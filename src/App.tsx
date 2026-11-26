import React, { useCallback, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  BookOpen,
  Database,
  FilePlus2,
  LogOut,
  Menu,
  Settings2,
  Share2,
  X,
} from 'lucide-react';
import { BankKuzView } from './components/BankKuzView';
import { ConfirmModal } from './components/ConfirmModal';
import { DataIndukView } from './components/DataIndukView';
import { GoogleSignInButton } from './components/GoogleSignInButton';
import { KajianFormView } from './components/KajianFormView';
import { ShareModal } from './components/ShareModal';
import { WorkspaceSetupView } from './components/WorkspaceSetupView';
import { googleSignIn, initAuth, logout } from './services/googleAuth';
import {
  AuthExpiredError,
  fetchDataInduk,
  fetchMasterZona,
} from './services/workspaceApi';
import {
  ConfirmDialogState,
  DataIndukRow,
  MasterZonaData,
  WorkspaceConfig,
} from './types/pkkpr';

type NavView = 'form' | 'rekap' | 'kuz' | 'setup';

const CONFIG_STORAGE_KEY = 'pkkpr_workspace_config_v1';

function hasTeamLinkParams(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    return Boolean(params.get('ss') && params.get('tpl') && params.get('out'));
  } catch {
    return false;
  }
}

function loadSavedConfig(): WorkspaceConfig | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const ss = params.get('ss')?.trim();
    const tpl = params.get('tpl')?.trim();
    const out = params.get('out')?.trim();
    if (ss && tpl && out) {
      const fromUrl: WorkspaceConfig = {
        spreadsheetId: ss,
        spreadsheetName: params.get('ssName')?.trim() || 'Master_Data_PKKPR (Bersama)',
        templateDocId: tpl,
        templateDocName: params.get('tplName')?.trim() || 'Template_Kajian_PKKPR (Bersama)',
        outputFolderId: out,
        outputFolderName: params.get('outName')?.trim() || 'Folder Output Bersama',
      };
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(fromUrl));
      return fromUrl;
    }

    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WorkspaceConfig;
    if (parsed.spreadsheetId && parsed.templateDocId && parsed.outputFolderId) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export default function App() {
  const [initialTeamLink] = useState<boolean>(() => hasTeamLinkParams());
  const [config, setConfig] = useState<WorkspaceConfig | null>(() => loadSavedConfig());
  const [user, setUser] = useState<User | null>(null);
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [authNotice, setAuthNotice] = useState<string | null>(() =>
    initialTeamLink
      ? 'Anda membuka tautan kolaborasi tim. Silakan masuk dengan akun Google yang telah diberi akses Drive bersama.'
      : null
  );

  const [activeView, setActiveView] = useState<NavView>(() => (config ? 'form' : 'setup'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [masterZona, setMasterZona] = useState<MasterZonaData>({ kab: [], prov: [] });
  const [dataInduk, setDataInduk] = useState<DataIndukRow[]>([]);
  const [loadingZona, setLoadingZona] = useState(false);
  const [loadingInduk, setLoadingInduk] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  useEffect(() => {
    if (initialTeamLink && typeof window !== 'undefined') {
      const cleanUrl = `${window.location.pathname}${window.location.hash}`;
      window.history.replaceState(null, '', cleanUrl || '/');
    }
  }, [initialTeamLink]);

  useEffect(() => {
    const unsubscribe = initAuth(
      (signedInUser) => {
        setUser(signedInUser);
        setNeedsAuth(false);
        setAuthNotice(null);
      },
      (maybeUser) => {
        setUser(maybeUser);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleAuthError = useCallback((err: unknown) => {
    if (err instanceof AuthExpiredError) {
      setNeedsAuth(true);
      setAuthNotice(err.message);
    }
  }, []);

  const refreshAllSheetData = useCallback(
    async (targetSpreadsheetId: string) => {
      setDataError(null);
      setLoadingZona(true);
      setLoadingInduk(true);
      try {
        const [zonaRes, indukRes] = await Promise.all([
          fetchMasterZona(targetSpreadsheetId),
          fetchDataInduk(targetSpreadsheetId),
        ]);
        setMasterZona(zonaRes);
        setDataInduk(indukRes);
      } catch (err) {
        handleAuthError(err);
        setDataError(
          err instanceof Error
            ? err.message
            : 'Gagal memuat data dari Google Sheets Master_Data_PKKPR.'
        );
      } finally {
        setLoadingZona(false);
        setLoadingInduk(false);
      }
    },
    [handleAuthError]
  );

  useEffect(() => {
    if (!needsAuth && config?.spreadsheetId) {
      refreshAllSheetData(config.spreadsheetId);
    }
  }, [needsAuth, config?.spreadsheetId, refreshAllSheetData]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setAuthNotice(null);
    try {
      const res = await googleSignIn();
      setUser(res.user);
      setNeedsAuth(false);
    } catch (err) {
      setAuthNotice(
        err instanceof Error ? err.message : 'Gagal masuk dengan akun Google.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setNeedsAuth(true);
  };

  const handleSaveConfig = (nextConfig: WorkspaceConfig) => {
    setConfig(nextConfig);
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(nextConfig));
    } catch {
      // ignore storage failure
    }
  };

  const requestConfirm = (dialog: Omit<ConfirmDialogState, 'isOpen'>) => {
    setConfirmDialog({ ...dialog, isOpen: true });
  };

  const navItems: Array<{ id: NavView; label: string; icon: React.ReactNode }> = [
    { id: 'form', label: 'Generator Kajian', icon: <FilePlus2 className="h-4 w-4" /> },
    { id: 'rekap', label: 'Rekap Data Induk', icon: <Database className="h-4 w-4" /> },
    { id: 'kuz', label: 'Bank KUZ (Kab & Prov)', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'setup', label: 'Konfigurasi Workspace', icon: <Settings2 className="h-4 w-4" /> },
  ];

  // Unauthenticated Landing Gate
  if (needsAuth) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="flex items-center justify-between gap-8 border-b border-slate-200 bg-white px-6 py-4">
          <span className="whitespace-nowrap shrink-0 font-display text-lg font-bold tracking-tight text-slate-900">
            SiKajian PKKPR
          </span>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <span className="whitespace-nowrap shrink-0">DCKTR Kab. Pasuruan</span>
            <span className="whitespace-nowrap shrink-0">Google Sheets</span>
            <span className="whitespace-nowrap shrink-0">Google Docs</span>
            <span className="whitespace-nowrap shrink-0">Ekspor DOCX</span>
          </nav>
          <div className="shrink-0">
            <GoogleSignInButton
              onClick={handleLogin}
              loading={isLoggingIn}
              label="Sign in with Google"
            />
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
            <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-8 lg:col-span-7">
              <div>
                <p className="text-xs font-medium text-blue-900">
                  Bidang Tata Ruang · Kabupaten Pasuruan
                </p>
                <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Generator Kajian PKKPR Terintegrasi Google Workspace
                </h1>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  Susun dokumen Kajian Kesesuaian Kegiatan Pemanfaatan Ruang secara terstandar, tarik otomatis pasal KUZ Kabupaten Pasuruan (Permen ATR/BPN No. 11/2024) dan Arahan Zonasi Provinsi Jawa Timur (Perda No. 10/2023), simpan rekap ke Google Sheets, dan unduh langsung file Word (.DOCX).
                </p>

                {authNotice && (
                  <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                    {authNotice}
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-6">
                <GoogleSignInButton
                  onClick={handleLogin}
                  loading={isLoggingIn}
                  label="Sign in with Google"
                />
                <span className="text-xs text-slate-500">
                  Akses Google Drive, Sheets, dan Docs milik Anda secara langsung.
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-8 lg:col-span-5">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Alur Kerja Otomatis
                </h2>
                <div className="mt-5 space-y-4 text-xs leading-relaxed text-slate-600">
                  <div>
                    <p className="font-semibold text-slate-900">
                      01. Master Data & Bank KUZ
                    </p>
                    <p className="mt-0.5">
                      Terhubung ke spreadsheet Master_Data_PKKPR dengan tab Data_Induk (30 kolom A–AD), Bank_KUZ_Kab, dan Bank_KUZ_Prov.
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-3">
                    <p className="font-semibold text-slate-900">
                      02. Template Google Docs Dinamis
                    </p>
                    <p className="mt-0.5">
                      Menggandakan Template_Kajian_PKKPR dan mengisi seluruh variabel teks serta 4 lampiran gambar peta overlay.
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-3">
                    <p className="font-semibold text-slate-900">
                      03. Ekspor Langsung .DOCX
                    </p>
                    <p className="mt-0.5">
                      Menghasilkan tautan unduhan file Word (.DOCX) siap cetak sekaligus tautan penyuntingan di Google Docs.
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-6 border-t border-slate-100 pt-4 text-[11px] text-slate-500">
                Belum menyiapkan file di Drive? Tersedia fitur Buat Otomatis 1-Klik setelah masuk.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Bar (3-zone contract) */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Buka menu navigasi"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="whitespace-nowrap shrink-0 font-display text-base font-bold tracking-tight text-slate-900 sm:text-lg">
            SiKajian PKKPR
          </span>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveView(item.id)}
              className={`whitespace-nowrap shrink-0 border-b-2 py-1 transition-colors ${
                activeView === item.id
                  ? 'border-blue-900 text-slate-900'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className="hidden max-w-[180px] truncate text-xs text-slate-600 sm:inline">
            {user?.email || user?.displayName}
          </span>
          <button
            type="button"
            onClick={() => setShareModalOpen(true)}
            className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-blue-900 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-950 transition-colors hover:bg-blue-100"
          >
            <Share2 className="h-3.5 w-3.5" />
            Bagikan
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <LogOut className="h-3.5 w-3.5" />
            Keluar
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveView(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium ${
                  activeView === item.id
                    ? 'bg-blue-50 text-blue-900'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-[1440px]">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-5 lg:block">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={`flex w-full items-center gap-3 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
                  activeView === item.id
                    ? 'bg-blue-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 border-t border-slate-100 pt-5 text-xs text-slate-600">
            <p className="font-semibold text-slate-900">Ringkasan Koneksi</p>
            <dl className="mt-3 space-y-2.5">
              <div>
                <dt className="text-[11px] text-slate-500">Spreadsheet Master</dt>
                <dd className="truncate font-medium text-slate-800">
                  {config?.spreadsheetName || (config?.spreadsheetId ? 'Terhubung' : 'Belum diatur')}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-500">Template Docs</dt>
                <dd className="truncate font-medium text-slate-800">
                  {config?.templateDocName || (config?.templateDocId ? 'Terhubung' : 'Belum diatur')}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-500">Folder Output</dt>
                <dd className="truncate font-medium text-slate-800">
                  {config?.outputFolderName || (config?.outputFolderId ? 'Terhubung' : 'Belum diatur')}
                </dd>
              </div>
              <div className="pt-1">
                <dt className="text-[11px] text-slate-500">Zona Terdaftar</dt>
                <dd className="font-mono tabular-nums font-medium text-slate-800">
                  {masterZona.kab.length} Kab · {masterZona.prov.length} Prov
                </dd>
              </div>
            </dl>
          </div>
        </aside>

        {/* Main Viewport */}
        <main className="min-w-0 flex-1 p-5 sm:p-8">
          {dataError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-900">
              Gagal membaca Google Sheets: {dataError}
            </div>
          )}

          {activeView === 'form' && (
            <KajianFormView
              config={config}
              masterZona={masterZona}
              onRequestConfirm={requestConfirm}
              onAuthError={handleAuthError}
              onGoToSetup={() => setActiveView('setup')}
              onSuccessSaved={() => {
                if (config?.spreadsheetId) {
                  refreshAllSheetData(config.spreadsheetId);
                }
              }}
            />
          )}

          {activeView === 'rekap' && (
            <DataIndukView
              spreadsheetId={config?.spreadsheetId || null}
              rows={dataInduk}
              loading={loadingInduk}
              onRefresh={async () => {
                if (config?.spreadsheetId) {
                  await refreshAllSheetData(config.spreadsheetId);
                }
              }}
              onCreateNew={() => setActiveView('form')}
            />
          )}

          {activeView === 'kuz' && (
            <BankKuzView
              spreadsheetId={config?.spreadsheetId || null}
              masterZona={masterZona}
              loading={loadingZona}
              onRefresh={async () => {
                if (config?.spreadsheetId) {
                  await refreshAllSheetData(config.spreadsheetId);
                }
              }}
              onRequestConfirm={requestConfirm}
              onAuthError={handleAuthError}
            />
          )}

          {activeView === 'setup' && (
            <WorkspaceSetupView
              config={config}
              onSaveConfig={handleSaveConfig}
              onRequestConfirm={requestConfirm}
              onAuthError={handleAuthError}
              onSwitchToForm={() => setActiveView('form')}
            />
          )}
        </main>
      </div>

      <ShareModal
        isOpen={shareModalOpen}
        config={config}
        onClose={() => setShareModalOpen(false)}
        onRequestConfirm={requestConfirm}
        onAuthError={handleAuthError}
      />

      <ConfirmModal
        dialog={confirmDialog}
        onClose={() => setConfirmDialog(null)}
      />
    </div>
  );
}
