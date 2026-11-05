import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { portfolioService } from '../services/portfolioService';
import ThemeRenderer from '../components/themes/ThemeRenderer';
import QRCodeModal from '../components/dashboard/QRCodeModal';
import {
  Loader2,
  ExternalLink,
  AlertCircle,
  Copy,
  Check,
  Download,
  QrCode,
  Globe,
  Lock,
} from 'lucide-react';
import Button from '../components/common/Button';

export default function PublicPortfolioPage() {
  const { slug } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const fetchPublicPortfolio = async () => {
    try {
      setLoading(true);
      const data = await portfolioService.getPublicPortfolio(slug);
      setPortfolio(data);
    } catch (err) {
      setError(err.message || 'This portfolio is either private or does not exist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchPublicPortfolio();
    }
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownloadZip = async () => {
    if (!slug) return;
    setDownloadingZip(true);
    try {
      await portfolioService.downloadPublicPortfolioZip(slug);
    } catch (err) {
      alert(err.message || 'Error downloading standalone portfolio ZIP.');
    } finally {
      setDownloadingZip(false);
    }
  };

  const handlePublishNow = async () => {
    if (!portfolio?._id) return;
    setPublishing(true);
    try {
      const updated = await portfolioService.updatePortfolio(portfolio._id, {
        isPublished: true,
      });
      setPortfolio((prev) => ({
        ...prev,
        ...updated,
        isPublished: true,
        _isOwnerPreview: false,
      }));
      setPublishSuccess(true);
      setTimeout(() => setPublishSuccess(false), 3000);
    } catch (err) {
      alert(err.message || 'Failed to publish portfolio.');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-xs text-slate-500 font-medium">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center p-8 bg-white border border-slate-200 rounded-3xl max-w-md shadow-card">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900">Portfolio Unavailable</h2>
          <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed">
            {error || 'This portfolio page does not exist or has been made private by its creator.'}
          </p>
          <Link to="/">
            <Button variant="primary" size="md">
              Build Your Own Portfolio
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    window.location.href
  )}`;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Portify Branding Strip with Action Bar */}
      <div className="bg-slate-950 text-slate-300 px-4 py-2 text-xs flex flex-wrap items-center justify-between border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-4 h-4 rounded bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold group-hover:bg-indigo-500">
              P
            </div>
            <span className="font-bold text-white tracking-tight">Portify AI</span>
          </Link>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline text-slate-400 font-mono text-[11px]">
            /p/{portfolio.slug}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700 hidden md:inline">
            Theme: {portfolio.theme}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Copy Public Link Button */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs transition-colors"
            title="Copy Public Link"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
            <span className={copied ? 'text-emerald-400 font-semibold' : ''}>
              {copied ? 'Link Copied!' : 'Copy Link'}
            </span>
          </button>

          {/* Standalone ZIP Export */}
          <a
            href={`/api/portfolios/public/${portfolio.slug}/zip`}
            download
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs transition-colors"
            title="Download Standalone Offline ZIP"
          >
            <Download className="w-3 h-3 text-slate-400" />
            <span>ZIP Export</span>
          </a>

          {/* QR Code Action */}
          <button
            onClick={() => setShowQRModal(true)}
            className="p-1 rounded-md bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors"
            title="View QR Code"
          >
            <QrCode className="w-3.5 h-3.5" />
          </button>

          {/* Call to action */}
          <Link
            to="/register"
            className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors pl-2 border-l border-slate-800"
          >
            <span className="hidden md:inline">Build your portfolio</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Owner Unpublished Draft Banner */}
      {portfolio._isOwnerPreview && (
        <div className="bg-amber-950/80 border-b border-amber-800/60 px-4 py-2.5 text-xs text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>Draft Preview (Private):</strong> This portfolio is unpublished. Only you can view this page.
            </span>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handlePublishNow}
            loading={publishing}
            className="text-xs bg-amber-600 hover:bg-amber-500 text-white"
          >
            {publishSuccess ? 'Published!' : 'Publish to Live Web'}
          </Button>
        </div>
      )}

      {/* Render Main Selected Theme */}
      <div className="flex-1">
        <ThemeRenderer portfolio={portfolio} qrCodeUrl={qrCodeUrl} />
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        portfolio={portfolio}
      />
    </div>
  );
}
