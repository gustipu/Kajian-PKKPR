import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { OFFICIAL_KUZ_KAB_PASURUAN, OFFICIAL_KUZ_PROV_JATIM } from '../data/kuzDatabase';
import { generateKajianAndSave } from '../services/workspaceApi';
import {
  ConfirmDialogState,
  GeneratedKajianResult,
  KajianFormData,
  MasterZonaData,
  WorkspaceConfig,
} from '../types/pkkpr';

interface KajianFormViewProps {
  config: WorkspaceConfig | null;
  masterZona: MasterZonaData;
  onRequestConfirm: (dialog: Omit<ConfirmDialogState, 'isOpen'>) => void;
  onAuthError: (err: unknown) => void;
  onGoToSetup: () => void;
  onSuccessSaved: () => void;
}

const pickDefaultKab = (kabList: MasterZonaData['kab']) =>
  kabList.find((z) => z.namaZona === 'Kawasan Tanaman Pangan')?.namaZona ||
  kabList[0]?.namaZona ||
  '';

const pickDefaultProv = (provList: MasterZonaData['prov']) =>
  provList.find((z) => z.namaZona === 'Kawasan Pertanian')?.namaZona ||
  provList[0]?.namaZona ||
  '';

const createInitialForm = (masterZona: MasterZonaData): KajianFormData => ({
  jenis_kkpr: 'Persetujuan',
  kategori_usaha: 'Berusaha',
  jalur: 'via sistem OSS',
  nama_perusahaan: '',
  status_modal: 'PMDN',
  kode_kbli: '',
  judul_kbli: '',
  penjelasan_kbli: '',
  id_proyek: '',
  desa: '',
  kecamatan: '',
  luas_permohonan: '',
  tgl_oss: '',
  tgl_validasi: '',
  tgl_pnbp: '',
  tgl_ptp: '',
  tgl_unggah_ptp: '',
  status_poligon: 'Tidak ada',
  zona_kab_1: pickDefaultKab(masterZona.kab),
  luas_kab_1: '',
  persen_kab_1: '100',
  zona_kab_2: '',
  luas_kab_2: '',
  persen_kab_2: '',
  zona_prov: pickDefaultProv(masterZona.prov),
  luas_prov: '',
  persen_prov: '100',
  status_lbs: 'tidak masuk',
  status_lsd: 'tidak masuk',
  no_ptp: '',
  tgl_ptp_surat: '',
  luas_ptp: '',
  guna_tanah: '',
  status_hutan: 'tidak masuk',
  status_lp2b: 'tidak masuk',
  tgl_momi: '',
  status_momi: 'tidak bertampalan',
  tgl_gistaru: '',
  status_gistaru: 'tidak bertampalan',
  skala_usaha: 'mikro',
  rekomendasi_status: '',
  kelengkapan_koordinat: 'Ada',
  kelengkapan_shp: 'Ada',
  kelengkapan_tanah: 'N',
  kelengkapan_lantai_jml: 'Tidak ada data',
  kelengkapan_lantai_luas: 'Tidak ada data',
  kelengkapan_rencana_teknis: 'Ada',
  telaah_lain: '',
  img_validasi: null,
  img_peta_kab: null,
  img_peta_prov: null,
  img_momi: null,
});

export const KajianFormView: React.FC<KajianFormViewProps> = ({
  config,
  masterZona,
  onRequestConfirm,
  onAuthError,
  onGoToSetup,
  onSuccessSaved,
}) => {
  const effectiveMasterZona = useMemo<MasterZonaData>(
    () => ({
      kab: masterZona.kab.length > 0 ? masterZona.kab : OFFICIAL_KUZ_KAB_PASURUAN,
      prov: masterZona.prov.length > 0 ? masterZona.prov : OFFICIAL_KUZ_PROV_JATIM,
    }),
    [masterZona]
  );

  const [formData, setFormData] = useState<KajianFormData>(() =>
    createInitialForm(effectiveMasterZona)
  );
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedKajianResult | null>(null);

  const previewsRef = useRef<Record<string, string>>({});
  previewsRef.current = previews;
  const resultUrlRef = useRef<string | null>(null);
  resultUrlRef.current = result?.docxBlobUrl || null;

  // Sync default zona selections once effectiveMasterZona loads
  useEffect(() => {
    setFormData((prev) => {
      const kabValid = effectiveMasterZona.kab.some((z) => z.namaZona === prev.zona_kab_1);
      const provValid = effectiveMasterZona.prov.some((z) => z.namaZona === prev.zona_prov);
      return {
        ...prev,
        zona_kab_1: kabValid ? prev.zona_kab_1 : pickDefaultKab(effectiveMasterZona.kab),
        zona_prov: provValid ? prev.zona_prov : pickDefaultProv(effectiveMasterZona.prov),
      };
    });
  }, [effectiveMasterZona]);

  // Revoke object URLs only on unmount
  useEffect(() => {
    return () => {
      Object.values(previewsRef.current).forEach((url) => URL.revokeObjectURL(url));
      if (resultUrlRef.current) {
        URL.revokeObjectURL(resultUrlRef.current);
      }
    };
  }, []);

  const setField = <K extends keyof KajianFormData>(key: K, value: KajianFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageChange = (
    key: 'img_validasi' | 'img_peta_kab' | 'img_peta_prov' | 'img_momi',
    file: File | null
  ) => {
    setFormData((prev) => ({ ...prev, [key]: file }));
    setPreviews((prev) => {
      if (prev[key]) URL.revokeObjectURL(prev[key]);
      const next = { ...prev };
      if (file) {
        next[key] = URL.createObjectURL(file);
      } else {
        delete next[key];
      }
      return next;
    });
  };

  const handleFillSample = () => {
    setFormData((prev) => ({
      ...prev,
      jenis_kkpr: 'Persetujuan',
      kategori_usaha: 'Berusaha',
      jalur: 'Non Elektronik',
      nama_perusahaan: 'Neotherm Optima Indonesia',
      status_modal: 'PMDN',
      skala_usaha: 'mikro',
      kode_kbli: '28130',
      judul_kbli: 'Industri Pompa Lainnya, Kompresor, Kran dan Klep/Katup',
      penjelasan_kbli:
        'Kegiatan usaha industri pompa lainnya, kompresor, kran dan klep/katup beserta fasilitas penunjangnya.',
      id_proyek: 'R-937',
      desa: 'Wonokoyo',
      kecamatan: 'Beji',
      luas_permohonan: '1.255,80',
      tgl_oss: '3 Juli 2026',
      tgl_validasi: '8 Juli 2026',
      tgl_pnbp: '10 Juli 2026',
      tgl_ptp: '18 Agustus 2026',
      tgl_unggah_ptp: '19 Agustus 2026',
      status_poligon: 'Tidak ada',
      zona_kab_1:
        effectiveMasterZona.kab.find((z) => z.namaZona === 'Kawasan Permukiman Perkotaan')
          ?.namaZona ||
        pickDefaultKab(effectiveMasterZona.kab) ||
        prev.zona_kab_1,
      luas_kab_1: '1.255,8',
      persen_kab_1: '100',
      zona_kab_2: '',
      luas_kab_2: '',
      persen_kab_2: '',
      zona_prov:
        effectiveMasterZona.prov.find((z) => z.namaZona === 'Kawasan Peruntukan Industri')
          ?.namaZona ||
        pickDefaultProv(effectiveMasterZona.prov) ||
        prev.zona_prov,
      luas_prov: '1.255,8',
      persen_prov: '100',
      status_lbs: 'tidak masuk',
      status_lsd: 'tidak masuk',
      status_lp2b: 'tidak masuk',
      no_ptp: '35.14/PTP.O1/318/VIII/2026',
      tgl_ptp_surat: '18 Agustus 2026',
      luas_ptp: '1.260 m² (100%)',
      guna_tanah: 'Industri',
      status_hutan: 'tidak masuk',
      tgl_momi: '7 September 2026',
      status_momi: 'tidak bertampalan',
      tgl_gistaru: '7 September 2026',
      status_gistaru: 'tidak bertampalan',
      rekomendasi_status: '',
      kelengkapan_koordinat: 'Ada',
      kelengkapan_shp: 'Ada',
      kelengkapan_tanah: 'N',
      kelengkapan_lantai_jml: 'Tidak ada data',
      kelengkapan_lantai_luas: 'Tidak ada data',
      kelengkapan_rencana_teknis: 'Ada',
      telaah_lain: '',
    }));
  };

  const handleReset = () => {
    Object.values(previews).forEach((url) => URL.revokeObjectURL(url));
    if (result?.docxBlobUrl) {
      URL.revokeObjectURL(result.docxBlobUrl);
    }
    setPreviews({});
    setFormData(createInitialForm(effectiveMasterZona));
    setResult(null);
    setErrorMsg(null);
  };

  // Live preview of matched KUZ
  const selectedKab1 = useMemo(
    () => effectiveMasterZona.kab.find((z) => z.namaZona === formData.zona_kab_1),
    [effectiveMasterZona.kab, formData.zona_kab_1]
  );
  const selectedKab2 = useMemo(
    () => effectiveMasterZona.kab.find((z) => z.namaZona === formData.zona_kab_2),
    [effectiveMasterZona.kab, formData.zona_kab_2]
  );
  const selectedProv = useMemo(
    () => effectiveMasterZona.prov.find((z) => z.namaZona === formData.zona_prov),
    [effectiveMasterZona.prov, formData.zona_prov]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) {
      onGoToSetup();
      return;
    }
    if (!formData.nama_perusahaan.trim()) {
      setErrorMsg('Nama Pelaku Usaha / Perusahaan wajib diisi.');
      return;
    }
    setErrorMsg(null);

    const attachedCount = [
      formData.img_validasi,
      formData.img_peta_kab,
      formData.img_peta_prov,
      formData.img_momi,
    ].filter(Boolean).length;

    onRequestConfirm({
      title: 'Simpan Data & Buat Dokumen Kajian PKKPR?',
      description:
        'Aplikasi akan mencatat permohonan ke Google Sheets dan menghasilkan file dokumen kajian baru di Google Drive.',
      details: [
        `Menambahkan 1 baris baru ke tab Data_Induk pada "${config.spreadsheetName || 'Master_Data_PKKPR'}".`,
        `Menyalin template "${config.templateDocName || 'Template_Kajian_PKKPR'}" menjadi "Kajian PKKPR - ${formData.nama_perusahaan.trim()}" di folder output.`,
        `Mengisi seluruh variabel kajian & tabel kelengkapan serta menyisipkan ${attachedCount} gambar lampiran, lalu mengekspor ke format .DOCX.`,
      ],
      confirmLabel: 'Proses & Generate .DOCX',
      onConfirm: async () => {
        setProcessing(true);
        setErrorMsg(null);
        try {
          const generated = await generateKajianAndSave(config, formData, effectiveMasterZona);
          setResult((prev) => {
            if (prev?.docxBlobUrl) {
              URL.revokeObjectURL(prev.docxBlobUrl);
            }
            return generated;
          });
          onSuccessSaved();
        } catch (err) {
          onAuthError(err);
          setErrorMsg(
            err instanceof Error
              ? err.message
              : 'Terjadi kesalahan saat memproses dokumen kajian.'
          );
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  if (!config) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <h3 className="text-base font-semibold text-slate-900">
          Workspace Google Drive Belum Dikonfigurasi
        </h3>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600">
          Sebelum membuat dokumen kajian, hubungkan file Master_Data_PKKPR dan Template_Kajian_PKKPR atau buat otomatis dalam 1 klik.
        </p>
        <button
          type="button"
          onClick={onGoToSetup}
          className="mt-5 inline-flex items-center rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          Buka Konfigurasi Workspace
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Formulir Kajian PKKPR — Bidang Tata Ruang
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Lengkapi data permohonan OSS, analisis pola ruang, pertampalan sektoral, dan lampiran peta.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleFillSample}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-800" />
            Isi Contoh Data
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Result Banner */}
      {result && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
              <div>
                <h3 className="text-sm font-semibold text-emerald-950">
                  Dokumen Kajian Berhasil Dibuat & Rekap Tersimpan di Google Sheets
                </h3>
                <p className="mt-0.5 text-xs text-emerald-800">
                  File: <span className="font-mono font-medium">{result.fileName}</span>
                </p>
                {result.warnings.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-amber-800">
                    {result.warnings.map((w, i) => (
                      <li key={i}>Catatan: {w}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <a
                href={result.docxBlobUrl}
                download={result.fileName}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-800"
              >
                <Download className="h-4 w-4" />
                Unduh Word (.DOCX)
              </a>
              <a
                href={result.urlEdit}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-emerald-700 bg-white px-4 py-2 text-xs font-semibold text-emerald-900 transition-colors hover:bg-emerald-100/60"
              >
                <FileText className="h-4 w-4" />
                Edit di Google Docs
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2-Column Layout: Form on Left (2 cols), Live KUZ Preview on Right (1 col) */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-6 xl:col-span-2">
          {/* SECTION 1 */}
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="border-b border-slate-100 pb-3 text-base font-semibold text-slate-900">
              01. Data Pelaku Usaha & Kronologi OSS
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-12">
              <div className="sm:col-span-4">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Jenis KKPR
                </label>
                <select
                  value={formData.jenis_kkpr}
                  onChange={(e) => setField('jenis_kkpr', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-800 focus:outline-none"
                >
                  <option>Persetujuan</option>
                  <option>Konfirmasi</option>
                </select>
              </div>
              <div className="sm:col-span-4">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Kategori Usaha
                </label>
                <select
                  value={formData.kategori_usaha}
                  onChange={(e) => setField('kategori_usaha', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-800 focus:outline-none"
                >
                  <option>Berusaha</option>
                  <option>Non Berusaha</option>
                </select>
              </div>
              <div className="sm:col-span-4">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Jalur Permohonan
                </label>
                <select
                  value={formData.jalur}
                  onChange={(e) => setField('jalur', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-800 focus:outline-none"
                >
                  <option>via sistem OSS</option>
                  <option>Non Elektronik</option>
                </select>
              </div>

              <div className="sm:col-span-6">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Nama Pelaku Usaha / Perusahaan *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama_perusahaan}
                  onChange={(e) => setField('nama_perusahaan', e.target.value)}
                  placeholder="Contoh: Neotherm Optima Indonesia"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Skala Usaha
                </label>
                <select
                  value={formData.skala_usaha}
                  onChange={(e) => setField('skala_usaha', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-800 focus:outline-none"
                >
                  <option value="mikro">mikro</option>
                  <option value="kecil">kecil</option>
                  <option value="menengah">menengah</option>
                  <option value="besar">besar</option>
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Status Modal
                </label>
                <select
                  value={formData.status_modal}
                  onChange={(e) => setField('status_modal', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-800 focus:outline-none"
                >
                  <option>PMDN</option>
                  <option>PMA</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Kode KBLI
                </label>
                <input
                  type="text"
                  value={formData.kode_kbli}
                  onChange={(e) => setField('kode_kbli', e.target.value)}
                  placeholder="01411"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-blue-800 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-9">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Judul KBLI
                </label>
                <input
                  type="text"
                  value={formData.judul_kbli}
                  onChange={(e) => setField('judul_kbli', e.target.value)}
                  placeholder="Judul kegiatan usaha sesuai KBLI"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-12">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Penjelasan Singkat KBLI
                </label>
                <textarea
                  rows={2}
                  value={formData.penjelasan_kbli}
                  onChange={(e) => setField('penjelasan_kbli', e.target.value)}
                  placeholder="Uraian singkat ruang lingkup rencana kegiatan..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  ID Proyek (Kode R-)
                </label>
                <input
                  type="text"
                  value={formData.id_proyek}
                  onChange={(e) => setField('id_proyek', e.target.value)}
                  placeholder="R-2026..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-blue-800 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Desa / Kelurahan
                </label>
                <input
                  type="text"
                  value={formData.desa}
                  onChange={(e) => setField('desa', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Kecamatan
                </label>
                <input
                  type="text"
                  value={formData.kecamatan}
                  onChange={(e) => setField('kecamatan', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Luas Permohonan (m²)
                </label>
                <input
                  type="text"
                  value={formData.luas_permohonan}
                  onChange={(e) => setField('luas_permohonan', e.target.value)}
                  placeholder="1.182"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-blue-800 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Tgl Masuk OSS
                </label>
                <input
                  type="text"
                  value={formData.tgl_oss}
                  onChange={(e) => setField('tgl_oss', e.target.value)}
                  placeholder="10 Juli 2026"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Tgl Validasi Lengkap
                </label>
                <input
                  type="text"
                  value={formData.tgl_validasi}
                  onChange={(e) => setField('tgl_validasi', e.target.value)}
                  placeholder="13 Juli 2026"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Tgl Pembayaran PNBP
                </label>
                <input
                  type="text"
                  value={formData.tgl_pnbp}
                  onChange={(e) => setField('tgl_pnbp', e.target.value)}
                  placeholder="16 Juli 2026"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-6">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Tgl Penerbitan PTP
                </label>
                <input
                  type="text"
                  value={formData.tgl_ptp}
                  onChange={(e) => setField('tgl_ptp', e.target.value)}
                  placeholder="28 Juli 2026"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-6">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Tgl Unggah PTP ke OSS
                </label>
                <input
                  type="text"
                  value={formData.tgl_unggah_ptp}
                  onChange={(e) => setField('tgl_unggah_ptp', e.target.value)}
                  placeholder="29 Juli 2026"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
                />
              </div>

              {/* Kelengkapan Data Table Overrides */}
              <div className="border-t border-slate-100 pt-4 sm:col-span-12">
                <p className="text-xs font-semibold text-slate-800">
                  Tabel Kelengkapan Validasi (Halaman 1 Dokumen)
                </p>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      1. Koordinat Lokasi
                    </label>
                    <input
                      type="text"
                      value={formData.kelengkapan_koordinat}
                      onChange={(e) => setField('kelengkapan_koordinat', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      2. Koordinat Lokasi SHP
                    </label>
                    <input
                      type="text"
                      value={formData.kelengkapan_shp}
                      onChange={(e) => setField('kelengkapan_shp', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      4. Informasi Penggunaan Tanah
                    </label>
                    <input
                      type="text"
                      value={formData.kelengkapan_tanah}
                      onChange={(e) => setField('kelengkapan_tanah', e.target.value)}
                      placeholder="N"
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      6. Rencana Jumlah Lantai
                    </label>
                    <input
                      type="text"
                      value={formData.kelengkapan_lantai_jml}
                      onChange={(e) => setField('kelengkapan_lantai_jml', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      7. Rencana Luas Lantai
                    </label>
                    <input
                      type="text"
                      value={formData.kelengkapan_lantai_luas}
                      onChange={(e) => setField('kelengkapan_lantai_luas', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      8. Rencana Teknis / Induk Kawasan
                    </label>
                    <input
                      type="text"
                      value={formData.kelengkapan_rencana_teknis}
                      onChange={(e) => setField('kelengkapan_rencana_teknis', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2 (RTRW Provinsi lalu Kabupaten sesuai urutan PDF) */}
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="border-b border-slate-100 pb-3 text-base font-semibold text-slate-900">
              02. Analisis RTRW Provinsi & Kabupaten (Otomatis Tarik Bank KUZ)
            </h3>

            <div className="mt-4 space-y-5">
              <div className="max-w-xs">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Perbedaan Poligon OSS & PTP
                </label>
                <select
                  value={formData.status_poligon}
                  onChange={(e) => setField('status_poligon', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-800 focus:outline-none"
                >
                  <option>Tidak ada</option>
                  <option>Ada</option>
                </select>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-sm font-semibold text-blue-950">
                  A. RTRW Provinsi Jawa Timur (Perda No. 10/2023) — Bagian 3 Dokumen
                </h4>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-12">
                  <div className="sm:col-span-6">
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Zona Provinsi
                    </label>
                    <select
                      value={formData.zona_prov}
                      onChange={(e) => setField('zona_prov', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-800 focus:outline-none"
                    >
                      {effectiveMasterZona.prov.length === 0 && (
                        <option value="">-- Bank_KUZ_Prov kosong --</option>
                      )}
                      {effectiveMasterZona.prov.map((z) => (
                        <option key={z.namaZona} value={z.namaZona}>
                          {z.namaZona}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Luas Provinsi (m²)
                    </label>
                    <input
                      type="text"
                      value={formData.luas_prov}
                      onChange={(e) => setField('luas_prov', e.target.value)}
                      placeholder="1.255,80"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-blue-800 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Persentase (%)
                    </label>
                    <input
                      type="text"
                      value={formData.persen_prov}
                      onChange={(e) => setField('persen_prov', e.target.value)}
                      placeholder="100"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-blue-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-sm font-semibold text-blue-950">
                  B. RTRW Kabupaten Pasuruan (Permen ATR/BPN No. 11/2024) — Bagian 4 Dokumen
                </h4>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-12">
                  <div className="sm:col-span-6">
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Zona 1 (Utama)
                    </label>
                    <select
                      value={formData.zona_kab_1}
                      onChange={(e) => setField('zona_kab_1', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-800 focus:outline-none"
                    >
                      {effectiveMasterZona.kab.length === 0 && (
                        <option value="">-- Bank_KUZ_Kab kosong --</option>
                      )}
                      {effectiveMasterZona.kab.map((z) => (
                        <option key={z.namaZona} value={z.namaZona}>
                          {z.namaZona}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Luas Zona 1 (m²)
                    </label>
                    <input
                      type="text"
                      value={formData.luas_kab_1}
                      onChange={(e) => setField('luas_kab_1', e.target.value)}
                      placeholder="1.255,8"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-blue-800 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Persentase (%)
                    </label>
                    <input
                      type="text"
                      value={formData.persen_kab_1}
                      onChange={(e) => setField('persen_kab_1', e.target.value)}
                      placeholder="100"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-blue-800 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Zona 2 (Opsional jika terbelah)
                    </label>
                    <select
                      value={formData.zona_kab_2}
                      onChange={(e) => setField('zona_kab_2', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-800 focus:outline-none"
                    >
                      <option value="">-- Tidak Ada --</option>
                      {effectiveMasterZona.kab.map((z) => (
                        <option key={z.namaZona} value={z.namaZona}>
                          {z.namaZona}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Luas Zona 2 (m²)
                    </label>
                    <input
                      type="text"
                      value={formData.luas_kab_2}
                      onChange={(e) => setField('luas_kab_2', e.target.value)}
                      disabled={!formData.zona_kab_2}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-blue-800 focus:outline-none disabled:bg-slate-50"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Persentase (%)
                    </label>
                    <input
                      type="text"
                      value={formData.persen_kab_2}
                      onChange={(e) => setField('persen_kab_2', e.target.value)}
                      disabled={!formData.zona_kab_2}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-blue-800 focus:outline-none disabled:bg-slate-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3 */}
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="border-b border-slate-100 pb-3 text-base font-semibold text-slate-900">
              03. Pertampalan Sektoral & Rekomendasi (PTP, Hutan, LSD, LBS, LP2B, MOMI, GISTARU)
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-12">
              <div className="sm:col-span-3">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Kawasan Hutan (SK 6606)
                </label>
                <select
                  value={formData.status_hutan}
                  onChange={(e) => setField('status_hutan', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-800 focus:outline-none"
                >
                  <option>tidak masuk</option>
                  <option>masuk</option>
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Status LSD (SK 1589)
                </label>
                <select
                  value={formData.status_lsd}
                  onChange={(e) => setField('status_lsd', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-800 focus:outline-none"
                >
                  <option>tidak masuk</option>
                  <option>masuk</option>
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Status LBS (SK 6734)
                </label>
                <select
                  value={formData.status_lbs}
                  onChange={(e) => setField('status_lbs', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-800 focus:outline-none"
                >
                  <option>tidak masuk</option>
                  <option>masuk</option>
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Status LP2B (SK Bupati 521.4)
                </label>
                <select
                  value={formData.status_lp2b}
                  onChange={(e) => setField('status_lp2b', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-800 focus:outline-none"
                >
                  <option>tidak masuk</option>
                  <option>masuk</option>
                </select>
              </div>

              <div className="sm:col-span-4">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Nomor Surat PTP
                </label>
                <input
                  type="text"
                  value={formData.no_ptp}
                  onChange={(e) => setField('no_ptp', e.target.value)}
                  placeholder="35.14/PTP.O1/318/VIII/2026"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-blue-800 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Tanggal Surat PTP
                </label>
                <input
                  type="text"
                  value={formData.tgl_ptp_surat}
                  onChange={(e) => setField('tgl_ptp_surat', e.target.value)}
                  placeholder="18 Agustus 2026"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Luas Sesuai PTP (m²)
                </label>
                <input
                  type="text"
                  value={formData.luas_ptp}
                  onChange={(e) => setField('luas_ptp', e.target.value)}
                  placeholder="1.260 m² (100%)"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Penggunaan Tanah Eksisting
                </label>
                <input
                  type="text"
                  value={formData.guna_tanah}
                  onChange={(e) => setField('guna_tanah', e.target.value)}
                  placeholder="Industri"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Tgl Cek Portal MOMI
                </label>
                <input
                  type="text"
                  value={formData.tgl_momi}
                  onChange={(e) => setField('tgl_momi', e.target.value)}
                  placeholder="7 September 2026"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Status WIUP/IUP (MOMI)
                </label>
                <select
                  value={formData.status_momi}
                  onChange={(e) => setField('status_momi', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-800 focus:outline-none"
                >
                  <option>tidak bertampalan</option>
                  <option>bertampalan</option>
                </select>
              </div>

              <div className="sm:col-span-4">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Tgl Cek GISTARU KKPR
                </label>
                <input
                  type="text"
                  value={formData.tgl_gistaru}
                  onChange={(e) => setField('tgl_gistaru', e.target.value)}
                  placeholder="7 September 2026"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Status GISTARU KKPR
                </label>
                <select
                  value={formData.status_gistaru}
                  onChange={(e) => setField('status_gistaru', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-800 focus:outline-none"
                >
                  <option>tidak bertampalan</option>
                  <option>bertampalan</option>
                </select>
              </div>
              <div className="sm:col-span-4">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Catatan Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  value={formData.telaah_lain}
                  onChange={(e) => setField('telaah_lain', e.target.value)}
                  placeholder="Kosongkan jika tidak ada"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-12">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Teks Rekomendasi (Kosongkan untuk otomatis: "disetujui seluruhnya seluas ± ...")
                </label>
                <input
                  type="text"
                  value={formData.rekomendasi_status}
                  onChange={(e) => setField('rekomendasi_status', e.target.value)}
                  placeholder={`disetujui seluruhnya seluas ± ${formData.luas_permohonan || '1.255,8'} m² melalui ${formData.jenis_kkpr} KKPR`}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-800 focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* SECTION 4 */}
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="border-b border-slate-100 pb-3 text-base font-semibold text-slate-900">
              04. Unggah Gambar Peta & Lampiran (Urutan Sesuai Format PDF)
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(
                [
                  { key: 'img_peta_prov', label: '1. Peta Overlay RTRW Prov. Jatim (Hal. 2)' },
                  { key: 'img_peta_kab', label: '2. Peta Overlay RTRW Kab. Pasuruan (Hal. 3)' },
                  { key: 'img_momi', label: '3. Screenshot Portal Minerba MOMI (Hal. 5)' },
                  { key: 'img_validasi', label: '4. Screenshot Cek Akun OSS Pelaku Usaha (Hal. 5)' },
                ] as const
              ).map((slot) => {
                const file = formData[slot.key];
                const previewUrl = previews[slot.key];
                return (
                  <div
                    key={slot.key}
                    className="flex flex-col justify-between rounded-lg border border-dashed border-slate-300 bg-slate-50/70 p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-800">
                        {slot.label}
                      </span>
                      {file && (
                        <button
                          type="button"
                          onClick={() => handleImageChange(slot.key, null)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-red-700 hover:underline"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Hapus
                        </button>
                      )}
                    </div>

                    {previewUrl ? (
                      <div className="mt-3 overflow-hidden rounded-md border border-slate-200 bg-white">
                        <img
                          src={previewUrl}
                          alt={slot.label}
                          className="h-36 w-full object-contain bg-slate-100"
                        />
                        <p className="truncate px-2.5 py-1.5 text-[11px] text-slate-600">
                          {file?.name}
                        </p>
                      </div>
                    ) : (
                      <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-md border border-slate-200 bg-white py-6 text-center transition-colors hover:border-blue-800 hover:bg-blue-50/30">
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                        <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-blue-900">
                          <Upload className="h-3.5 w-3.5" />
                          Pilih Gambar
                        </span>
                        <span className="mt-0.5 text-[11px] text-slate-400">
                          PNG atau JPG
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleImageChange(slot.key, e.target.files?.[0] || null)
                          }
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <button
            type="submit"
            disabled={processing}
            className="w-full rounded-xl bg-blue-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-60"
          >
            {processing
              ? 'Sedang Memproses Google Sheets & Ekspor .DOCX...'
              : 'Simpan Data ke Sheets & Generate Kajian (.DOCX)'}
          </button>
        </form>

        {/* Sticky Live Preview Panel */}
        <aside className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 xl:sticky xl:top-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Pratinjau Otomatis KUZ & Intensitas
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Teks berikut akan ditarik otomatis ke dokumen Google Docs berdasarkan pilihan zona Anda.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <p className="font-semibold text-slate-800">Intensitas Ruang Kabupaten</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-center">
                  <span className="block text-[11px] text-slate-500">KDB Maks</span>
                  <span className="mt-0.5 block font-mono text-sm font-semibold tabular-nums text-slate-900">
                    {selectedKab1?.kdb || '-'}
                  </span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-center">
                  <span className="block text-[11px] text-slate-500">KLB Maks</span>
                  <span className="mt-0.5 block font-mono text-sm font-semibold tabular-nums text-slate-900">
                    {selectedKab1?.klb || '-'}
                  </span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-center">
                  <span className="block text-[11px] text-slate-500">KDH Min</span>
                  <span className="mt-0.5 block font-mono text-sm font-semibold tabular-nums text-slate-900">
                    {selectedKab1?.kdh || '-'}
                  </span>
                </div>
              </div>
              {selectedKab2 &&
                (selectedKab2.kdb !== selectedKab1?.kdb ||
                  selectedKab2.klb !== selectedKab1?.klb ||
                  selectedKab2.kdh !== selectedKab1?.kdh) && (
                  <p className="mt-2 text-[11px] text-slate-500">
                    Zona 2 ({selectedKab2.namaZona}): KDB {selectedKab2.kdb} · KLB {selectedKab2.klb} · KDH {selectedKab2.kdh}
                  </p>
                )}
            </div>

            <div className="border-t border-slate-100 pt-3">
              <p className="font-semibold text-slate-800">Arahan Zonasi Prov. Jatim</p>
              <p className="mt-1 font-mono text-[11px] text-slate-700">
                A. {formData.zona_prov || '-'} ± {formData.luas_prov || '-'} m² ({formData.persen_prov || '0'}%)
              </p>
              <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-600">
                {selectedProv?.isiKuz || 'Pilih zona provinsi untuk melihat teks IAZ.'}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <p className="font-semibold text-slate-800">Rincian Pola Ruang Kab. Pasuruan</p>
              <p className="mt-1 whitespace-pre-line font-mono text-[11px] text-slate-700">
                A. {formData.zona_kab_1 || '-'} ± {formData.luas_kab_1 || '-'} m² ({formData.persen_kab_1 || '0'}%)
                {formData.zona_kab_2
                  ? `;\nB. ${formData.zona_kab_2} ± ${formData.luas_kab_2 || '-'} m² (${formData.persen_kab_2 || '0'}%)`
                  : ''}
              </p>
              <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-600">
                {selectedKab1?.isiKuz || 'Pilih zona kabupaten untuk melihat pasal KUZ.'}
              </p>
              {selectedKab2 && (
                <p className="mt-2 whitespace-pre-line border-t border-slate-100 pt-2 leading-relaxed text-slate-600">
                  {selectedKab2.isiKuz}
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
