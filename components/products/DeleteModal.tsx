'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
  isDeleting?: boolean;
}

export function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
  isDeleting = false,
}: DeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="flex flex-col items-center text-center p-2">
        <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-400 mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-white tracking-tight">Delete Product?</h3>

        <p className="text-sm text-slate-300 mt-2">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-white">"{productName}"</span>?
        </p>

        <div className="mt-4 p-3 rounded-xl bg-rose-950/30 border border-rose-900/50 text-xs text-rose-300 text-left">
          <span className="font-bold block mb-1">Permanent Effect:</span>
          Deleting this product will permanently deactivate its QR code. Any physical stickers
          printed for this product will no longer load a manual. The associated PDF file will also
          be permanently removed from storage.
        </div>

        <div className="flex items-center justify-end gap-3 w-full mt-6 pt-4 border-t border-slate-800">
          <Button variant="ghost" size="md" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={onConfirm}
            isLoading={isDeleting}
          >
            Yes, Delete Product
          </Button>
        </div>
      </div>
    </Modal>
  );
}
