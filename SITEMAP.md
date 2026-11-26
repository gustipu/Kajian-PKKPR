# Sitemap Aplikasi — SiKajian PKKPR (DCKTR Kab. Pasuruan)

Aplikasi web Single Page Application (SPA) berbasis **React + TypeScript + Vite + Tailwind CSS** yang terintegrasi langsung dengan **Firebase Authentication (Google OAuth)** dan **Google Workspace API (Drive, Sheets, Docs)** untuk penyusunan dokumen Kajian PKKPR.

---

## 1. Peta Navigasi & Halaman (UI Sitemap)

```text
SiKajian PKKPR (/)
│
├── [Belum Login] Landing & Auth Gate (App.tsx)
│   ├── Header (Brand, Ringkasan Integrasi, Tombol Sign in with Google)
│   ├── Hero & Penjelasan Alur Kerja (01 Master Data & KUZ, 02 Template Docs, 03 Ekspor .DOCX)
│   └── Deteksi Tautan Kolaborasi Tim (?ss=...&tpl=...&out=...)
│
└── [Sudah Login] Workspace Shell (App.tsx)
    ├── Top Bar
    │   ├── Toggle Menu Mobile
    │   ├── Navigasi Tab (4 Menu Utama)
    │   ├── Identitas Akun Google
    │   ├── Tombol Bagikan ──────────────────────▶ ShareModal
    │   └── Tombol Keluar (Logout)
    │
    ├── Sidebar Kiri
    │   ├── Menu Navigasi (4 View)
    │   └── Ringkasan Koneksi (Spreadsheet, Template Docs, Folder Output, Jumlah Zona Kab/Prov)
    │
    ├── 1. Generator Kajian (activeView: 'form' → KajianFormView)
    │   ├── Aksi Cepat: Isi Contoh Data | Reset
    │   ├── Banner Hasil (setelah generate): Unduh Word (.DOCX) | Edit di Google Docs | Warnings
    │   ├── Seksi 01: Data Pelaku Usaha, Kronologi OSS, & Tabel Kelengkapan Validasi (8 item)
    │   ├── Seksi 02: Analisis RTRW Prov. Jatim (Perda 10/2023) & Kab. Pasuruan (Permen ATR/BPN 11/2024, Zona 1 + Zona 2 opsional)
    │   ├── Seksi 03: Pertampalan Sektoral (Hutan, LSD, LBS, LP2B, PTP, MOMI, GISTARU) & Rekomendasi
    │   ├── Seksi 04: Unggah 4 Lampiran Gambar (Peta Prov, Peta Kab, Portal MOMI, Cek Akun OSS)
    │   └── Panel Pratinjau Sticky: KDB/KLB/KDH, IAZ Prov. Jatim, & KUZ Kab. Pasuruan
    │
    ├── 2. Rekap Data Induk (activeView: 'rekap' → DataIndukView)
    │   ├── Aksi: Buka Google Sheets | Segarkan Data
    │   ├── Filter Jenis KKPR (Semua | Persetujuan | Konfirmasi) & Pencarian (Perusahaan, ID Proyek, KBLI, Desa, Kec.)
    │   ├── Tabel Data_Induk (30 kolom A–AD)
    │   └── Modal Detail Permohonan (klik baris / tombol Detail)
    │
    ├── 3. Bank KUZ (Kab & Prov) (activeView: 'kuz' → BankKuzView)
    │   ├── Aksi (jika Sheets terhubung): Sinkronkan KUZ Resmi (PDF) | Muat Ulang | Tambah Zona
    │   ├── Tautan Referensi PDF: RTRW Kab. Pasuruan & RTRW Prov. Jatim
    │   ├── Tab Bank_KUZ_Kab (19 zona resmi Permen ATR/BPN 11/2024 + KDB/KLB/KDH)
    │   ├── Tab Bank_KUZ_Prov (18 zona resmi Perda Jatim 10/2023)
    │   ├── Form Tambah Zona Baru (Kab / Prov)
    │   └── Pencarian Zona & Pasal KUZ/IAZ
    │
    ├── 4. Konfigurasi Workspace (activeView: 'setup' → WorkspaceSetupView)
    │   ├── Buat Otomatis (1-Klik) → Membuat Folder, Spreadsheet 3 tab, & Template Docs berformat standar
    │   ├── Terapkan Format Template PDF → Memformat ulang Template_Kajian_PKKPR (Times New Roman 11pt + Tabel Kelengkapan)
    │   ├── Form Tautkan File & Folder (input ID/URL + Buka di Google + Picker Drive)
    │   ├── Modal Pemilih File Google Drive (Spreadsheet / Docs / Folder)
    │   └── Checklist Referensi Struktur Wajib Google Sheets & Docs
    │
    └── Global Modals
        ├── ShareModal (Link Kolaborasi Tim, Undang Email Editor Drive, Link Aplikasi Mandiri)
        └── ConfirmModal (Dialog konfirmasi sebelum setiap aksi tulis ke Google Workspace)
```

---

## 2. Struktur Direktori & Fungsi Setiap File

### Entry & Konfigurasi Root
| File | Fungsi |
| :--- | :--- |
| `index.html` | Dokumen HTML utama (`lang="id"`), meta SEO/OpenGraph, dan font Google (`DM Sans`, `Plus Jakarta Sans`, `JetBrains Mono`). |
| `package.json` | Daftar dependensi (`react`, `firebase`, `lucide-react`, `tailwindcss`, `vite`, dll.) dan script (`dev`, `build`, `preview`, `lint`). |
| `vite.config.ts` | Konfigurasi Vite + React + Tailwind v4 + plugin salin aset `src/assets` ke `dist`. |
| `tsconfig.json` | Konfigurasi compiler TypeScript (`ES2022`, `react-jsx`, alias `@/*`). |
| `firebase-applet-config.json` | Konfigurasi proyek Firebase & OAuth Client ID. |
| `metadata.json` | Metadata aplikasi AI Studio. |
| `.env.example` | Contoh variabel lingkungan (`GEMINI_API_KEY`, `APP_URL`). |

### Source Code (`src/`)
| File | Fungsi |
| :--- | :--- |
| `src/main.tsx` | Entry point React (`createRoot`) yang merender `<App />`. |
| `src/index.css` | Konfigurasi Tailwind CSS v4, variabel font, dan styling tombol `GoogleSignInButton`. |
| `src/App.tsx` | Shell utama aplikasi: state autentikasi, pemuatan konfigurasi URL/localStorage, navigasi 4 menu, sinkronisasi `MasterZona` & `DataInduk`, dan modal global. |
| `src/types/pkkpr.ts` | Definisi tipe TypeScript (`ZonaKab`, `ZonaProv`, `MasterZonaData`, `KajianFormData`, `DataIndukRow`, `WorkspaceConfig`, `DriveItem`, `GeneratedKajianResult`, `ConfirmDialogState`). |
| `src/data/kuzDatabase.ts` | Database lokal resmi: 19 zona `OFFICIAL_KUZ_KAB_PASURUAN` (Permen ATR/BPN No. 11/2024) dan 18 zona `OFFICIAL_KUZ_PROV_JATIM` (Perda Prov. Jatim No. 10/2023). |
| `src/services/googleAuth.ts` | Autentikasi Firebase Google Sign-In dengan scope Drive, Sheets, dan Docs, serta penyimpanan `accessToken` di memori. |
| `src/services/workspaceApi.ts` | Klien REST API Google Drive, Sheets, dan Docs: listing/metadata Drive, baca/tulis `Data_Induk` & `Bank_KUZ_*`, sinkronisasi KUZ resmi, formatter `Template_Kajian_PKKPR`, generator kajian + sisip gambar + ekspor `.docx`, bootstrap 1-klik, dan berbagi akses tim. |

### Komponen UI (`src/components/`)
| Komponen | Fungsi |
| :--- | :--- |
| `GoogleSignInButton.tsx` | Tombol resmi *Sign in with Google* dengan ikon SVG Google. |
| `KajianFormView.tsx` | Formulir input kajian 4 bagian, pratinjau KUZ & intensitas real-time, unggah 4 gambar peta/lampiran, isi contoh data, dan unduh hasil `.docx`. |
| `DataIndukView.tsx` | Tabel rekap permohonan dari tab `Data_Induk` dengan filter jenis KKPR, pencarian teks, dan modal detail baris. |
| `BankKuzView.tsx` | Manajemen & pencarian `Bank_KUZ_Kab` dan `Bank_KUZ_Prov`, sinkronisasi dari database peraturan resmi, tambah zona baru, serta tautan ke PDF peraturan. |
| `WorkspaceSetupView.tsx` | Pengaturan koneksi Spreadsheet/Template Docs/Folder Output, Drive File Picker, Bootstrap 1-klik, dan pemformatan template Docs. |
| `ShareModal.tsx` | Pembuat tautan kolaborasi tim (`?ss=...&tpl=...&out=...`), pemberian izin Editor Drive via email, dan tautan aplikasi mandiri. |
| `ConfirmModal.tsx` | Modal konfirmasi reusable sebelum melakukan perubahan data ke Google Drive/Sheets/Docs. |

### Aset Publik (`public/assets/aistudio/`)
| File | Keterangan |
| :--- | :--- |
| `Permen_ATRKBPN_No_11_Tahun_2024_Tentang_RTRW_Kabupaten_Pasuruan_1d85fa91.pdf` | Dokumen peraturan RTRW Kab. Pasuruan (referensi `BankKuzView`). |
| `PERDA-PROVJATIM-10-2023-RTRWP_JATIM_2023-2043_87688272.pdf` | Dokumen peraturan RTRW Prov. Jawa Timur 2023–2043 (referensi `BankKuzView`). |
| `NEOTHERM_OPTIMA_INDONESIA_R-937_e14a34ea.pdf` | Dokumen contoh format Kajian PKKPR (referensi struktur template & contoh data). |
