import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  RefreshCw,
  Search,
  Wand2,
} from 'lucide-react';
import {
  bootstrapWorkspaceFiles,
  extractDriveId,
  getDriveItemMetadata,
  listDriveItems,
  populateFormattedTemplateDoc,
} from '../services/workspaceApi';
import { ConfirmDialogState, DriveItem, WorkspaceConfig } from '../types/pkkpr';

interface WorkspaceSetupViewProps {
  config: WorkspaceConfig | null;
  onSaveConfig: (nextConfig: WorkspaceConfig) => void;
  onRequestConfirm: (dialog: Omit<ConfirmDialogState, 'isOpen'>) => void;
  onAuthError: (err: unknown) => void;
  onSwitchToForm: () => void;
}

type PickerTarget = 'spreadsheet' | 'template' | 'folder' | null;

export const WorkspaceSetupView: React.FC<WorkspaceSetupViewProps> = ({
  config,
  onSaveConfig,
  onRequestConfirm,
  onAuthError,
  onSwitchToForm,
}) => {
  const [spreadsheetId, setSpreadsheetId] = useState(config?.spreadsheetId || '');
  const [spreadsheetName, setSpreadsheetName] = useState(config?.spreadsheetName || '');
  const [templateDocId, setTemplateDocId] = useState(config?.templateDocId || '');
  const [templateDocName, setTemplateDocName] = useState(config?.templateDocName || '');
  const [outputFolderId, setOutputFolderId] = useState(config?.outputFolderId || '');
  const [outputFolderName, setOutputFolderName] = useState(config?.outputFolderName || '');

  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerItems, setPickerItems] = useState<DriveItem[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [formattingTemplate, setFormattingTemplate] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    if (!config) return;
    setSpreadsheetId(config.spreadsheetId || '');
    setSpreadsheetName(config.spreadsheetName || '');
    setTemplateDocId(config.templateDocId || '');
    setTemplateDocName(config.templateDocName || '');
    setOutputFolderId(config.outputFolderId || '');
    setOutputFolderName(config.outputFolderName || '');
  }, [config]);

  const openPicker = async (target: PickerTarget) => {
    if (!target) return;
    setPickerTarget(target);
    setPickerSearch('');
    await loadDriveItems(target, '');
  };

  const loadDriveItems = async (target: PickerTarget, query: string) => {
    if (!target) return;
    setPickerLoading(true);
    try {
      const mimeMap: Record<Exclude<PickerTarget, null>, string> = {
        spreadsheet: 'application/vnd.google-apps.spreadsheet',
        template: 'application/vnd.google-apps.document',
        folder: 'application/vnd.google-apps.folder',
      };
      const files = await listDriveItems(mimeMap[target], query);
      setPickerItems(files);
    } catch (err) {
      onAuthError(err);
      setStatusMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Gagal memuat daftar file Google Drive.',
      });
    } finally {
      setPickerLoading(false);
    }
  };

  const handleSelectPickerItem = (item: DriveItem) => {
    if (pickerTarget === 'spreadsheet') {
      setSpreadsheetId(item.id);
      setSpreadsheetName(item.name);
    } else if (pickerTarget === 'template') {
      setTemplateDocId(item.id);
      setTemplateDocName(item.name);
    } else if (pickerTarget === 'folder') {
      setOutputFolderId(item.id);
      setOutputFolderName(item.name);
    }
    setPickerTarget(null);
  };

  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSsId = extractDriveId(spreadsheetId);
    const cleanDocId = extractDriveId(templateDocId);
    const cleanFolderId = extractDriveId(outputFolderId);
    if (!cleanSsId || !cleanDocId || !cleanFolderId) {
      setStatusMsg({
        type: 'error',
        text: 'Ketiga ID (Master Google Sheets, Template Google Docs, dan Folder Output) wajib diisi.',
      });
      return;
    }
    setSaving(true);
    setStatusMsg(null);
    try {
      const [ssMeta, docMeta, folderMeta] = await Promise.all([
        getDriveItemMetadata(cleanSsId),
        getDriveItemMetadata(cleanDocId),
        getDriveItemMetadata(cleanFolderId),
      ]);
      const next: WorkspaceConfig = {
        spreadsheetId: ssMeta.id,
        spreadsheetName: ssMeta.name,
        templateDocId: docMeta.id,
        templateDocName: docMeta.name,
        outputFolderId: folderMeta.id,
        outputFolderName: folderMeta.name,
      };
      setSpreadsheetId(ssMeta.id);
      setSpreadsheetName(ssMeta.name);
      setTemplateDocId(docMeta.id);
      setTemplateDocName(docMeta.name);
      setOutputFolderId(folderMeta.id);
      setOutputFolderName(folderMeta.name);
      onSaveConfig(next);
      setStatusMsg({
        type: 'success',
        text: 'Konfigurasi Google Drive, Sheets, dan Docs berhasil diverifikasi dan disimpan.',
      });
    } catch (err) {
      onAuthError(err);
      setStatusMsg({
        type: 'error',
        text:
          err instanceof Error
            ? `Verifikasi gagal: ${err.message}`
            : 'Gagal memverifikasi ID file di Google Drive.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBootstrapClick = () => {
    onRequestConfirm({
      title: 'Buat Otomatis 3 File Dasar di Google Drive?',
      description:
        'Aplikasi akan membuat struktur folder dan file dasar PKKPR di Google Drive akun Anda secara otomatis.',
      details: [
        'Folder baru: "Otomasi Kajian PKKPR" beserta subfolder "Hasil Kajian PKKPR (DOCX)".',
        'Google Sheets baru: "Master_Data_PKKPR" berisi tab Data_Induk (30 kolom A–AD), Bank_KUZ_Kab (19 zona resmi Permen ATR/BPN No. 11/2024), dan Bank_KUZ_Prov (18 zona resmi Perda Jatim No. 10/2023).',
        'Google Docs baru: "Template_Kajian_PKKPR" berisi seluruh variabel {{...}} yang siap digunakan.',
      ],
      confirmLabel: 'Buat File di Google Drive',
      onConfirm: async () => {
        setBootstrapping(true);
        setStatusMsg(null);
        try {
          const created = await bootstrapWorkspaceFiles();
          setSpreadsheetId(created.spreadsheetId);
          setSpreadsheetName(created.spreadsheetName || 'Master_Data_PKKPR');
          setTemplateDocId(created.templateDocId);
          setTemplateDocName(created.templateDocName || 'Template_Kajian_PKKPR');
          setOutputFolderId(created.outputFolderId);
          setOutputFolderName(created.outputFolderName || 'Hasil Kajian PKKPR (DOCX)');
          onSaveConfig(created);
          setStatusMsg({
            type: 'success',
            text: 'Folder "Otomasi Kajian PKKPR", Master_Data_PKKPR, dan Template_Kajian_PKKPR berhasil dibuat dan terhubung.',
          });
        } catch (err) {
          onAuthError(err);
          setStatusMsg({
            type: 'error',
            text:
              err instanceof Error
                ? err.message
                : 'Gagal membuat file dasar di Google Drive.',
          });
        } finally {
          setBootstrapping(false);
        }
      },
    });
  };

  const handleFormatTemplateClick = () => {
    const targetDocId = extractDriveId(config?.templateDocId || templateDocId);
    if (!targetDocId) return;

    onRequestConfirm({
      title: 'Terapkan Format Template Sesuai Contoh PDF?',
      description:
        'Isi dokumen Template_Kajian_PKKPR di Google Docs akan diperbarui agar menggunakan font Times New Roman 11 pt, tabel kelengkapan 4 kolom, urutan RTRW Provinsi lalu Kabupaten, serta tata letak gambar sesuai format PDF contoh (tanpa catatan komentar).',
      details: [
        `Dokumen Target: ${config?.templateDocName || templateDocName || 'Template_Kajian_PKKPR'}`,
        'Seluruh konten template sebelumnya akan digantikan dengan struktur standar format PDF terbaru.',
      ],
      confirmLabel: 'Perbarui Template Docs',
      onConfirm: async () => {
        setFormattingTemplate(true);
        setStatusMsg(null);
        try {
          await populateFormattedTemplateDoc(targetDocId);
          setStatusMsg({
            type: 'success',
            text: 'Template_Kajian_PKKPR berhasil diperbarui ke format standar PDF (Times New Roman 11 pt, tabel kelengkapan, dan tata letak peta).',
          });
        } catch (err) {
          onAuthError(err);
          setStatusMsg({
            type: 'error',
            text:
              err instanceof Error
                ? err.message
                : 'Gagal memperbarui format Template_Kajian_PKKPR.',
          });
        } finally {
          setFormattingTemplate(false);
        }
      },
    });
  };

  const isConfigured = Boolean(
    config?.spreadsheetId && config?.templateDocId && config?.outputFolderId
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Konfigurasi File Google Workspace
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Hubungkan Master_Data_PKKPR, Template_Kajian_PKKPR, dan Folder Output di Google Drive Anda.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {(config?.templateDocId || templateDocId.trim()) && (
            <button
              type="button"
              onClick={handleFormatTemplateClick}
              disabled={formattingTemplate || bootstrapping}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-blue-900 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-950 transition-colors hover:bg-blue-100 disabled:opacity-60"
            >
              <FileText className="h-3.5 w-3.5" />
              {formattingTemplate ? 'Memformat Template...' : 'Terapkan Format Template PDF'}
            </button>
          )}
          <button
            type="button"
            onClick={handleBootstrapClick}
            disabled={bootstrapping || formattingTemplate}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800 disabled:opacity-60"
          >
            <Wand2 className="h-4 w-4" />
            {bootstrapping ? 'Membuat File...' : 'Buat Otomatis (1-Klik)'}
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`flex items-start justify-between gap-4 rounded-lg border p-4 text-sm ${
            statusMsg.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-red-200 bg-red-50 text-red-900'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{statusMsg.text}</span>
          </div>
          {statusMsg.type === 'success' && isConfigured && (
            <button
              type="button"
              onClick={onSwitchToForm}
              className="whitespace-nowrap font-medium underline underline-offset-4 hover:opacity-80"
            >
              Buka Generator Kajian
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form
          onSubmit={handleManualSave}
          className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-semibold text-slate-900">
              Tautkan File & Folder yang Sudah Ada
            </h3>
            <span className="text-xs text-slate-500">
              Pilih dari Google Drive atau tempel ID file
            </span>
          </div>

          {/* 1. Master Spreadsheet */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-sm font-medium text-slate-800">
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
                1. Google Sheets (Master_Data_PKKPR)
              </span>
              {spreadsheetId && (
                <a
                  href={`https://docs.google.com/spreadsheets/d/${extractDriveId(spreadsheetId)}/edit`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-normal text-blue-800 hover:underline"
                >
                  Buka Sheets <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                placeholder="Tempel ID Google Sheets (antara /d/ dan /edit)"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-800 focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800"
              />
              <button
                type="button"
                onClick={() => openPicker('spreadsheet')}
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                <Search className="h-3.5 w-3.5" />
                Pilih dari Drive
              </button>
            </div>
            {spreadsheetName && (
              <p className="text-xs text-slate-500">
                Terpilih: <span className="font-medium text-slate-700">{spreadsheetName}</span> · Wajib memuat tab Data_Induk, Bank_KUZ_Kab, Bank_KUZ_Prov
              </p>
            )}
          </div>

          {/* 2. Template Google Docs */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-sm font-medium text-slate-800">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-700" />
                2. Google Docs (Template_Kajian_PKKPR)
              </span>
              {templateDocId && (
                <a
                  href={`https://docs.google.com/document/d/${extractDriveId(templateDocId)}/edit`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-normal text-blue-800 hover:underline"
                >
                  Buka Docs <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={templateDocId}
                onChange={(e) => setTemplateDocId(e.target.value)}
                placeholder="Tempel ID Google Docs Template (antara /d/ dan /edit)"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-800 focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800"
              />
              <button
                type="button"
                onClick={() => openPicker('template')}
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                <Search className="h-3.5 w-3.5" />
                Pilih dari Drive
              </button>
            </div>
            {templateDocName && (
              <p className="text-xs text-slate-500">
                Terpilih: <span className="font-medium text-slate-700">{templateDocName}</span>
              </p>
            )}
          </div>

          {/* 3. Folder Output */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-sm font-medium text-slate-800">
              <span className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-amber-700" />
                3. Folder Output Google Drive
              </span>
              {outputFolderId && (
                <a
                  href={`https://drive.google.com/drive/folders/${extractDriveId(outputFolderId)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-normal text-blue-800 hover:underline"
                >
                  Buka Folder <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={outputFolderId}
                onChange={(e) => setOutputFolderId(e.target.value)}
                placeholder="Tempel ID Folder Google Drive (setelah /folders/)"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-800 focus:border-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-800"
              />
              <button
                type="button"
                onClick={() => openPicker('folder')}
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                <Search className="h-3.5 w-3.5" />
                Pilih dari Drive
              </button>
            </div>
            {outputFolderName && (
              <p className="text-xs text-slate-500">
                Terpilih: <span className="font-medium text-slate-700">{outputFolderName}</span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
              {saving ? 'Memverifikasi...' : 'Verifikasi & Simpan Konfigurasi'}
            </button>
          </div>
        </form>

        {/* Reference Checklist */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-base font-semibold text-slate-900">
            Struktur Wajib Google Sheets & Docs
          </h3>
          <p className="text-xs leading-relaxed text-slate-600">
            Jika Anda membuat file secara manual di Google Drive, pastikan struktur tab dan variabel kurung kurawal ganda sesuai standar berikut:
          </p>
          <div className="space-y-3 border-t border-slate-100 pt-3 text-xs">
            <div>
              <p className="font-semibold text-slate-800">Tab 1: Data_Induk (Kolom A–AD)</p>
              <p className="mt-0.5 text-slate-500">
                30 kolom rekap otomatis mulai dari Timestamp, Jenis_KKPR, Nama_Perusahaan, hingga Status_LBS_LSD_Hutan_MOMI.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-800">Tab 2: Bank_KUZ_Kab</p>
              <p className="mt-0.5 text-slate-500">
                Kolom: Nama_Zona, Isi_KUZ, KDB, KLB, KDH (Permen ATR/BPN No. 11 Tahun 2024 Kab. Pasuruan).
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-800">Tab 3: Bank_KUZ_Prov</p>
              <p className="mt-0.5 text-slate-500">
                Kolom: Nama_Zona, Isi_KUZ (Perda Prov. Jatim No. 10 Tahun 2023).
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-800">Format Standar Template Docs (PDF)</p>
              <p className="mt-0.5 text-slate-500">
                Font Times New Roman 11 pt, tabel kelengkapan validasi 8 item, urutan RTRW Provinsi → Kabupaten, pertampalan Hutan/LSD/LBS/LP2B/MOMI/GISTARU, dan Rekomendasi.
              </p>
              <p className="mt-1.5 font-mono text-[11px] text-slate-600">
                {'{{img_peta_prov}} {{img_peta_kab}} {{img_momi}} {{img_validasi}}'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Drive File Picker Modal */}
      {pickerTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-base font-semibold text-slate-900">
                {pickerTarget === 'spreadsheet' && 'Pilih Google Sheets (Master_Data_PKKPR)'}
                {pickerTarget === 'template' && 'Pilih Google Docs (Template_Kajian_PKKPR)'}
                {pickerTarget === 'folder' && 'Pilih Folder Output Google Drive'}
              </h3>
              <button
                type="button"
                onClick={() => setPickerTarget(null)}
                className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>

            <div className="border-b border-slate-100 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      loadDriveItems(pickerTarget, pickerSearch);
                    }
                  }}
                  placeholder="Cari nama file atau folder di Google Drive..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => loadDriveItems(pickerTarget, pickerSearch)}
                  className="whitespace-nowrap rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                >
                  Cari
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {pickerLoading ? (
                <div className="space-y-2 p-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
                  ))}
                </div>
              ) : pickerItems.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-500">
                  Tidak ada item yang ditemukan di Google Drive Anda.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {pickerItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectPickerItem(item)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg px-3.5 py-3 text-left transition-colors hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                        <p className="mt-0.5 truncate font-mono text-[11px] text-slate-500">
                          {item.id}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-blue-900">Pilih</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
