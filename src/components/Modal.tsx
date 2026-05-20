"use client";

import React, { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  hideCloseBtn?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  className = "",
  hideCloseBtn = false,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay active">
      <div className={`modal-content ${className}`}>
        {!hideCloseBtn && onClose && (
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
