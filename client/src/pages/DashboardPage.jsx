import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { portfolioService } from '../services/portfolioService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { SkeletonCard } from '../components/common/Skeleton';
import QRCodeModal from '../components/dashboard/QRCodeModal';
import DeleteConfirmModal from '../components/dashboard/DeleteConfirmModal';
import ProfileSettingsModal from '../components/dashboard/ProfileSettingsModal';
import {
  Upload,
  ExternalLink,
  Edit3,
  Download,
  Trash2,
  QrCode,
  Eye,
  Calendar,
  Layers,
  Sparkles,
  Copy,
  Check,
  Briefcase,
  Settings,
  User,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const navigate = useNavigate();

  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [selectedQRPortfolio, setSelectedQRPortfolio] = useState(null);
  const [selectedDeletePortfolio, setSelectedDeletePortfolio] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      const data = await portfolioService.getPortfolios();
      setPortfolios(data);
    } catch (err) {
      setError(err.message || 'Failed to load portfolios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const handleDelete = async () => {
    if (!selectedDeletePortfolio) return;
    setDeleteLoading(true);
    try {
      await portfolioService.deletePortfolio(selectedDeletePortfolio._id);
      setPortfolios((prev) => prev.filter((p) => p._id !== selectedDeletePortfolio._id));
      setSelectedDeletePortfolio(null);
      showSuccess('Portfolio deleted successfully.');
    } catch (err) {
      showError(err.message || 'Failed to delete portfolio.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCopyLink = (portfolio) => {
    const publicUrl = `${window.location.origin}/p/${portfolio.slug}`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedId(portfolio._id);
    showSuccess('Public link copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadZip = async (portfolio) => {
    try {
      showInfo('Preparing standalone offline ZIP export...');
      await portfolioService.downloadPortfolioZip(portfolio._id, portfolio.slug);
      showSuccess('ZIP downloaded successfully.');
    } catch (err) {
      showError(err.message || 'Error downloading ZIP.');
    }
  };

  const totalViews = portfolios.reduce((acc, p) => acc + (p.analytics?.views || 0), 0);

  return (
    <div className="bg-[#F7F5EF] min-h-screen py-10 font-sans text-[#252B2A]">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20">
        {/* Header / Stats Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#E6E2D8]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252B2A]">
              Welcome back, {user?.name || 'Professional'}
            </h1>
            <p className="text-xs sm:text-sm text-[#5A6260] mt-1">
              Manage your personal portfolio websites, view analytics, and generate exports.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              icon={Settings}
              onClick={() => setIsSettingsOpen(true)}
              id="profile-settings-btn"
            >
              Profile Settings
            </Button>
            <Link to="/upload">
              <Button variant="primary" size="md" icon={Upload} id="upload-resume-btn">
                Upload New Resume
              </Button>
            </Link>
          </div>
        </div>

        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="p-5 bg-white border border-[#E6E2D8] rounded-2xl shadow-subtle">
            <span className="text-xs text-[#5A6260] font-medium">Total Portfolios</span>
            <div className="text-2xl font-bold text-[#252B2A] mt-1">{portfolios.length}</div>
            <span className="text-[11px] text-[#878F8D] mt-0.5 block">Generated from uploaded resumes</span>
          </div>

          <div className="p-5 bg-white border border-[#E6E2D8] rounded-2xl shadow-subtle">
            <span className="text-xs text-[#5A6260] font-medium">Published Live Slugs</span>
            <div className="text-2xl font-bold text-[#176B67] mt-1">
              {portfolios.filter((p) => p.isPublished).length}
            </div>
            <span className="text-[11px] text-[#878F8D] mt-0.5 block">Publicly accessible worldwide</span>
          </div>

          <div className="p-5 bg-white border border-[#E6E2D8] rounded-2xl shadow-subtle">
            <span className="text-xs text-[#5A6260] font-medium">Total Portfolio Views</span>
            <div className="text-2xl font-bold text-[#252B2A] mt-1">{totalViews}</div>
            <span className="text-[11px] text-[#878F8D] mt-0.5 block">Aggregated visitor sessions</span>
          </div>
        </div>

        {/* Portfolio History Section */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#252B2A]">Your Portfolios (History)</h2>
            <span className="text-xs text-[#5A6260]">{portfolios.length} items</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <SkeletonCard key={n} />
              ))}
            </div>
          ) : portfolios.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16 px-6 bg-white border border-dashed border-[#E6E2D8] rounded-2xl max-w-xl mx-auto shadow-subtle">
              <div className="w-12 h-12 bg-[#176B67]/10 text-[#176B67] rounded-xl flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#252B2A]">No portfolios created yet</h3>
              <p className="text-xs text-[#5A6260] max-w-md mx-auto mt-1 mb-6">
                Upload your first resume in PDF or DOCX format. Portify AI will extract your career history and generate a personalized website in seconds.
              </p>
              <Link to="/upload">
                <Button variant="primary" size="md" icon={Upload}>
                  Upload Resume Now
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {portfolios.map((portfolio) => (
                <div
                  key={portfolio._id}
                  className="bg-white border border-[#E6E2D8] hover:border-[#176B67]/40 rounded-2xl shadow-subtle p-6 flex flex-col justify-between transition-all"
                >
                  <div>
                    {/* Top Tag Bar */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <Badge variant="teal" size="sm">
                        {portfolio.theme.replace('-', ' ')}
                      </Badge>
                      <span className="flex items-center gap-1 text-[11px] text-[#878F8D]">
                        <Eye className="w-3.5 h-3.5" />
                        {portfolio.analytics?.views || 0} views
                      </span>
                    </div>

                    {/* Title & Headline */}
                    <h3 className="text-base font-bold text-[#252B2A] truncate">
                      {portfolio.title || 'Professional Portfolio'}
                    </h3>
                    <p className="text-xs text-[#5A6260] mt-0.5 truncate">
                      {portfolio.personalInfo?.headline || 'Candidate Profile'}
                    </p>

                    {/* Public URL Box */}
                    <div className="mt-4 p-2.5 bg-[#F7F5EF] border border-[#E6E2D8] rounded-xl flex items-center justify-between text-xs font-mono text-[#5A6260]">
                      <span className="truncate">/p/{portfolio.slug}</span>
                      <button
                        onClick={() => handleCopyLink(portfolio)}
                        className="p-1 hover:bg-[#EAE6DC] rounded text-[#5A6260] transition-colors shrink-0"
                        title="Copy public link"
                      >
                        {copiedId === portfolio._id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-[#878F8D] mt-3">
                      <Calendar className="w-3 h-3" />
                      <span>Updated {new Date(portfolio.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="mt-6 pt-4 border-t border-[#E6E2D8]/60 flex items-center justify-between gap-2">
                    <Link to={`/editor/${portfolio._id}`} className="flex-1">
                      <Button variant="secondary" size="sm" icon={Edit3} className="w-full text-xs">
                        Studio
                      </Button>
                    </Link>

                    <a
                      href={`/p/${portfolio.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 border border-[#E6E2D8] rounded-lg hover:bg-[#F7F5EF] text-[#5A6260] transition-colors"
                      title="View public live page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => setSelectedQRPortfolio(portfolio)}
                      className="p-2 border border-[#E6E2D8] rounded-lg hover:bg-[#F7F5EF] text-[#5A6260] transition-colors"
                      title="Share & QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDownloadZip(portfolio)}
                      className="p-2 border border-[#E6E2D8] rounded-lg hover:bg-[#F7F5EF] text-[#5A6260] transition-colors"
                      title="Download offline ZIP"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setSelectedDeletePortfolio(portfolio)}
                      className="p-2 border border-[#E6E2D8] rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete portfolio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ProfileSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <QRCodeModal
        isOpen={Boolean(selectedQRPortfolio)}
        onClose={() => setSelectedQRPortfolio(null)}
        portfolio={selectedQRPortfolio}
      />

      <DeleteConfirmModal
        isOpen={Boolean(selectedDeletePortfolio)}
        onClose={() => setSelectedDeletePortfolio(null)}
        onConfirm={handleDelete}
        portfolio={selectedDeletePortfolio}
        loading={deleteLoading}
      />
    </div>
  );
}

