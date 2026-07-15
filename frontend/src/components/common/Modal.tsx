import { type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="fixed inset-0 bg-gov-text/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className={`relative gov-card w-full ${sizes[size]} max-h-[90vh] overflow-y-auto shadow-gov-lg animate-slide-up`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gov-border dark:border-slate-700 bg-gov-blue-light/50 dark:bg-slate-800">
          <h2 id="modal-title" className="text-lg font-semibold text-gov-text dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-white/80 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gov-muted" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
