import React, { useState } from 'react';
import {
  CheckCircle2,
  DatabaseZap,
  ExternalLink,
  FileText,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
import { OFFICIAL_KUZ_KAB_PASURUAN, OFFICIAL_KUZ_PROV_JATIM } from '../data/kuzDatabase';
import {
  appendZonaKab,
  appendZonaProv,
  syncOfficialKuzToSheets,
} from '../services/workspaceApi';
import { ConfirmDialogState, MasterZonaData } from '../types/pkkpr';

interface BankKuzViewProps {
  spreadsheetId: string | null;
  masterZona: MasterZonaData;
  loading: boolean;
  onRefresh: () => Promise<void>;
  onRequestConfirm: (dialog: Omit<ConfirmDialogState, 'isOpen'>) => void;
  onAuthError: (err: unknown) => void;
}

const PDF_RTRW_KAB_URL =
  '/assets/aistudio/Permen_ATRKBPN_No_11_Tahun_2024_Tentang_RTRW_Kabupaten_Pasuruan_1d85fa91.pdf';
const PDF_RTRW_PROV_URL =
  '/assets/aistudio/PERDA-PROVJATIM-10-2023-RTRWP_JATIM_2023-2043_87688272.pdf';

export const BankKuzView: React.FC<BankKuzViewProps> = ({
  spreadsheetId,
  masterZona,
  loading,
  onRefresh,
  onRequestConfirm,
  onAuthError,
}) => {
  const [activeTab, setActiveTab] = useState<'kab' | 'prov'>('kab');
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Add form state
  const [namaZona, setNamaZona] = useState('');
  const [isiKuz, setIsiKuz] = useState('');
  const [kdb, setKdb] = useState('60%');
  const [klb, setKlb] = useState('1,8');
  const [kdh, setKdh] = useState('20%');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Use Sheet data when connected; fallback to official PDF database for preview when not connected
  const activeKabList = spreadsheetId ? masterZona.kab : OFFICIAL_KUZ_KAB_PASURUAN;
  const activeProvList = spreadsheetId ? masterZona.prov : OFFICIAL_KUZ_PROV_JATIM;

  const filteredKab = activeKabList.filter(
    (z) =>
      z.namaZona.toLowerCase().includes(search.toLowerCase()) ||
      z.isiKuz.toLowerCase().includes(search.toLowerCase())
  );

  const filteredProv = activeProvList.filter(
    (z) =>
      z.namaZona.toLowerCase().includes(search.toLowerCase()) ||
      z.isiKuz.toLowerCase().includes(search.toLowerCase())
  );

  const handleSyncOfficialKuz = () => {
    if (!spreadsheetId) return;
    setErrorMsg(null);
    setSyncMessage(null);

    onRequestConfirm({
      title: 'Sinkronkan Database KUZ Resmi dari PDF Peraturan?',
      description:
        'Seluruh isi tab Bank_KUZ_Kab dan Bank_KUZ_Prov pada Google Sheets Master_Data_PKKPR akan diperbarui agar sesuai dengan dokumen peraturan RTRW yang diunggah.',
      details: [
        `Bank_KUZ_Kab: ${OFFICIAL_KUZ_KAB_PASURUAN.length} zona pola ruang beserta KDB/KLB/KDH sesuai Lampiran & Pasal 71–83 Permen ATR/BPN No. 11 Tahun 2024 (RTRW Kab. Pasuruan).`,
        `Bank_KUZ_Prov: ${OFFICIAL_KUZ_PROV_JATIM.length} zona pola ruang sesuai Pasal 97–114 Perda Prov. Jawa Timur No. 10 Tahun 2023 (RTRW Prov. Jatim 2023–2043).`,
        'Data sebelumnya di tab Bank_KUZ_Kab dan Bank_KUZ_Prov akan digantikan oleh daftar resmi terbaru (tab Data_Induk tetap aman tidak berubah).',
      ],
      confirmLabel: 'Perbarui Google Sheets',
      onConfirm: async () => {
        setSyncing(true);
        setErrorMsg(null);
        setSyncMessage(null);
        try {
          const res = await syncOfficialKuzToSheets(spreadsheetId);
          await onRefresh();
          setSyncMessage(
            `Berhasil menyinkronkan ${res.kabCount} zona KUZ Kabupaten Pasuruan dan ${res.provCount} zona IAZ Provinsi Jawa Timur ke Google Sheets.`
          );
        } catch (err) {
          onAuthError(err);
          setErrorMsg(
            err instanceof Error
              ? err.message
              : 'Gagal menyinkronkan database KUZ ke Google Sheets.'
          );
        } finally {
          setSyncing(false);
        }
      },
    });
  };

  const handleAddZona = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spreadsheetId) return;
    if (!namaZona.trim() || !isiKuz.trim()) {
      setErrorMsg('Nama zona dan teks KUZ/IAZ wajib diisi.');
      return;
    }
    setErrorMsg(null);

    const targetTabName = activeTab === 'kab' ? 'Bank_KUZ_Kab' : 'Bank_KUZ_Prov';
    onRequestConfirm({
      title: `Tambahkan Zona ke ${targetTabName}?`,
      description: `Baris zona baru akan ditambahkan langsung ke tab ${targetTabName} di Google Sheets Master_Data_PKKPR.`,
      details: [
        `Nama Zona: ${namaZona.trim()}`,
        activeTab === 'kab'
          ? `Intensitas Ruang: KDB ${kdb || '-'} · KLB ${klb || '-'} · KDH ${kdh || '-'}`
          : 'Referensi: Perda Prov. Jatim No. 10 Tahun 2023',
      ],
      confirmLabel: 'Simpan ke Google Sheets',
      onConfirm: async () => {
        try {
          if (activeTab === 'kab') {
            await appendZonaKab(spreadsheetId, {
              namaZona: namaZona.trim(),
              isiKuz: isiKuz.trim(),
              kdb: kdb.trim() || '-',
              klb: klb.trim() || '-',
              kdh: kdh.trim() || '-',
            });
          } else {
            await appendZonaProv(spreadsheetId, {
              namaZona: namaZona.trim(),
              isiKuz: isiKuz.trim(),
            });
          }
          setNamaZona('');
          setIsiKuz('');
          setShowAddForm(false);
          await onRefresh();
        } catch (err) {
          onAuthError(err);
          setErrorMsg(
            err instanceof Error ? err.message : 'Gagal menambahkan zona ke Google Sheets.'
          );
        }
      },
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Bank Ketentuan Umum Zonasi (KUZ & IAZ)
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Diselaraskan dengan Permen ATR/BPN No. 11 Tahun 2024 (RTRW Kab. Pasuruan) & Perda No. 10 Tahun 2023 (RTRW Prov. Jawa Timur).
          </p>
        </div>
        {spreadsheetId && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSyncOfficialKuz}
              disabled={syncing || loading}
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-blue-900 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-950 transition-colors hover:bg-blue-100 disabled:opacity-60"
            >
              <DatabaseZap className="h-3.5 w-3.5" />
              {syncing ? 'Menyinkronkan...' : 'Sinkronkan KUZ Resmi (PDF)'}
            </button>
            <button
              type="button"
              onClick={() => onRefresh()}
              disabled={loading || syncing}
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Muat Ulang
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm((prev) => !prev)}
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg bg-blue-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-blue-800"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Zona
            </button>
          </div>
        )}
      </div>

      {/* Sumber Peraturan PDF & Status Koneksi */}
      <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center">
        <div className="text-xs text-slate-600">
          {spreadsheetId ? (
            <span>
              Menampilkan data aktif dari Google Sheets <span className="font-mono font-medium text-slate-800">Master_Data_PKKPR</span>. Gunakan tombol <strong className="font-semibold text-slate-800">Sinkronkan KUZ Resmi (PDF)</strong> untuk memperbarui seluruh zona sesuai PDF peraturan.
            </span>
          ) : (
            <span>
              <strong className="font-semibold text-slate-800">Master_Data_PKKPR belum terhubung</strong> — menampilkan database referensi resmi dari kedua PDF RTRW ({OFFICIAL_KUZ_KAB_PASURUAN.length} Kab · {OFFICIAL_KUZ_PROV_JATIM.length} Prov). Hubungkan Workspace di menu Konfigurasi untuk menyinkronkan ke Google Sheets.
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <a
            href={PDF_RTRW_KAB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-blue-900 hover:underline"
          >
            <FileText className="h-3.5 w-3.5" />
            PDF RTRW Kab. Pasuruan
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href={PDF_RTRW_PROV_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-blue-900 hover:underline"
          >
            <FileText className="h-3.5 w-3.5" />
            PDF RTRW Prov. Jatim
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {syncMessage && (
        <div className="flex items-start gap-2.5 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs text-emerald-900">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
          <span>{syncMessage}</span>
        </div>
      )}

      {errorMsg && !showAddForm && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
          {errorMsg}
        </div>
      )}

      {/* Segmented filter tabs + Search */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="inline-flex items-center gap-1 rounded-lg bg-slate-200/70 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('kab')}
            className={`whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'kab'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bank_KUZ_Kab ({activeKabList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('prov')}
            className={`whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'prov'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bank_KUZ_Prov ({activeProvList.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama zona atau pasal KUZ..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 focus:border-blue-800 focus:outline-none"
          />
        </div>
      </div>

      {showAddForm && spreadsheetId && (
        <form
          onSubmit={handleAddZona}
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-5"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Tambah Referensi ke {activeTab === 'kab' ? 'Bank_KUZ_Kab' : 'Bank_KUZ_Prov'}
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Tutup
            </button>
          </div>

          {errorMsg && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
              {errorMsg}
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className={activeTab === 'kab' ? 'md:col-span-2' : 'md:col-span-4'}>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Nama Zona *
              </label>
              <input
                type="text"
                value={namaZona}
                onChange={(e) => setNamaZona(e.target.value)}
                required
                placeholder="Misal: Kawasan Perdagangan dan Jasa"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
              />
            </div>

            {activeTab === 'kab' && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">KDB</label>
                  <input
                    type="text"
                    value={kdb}
                    onChange={(e) => setKdb(e.target.value)}
                    placeholder="60%"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-blue-800 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">KLB</label>
                    <input
                      type="text"
                      value={klb}
                      onChange={(e) => setKlb(e.target.value)}
                      placeholder="1,8"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-blue-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">KDH</label>
                    <input
                      type="text"
                      value={kdh}
                      onChange={(e) => setKdh(e.target.value)}
                      placeholder="20%"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-blue-800 focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="md:col-span-4">
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Teks Lengkap {activeTab === 'kab' ? 'Pasal KUZ' : 'IAZ Provinsi'} *
              </label>
              <textarea
                rows={4}
                value={isiKuz}
                onChange={(e) => setIsiKuz(e.target.value)}
                required
                placeholder="Salin teks lengkap ketentuan zonasi..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="rounded-lg bg-blue-900 px-4 py-2 text-xs font-medium text-white hover:bg-blue-800"
            >
              Simpan Zona Baru
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-slate-100" />
            ))}
          </div>
        ) : activeTab === 'kab' ? (
          filteredKab.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              {activeKabList.length === 0
                ? 'Tab Bank_KUZ_Kab masih kosong. Klik "Sinkronkan KUZ Resmi (PDF)" di atas untuk mengisi 19 zona resmi.'
                : 'Tidak ada zona kabupaten yang cocok dengan pencarian Anda.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="px-4 py-3 font-semibold">Nama Zona (Permen ATR/BPN 11/2024)</th>
                    <th className="px-4 py-3 font-semibold">Isi Ketentuan Umum Zonasi (KUZ)</th>
                    <th className="px-4 py-3 text-right font-semibold">KDB</th>
                    <th className="px-4 py-3 text-right font-semibold">KLB</th>
                    <th className="px-4 py-3 text-right font-semibold">KDH</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredKab.map((row, idx) => (
                    <tr key={`${row.namaZona}-${idx}`} className="hover:bg-slate-50/70">
                      <td className="w-56 px-4 py-3 align-top font-medium text-slate-900">
                        {row.namaZona}
                      </td>
                      <td className="whitespace-pre-line px-4 py-3 align-top leading-relaxed text-slate-600">
                        {row.isiKuz}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right align-top font-mono tabular-nums text-slate-800">
                        {row.kdb}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right align-top font-mono tabular-nums text-slate-800">
                        {row.klb}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right align-top font-mono tabular-nums text-slate-800">
                        {row.kdh}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : filteredProv.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">
            {activeProvList.length === 0
              ? 'Tab Bank_KUZ_Prov masih kosong. Klik "Sinkronkan KUZ Resmi (PDF)" di atas untuk mengisi 18 zona resmi.'
              : 'Tidak ada zona provinsi yang cocok dengan pencarian Anda.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="px-4 py-3 font-semibold">Nama Zona (Perda Jatim 10/2023)</th>
                  <th className="px-4 py-3 font-semibold">Isi Indikasi Arahan Zonasi (IAZ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProv.map((row, idx) => (
                  <tr key={`${row.namaZona}-${idx}`} className="hover:bg-slate-50/70">
                    <td className="w-64 px-4 py-3 align-top font-medium text-slate-900">
                      {row.namaZona}
                    </td>
                    <td className="whitespace-pre-line px-4 py-3 align-top leading-relaxed text-slate-600">
                      {row.isiKuz}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
