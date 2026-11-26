import { clearAccessToken, getAccessToken } from './googleAuth';
import { OFFICIAL_KUZ_KAB_PASURUAN, OFFICIAL_KUZ_PROV_JATIM } from '../data/kuzDatabase';
import {
  DataIndukRow,
  DriveItem,
  GeneratedKajianResult,
  KajianFormData,
  MasterZonaData,
  WorkspaceConfig,
  ZonaKab,
  ZonaProv,
} from '../types/pkkpr';

export class AuthExpiredError extends Error {
  constructor(message = 'Sesi akses Google Workspace telah berakhir. Silakan masuk kembali.') {
    super(message);
    this.name = 'AuthExpiredError';
  }
}

export const DATA_INDUK_HEADERS = [
  'Timestamp',
  'Jenis_KKPR',
  'Kategori_Usaha',
  'Jalur',
  'Nama_Perusahaan',
  'Kode_KBLI',
  'Judul_KBLI',
  'Penjelasan_KBLI',
  'Tgl_OSS',
  'Tgl_Validasi',
  'Tgl_PNBP',
  'Tgl_PTP',
  'Tgl_Unggah_PTP',
  'ID_Proyek',
  'Desa',
  'Kecamatan',
  'Luas_Permohonan',
  'Status_Modal',
  'Status_Poligon',
  'Zona_Kab_1',
  'Luas_Kab_1',
  'Persen_Kab_1',
  'Zona_Kab_2',
  'Luas_Kab_2',
  'Persen_Kab_2',
  'Zona_Prov',
  'Luas_Prov',
  'Persen_Prov',
  'No_PTP',
  'Status_LBS_LSD_Hutan_MOMI',
];

const DEFAULT_KUZ_KAB_ROWS: string[][] = [
  ['Nama_Zona', 'Isi_KUZ', 'KDB', 'KLB', 'KDH'],
  ...OFFICIAL_KUZ_KAB_PASURUAN.map((z) => [z.namaZona, z.isiKuz, z.kdb, z.klb, z.kdh]),
];

const DEFAULT_KUZ_PROV_ROWS: string[][] = [
  ['Nama_Zona', 'Isi_KUZ'],
  ...OFFICIAL_KUZ_PROV_JATIM.map((z) => [z.namaZona, z.isiKuz]),
];

async function requireToken(): Promise<string> {
  const token = await getAccessToken();
  if (!token) {
    throw new AuthExpiredError('Silakan masuk dengan akun Google terlebih dahulu.');
  }
  return token;
}

async function googleFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await requireToken();
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAccessToken();
    throw new AuthExpiredError();
  }

  return response;
}

async function googleJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await googleFetch(url, { ...options, headers });
  if (!res.ok) {
    let errMsg = `Google API error (${res.status})`;
    try {
      const errJson = await res.json();
      if (errJson?.error?.message) {
        errMsg = errJson.error.message;
      }
    } catch {
      // ignore json parse failure
    }
    throw new Error(errMsg);
  }
  return res.json() as Promise<T>;
}

export function extractDriveId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const match =
    trimmed.match(/\/d\/([a-zA-Z0-9_-]{10,})/) ||
    trimmed.match(/\/folders\/([a-zA-Z0-9_-]{10,})/) ||
    trimmed.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  return match ? match[1] : trimmed;
}

export async function listDriveItems(
  mimeType: string,
  searchQuery = ''
): Promise<DriveItem[]> {
  const clauses = [`mimeType='${mimeType}'`, 'trashed=false'];
  if (searchQuery.trim()) {
    const escaped = searchQuery.trim().replace(/'/g, "\\'");
    clauses.push(`name contains '${escaped}'`);
  }
  const q = encodeURIComponent(clauses.join(' and '));
  const fields = encodeURIComponent('files(id,name,mimeType,modifiedTime,webViewLink)');
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=modifiedTime desc&pageSize=25&supportsAllDrives=true&includeItemsFromAllDrives=true&fields=${fields}`;
  const data = await googleJson<{ files?: DriveItem[] }>(url);
  return data.files || [];
}

export async function getDriveItemMetadata(fileId: string): Promise<DriveItem> {
  const cleanId = extractDriveId(fileId);
  const fields = encodeURIComponent('id,name,mimeType,modifiedTime,webViewLink');
  return googleJson<DriveItem>(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(cleanId)}?supportsAllDrives=true&fields=${fields}`
  );
}

export async function fetchMasterZona(spreadsheetId: string): Promise<MasterZonaData> {
  const ranges = [
    encodeURIComponent('Bank_KUZ_Kab!A2:E'),
    encodeURIComponent('Bank_KUZ_Prov!A2:B'),
  ];
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    spreadsheetId
  )}/values:batchGet?ranges=${ranges[0]}&ranges=${ranges[1]}`;

  const data = await googleJson<{
    valueRanges?: Array<{ values?: string[][] }>;
  }>(url);

  const rawKab = data.valueRanges?.[0]?.values || [];
  const rawProv = data.valueRanges?.[1]?.values || [];

  const kab: ZonaKab[] = rawKab
    .filter((r) => r[0] && r[0].trim() !== '')
    .map((r) => ({
      namaZona: (r[0] || '').trim(),
      isiKuz: (r[1] || '').trim(),
      kdb: (r[2] || '-').trim(),
      klb: (r[3] || '-').trim(),
      kdh: (r[4] || '-').trim(),
    }));

  const prov: ZonaProv[] = rawProv
    .filter((r) => r[0] && r[0].trim() !== '')
    .map((r) => ({
      namaZona: (r[0] || '').trim(),
      isiKuz: (r[1] || '').trim(),
    }));

  return { kab, prov };
}

export async function fetchDataInduk(spreadsheetId: string): Promise<DataIndukRow[]> {
  const range = encodeURIComponent('Data_Induk!A2:AD');
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    spreadsheetId
  )}/values/${range}`;

  const data = await googleJson<{ values?: string[][] }>(url);
  const rows = data.values || [];

  return rows
    .map((r, idx) => ({
      rowIndex: idx + 2,
      timestamp: r[0] || '',
      jenis_kkpr: r[1] || '',
      kategori_usaha: r[2] || '',
      jalur: r[3] || '',
      nama_perusahaan: r[4] || '',
      kode_kbli: r[5] || '',
      judul_kbli: r[6] || '',
      penjelasan_kbli: r[7] || '',
      tgl_oss: r[8] || '',
      tgl_validasi: r[9] || '',
      tgl_pnbp: r[10] || '',
      tgl_ptp: r[11] || '',
      tgl_unggah_ptp: r[12] || '',
      id_proyek: r[13] || '',
      desa: r[14] || '',
      kecamatan: r[15] || '',
      luas_permohonan: r[16] || '',
      status_modal: r[17] || '',
      status_poligon: r[18] || '',
      zona_kab_1: r[19] || '',
      luas_kab_1: r[20] || '',
      persen_kab_1: r[21] || '',
      zona_kab_2: r[22] || '',
      luas_kab_2: r[23] || '',
      persen_kab_2: r[24] || '',
      zona_prov: r[25] || '',
      luas_prov: r[26] || '',
      persen_prov: r[27] || '',
      no_ptp: r[28] || '',
      status_lbs_lsd_hutan_momi: r[29] || '',
    }))
    .filter((row) =>
      Boolean(
        row.timestamp.trim() ||
          row.nama_perusahaan.trim() ||
          row.id_proyek.trim() ||
          row.kode_kbli.trim() ||
          row.desa.trim() ||
          row.kecamatan.trim()
      )
    )
    .reverse();
}

export async function appendZonaKab(spreadsheetId: string, zona: ZonaKab): Promise<void> {
  const range = encodeURIComponent('Bank_KUZ_Kab!A:E');
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    spreadsheetId
  )}/values/${range}:append?valueInputOption=USER_ENTERED`;

  await googleJson(url, {
    method: 'POST',
    body: JSON.stringify({
      values: [[zona.namaZona, zona.isiKuz, zona.kdb, zona.klb, zona.kdh]],
    }),
  });
}

export async function appendZonaProv(spreadsheetId: string, zona: ZonaProv): Promise<void> {
  const range = encodeURIComponent('Bank_KUZ_Prov!A:B');
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    spreadsheetId
  )}/values/${range}:append?valueInputOption=USER_ENTERED`;

  await googleJson(url, {
    method: 'POST',
    body: JSON.stringify({
      values: [[zona.namaZona, zona.isiKuz]],
    }),
  });
}

export async function syncOfficialKuzToSheets(
  spreadsheetId: string
): Promise<{ kabCount: number; provCount: number }> {
  const encodedId = encodeURIComponent(spreadsheetId);

  await googleJson(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodedId}/values:batchClear`,
    {
      method: 'POST',
      body: JSON.stringify({
        ranges: ['Bank_KUZ_Kab!A1:E', 'Bank_KUZ_Prov!A1:B'],
      }),
    }
  );

  await googleJson(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodedId}/values:batchUpdate`,
    {
      method: 'POST',
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: `Bank_KUZ_Kab!A1:E${DEFAULT_KUZ_KAB_ROWS.length}`,
            values: DEFAULT_KUZ_KAB_ROWS,
          },
          {
            range: `Bank_KUZ_Prov!A1:B${DEFAULT_KUZ_PROV_ROWS.length}`,
            values: DEFAULT_KUZ_PROV_ROWS,
          },
        ],
      }),
    }
  );

  return {
    kabCount: OFFICIAL_KUZ_KAB_PASURUAN.length,
    provCount: OFFICIAL_KUZ_PROV_JATIM.length,
  };
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth || 800;
      const h = img.naturalHeight || 500;
      URL.revokeObjectURL(url);
      resolve({ width: w, height: h });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 800, height: 500 });
    };
    img.src = url;
  });
}

async function normalizeImageForDocs(file: File): Promise<File> {
  const supported = ['image/png', 'image/jpeg', 'image/gif'];
  if (supported.includes(file.type.toLowerCase())) {
    return file;
  }
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 800;
        canvas.height = img.naturalHeight || 500;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            resolve(file);
            return;
          }
          const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
          resolve(new File([blob], `${baseName}.png`, { type: 'image/png' }));
        }, 'image/png');
      } catch {
        URL.revokeObjectURL(url);
        resolve(file);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

async function uploadTempImageToDrive(
  rawFile: File,
  parentFolderId: string,
  namePrefix: string
): Promise<{ fileId: string; imageUrl: string; canInsert: boolean; warning?: string }> {
  const file = await normalizeImageForDocs(rawFile);
  const token = await requireToken();
  const metadata = {
    name: `_tmp_${namePrefix}_${Date.now()}_${file.name}`,
    parents: [parentFolderId],
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id,webContentLink',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }
  );

  if (uploadRes.status === 401) {
    clearAccessToken();
    throw new AuthExpiredError();
  }
  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Gagal mengunggah gambar lampiran ke Drive: ${errText}`);
  }

  const uploaded = (await uploadRes.json()) as { id: string; webContentLink?: string };

  // Grant temporary public reader permission so Google Docs server can fetch the inline image
  try {
    const permRes = await googleFetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(uploaded.id)}/permissions?supportsAllDrives=true`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'reader', type: 'anyone' }),
      }
    );
    if (!permRes.ok) {
      return {
        fileId: uploaded.id,
        imageUrl: `https://drive.google.com/uc?export=view&id=${uploaded.id}`,
        canInsert: false,
        warning: `Izin berbagi tautan untuk ${namePrefix} dibatasi oleh kebijakan domain; gambar dilewati pada dokumen Docs.`,
      };
    }
  } catch {
    return {
      fileId: uploaded.id,
      imageUrl: `https://drive.google.com/uc?export=view&id=${uploaded.id}`,
      canInsert: false,
      warning: `Gagal mengatur akses gambar sementara untuk ${namePrefix}.`,
    };
  }

  return {
    fileId: uploaded.id,
    imageUrl: `https://drive.google.com/uc?export=view&id=${uploaded.id}`,
    canInsert: true,
  };
}

async function deleteDriveFileQuietly(fileId: string): Promise<void> {
  try {
    await googleFetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?supportsAllDrives=true`,
      {
        method: 'DELETE',
      }
    );
  } catch {
    // Non-critical cleanup failure
  }
}

interface DocsElement {
  startIndex?: number;
  endIndex?: number;
  paragraph?: {
    elements?: Array<{
      startIndex?: number;
      endIndex?: number;
      textRun?: { content?: string };
    }>;
  };
  table?: {
    tableRows?: Array<{
      tableCells?: Array<{
        content?: DocsElement[];
      }>;
    }>;
  };
}

interface PlaceholderMatch {
  placeholder: string;
  startIndex: number;
  endIndex: number;
}

function collectPlaceholdersFromElements(
  elements: DocsElement[],
  targets: string[],
  matches: PlaceholderMatch[]
) {
  for (const el of elements) {
    if (el.paragraph?.elements) {
      // Reconstruct paragraph text with exact index offsets
      let fullText = '';
      const runOffsets: Array<{ docStart: number; textStart: number; length: number }> = [];
      for (const pe of el.paragraph.elements) {
        const content = pe.textRun?.content || '';
        if (content && typeof pe.startIndex === 'number') {
          runOffsets.push({
            docStart: pe.startIndex,
            textStart: fullText.length,
            length: content.length,
          });
          fullText += content;
        }
      }

      const toDocStartIndex = (textIdx: number): number | null => {
        for (const r of runOffsets) {
          if (textIdx >= r.textStart && textIdx < r.textStart + r.length) {
            return r.docStart + (textIdx - r.textStart);
          }
        }
        return null;
      };

      const toDocEndIndex = (textIdx: number): number | null => {
        for (const r of runOffsets) {
          if (textIdx > r.textStart && textIdx <= r.textStart + r.length) {
            return r.docStart + (textIdx - r.textStart);
          }
        }
        return null;
      };

      for (const target of targets) {
        let searchFrom = 0;
        while (searchFrom < fullText.length) {
          const foundAt = fullText.indexOf(target, searchFrom);
          if (foundAt === -1) break;
          const docStart = toDocStartIndex(foundAt);
          const docEnd = toDocEndIndex(foundAt + target.length);
          if (docStart !== null && docEnd !== null) {
            matches.push({
              placeholder: target,
              startIndex: docStart,
              endIndex: docEnd,
            });
          }
          searchFrom = foundAt + target.length;
        }
      }
    }

    if (el.table?.tableRows) {
      for (const row of el.table.tableRows) {
        for (const cell of row.tableCells || []) {
          if (cell.content) {
            collectPlaceholdersFromElements(cell.content, targets, matches);
          }
        }
      }
    }
  }
}

interface TextSegmentSpec {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

interface ParagraphSpec {
  segments: TextSegmentSpec[];
  alignment?: 'START' | 'CENTER' | 'JUSTIFIED';
  indentStart?: number;
  indentFirstLine?: number;
  spaceAbove?: number;
  spaceBelow?: number;
  lineSpacing?: number;
}

const KELENGKAPAN_TABLE_DATA: string[][] = [
  ['No', 'Kelengkapan', 'Data', 'Status Lengkap'],
  ['1.', 'Koordinat Lokasi', '{{kelengkapan_koordinat}}', 'Ya'],
  ['2.', 'Koordinat Lokasi SHP', '{{kelengkapan_shp}}', 'Ya'],
  ['3.', 'Kebutuhan Luas Lahan', '{{kelengkapan_luas}} m²', 'Ya'],
  [
    '4.',
    'Informasi Penggunaan Tanah\n(Dalam Bentuk Surat Kepemilikan)',
    '{{kelengkapan_tanah}}',
    'Ya',
  ],
  ['5.', 'Informasi Jenis Kegiatan', 'KBLI {{kode_kbli}}', 'Ya'],
  ['6.', 'Rencana Jumlah Lantai Bangunan', '{{kelengkapan_lantai_jml}}', 'Ya'],
  ['7.', 'Rencana Luas Lantai Bangunan', '{{kelengkapan_lantai_luas}}', 'Ya'],
  [
    '8.',
    'Rencana Teknis Bangunan Dan/\nAtau Rencana Induk Kawasan',
    '{{kelengkapan_rencana_teknis}}',
    'Ya',
  ],
];

const TEMPLATE_PARAGRAPHS: ParagraphSpec[] = [
  {
    segments: [{ text: 'KAJIAN', bold: true }],
    alignment: 'CENTER',
    spaceBelow: 1,
    lineSpacing: 115,
  },
  {
    segments: [{ text: '{{jenis_kkpr_upper}} KESESUAIAN KEGIATAN PEMANFAATAN RUANG', bold: true }],
    alignment: 'CENTER',
    spaceBelow: 1,
    lineSpacing: 115,
  },
  {
    segments: [{ text: '{{nama_perusahaan_upper}} {{id_proyek}}', bold: true }],
    alignment: 'CENTER',
    spaceBelow: 8,
    lineSpacing: 115,
  },
  {
    segments: [
      {
        text: 'Menindaklanjuti permohonan {{jenis_kkpr}} KKPR {{kategori_usaha}} {{jalur}} dan telah dinyatakan memenuhi syarat kelengkapan data serta telah dilakukan kajian penilaian KKPR berdasarkan Peraturan Menteri Agraria dan Tata Ruang/Kepala Badan Pertanahan Nasional Nomor 13 Tahun 2021 tentang Pelaksanaan KKPR dan SPPR, bersama ini disampaikan:',
      },
    ],
    alignment: 'JUSTIFIED',
    spaceBelow: 4,
    lineSpacing: 115,
  },
  {
    segments: [{ text: 'I.  Kronologi dan Kelengkapan Data' }],
    alignment: 'START',
    spaceAbove: 4,
    spaceBelow: 2,
    lineSpacing: 115,
  },
  {
    segments: [
      { text: '1.  Rencana kegiatan ' },
      { text: 'KBLI {{kode_kbli}} {{judul_kbli}}', bold: true },
      { text: ' di Kabupaten Pasuruan, Provinsi Jawa Timur:' },
    ],
    alignment: 'JUSTIFIED',
    indentStart: 36,
    indentFirstLine: 18,
    spaceBelow: 2,
    lineSpacing: 115,
  },
  {
    segments: [{ text: '1)  Permohonan masuk : tanggal {{tgl_oss}};' }],
    alignment: 'JUSTIFIED',
    indentStart: 54,
    indentFirstLine: 36,
    spaceBelow: 1,
    lineSpacing: 115,
  },
  {
    segments: [{ text: '2)  Validasi lengkap: tanggal {{tgl_validasi}};' }],
    alignment: 'JUSTIFIED',
    indentStart: 54,
    indentFirstLine: 36,
    spaceBelow: 1,
    lineSpacing: 115,
  },
  {
    segments: [{ text: '3)  Penerbitan PTP: tanggal {{tgl_ptp}};' }],
    alignment: 'JUSTIFIED',
    indentStart: 54,
    indentFirstLine: 36,
    spaceBelow: 1,
    lineSpacing: 115,
  },
  {
    segments: [
      {
        text: '4)  Lokasi Desa/Kelurahan {{desa}} Kecamatan {{kecamatan}}, Kabupaten Pasuruan, Provinsi Jawa Timur;',
      },
    ],
    alignment: 'JUSTIFIED',
    indentStart: 54,
    indentFirstLine: 36,
    spaceBelow: 1,
    lineSpacing: 115,
  },
  {
    segments: [{ text: '5)  Luas permohonan {{luas_permohonan}} m² dan' }],
    alignment: 'JUSTIFIED',
    indentStart: 54,
    indentFirstLine: 36,
    spaceBelow: 2,
    lineSpacing: 115,
  },
  {
    segments: [
      { text: '2.  Permohonan ' },
      { text: '{{nama_perusahaan}}', bold: true },
      {
        text: ' dinyatakan lengkap dan divalidasi dengan melampirkan dokumen sebagai berikut:',
      },
    ],
    alignment: 'JUSTIFIED',
    indentStart: 36,
    indentFirstLine: 18,
    spaceBelow: 6,
    lineSpacing: 115,
  },
  {
    segments: [{ text: '{{TABLE_KELENGKAPAN}}' }],
    alignment: 'CENTER',
    spaceBelow: 6,
    lineSpacing: 115,
  },
  {
    segments: [{ text: 'II.  Hasil Analisis' }],
    alignment: 'START',
    spaceAbove: 6,
    spaceBelow: 2,
    lineSpacing: 115,
  },
  {
    segments: [
      { text: 'Permohonan PKKPR untuk rencana kegiatan atas nama ' },
      { text: '{{nama_perusahaan}}', bold: true },
      { text: ' telah selesai dikaji dengan hasil analisis sebagai berikut:' },
    ],
    alignment: 'JUSTIFIED',
    indentStart: 18,
    indentFirstLine: 18,
    spaceBelow: 2,
    lineSpacing: 115,
  },
  {
    segments: [
      { text: '1.  ' },
      { text: '{{status_poligon}} perbedaan', bold: true },
      { text: ' antara polygon permohonan dan Pertimbangan Teknis Pertanahan' },
    ],
    alignment: 'JUSTIFIED',
    indentStart: 36,
    indentFirstLine: 18,
    spaceBelow: 2,
    lineSpacing: 115,
  },
  {
    segments: [
      {
        text: '2.  RTRW yang tersedia pada lokasi rencana kegiatan adalah RTRW Provinsi Jawa Timur (Peraturan Daerah Provinsi Jawa Timur Nomor 10 Tahun 2023 Tentang Rencana Tata Ruang Wilayah Provinsi Jawa Timur Tahun 2023-2043) dan Peraturan Menteri Agraria Dan Tata Ruang/ Kepala Badan Pertanahan Nasional Republik Indonesia Nomor 11 Tahun 2024 Tentang Rencana Tata Ruang Wilayah Kabupaten Pasuruan). Berdasarkan hal tersebut, maka penilaian KKPR diawali dengan kajian terhadap RTRW Provinsi Jawa Timur;',
      },
    ],
    alignment: 'JUSTIFIED',
    indentStart: 36,
    indentFirstLine: 18,
    spaceBelow: 2,
    lineSpacing: 115,
  },
  {
    segments: [
      {
        text: '3.  Berdasarkan Peraturan Daerah Provinsi Jawa Timur Nomor 10 Tahun 2023 Tentang Rencana Tata Ruang Wilayah Provinsi Jawa Timur Tahun 2023-2043:',
      },
    ],
    alignment: 'JUSTIFIED',
    indentStart: 36,
    indentFirstLine: 18,
    spaceBelow: 2,
    lineSpacing: 115,
  },
  {
    segments: [{ text: '1)  Lokasi yang dimohonkan berada pada rencana pola ruang:' }],
    alignment: 'JUSTIFIED',
    indentStart: 54,
    indentFirstLine: 36,
    spaceBelow: 2,
    lineSpacing: 115,
  },
  {
    segments: [{ text: '{{rincian_pola_ruang_prov}}' }],
    alignment: 'JUSTIFIED',
    indentStart: 72,
    indentFirstLine: 54,
    spaceBelow: 4,
    lineSpacing: 115,
  },
  {
    segments: [{ text: '{{img_peta_prov}}' }],
    alignment: 'CENTER',
    spaceAbove: 4,
    spaceBelow: 4,
    lineSpacing: 115,
  },
  {
    segments: [{ text: '2)  Muatan rencana struktur ruang…' }],
    alignment: 'JUSTIFIED',
    indentStart: 54,
    indentFirstLine: 36,
    spaceBelow: 2,
    lineSpacing: 115,
  },
  {
    segments: [{ text: '3)  Muatan Indikasi Arahan Zonasi:' }],
    alignment: 'JUSTIFIED',
    indentStart: 54,
    indentFirstLine: 36,
    spaceBelow: 2,
    lineSpacing: 115,
  },
  {
    segments: [
      { text: 'a.  ' },
      { text: 'IAZ pola ruang {{zona_prov}}', bold: true, italic: true },
    ],
    alignment: 'JUSTIFIED',
    indentStart: 72,
    indentFirstLine: 54,
    spaceBelow: 2,
    lineSpacing: 115,
  },
  {
    segments: [{ text: '{{teks_kuz_prov}}' }],
    alignment: 'JUSTIFIED',
    indentStart: 72,
    indentFirstLine: 72,
    spaceBelow: 2,
    lineSpacing: 115,
  },
  {
    segments: [
      {
        text: '4)  Luas permohonan yang sesuai berdasarkan RTR seluas ± {{luas_prov}} m² ({{persen_prov}}%)',
      },
    ],
    alignment: 'JUSTIFIED',
    indentStart: 54,
    indentFirstLine: 36,
    spaceBelow: 3,
    lineSpacing: 115,
  },
  {
    segments: [
      {
        text: '4.  Berdasarkan Peraturan Menteri Agraria Dan Tata Ruang/ Kepala Badan Pertanahan Nasional Republik Indonesia Nomor 11 Tahun 2024 Tentang Rencana Tata Ruang Wilayah Kabupaten Pasuruan :',
      },
    ],
    alignment: 'JUSTIFIED',
    indentStart: 36,
    indentFirstLine: 18,
    spaceBelow: 2,
    lineSpacing: 115,
  },
  {
    segments: [{ text: '1)  Lokasi yang dimohonkan berada pada rencana pola ruang:' }],
    alignment: 'JUSTIFIED',
    indentStart: 54,
    indentFirstLine: 36,
    spaceBelow: 2,
    lineSpacing: 115,
  },
  {
    segments: [{ text: '{{rincian_pola_ruang_kab}}' }],
    alignment: 'JUSTIFIED',
    indentStart: 72,
    indentFirstLine: 54,
    spaceBelow: 4,
    lineSpacing: 115,
  },
  {
    segments: [{ text: '{{img_peta_kab}}' }],
    alignment: 'CENTER',
    spaceAbove: 4,
    spaceBelow: 4,
    lineSpacing: 115,
  },
  {
    segments: [{ text: '2)  Muatan rencana struktur ruang…' }],
    alignment: 'JUSTIFIED',
    indentStart: 54,
    indentFirstLine: 36,
    spaceBelow: 2,
    lineSpacing: 115,
  },
  {
    segments: [{ text: '3)  Muatan Indikasi Arahan Zonasi:' }],
    alignment: 'JUSTIFIED',
    indentStart: 54,
    indentFirstLine: 36,
    spaceBelow: 2,
    lineSpacing: 115,
  },
  {
    segments: [
      { text: 'A.  ' },
      { text: 'KUZ Pola Ruang {{zona_kab_display}}', bold: true, italic: true },
    ],
    alignment: 'JUSTIFIED',
    indentStart: 72,
    indentFirstLine: 54,
    spaceBelow: 2,
    lineSpacing: 115,
  },
  {
    segments: [{ text: '{{teks_kuz_kab}}' }],
    alignment: 'JUSTIFIED',
    indentStart: 72,
    indentFirstLine: 72,
    spaceBelow: 2,
    lineSpacing: 115,
  },
  {
    segments: [
      {
        text: '4)  Luas permohonan yang sesuai berdasarkan RTR seluas ± {{luas_kab_total}} m² ({{persen_kab_total}}%)',
      },
    ],
    alignment: 'JUSTIFIED',
    indentStart: 54,
    indentFirstLine: 36,
    spaceBelow: 3,
    lineSpacing: 115,
  },
  {
    segments: [
      {
        text: '5.  Berdasarkan Peraturan Menteri Agraria Dan Tata Ruang/ Kepala Badan Pertanahan Nasional Republik Indonesia Nomor 11 Tahun 2024 Tentang Rencana Tata Ruang Wilayah Kabupaten Pasuruan diarahkan Ketentuan Intensitas Pemanfaatan Ruang:',
      },
    ],
    alignment: 'JUSTIFIED',
    indentStart: 36,
    indentFirstLine: 18,
    spaceBelow: 2,
    lineSpacing: 115,
  },
  {
    segments: [{ text: '1)  KDB Maksimum: {{kdb}}' }],
    alignment: 'JUSTIFIED',
    indentStart: 54,
    indentFirstLine: 36,
    spaceBelow: 1,
    lineSpacing: 115,
  },
  {
    segments: [{ text: '2)  KLB Maksimum: {{klb}}' }],
    alignment: 'JUSTIFIED',
    indentStart: 54,
    indentFirstLine: 36,
    spaceBelow: 1,
    lineSpacing: 115,
  },
  {
    segments: [{ text: '3)  KDH Minimum: {{kdh}}' }],
    alignment: 'JUSTIFIED',
    indentStart: 54,
    indentFirstLine: 36,
    spaceBelow: 2,
    lineSpacing: 115,
  },
  {
    segments: [
      {
        text: '6.  Berdasarkan Pertimbangan Teknis Pertanahan untuk Kegiatan Penerbitan PKKPR Nomor {{no_ptp}} tanggal {{tgl_ptp_surat}}, dari Kantor Pertanahan Kabupaten Pasuruan analisis Penguasaan, Pemilikan, Penggunaan, Pemanfaatan Tanah (P4T) dan kemampuan tanah dinyatakan Sesuai seluas ± {{luas_ptp}}, dengan penggunaan tanah saat ini berupa {{guna_tanah}}.',
      },
    ],
    alignment: 'JUSTIFIED',
    indentStart: 36,
    indentFirstLine: 18,
    spaceBelow: 2,
    lineSpacing: 115,
  },
  {
    segments: [
      {
        text: '7.  Berdasarkan hasil pertampalan rencana kegiatan dengan Keputusan Menteri Lingkungan Hidup dan Kehutanan (LHK) Nomor SK.6606/MNLHK-PKTL/KUH/PLA.2/10/2021 tentang Peta Perkembangan Pengukuhan Kawasan Hutan Provinsi Jawa Timur sampai dengan Tahun 2023 lokasi yang dimohon ',
      },
      { text: '{{status_hutan}} dalam SK Hutan', bold: true, underline: true },
      { text: '.' },
    ],
    alignment: 'JUSTIFIED',
    indentStart: 36,
    indentFirstLine: 18,
    spaceBelow: 2,
    lineSpacing: 115,
  },
  {
    segments: [
      {
        text: '8.  Berdasarkan hasil pertampalan Keputusan Menteri Agraria dan Tata Ruang/Kepala Badan Pertanahan Nasional Republik Indonesia No.1589/SK-HK.02.01/XII/2021 Tentang Penetapan Peta Lahan Sawah yang Dilindungi pada Kabupaten/Kota di Provinsi Sumatera Barat, Provinsi Banten, Provinsi Jawa Barat, Provinsi Jawa Tengah, Provinsi Daerah Istimewa Yogyakarta, Provinsi Jawa Timur, Provinsi Bali, dan Provinsi Nusa Tenggara Barat lokasi yang dimohon ',
      },
      { text: '{{status_lsd}} dalam SK LSD', bold: true, underline: true },
      { text: '.' },
    ],
    alignment: 'JUSTIFIED',
    indentStart: 36,
    indentFirstLine: 18,
    spaceBelow: 2,
    lineSpacing: 115,
  },
  {
    segments: [
      {
        text: '9.  Berdasarkan hasil pertampalan Keputusan Menteri Agraria dan Tata Ruang/Kepala Badan Pertanahan Nasional RI Nomor 6734/SK-PG.03.03/XII/2025 tentang Penetapan Luas Lahan Baku Sawah Parsial di Pulau Jawa Tahun 2025 lokasi yang dimohon ',
      },
      { text: '{{status_lbs}} dalam SK LBS', bold: true, underline: true },
      { text: '.' },
    ],
    alignment: 'JUSTIFIED',
    indentStart: 36,
    indentFirstLine: 18,
    spaceBelow: 2,
    lineSpacing: 115,
  },
  {
    segments: [
      {
        text: '10.  Berdasarkan hasil pertampalan Keputusan Bupati Pasuruan Nomor : 521.4/1149/HK/424.013/2022 tentang Luasan dan Sebaran Lahan Pertanian Pangan Berkelanjutan, lokasi yang dimohon ',
      },
      { text: '{{status_lp2b}} dalam SK LP2B', bold: true, underline: true },
      { text: '.' },
    ],
    alignment: 'JUSTIFIED',
    indentStart: 36,
    indentFirstLine: 18,
    spaceBelow: 2,
    lineSpacing: 115,
  },
  {
    segments: [
      {
        text: '11.  Berdasarkan hasil pengecekan rencana kegiatan dengan Portal Minerba One Map Indonesia (MOMI) per tanggal {{tgl_momi}}, lokasi dimohonkan {{status_momi}} dengan Peta WIUP/IUP lain.',
      },
    ],
    alignment: 'JUSTIFIED',
    indentStart: 36,
    indentFirstLine: 18,
    spaceBelow: 4,
    lineSpacing: 115,
  },
  {
    segments: [{ text: '{{img_momi}}' }],
    alignment: 'CENTER',
    spaceAbove: 4,
    spaceBelow: 4,
    lineSpacing: 115,
  },
  {
    segments: [
      {
        text: '12.  Berdasarkan pengecekan data spasial KKPR yang telah terbit dan tertanam pada Portal GISTARU KKPR (Kewenangan Pusat maupun Daerah) Kelompok Kerja Data dan Informasi Direktorat Jenderal Tata Ruang per tanggal {{tgl_gistaru}}, lokasi permohonan {{status_gistaru}} dengan KKPR lainnya.',
      },
    ],
    alignment: 'JUSTIFIED',
    indentStart: 36,
    indentFirstLine: 18,
    spaceBelow: 4,
    lineSpacing: 115,
  },
  {
    segments: [{ text: 'III.  Rekomendasi' }],
    alignment: 'START',
    spaceAbove: 6,
    spaceBelow: 2,
    lineSpacing: 115,
  },
  {
    segments: [
      { text: 'a)  Terhadap permohonan PKKPR untuk Kegiatan {{kategori_usaha}} atas ' },
      { text: '{{nama_perusahaan}}', bold: true },
      { text: ' dengan Rencana Kegiatan ' },
      { text: '{{judul_kbli}}', bold: true },
      { text: ' dengan skala usaha {{skala_usaha}} seluas ' },
      { text: '{{luas_permohonan}} m²', bold: true },
      { text: ' di Kabupaten Pasuruan Provinsi Jawa Timur direkomendasikan untuk dapat :' },
    ],
    alignment: 'JUSTIFIED',
    indentStart: 36,
    indentFirstLine: 18,
    spaceBelow: 2,
    lineSpacing: 115,
  },
  {
    segments: [
      { text: '1)  ' },
      { text: '{{rekomendasi_status}}', italic: true },
      {
        text: ', dengan mengacu Peraturan Menteri ATR/KBPN Nomor 11 tahun 2024 tentang Rencana Tata Ruang Wilayah Kabupaten Pasuruan.',
      },
    ],
    alignment: 'JUSTIFIED',
    indentStart: 54,
    indentFirstLine: 36,
    spaceBelow: 2,
    lineSpacing: 115,
  },
  {
    segments: [{ text: '2)  Berikut adalah pengecekan akun OSS pelaku usaha' }],
    alignment: 'JUSTIFIED',
    indentStart: 54,
    indentFirstLine: 36,
    spaceBelow: 4,
    lineSpacing: 115,
  },
  {
    segments: [{ text: '{{img_validasi}}' }],
    alignment: 'CENTER',
    spaceAbove: 4,
    spaceBelow: 4,
    lineSpacing: 115,
  },
  {
    segments: [{ text: '{{telaah_lain_blok}}' }],
    alignment: 'JUSTIFIED',
    spaceAbove: 4,
    spaceBelow: 2,
    lineSpacing: 115,
  },
];

export async function populateFormattedTemplateDoc(docId: string): Promise<void> {
  // 1. Read existing document bounds so we can cleanly clear old content
  const existingDoc = await googleJson<{ body?: { content?: DocsElement[] } }>(
    `https://docs.googleapis.com/v1/documents/${encodeURIComponent(docId)}`
  );
  const contentEls = existingDoc.body?.content || [];
  const lastEl = contentEls[contentEls.length - 1];
  const lastEndIndex = lastEl?.endIndex || 1;

  const setupRequests: unknown[] = [];
  if (lastEndIndex > 2) {
    setupRequests.push({
      deleteContentRange: {
        range: { startIndex: 1, endIndex: lastEndIndex - 1 },
      },
    });
  }
  setupRequests.push({
    updateDocumentStyle: {
      documentStyle: {
        pageSize: {
          width: { magnitude: 595.28, unit: 'PT' },
          height: { magnitude: 841.89, unit: 'PT' },
        },
        marginTop: { magnitude: 56.7, unit: 'PT' },
        marginBottom: { magnitude: 56.7, unit: 'PT' },
        marginLeft: { magnitude: 72, unit: 'PT' },
        marginRight: { magnitude: 72, unit: 'PT' },
      },
      fields: 'pageSize,marginTop,marginBottom,marginLeft,marginRight',
    },
  });

  await googleJson(`https://docs.googleapis.com/v1/documents/${encodeURIComponent(docId)}:batchUpdate`, {
    method: 'POST',
    body: JSON.stringify({ requests: setupRequests }),
  });

  // 2. Build full text and exact character/paragraph style requests
  let fullText = '';
  let cursor = 1;
  const textStyleRequests: unknown[] = [];
  const paraStyleRequests: unknown[] = [];

  TEMPLATE_PARAGRAPHS.forEach((p, idx) => {
    const pStart = cursor;
    for (const seg of p.segments) {
      const segStart = cursor;
      fullText += seg.text;
      cursor += seg.text.length;
      const segEnd = cursor;

      if (seg.bold || seg.italic || seg.underline) {
        const styleFields: string[] = [];
        const textStyle: Record<string, unknown> = {};
        if (seg.bold) {
          textStyle.bold = true;
          styleFields.push('bold');
        }
        if (seg.italic) {
          textStyle.italic = true;
          styleFields.push('italic');
        }
        if (seg.underline) {
          textStyle.underline = true;
          styleFields.push('underline');
        }
        textStyleRequests.push({
          updateTextStyle: {
            range: { startIndex: segStart, endIndex: segEnd },
            textStyle,
            fields: styleFields.join(','),
          },
        });
      }
    }

    const isLast = idx === TEMPLATE_PARAGRAPHS.length - 1;
    if (!isLast) {
      fullText += '\n';
      cursor += 1;
    }
    const pEnd = isLast ? cursor + 1 : cursor;

    const pStyle: Record<string, unknown> = {
      namedStyleType: 'NORMAL_TEXT',
      alignment: p.alignment || 'JUSTIFIED',
      lineSpacing: p.lineSpacing || 115,
      spaceAbove: { magnitude: p.spaceAbove ?? 0, unit: 'PT' },
      spaceBelow: { magnitude: p.spaceBelow ?? 2, unit: 'PT' },
      indentStart: { magnitude: p.indentStart ?? 0, unit: 'PT' },
      indentFirstLine: { magnitude: p.indentFirstLine ?? 0, unit: 'PT' },
    };
    const pFields = [
      'namedStyleType',
      'alignment',
      'lineSpacing',
      'spaceAbove',
      'spaceBelow',
      'indentStart',
      'indentFirstLine',
    ];

    paraStyleRequests.push({
      updateParagraphStyle: {
        range: { startIndex: pStart, endIndex: pEnd },
        paragraphStyle: pStyle,
        fields: pFields.join(','),
      },
    });
  });

  const baseStyleRequest = {
    updateTextStyle: {
      range: { startIndex: 1, endIndex: 1 + fullText.length },
      textStyle: {
        weightedFontFamily: { fontFamily: 'Times New Roman' },
        fontSize: { magnitude: 11, unit: 'PT' },
        foregroundColor: { color: { rgbColor: { red: 0, green: 0, blue: 0 } } },
      },
      fields: 'weightedFontFamily,fontSize,foregroundColor',
    },
  };

  await googleJson(`https://docs.googleapis.com/v1/documents/${encodeURIComponent(docId)}:batchUpdate`, {
    method: 'POST',
    body: JSON.stringify({
      requests: [
        { insertText: { location: { index: 1 }, text: fullText } },
        baseStyleRequest,
        ...textStyleRequests,
        ...paraStyleRequests,
      ],
    }),
  });

  // 3. Replace {{TABLE_KELENGKAPAN}} marker with a real 9x4 bordered table
  const docAfterText = await googleJson<{ body?: { content?: DocsElement[] } }>(
    `https://docs.googleapis.com/v1/documents/${encodeURIComponent(docId)}`
  );
  const tableMarkers: PlaceholderMatch[] = [];
  collectPlaceholdersFromElements(
    docAfterText.body?.content || [],
    ['{{TABLE_KELENGKAPAN}}'],
    tableMarkers
  );

  if (tableMarkers.length > 0) {
    const marker = tableMarkers[0];
    await googleJson(
      `https://docs.googleapis.com/v1/documents/${encodeURIComponent(docId)}:batchUpdate`,
      {
        method: 'POST',
        body: JSON.stringify({
          requests: [
            {
              deleteContentRange: {
                range: { startIndex: marker.startIndex, endIndex: marker.endIndex },
              },
            },
            {
              insertTable: {
                location: { index: marker.startIndex },
                rows: KELENGKAPAN_TABLE_DATA.length,
                columns: 4,
              },
            },
          ],
        }),
      }
    );

    // 4. Read exact cell startIndices & table startIndex, then populate & style the table
    const docWithTable = await googleJson<{ body?: { content?: DocsElement[] } }>(
      `https://docs.googleapis.com/v1/documents/${encodeURIComponent(docId)}`
    );
    const tableEl = (docWithTable.body?.content || []).find((el) => Boolean(el.table));
    if (tableEl?.table?.tableRows && typeof tableEl.startIndex === 'number') {
      const tableStartIndex = tableEl.startIndex;
      const borderSpec = {
        color: { color: { rgbColor: { red: 0, green: 0, blue: 0 } } },
        width: { magnitude: 0.75, unit: 'PT' },
        dashStyle: 'SOLID',
      };

      const colWidths = [34, 225, 122, 70];
      const tableStyleRequests: unknown[] = [
        ...colWidths.map((w, colIdx) => ({
          updateTableColumnProperties: {
            tableStartLocation: { index: tableStartIndex },
            columnIndices: [colIdx],
            tableColumnProperties: {
              widthType: 'FIXED_WIDTH',
              width: { magnitude: w, unit: 'PT' },
            },
            fields: 'widthType,width',
          },
        })),
        {
          updateTableCellStyle: {
            tableRange: {
              tableCellLocation: {
                tableStartLocation: { index: tableStartIndex },
                rowIndex: 0,
                columnIndex: 0,
              },
              rowSpan: KELENGKAPAN_TABLE_DATA.length,
              columnSpan: 4,
            },
            tableCellStyle: {
              borderTop: borderSpec,
              borderBottom: borderSpec,
              borderLeft: borderSpec,
              borderRight: borderSpec,
              paddingTop: { magnitude: 3, unit: 'PT' },
              paddingBottom: { magnitude: 3, unit: 'PT' },
              paddingLeft: { magnitude: 5, unit: 'PT' },
              paddingRight: { magnitude: 5, unit: 'PT' },
              contentAlignment: 'MIDDLE',
            },
            fields:
              'borderTop,borderBottom,borderLeft,borderRight,paddingTop,paddingBottom,paddingLeft,paddingRight,contentAlignment',
          },
        },
      ];

      // Collect cell locations and populate in reverse document order so earlier indices stay valid
      const cellsToFill: Array<{
        rowIdx: number;
        colIdx: number;
        cellStartIndex: number;
        text: string;
      }> = [];

      tableEl.table.tableRows.forEach((row, rowIdx) => {
        (row.tableCells || []).forEach((cell, colIdx) => {
          const firstPara = cell.content?.[0];
          if (typeof firstPara?.startIndex === 'number') {
            cellsToFill.push({
              rowIdx,
              colIdx,
              cellStartIndex: firstPara.startIndex,
              text: KELENGKAPAN_TABLE_DATA[rowIdx]?.[colIdx] || '',
            });
          }
        });
      });

      cellsToFill.sort((a, b) => b.cellStartIndex - a.cellStartIndex);

      const cellRequests: unknown[] = [];
      for (const item of cellsToFill) {
        if (!item.text) continue;
        const endIdx = item.cellStartIndex + item.text.length;
        cellRequests.push({
          insertText: {
            location: { index: item.cellStartIndex },
            text: item.text,
          },
        });
        cellRequests.push({
          updateTextStyle: {
            range: { startIndex: item.cellStartIndex, endIndex: endIdx },
            textStyle: {
              weightedFontFamily: { fontFamily: 'Times New Roman' },
              fontSize: { magnitude: 10.5, unit: 'PT' },
              bold: false,
            },
            fields: 'weightedFontFamily,fontSize,bold',
          },
        });
        cellRequests.push({
          updateParagraphStyle: {
            range: { startIndex: item.cellStartIndex, endIndex: endIdx + 1 },
            paragraphStyle: {
              alignment: item.colIdx === 1 && item.rowIdx > 0 ? 'START' : 'CENTER',
              lineSpacing: 110,
              spaceAbove: { magnitude: 0, unit: 'PT' },
              spaceBelow: { magnitude: 0, unit: 'PT' },
            },
            fields: 'alignment,lineSpacing,spaceAbove,spaceBelow',
          },
        });
      }

      await googleJson(
        `https://docs.googleapis.com/v1/documents/${encodeURIComponent(docId)}:batchUpdate`,
        {
          method: 'POST',
          body: JSON.stringify({
            requests: [...tableStyleRequests, ...cellRequests],
          }),
        }
      );
    }
  }
}

function parseIndoNumber(val: string): number | null {
  const cleaned = val.trim().replace(/\s+/g, '');
  if (!cleaned) return null;
  // Support "1.255,80" (Indonesian format) and "1255.8"
  const normalized =
    cleaned.includes(',')
      ? cleaned.replace(/\./g, '').replace(',', '.')
      : /^\d{1,3}(\.\d{3})+$/.test(cleaned)
        ? cleaned.replace(/\./g, '')
        : cleaned;
  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}

function formatIndoNumber(num: number): string {
  const rounded = Math.round(num * 100) / 100;
  return rounded.toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export async function generateKajianAndSave(
  config: WorkspaceConfig,
  formData: KajianFormData,
  masterZona: MasterZonaData
): Promise<GeneratedKajianResult> {
  const warnings: string[] = [];

  // 1. Resolve KUZ Kabupaten & Intensitas Ruang
  let teksKuzKab = '';
  let kdb = '-';
  let klb = '-';
  let kdh = '-';
  let rincianKab = `A. ${formData.zona_kab_1} ± ${formData.luas_kab_1 || '-'} m² (${
    formData.persen_kab_1 || '0'
  }%)`;

  const matchKab1 = masterZona.kab.find((r) => r.namaZona === formData.zona_kab_1);
  if (matchKab1) {
    teksKuzKab += matchKab1.isiKuz;
    kdb = matchKab1.kdb || '-';
    klb = matchKab1.klb || '-';
    kdh = matchKab1.kdh || '-';
  }

  let luasKabTotal = formData.luas_kab_1 || formData.luas_permohonan || '-';
  let persenKabTotal = formData.persen_kab_1 || '100';

  if (formData.zona_kab_2) {
    rincianKab += `;\nB. ${formData.zona_kab_2} ± ${formData.luas_kab_2 || '-'} m² (${
      formData.persen_kab_2 || '0'
    }%)`;
    const matchKab2 = masterZona.kab.find((r) => r.namaZona === formData.zona_kab_2);
    if (matchKab2) {
      teksKuzKab += (teksKuzKab ? '\n\n' : '') + matchKab2.isiKuz;
      const kdb2 = matchKab2.kdb || '-';
      const klb2 = matchKab2.klb || '-';
      const kdh2 = matchKab2.kdh || '-';
      if (kdb2 !== kdb && matchKab1) {
        kdb = `${kdb} (${matchKab1.namaZona}) / ${kdb2} (${matchKab2.namaZona})`;
      }
      if (klb2 !== klb && matchKab1) {
        klb = `${klb} (${matchKab1.namaZona}) / ${klb2} (${matchKab2.namaZona})`;
      }
      if (kdh2 !== kdh && matchKab1) {
        kdh = `${kdh} (${matchKab1.namaZona}) / ${kdh2} (${matchKab2.namaZona})`;
      }
    }
    const l1 = parseIndoNumber(formData.luas_kab_1);
    const l2 = parseIndoNumber(formData.luas_kab_2);
    if (l1 !== null && l2 !== null) {
      luasKabTotal = formatIndoNumber(l1 + l2);
    } else {
      luasKabTotal = formData.luas_permohonan || formData.luas_kab_1 || '-';
    }

    const p1 = parseIndoNumber(formData.persen_kab_1) ?? 0;
    const p2 = parseIndoNumber(formData.persen_kab_2) ?? 0;
    persenKabTotal = p1 + p2 > 0 ? formatIndoNumber(p1 + p2) : '100';
  }

  const zonaKabDisplay = formData.zona_kab_2
    ? `${formData.zona_kab_1} & ${formData.zona_kab_2}`
    : formData.zona_kab_1;

  // 2. Resolve KUZ Provinsi
  let teksKuzProv = '';
  const rincianProv = `A. ${formData.zona_prov} ± ${formData.luas_prov || '-'} m² (${
    formData.persen_prov || '0'
  }%)`;
  const matchProv = masterZona.prov.find((r) => r.namaZona === formData.zona_prov);
  if (matchProv) {
    teksKuzProv = matchProv.isiKuz;
  }

  // 3. Copy Template Google Docs into Output Folder
  const namaFileBaru = `Kajian PKKPR - ${formData.nama_perusahaan.trim()}`;
  const copiedFile = await googleJson<{ id: string; webViewLink?: string }>(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
      config.templateDocId
    )}/copy?supportsAllDrives=true&fields=id,webViewLink`,
    {
      method: 'POST',
      body: JSON.stringify({
        name: namaFileBaru,
        parents: [config.outputFolderId],
      }),
    }
  );

  const docId = copiedFile.id;
  const encodedDocId = encodeURIComponent(docId);

  // 4. Replace all text placeholders (PDF-aligned + legacy compatibility)
  const defaultRekomendasi = `disetujui seluruhnya seluas ± ${
    formData.luas_permohonan || '-'
  } m² melalui ${formData.jenis_kkpr} KKPR`;
  const rekomendasiText = formData.rekomendasi_status.trim() || defaultRekomendasi;
  const telaahLainBlok = formData.telaah_lain.trim()
    ? `IV.  Catatan Tambahan\n${formData.telaah_lain.trim()}`
    : '';

  const replacements: Record<string, string> = {
    '{{nama_perusahaan}}': formData.nama_perusahaan || '-',
    '{{nama_perusahaan_upper}}': (formData.nama_perusahaan || '-').toUpperCase(),
    '{{jenis_kkpr}}': formData.jenis_kkpr || '-',
    '{{jenis_kkpr_upper}}': (formData.jenis_kkpr || '-').toUpperCase(),
    '{{kategori_usaha}}': formData.kategori_usaha || '-',
    '{{jalur}}': formData.jalur || '-',
    '{{judul_kbli}}': formData.judul_kbli || '-',
    '{{kode_kbli}}': formData.kode_kbli || '-',
    '{{penjelasan_kbli}}': formData.penjelasan_kbli || '-',
    '{{tgl_oss}}': formData.tgl_oss || '-',
    '{{tgl_validasi}}': formData.tgl_validasi || '-',
    '{{tgl_pnbp}}': formData.tgl_pnbp || '-',
    '{{tgl_ptp}}': formData.tgl_ptp || '-',
    '{{tgl_unggah_ptp}}': formData.tgl_unggah_ptp || '-',
    '{{id_proyek}}': formData.id_proyek || '-',
    '{{desa}}': formData.desa || '-',
    '{{kecamatan}}': formData.kecamatan || '-',
    '{{luas_permohonan}}': formData.luas_permohonan || '-',
    '{{status_modal}}': formData.status_modal || '-',
    '{{status_poligon}}': formData.status_poligon || '-',
    '{{rincian_pola_ruang_kab}}': rincianKab,
    '{{zona_kab_display}}': zonaKabDisplay || '-',
    '{{luas_kab_total}}': luasKabTotal,
    '{{persen_kab_total}}': persenKabTotal,
    '{{teks_kuz_kab}}': teksKuzKab || '-',
    '{{kdb}}': kdb,
    '{{klb}}': klb,
    '{{kdh}}': kdh,
    '{{rincian_pola_ruang_prov}}': rincianProv,
    '{{zona_prov}}': formData.zona_prov || '-',
    '{{luas_prov}}': formData.luas_prov || formData.luas_permohonan || '-',
    '{{persen_prov}}': formData.persen_prov || '100',
    '{{teks_kuz_prov}}': teksKuzProv || '-',
    '{{status_lbs}}': (formData.status_lbs || 'tidak masuk').toLowerCase(),
    '{{status_lsd}}': (formData.status_lsd || 'tidak masuk').toLowerCase(),
    '{{status_lp2b}}': (formData.status_lp2b || 'tidak masuk').toLowerCase(),
    '{{no_ptp}}': formData.no_ptp || '-',
    '{{tgl_ptp_surat}}': formData.tgl_ptp_surat || formData.tgl_ptp || '-',
    '{{luas_ptp}}': formData.luas_ptp || '-',
    '{{guna_tanah}}': formData.guna_tanah || '-',
    '{{status_hutan}}': (formData.status_hutan || 'tidak masuk').toLowerCase(),
    '{{tgl_momi}}': formData.tgl_momi || '-',
    '{{status_momi}}': formData.status_momi || 'tidak bertampalan',
    '{{tgl_gistaru}}': formData.tgl_gistaru || formData.tgl_momi || '-',
    '{{status_gistaru}}': formData.status_gistaru || 'tidak bertampalan',
    '{{skala_usaha}}': formData.skala_usaha || 'mikro',
    '{{rekomendasi_status}}': rekomendasiText,
    '{{kelengkapan_koordinat}}': formData.kelengkapan_koordinat || 'Ada',
    '{{kelengkapan_shp}}': formData.kelengkapan_shp || 'Ada',
    '{{kelengkapan_luas}}': formData.luas_permohonan || '-',
    '{{kelengkapan_tanah}}': formData.kelengkapan_tanah || 'N',
    '{{kelengkapan_lantai_jml}}': formData.kelengkapan_lantai_jml || 'Tidak ada data',
    '{{kelengkapan_lantai_luas}}': formData.kelengkapan_lantai_luas || 'Tidak ada data',
    '{{kelengkapan_rencana_teknis}}': formData.kelengkapan_rencana_teknis || 'Ada',
    '{{telaah_lain_blok}}': telaahLainBlok,
    '{{telaah_lain}}': formData.telaah_lain.trim() || '-',
  };

  const textRequests = Object.entries(replacements).map(([key, value]) => ({
    replaceAllText: {
      containsText: { text: key, matchCase: true },
      replaceText: value,
    },
  }));

  await googleJson(`https://docs.googleapis.com/v1/documents/${encodedDocId}:batchUpdate`, {
    method: 'POST',
    body: JSON.stringify({ requests: textRequests }),
  });

  // 5. Upload & insert any provided images into {{img_*}} placeholders
  const imageSlots: Array<{ placeholder: string; file: File | null; label: string }> = [
    { placeholder: '{{img_validasi}}', file: formData.img_validasi, label: 'Akun OSS' },
    { placeholder: '{{img_peta_kab}}', file: formData.img_peta_kab, label: 'Peta Kab. Pasuruan' },
    { placeholder: '{{img_peta_prov}}', file: formData.img_peta_prov, label: 'Peta Prov. Jatim' },
    { placeholder: '{{img_momi}}', file: formData.img_momi, label: 'Portal MOMI' },
  ];

  const uploadedTempIds: string[] = [];
  const slotLabelByPlaceholder: Record<string, string> = {};
  const preparedImages: Record<
    string,
    { imageUrl: string; widthPt: number; heightPt: number } | null
  > = {};

  for (const slot of imageSlots) {
    slotLabelByPlaceholder[slot.placeholder] = slot.label;
    if (!slot.file) {
      preparedImages[slot.placeholder] = null;
      continue;
    }
    const dims = await getImageDimensions(slot.file);
    const targetWidthPt = 445;
    const rawHeightPt = Math.round(targetWidthPt * (dims.height / Math.max(1, dims.width)));
    const maxHeightPt = 460;
    const heightPt = rawHeightPt > maxHeightPt ? maxHeightPt : rawHeightPt;
    const widthPt =
      rawHeightPt > maxHeightPt
        ? Math.round(maxHeightPt * (dims.width / Math.max(1, dims.height)))
        : targetWidthPt;

    const uploaded = await uploadTempImageToDrive(slot.file, config.outputFolderId, slot.label);
    uploadedTempIds.push(uploaded.fileId);
    if (uploaded.warning) {
      warnings.push(uploaded.warning);
    }
    preparedImages[slot.placeholder] = uploaded.canInsert
      ? { imageUrl: uploaded.imageUrl, widthPt, heightPt }
      : null;
  }

  try {
    // First remove placeholders that have no image to insert
    const clearEmptyRequests = imageSlots
      .filter((s) => !preparedImages[s.placeholder])
      .map((s) => ({
        replaceAllText: {
          containsText: { text: s.placeholder, matchCase: true },
          replaceText: '',
        },
      }));
    if (clearEmptyRequests.length > 0) {
      await googleJson(`https://docs.googleapis.com/v1/documents/${encodedDocId}:batchUpdate`, {
        method: 'POST',
        body: JSON.stringify({ requests: clearEmptyRequests }),
      });
    }

    const activePlaceholders = imageSlots
      .filter((s) => Boolean(preparedImages[s.placeholder]))
      .map((s) => s.placeholder);

    if (activePlaceholders.length > 0) {
      const docData = await googleJson<{ body?: { content?: DocsElement[] } }>(
        `https://docs.googleapis.com/v1/documents/${encodedDocId}`
      );
      const matches: PlaceholderMatch[] = [];
      collectPlaceholdersFromElements(
        docData.body?.content || [],
        activePlaceholders,
        matches
      );

      // Process in reverse document order so earlier indices stay valid even if one slot falls back
      matches.sort((a, b) => b.startIndex - a.startIndex);

      for (const m of matches) {
        const imgInfo = preparedImages[m.placeholder];
        if (!imgInfo) continue;
        try {
          await googleJson(`https://docs.googleapis.com/v1/documents/${encodedDocId}:batchUpdate`, {
            method: 'POST',
            body: JSON.stringify({
              requests: [
                {
                  deleteContentRange: {
                    range: { startIndex: m.startIndex, endIndex: m.endIndex },
                  },
                },
                {
                  insertInlineImage: {
                    location: { index: m.startIndex },
                    uri: imgInfo.imageUrl,
                    objectSize: {
                      width: { magnitude: imgInfo.widthPt, unit: 'PT' },
                      height: { magnitude: imgInfo.heightPt, unit: 'PT' },
                    },
                  },
                },
              ],
            }),
          });
        } catch (imgErr) {
          const label = slotLabelByPlaceholder[m.placeholder] || m.placeholder;
          warnings.push(
            `Gambar "${label}" tidak dapat disisipkan otomatis ke Google Docs (${
              imgErr instanceof Error ? imgErr.message : 'akses gambar'
            }). Anda dapat menyisipkannya manual melalui tautan Edit Google Docs.`
          );
          await googleJson(`https://docs.googleapis.com/v1/documents/${encodedDocId}:batchUpdate`, {
            method: 'POST',
            body: JSON.stringify({
              requests: [
                {
                  replaceAllText: {
                    containsText: { text: m.placeholder, matchCase: true },
                    replaceText: `[Lampiran Gambar ${label} - Sisipkan di Google Docs]`,
                  },
                },
              ],
            }),
          });
        }
      }
    }
  } finally {
    await Promise.all(uploadedTempIds.map((id) => deleteDriveFileQuietly(id)));
  }

  // 6. Append row to Google Sheets Data_Induk (A:AD, 30 columns) after Docs succeeds
  const timestamp = new Date().toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const statusGabungan = `LBS: ${formData.status_lbs} | LSD: ${formData.status_lsd} | LP2B: ${formData.status_lp2b} | Hutan: ${formData.status_hutan} | MOMI: ${formData.status_momi}`;

  const rowValues = [
    timestamp,
    formData.jenis_kkpr,
    formData.kategori_usaha,
    formData.jalur,
    formData.nama_perusahaan,
    formData.kode_kbli,
    formData.judul_kbli,
    formData.penjelasan_kbli,
    formData.tgl_oss,
    formData.tgl_validasi,
    formData.tgl_pnbp,
    formData.tgl_ptp,
    formData.tgl_unggah_ptp,
    formData.id_proyek,
    formData.desa,
    formData.kecamatan,
    formData.luas_permohonan,
    formData.status_modal,
    formData.status_poligon,
    formData.zona_kab_1,
    formData.luas_kab_1,
    formData.persen_kab_1,
    formData.zona_kab_2,
    formData.luas_kab_2,
    formData.persen_kab_2,
    formData.zona_prov,
    formData.luas_prov,
    formData.persen_prov,
    formData.no_ptp,
    statusGabungan,
  ];

  let sheetRowUpdated = true;
  try {
    await googleJson(
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
        config.spreadsheetId
      )}/values/${encodeURIComponent('Data_Induk!A:AD')}:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        body: JSON.stringify({ values: [rowValues] }),
      }
    );
  } catch (sheetErr) {
    sheetRowUpdated = false;
    warnings.push(
      `Dokumen Google Docs berhasil dibuat, tetapi gagal mencatat baris ke Data_Induk (${
        sheetErr instanceof Error ? sheetErr.message : 'Sheets API error'
      }).`
    );
  }

  // 7. Export final document as .DOCX blob directly using authenticated fetch
  const exportMime = encodeURIComponent(
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  );
  const exportRes = await googleFetch(
    `https://www.googleapis.com/drive/v3/files/${encodedDocId}/export?mimeType=${exportMime}`
  );
  if (!exportRes.ok) {
    throw new Error(`Dokumen tersimpan di Google Docs, tetapi gagal ekspor .docx (${exportRes.status}).`);
  }
  const docxBlob = await exportRes.blob();
  const docxBlobUrl = URL.createObjectURL(docxBlob);

  return {
    docId,
    fileName: `${namaFileBaru}.docx`,
    urlEdit: copiedFile.webViewLink || `https://docs.google.com/document/d/${docId}/edit`,
    docxBlobUrl,
    sheetRowUpdated,
    warnings,
  };
}

export async function bootstrapWorkspaceFiles(): Promise<WorkspaceConfig> {
  // 1. Create main folder "Otomasi Kajian PKKPR" and subfolder "Hasil_Kajian_DOCX"
  const mainFolder = await googleJson<{ id: string; name: string }>(
    'https://www.googleapis.com/drive/v3/files?fields=id,name',
    {
      method: 'POST',
      body: JSON.stringify({
        name: 'Otomasi Kajian PKKPR',
        mimeType: 'application/vnd.google-apps.folder',
      }),
    }
  );

  const outputFolder = await googleJson<{ id: string; name: string }>(
    'https://www.googleapis.com/drive/v3/files?fields=id,name',
    {
      method: 'POST',
      body: JSON.stringify({
        name: 'Hasil Kajian PKKPR (DOCX)',
        mimeType: 'application/vnd.google-apps.folder',
        parents: [mainFolder.id],
      }),
    }
  );

  // 2. Create Spreadsheet "Master_Data_PKKPR" with 3 exact tabs
  const spreadsheet = await googleJson<{ spreadsheetId: string }>(
    'https://sheets.googleapis.com/v4/spreadsheets',
    {
      method: 'POST',
      body: JSON.stringify({
        properties: { title: 'Master_Data_PKKPR' },
        sheets: [
          { properties: { title: 'Data_Induk', gridProperties: { frozenRowCount: 1 } } },
          { properties: { title: 'Bank_KUZ_Kab', gridProperties: { frozenRowCount: 1 } } },
          { properties: { title: 'Bank_KUZ_Prov', gridProperties: { frozenRowCount: 1 } } },
        ],
      }),
    }
  );

  const spreadsheetId = spreadsheet.spreadsheetId;

  // Move Spreadsheet into mainFolder cleanly
  const ssMeta = await googleJson<{ parents?: string[] }>(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(spreadsheetId)}?fields=parents&supportsAllDrives=true`
  );
  const removeParentsParam = ssMeta.parents?.length
    ? `&removeParents=${encodeURIComponent(ssMeta.parents.join(','))}`
    : '';
  await googleJson(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(spreadsheetId)}?addParents=${encodeURIComponent(mainFolder.id)}${removeParentsParam}&supportsAllDrives=true&fields=id`,
    { method: 'PATCH', body: JSON.stringify({}) }
  );

  // Populate headers and default KUZ rows
  await googleJson(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          { range: 'Data_Induk!A1:AD1', values: [DATA_INDUK_HEADERS] },
          {
            range: `Bank_KUZ_Kab!A1:E${DEFAULT_KUZ_KAB_ROWS.length}`,
            values: DEFAULT_KUZ_KAB_ROWS,
          },
          {
            range: `Bank_KUZ_Prov!A1:B${DEFAULT_KUZ_PROV_ROWS.length}`,
            values: DEFAULT_KUZ_PROV_ROWS,
          },
        ],
      }),
    }
  );

  // 3. Create Google Doc "Template_Kajian_PKKPR" in mainFolder and format it to match PDF layout
  const docFile = await googleJson<{ id: string; name: string }>(
    'https://www.googleapis.com/drive/v3/files?fields=id,name',
    {
      method: 'POST',
      body: JSON.stringify({
        name: 'Template_Kajian_PKKPR',
        mimeType: 'application/vnd.google-apps.document',
        parents: [mainFolder.id],
      }),
    }
  );

  await populateFormattedTemplateDoc(docFile.id);

  return {
    spreadsheetId,
    spreadsheetName: 'Master_Data_PKKPR',
    templateDocId: docFile.id,
    templateDocName: 'Template_Kajian_PKKPR',
    outputFolderId: outputFolder.id,
    outputFolderName: 'Hasil Kajian PKKPR (DOCX)',
  };
}

export function getPublicAppUrl(): string {
  if (typeof window === 'undefined') {
    return 'https://ais-pre-uvzg27nyvsnb3dgim7qh4g-1018282165679.asia-east1.run.app';
  }
  const basePath = window.location.pathname.replace(/\/$/, '');
  return `${window.location.origin.replace('ais-dev-', 'ais-pre-')}${basePath}`;
}

export function buildTeamShareUrl(config: WorkspaceConfig): string {
  const base = getPublicAppUrl();
  const params = new URLSearchParams({
    ss: config.spreadsheetId,
    tpl: config.templateDocId,
    out: config.outputFolderId,
  });
  if (config.spreadsheetName) params.set('ssName', config.spreadsheetName);
  if (config.templateDocName) params.set('tplName', config.templateDocName);
  if (config.outputFolderName) params.set('outName', config.outputFolderName);
  return `${base}/?${params.toString()}`;
}

export async function shareWorkspaceWithEmail(
  config: WorkspaceConfig,
  email: string
): Promise<void> {
  const cleanEmail = email.trim();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Masukkan alamat email Google yang valid.');
  }

  const fileIds = [config.spreadsheetId, config.templateDocId, config.outputFolderId];
  await Promise.all(
    fileIds.map((fileId) =>
      googleJson(
        `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
          fileId
        )}/permissions?sendNotificationEmail=true&supportsAllDrives=true`,
        {
          method: 'POST',
          body: JSON.stringify({
            role: 'writer',
            type: 'user',
            emailAddress: cleanEmail,
          }),
        }
      )
    )
  );
}

