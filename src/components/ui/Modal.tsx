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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md shadow-xl animate-in zoom-in-95 duration-200 max-h-[85vh] sm:max-h-[90vh] flex flex-col">
        {title && (
          <div className="flex items-center justify-between p-4 sm:p-5 border-b sticky top-0 bg-white z-10 flex-shrink-0 rounded-t-3xl sm:rounded-t-2xl">
            <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors p-1"
            >
              <X size={24} />
            </button>
          </div>
        )}
        <div className="p-4 sm:p-5 pb-6 sm:pb-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
