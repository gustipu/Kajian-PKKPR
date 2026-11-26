export interface ZonaKab {
  namaZona: string;
  isiKuz: string;
  kdb: string;
  klb: string;
  kdh: string;
}

export interface ZonaProv {
  namaZona: string;
  isiKuz: string;
}

export interface MasterZonaData {
  kab: ZonaKab[];
  prov: ZonaProv[];
}

export interface KajianFormData {
  jenis_kkpr: string;
  kategori_usaha: string;
  jalur: string;
  nama_perusahaan: string;
  status_modal: string;
  kode_kbli: string;
  judul_kbli: string;
  penjelasan_kbli: string;
  id_proyek: string;
  desa: string;
  kecamatan: string;
  luas_permohonan: string;
  tgl_oss: string;
  tgl_validasi: string;
  tgl_pnbp: string;
  tgl_ptp: string;
  tgl_unggah_ptp: string;
  status_poligon: string;
  zona_kab_1: string;
  luas_kab_1: string;
  persen_kab_1: string;
  zona_kab_2: string;
  luas_kab_2: string;
  persen_kab_2: string;
  zona_prov: string;
  luas_prov: string;
  persen_prov: string;
  status_lbs: string;
  status_lsd: string;
  no_ptp: string;
  tgl_ptp_surat: string;
  luas_ptp: string;
  guna_tanah: string;
  status_hutan: string;
  status_lp2b: string;
  tgl_momi: string;
  status_momi: string;
  tgl_gistaru: string;
  status_gistaru: string;
  skala_usaha: string;
  rekomendasi_status: string;
  kelengkapan_koordinat: string;
  kelengkapan_shp: string;
  kelengkapan_tanah: string;
  kelengkapan_lantai_jml: string;
  kelengkapan_lantai_luas: string;
  kelengkapan_rencana_teknis: string;
  telaah_lain: string;
  img_validasi: File | null;
  img_peta_kab: File | null;
  img_peta_prov: File | null;
  img_momi: File | null;
}

export interface DataIndukRow {
  rowIndex: number;
  timestamp: string;
  jenis_kkpr: string;
  kategori_usaha: string;
  jalur: string;
  nama_perusahaan: string;
  kode_kbli: string;
  judul_kbli: string;
  penjelasan_kbli: string;
  tgl_oss: string;
  tgl_validasi: string;
  tgl_pnbp: string;
  tgl_ptp: string;
  tgl_unggah_ptp: string;
  id_proyek: string;
  desa: string;
  kecamatan: string;
  luas_permohonan: string;
  status_modal: string;
  status_poligon: string;
  zona_kab_1: string;
  luas_kab_1: string;
  persen_kab_1: string;
  zona_kab_2: string;
  luas_kab_2: string;
  persen_kab_2: string;
  zona_prov: string;
  luas_prov: string;
  persen_prov: string;
  no_ptp: string;
  status_lbs_lsd_hutan_momi: string;
}

export interface WorkspaceConfig {
  spreadsheetId: string;
  spreadsheetName?: string;
  templateDocId: string;
  templateDocName?: string;
  outputFolderId: string;
  outputFolderName?: string;
}

export interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export interface GeneratedKajianResult {
  docId: string;
  fileName: string;
  urlEdit: string;
  docxBlobUrl: string;
  sheetRowUpdated: boolean;
  warnings: string[];
}

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  description: string;
  details: string[];
  confirmLabel: string;
  variant?: 'primary' | 'danger';
  onConfirm: () => Promise<void> | void;
}
