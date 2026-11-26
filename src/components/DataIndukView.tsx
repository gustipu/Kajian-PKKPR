import React, { useMemo, useState } from 'react';
import { ExternalLink, FileSpreadsheet, RefreshCw, Search, X } from 'lucide-react';
import { DataIndukRow } from '../types/pkkpr';

interface DataIndukViewProps {
  spreadsheetId: string | null;
  rows: DataIndukRow[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  onCreateNew: () => void;
}

export const DataIndukView: React.FC<DataIndukViewProps> = ({
  spreadsheetId,
  rows,
  loading,
  onRefresh,
  onCreateNew,
}) => {
  const [search, setSearch] = useState('');
  const [jenisFilter, setJenisFilter] = useState<'all' | 'Persetujuan' | 'Konfirmasi'>('all');
  const [selectedRow, setSelectedRow] = useState<DataIndukRow | null>(null);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (
        jenisFilter !== 'all' &&
        r.jenis_kkpr.trim().toLowerCase() !== jenisFilter.toLowerCase()
      ) {
        return false;
      }
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        r.nama_perusahaan.toLowerCase().includes(q) ||
        r.kecamatan.toLowerCase().includes(q) ||
        r.desa.toLowerCase().includes(q) ||
        r.id_proyek.toLowerCase().includes(q) ||
        r.kode_kbli.toLowerCase().includes(q)
      );
    });
  }, [rows, jenisFilter, search]);

  if (!spreadsheetId) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm font-medium text-slate-800">
          Master_Data_PKKPR belum terhubung.
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Hubungkan Google Sheets terlebih dahulu di menu Konfigurasi.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Rekap Data Induk Permohonan PKKPR
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Data tersinkron langsung dengan tab Data_Induk (kolom A–AD) pada Google Sheets.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-700" />
            Buka Sheets
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </a>
          <button
            type="button"
            onClick={() => onRefresh()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-blue-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-blue-800"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Segarkan
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="inline-flex items-center gap-1 rounded-lg bg-slate-200/70 p-1">
          {(['all', 'Persetujuan', 'Konfirmasi'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setJenisFilter(tab)}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                jenisFilter === tab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'all' ? `Semua (${rows.length})` : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari perusahaan, ID proyek, kecamatan..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 focus:border-blue-800 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-11 animate-pulse rounded bg-slate-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-medium text-slate-800">
              {rows.length === 0
                ? 'Belum ada permohonan yang terekap di tab Data_Induk.'
                : 'Tidak ada data yang cocok dengan filter pencarian.'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {rows.length === 0
                ? 'Setiap kajian yang dibuat melalui Generator Kajian akan otomatis tercatat di sini.'
                : 'Coba ubah kata kunci pencarian atau filter jenis KKPR.'}
            </p>
            {rows.length === 0 && (
              <button
                type="button"
                onClick={onCreateNew}
                className="mt-4 inline-flex items-center rounded-lg bg-blue-900 px-4 py-2 text-xs font-medium text-white hover:bg-blue-800"
              >
                Buat Kajian Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="px-4 py-3 font-semibold">Timestamp</th>
                  <th className="px-4 py-3 font-semibold">Pelaku Usaha</th>
                  <th className="px-4 py-3 font-semibold">ID Proyek · KBLI</th>
                  <th className="px-4 py-3 font-semibold">Lokasi</th>
                  <th className="px-4 py-3 text-right font-semibold">Luas (m²)</th>
                  <th className="px-4 py-3 font-semibold">Zona Kab. Utama</th>
                  <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((row) => (
                  <tr
                    key={row.rowIndex}
                    onClick={() => setSelectedRow(row)}
                    className="cursor-pointer transition-colors hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono tabular-nums text-[11px] text-slate-500">
                      {row.timestamp || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{row.nama_perusahaan || '-'}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {row.jenis_kkpr} · {row.kategori_usaha} · {row.status_modal}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono tabular-nums text-slate-800">
                        {row.id_proyek || '-'}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                        KBLI {row.kode_kbli || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {row.desa || '-'}, Kec. {row.kecamatan || '-'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-mono tabular-nums text-slate-900">
                      {row.luas_permohonan || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <p className="truncate max-w-[200px]">{row.zona_kab_1 || '-'}</p>
                      {row.persen_kab_1 && (
                        <p className="font-mono tabular-nums text-[11px] text-slate-500">
                          {row.luas_kab_1} m² ({row.persen_kab_1}%)
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRow(row);
                        }}
                        className="font-medium text-blue-900 hover:underline"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Row Detail Modal */}
      {selectedRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {selectedRow.nama_perusahaan}
                </h3>
                <p className="text-xs text-slate-500">
                  Baris #{selectedRow.rowIndex} · {selectedRow.jenis_kkpr} · {selectedRow.id_proyek || 'Tanpa ID Proyek'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRow(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 overflow-y-auto p-6 text-xs sm:grid-cols-2">
              {[
                ['Jenis / Kategori / Jalur', `${selectedRow.jenis_kkpr} · ${selectedRow.kategori_usaha} · ${selectedRow.jalur}`],
                ['Status Modal', selectedRow.status_modal],
                ['KBLI', `${selectedRow.kode_kbli} — ${selectedRow.judul_kbli}`],
                ['Lokasi', `Desa ${selectedRow.desa}, Kec. ${selectedRow.kecamatan}`],
                ['Luas Permohonan', `${selectedRow.luas_permohonan} m²`],
                ['Status Poligon', selectedRow.status_poligon],
                ['Tgl OSS / Validasi', `${selectedRow.tgl_oss || '-'} / ${selectedRow.tgl_validasi || '-'}`],
                ['Tgl PNBP / PTP / Unggah', `${selectedRow.tgl_pnbp || '-'} / ${selectedRow.tgl_ptp || '-'} / ${selectedRow.tgl_unggah_ptp || '-'}`],
                ['Zona Kab. 1', selectedRow.zona_kab_1 ? `${selectedRow.zona_kab_1} (${selectedRow.luas_kab_1 || '-'} m² / ${selectedRow.persen_kab_1 || '0'}%)` : '-'],
                ['Zona Kab. 2', selectedRow.zona_kab_2 ? `${selectedRow.zona_kab_2} (${selectedRow.luas_kab_2 || '-'} m² / ${selectedRow.persen_kab_2 || '0'}%)` : '-'],
                ['Zona Prov. Jatim', selectedRow.zona_prov ? `${selectedRow.zona_prov} (${selectedRow.luas_prov || '-'} m² / ${selectedRow.persen_prov || '0'}%)` : '-'],
                ['Nomor PTP', selectedRow.no_ptp || '-'],
                ['Status LBS | LSD | Hutan | MOMI', selectedRow.status_lbs_lsd_hutan_momi || '-'],
              ].map(([label, val]) => (
                <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[11px] font-medium text-slate-500">{label}</p>
                  <p className="mt-1 font-medium text-slate-900">{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
