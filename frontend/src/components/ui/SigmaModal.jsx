import React from "react";
import { FiX } from "react-icons/fi";

const SigmaModal = ({ children, onClose, open, size = "max-w-2xl", title }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className={`max-h-[90vh] w-full ${size} overflow-hidden rounded-lg border border-[var(--sigma-border)] bg-[var(--sigma-surface)] shadow-2xl shadow-black/40`}>
        <div className="flex items-center justify-between border-b border-[var(--sigma-border)] px-5 py-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--sigma-border)] bg-white/5 text-slate-300 transition hover:bg-white/10"
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>
        <div className="max-h-[calc(90vh-70px)] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
};

export default SigmaModal;
