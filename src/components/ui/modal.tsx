'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, children, className = '' }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] overflow-auto flex items-center justify-center"
      >
        {children}
      </div>
    </div>,
    document.body
  );
}