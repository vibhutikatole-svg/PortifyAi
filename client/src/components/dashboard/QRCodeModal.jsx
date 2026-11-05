import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Copy, Check, Download, ExternalLink } from 'lucide-react';

export default function QRCodeModal({ isOpen, onClose, portfolio }) {
  const [copied, setCopied] = useState(false);

  if (!portfolio) return null;

  const publicUrl = `${window.location.origin}/p/${portfolio.slug}`;
  const qrImageUrl = `/api/portfolios/${portfolio._id}/qr`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = async () => {
    try {
      const token = localStorage.getItem('portify_token');
      const res = await fetch(qrImageUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.qrDataUrl) {
        const link = document.createElement('a');
        link.href = data.qrDataUrl;
        link.download = `portify-qr-${portfolio.slug}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Download QR error:', err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Portfolio QR Code &amp; Share">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-subtle">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
              publicUrl
            )}`}
            alt="Portfolio QR Code"
            className="w-48 h-48 rounded-lg"
          />
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 text-base">{portfolio.title}</h4>
          <p className="text-xs text-slate-500 mt-1">
            Scan to view this portfolio on any mobile device or camera.
          </p>
        </div>

        {/* Public Link Box */}
        <div className="w-full flex items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700">
          <span className="truncate">{publicUrl}</span>
          <button
            onClick={copyToClipboard}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors shrink-0"
            title="Copy link"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <Button variant="outline" size="sm" onClick={downloadQR} icon={Download}>
            Download QR (PNG)
          </Button>
          <a href={publicUrl} target="_blank" rel="noreferrer">
            <Button variant="primary" size="sm" icon={ExternalLink}>
              Visit Public Page
            </Button>
          </a>
        </div>
      </div>
    </Modal>
  );
}

