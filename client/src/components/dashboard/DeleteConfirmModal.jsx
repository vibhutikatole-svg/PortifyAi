import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { AlertTriangle } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, portfolio, loading }) {
  if (!portfolio) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Portfolio">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-900">Are you sure you want to delete this portfolio?</p>
            <p className="mt-1">
              This action cannot be undone. The public link <code className="font-mono">/p/{portfolio.slug}</code> will no longer be accessible.
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600">
          Portfolio to delete: <span className="font-semibold text-slate-900">{portfolio.title}</span>
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} loading={loading}>
            Yes, Delete Portfolio
          </Button>
        </div>
      </div>
    </Modal>
  );
}

