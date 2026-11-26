import React, { useState } from 'react';
import { Check, Copy, Link2, Share2, UserPlus, X } from 'lucide-react';
import {
  buildTeamShareUrl,
  getPublicAppUrl,
  shareWorkspaceWithEmail,
} from '../services/workspaceApi';
import { ConfirmDialogState, WorkspaceConfig } from '../types/pkkpr';

interface ShareModalProps {
  isOpen: boolean;
  config: WorkspaceConfig | null;
  onClose: () => void;
  onRequestConfirm: (dialog: Omit<ConfirmDialogState, 'isOpen'>) => void;
  onAuthError: (err: unknown) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  config,
  onClose,
  onRequestConfirm,
  onAuthError,
}) => {
  const [copiedType, setCopiedType] = useState<'public' | 'team' | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shareMsg, setShareMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  if (!isOpen) return null;

  const publicUrl = getPublicAppUrl();
  const teamUrl = config ? buildTeamShareUrl(config) : null;

  const handleCopy = async (text: string, type: 'public' | 'team') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      setShareMsg({
        type: 'error',
        text: 'Gagal menyalin otomatis. Silakan blok dan salin tautan secara manual.',
      });
    }
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    const cleanEmail = emailInput.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setShareMsg({ type: 'error', text: 'Masukkan alamat email Google kerabat yang valid.' });
      return;
    }

    setShareMsg(null);
    onRequestConfirm({
      title: 'Berikan Akses Editor Google Drive ke Kerabat?',
      description: `Akun ${cleanEmail} akan diberi izin Editor (Writer) untuk menggunakan file Master_Data_PKKPR, Template_Kajian_PKKPR, dan folder hasil kajian bersama Anda.`,
      details: [
        `Spreadsheet: ${config.spreadsheetName || config.spreadsheetId}`,
        `Template Docs: ${config.templateDocName || config.templateDocId}`,
        `Folder Output: ${config.outputFolderName || config.outputFolderId}`,
        'Notifikasi undangan Google Drive akan dikirim ke email tersebut.',
      ],
      confirmLabel: 'Kirim Akses Drive',
      onConfirm: async () => {
        setSharing(true);
        setShareMsg(null);
        try {
          await shareWorkspaceWithEmail(config, cleanEmail);
          setShareMsg({
            type: 'success',
            text: `Akses Editor Google Drive berhasil diberikan ke ${cleanEmail}. Bagikan Link Kolaborasi Tim di atas agar langsung terhubung.`,
          });
          setEmailInput('');
        } catch (err) {
          onAuthError(err);
          setShareMsg({
            type: 'error',
            text:
              err instanceof Error
                ? err.message
                : 'Gagal membagikan akses Google Drive. Pastikan Anda adalah pemilik file.',
          });
        } finally {
          setSharing(false);
        }
      },
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Share2 className="h-5 w-5 text-blue-900" />
            <h3 id="share-modal-title" className="text-base font-semibold text-slate-900">
              Bagikan Akses Aplikasi ke Kerabat / Tim
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="Tutup modal bagikan"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6 text-sm">
          {/* 1. Link Kolaborasi Tim (Workspace Bersama) */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-blue-900" />
              <p className="text-xs font-semibold text-blue-950">
                1. Link Kolaborasi Tim (Langsung Terhubung ke Drive Bersama)
              </p>
            </div>
            {teamUrl ? (
              <>
                <p className="mt-1 text-xs text-slate-600">
                  Kerabat yang membuka tautan ini akan otomatis terhubung ke Master_Data_PKKPR, Template_Kajian_PKKPR, dan folder output yang sama setelah masuk dengan Google.
                </p>
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={teamUrl}
                    onFocus={(e) => e.target.select()}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-[11px] text-slate-700 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(teamUrl, 'team')}
                    className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-blue-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-blue-800"
                  >
                    {copiedType === 'team' ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Tersalin
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Salin Link Tim
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <p className="mt-1 text-xs text-amber-800">
                Hubungkan atau buat file Google Workspace terlebih dahulu di menu Konfigurasi untuk membuat link tim otomatis.
              </p>
            )}
          </div>

          {/* 2. Undang Email Kerabat ke Google Drive */}
          {config && (
            <form
              onSubmit={handleInviteSubmit}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-slate-700" />
                <p className="text-xs font-semibold text-slate-900">
                  2. Beri Akses Editor Google Drive ke Email Kerabat
                </p>
              </div>
              <p className="mt-1 text-xs text-slate-600">
                Masukkan akun Gmail kerabat agar mereka dapat membaca Bank KUZ, mengisi Data_Induk, dan menghasilkan file kajian di folder Drive bersama.
              </p>

              {shareMsg && (
                <div
                  className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
                    shareMsg.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-red-200 bg-red-50 text-red-800'
                  }`}
                >
                  {shareMsg.text}
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="nama.kerabat@gmail.com"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-blue-800 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sharing}
                  className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {sharing ? 'Memproses...' : 'Beri Akses Drive'}
                </button>
              </div>
            </form>
          )}

          {/* 3. Link Aplikasi Umum */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-xs font-semibold text-slate-900">
              3. Link Aplikasi Mandiri (Drive Masing-Masing)
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Gunakan tautan ini jika kerabat ingin membuat Master_Data_PKKPR & template sendiri di Google Drive akun mereka masing-masing.
            </p>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                onFocus={(e) => e.target.select()}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-[11px] text-slate-700 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleCopy(publicUrl, 'public')}
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                {copiedType === 'public' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-700" />
                    Tersalin
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Salin Link
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Catatan OAuth Test User */}
          <p className="text-[11px] leading-relaxed text-slate-500">
            Catatan penting: Jika status OAuth Google Cloud masih dalam mode pengujian (Testing), pastikan alamat email Gmail kerabat sudah ditambahkan pada menu <strong className="font-medium text-slate-700">Audience / Test Users</strong> di Google Cloud Console agar mereka dapat melakukan Sign in with Google.
          </p>
        </div>
      </div>
    </div>
  );
};
