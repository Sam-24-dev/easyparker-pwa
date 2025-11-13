import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl animate-in zoom-in-95 duration-200">
        {title && (
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        )}
        <div className={title ? 'p-6' : 'p-6'}>
          {children}
        </div>
      </div>
    </div>
  );
}
