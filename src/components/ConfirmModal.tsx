import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { ConfirmDialogState } from '../types/pkkpr';

interface ConfirmModalProps {
  dialog: ConfirmDialogState | null;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ dialog, onClose }) => {
  const [submitting, setSubmitting] = useState(false);

  if (!dialog || !dialog.isOpen) return null;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await dialog.onConfirm();
    } finally {
      setSubmitting(false);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                dialog.variant === 'danger'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-blue-50 text-blue-900'
              }`}
            >
              {dialog.variant === 'danger' ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3
                id="confirm-modal-title"
                className="text-base font-semibold text-slate-900"
              >
                {dialog.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {dialog.description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Tutup dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {dialog.details.length > 0 && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3.5">
            <p className="text-xs font-medium text-slate-700">
              Perubahan yang akan dilakukan pada Google Workspace Anda:
            </p>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
              {dialog.details.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="whitespace-nowrap rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-60 ${
              dialog.variant === 'danger'
                ? 'bg-red-700 hover:bg-red-800'
                : 'bg-blue-900 hover:bg-blue-800'
            }`}
          >
            {submitting ? 'Memproses...' : dialog.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
