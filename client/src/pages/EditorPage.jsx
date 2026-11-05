import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { portfolioService } from '../services/portfolioService';
import { aiService } from '../services/aiService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import ThemeRenderer, { THEMES } from '../components/themes/ThemeRenderer';
import DeviceSwitcher from '../components/preview/DeviceSwitcher';
import QRCodeModal from '../components/dashboard/QRCodeModal';
import AIGenerationModal from '../components/studio/AIGenerationModal';
import {
  Save,
  Download,
  QrCode,
  ExternalLink,
  Sparkles,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Palette,
  Plus,
  Trash2,
  Check,
  Copy,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Award,
  Trophy,
  Share2,
  Globe,
  Github,
  Linkedin,
  Twitter,
  ClipboardCheck,
  Maximize2,
  Minimize2,
  Loader2,
  Clock,
  Sparkle,
  Upload,
  Camera,
  ImageIcon,
} from 'lucide-react';

const SECTION_TABS = [
  { id: 'overview', name: 'Review All', icon: ClipboardCheck, countKey: null },
  { id: 'personal', name: '1. Personal Info', icon: User, countKey: null },
  { id: 'summary', name: '2. Summary', icon: FileText, countKey: null },
  { id: 'skills', name: '3. Skills', icon: Wrench, countKey: 'skills' },
  { id: 'education', name: '4. Education', icon: GraduationCap, countKey: 'education' },
  { id: 'experience', name: '5. Experience', icon: Briefcase, countKey: 'experience' },
  { id: 'projects', name: '6. Projects', icon: FolderGit2, countKey: 'projects' },
  { id: 'certifications', name: '7. Certifications', icon: Award, countKey: 'certifications' },
  { id: 'achievements', name: '8. Achievements', icon: Trophy, countKey: 'achievements' },
  { id: 'social', name: '9. Social Links', icon: Share2, countKey: null },
  { id: 'theme', name: 'Theme & Publish', icon: Palette, countKey: null },
];

const SOFT_SKILLS_SUGGESTIONS = [
  'Leadership',
  'Strategic Planning',
  'Cross-functional Collaboration',
  'Mentoring',
  'Problem Solving',
  'Agile / Scrum',
  'Communication',
  'Adaptability',
  'Stakeholder Management',
  'Decision Making',
];

export default function EditorPage({ initialTab }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const formScrollRef = useRef(null);

  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Active editor tab
  const [activeTab, setActiveTab] = useState(
    initialTab || location.state?.defaultTab || 'overview'
  );

  // Full Editor view vs Split-Screen Preview view
  const [isFullEditor, setIsFullEditor] = useState(false);

  // Preview device mode: 'desktop' | 'tablet' | 'mobile'
  const [device, setDevice] = useState('desktop');

  // AI enhancement loading states
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiHighlightLoadingIdx, setAiHighlightLoadingIdx] = useState(null);

  // QR Modal
  const [showQRModal, setShowQRModal] = useState(false);

  // AI Enhancer Modal
  const [showAIEnhancerModal, setShowAIEnhancerModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // New upload banner
  const [newUploadInfo, setNewUploadInfo] = useState(location.state || null);

  // New item input states
  const [newSkillCategoryName, setNewSkillCategoryName] = useState('');
  const [newCategorySkillInput, setNewCategorySkillInput] = useState({});
  const [newSoftSkillInput, setNewSoftSkillInput] = useState('');

  // Profile photo upload states
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const avatarInputRef = useRef(null);

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image exceeds the 5MB size limit.');
      return;
    }

    setAvatarUploading(true);
    setAvatarError('');
    try {
      const res = await portfolioService.uploadAvatar(portfolio._id, file);
      if (res.avatarUrl) {
        updatePersonalInfo('avatarUrl', res.avatarUrl);
      }
    } catch (err) {
      setAvatarError(err.response?.data?.message || err.message || 'Failed to upload photo.');
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleAvatarRemove = async () => {
    setAvatarUploading(true);
    setAvatarError('');
    try {
      await portfolioService.deleteAvatar(portfolio._id);
      updatePersonalInfo('avatarUrl', '');
    } catch (err) {
      setAvatarError(err.message || 'Failed to remove photo.');
    } finally {
      setAvatarUploading(false);
    }
  };

  // Fetch portfolio record from MongoDB
  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const data = await portfolioService.getPortfolioById(id);
      // Guarantee defaults for new optional fields
      const normalized = {
        ...data,
        softSkills: data.softSkills || [],
        certifications: data.certifications || [],
        achievements: data.achievements || [],
        skills: data.skills || [],
        experience: data.experience || [],
        education: data.education || [],
        projects: data.projects || [],
      };
      setPortfolio(normalized);
      setIsDirty(false);
    } catch (err) {
      setError(err.message || 'Failed to load portfolio.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPortfolio();
    }
  }, [id]);

  // Validation function
  const validatePortfolio = (data) => {
    const errs = {};
    if (!data) return errs;

    // Personal Info validation
    if (!data.personalInfo?.fullName?.trim()) {
      errs.fullName = 'Full Name is required for your portfolio.';
    }
    if (
      data.personalInfo?.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personalInfo.email.trim())
    ) {
      errs.email = 'Please provide a valid email address (e.g. name@domain.com).';
    }

    // Experience validation
    (data.experience || []).forEach((exp, idx) => {
      if (!exp.role?.trim()) {
        errs[`exp_${idx}_role`] = 'Role / Title is required.';
      }
      if (!exp.company?.trim()) {
        errs[`exp_${idx}_company`] = 'Company name is required.';
      }
    });

    // Education validation
    (data.education || []).forEach((edu, idx) => {
      if (!edu.degree?.trim()) {
        errs[`edu_${idx}_degree`] = 'Degree is required.';
      }
      if (!edu.institution?.trim()) {
        errs[`edu_${idx}_institution`] = 'Institution is required.';
      }
    });

    // Projects validation
    (data.projects || []).forEach((proj, idx) => {
      if (!proj.title?.trim()) {
        errs[`proj_${idx}_title`] = 'Project title is required.';
      }
    });

    // Certifications validation
    (data.certifications || []).forEach((cert, idx) => {
      if (!cert.name?.trim()) {
        errs[`cert_${idx}_name`] = 'Certification name is required.';
      }
    });

    return errs;
  };

  // Run validation when portfolio changes
  useEffect(() => {
    if (portfolio) {
      const errs = validatePortfolio(portfolio);
      setValidationErrors(errs);
    }
  }, [portfolio]);

  // Save changes to MongoDB
  const handleSave = async (silent = false) => {
    if (!portfolio) return false;
    setSaving(true);
    if (!silent) setSaveSuccess(false);
    setError('');

    try {
      const updated = await portfolioService.updatePortfolio(portfolio._id, portfolio);
      setPortfolio((prev) => ({
        ...prev,
        ...updated,
        softSkills: updated.softSkills || prev.softSkills || [],
        achievements: updated.achievements || prev.achievements || [],
      }));
      setIsDirty(false);
      if (!silent) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
      return true;
    } catch (err) {
      setError(err.message || 'Failed to save portfolio.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Apply selected AI enhancements and persist to MongoDB
  const handleApplyAIEnhancements = async (enhancedPortfolio) => {
    setPortfolio(enhancedPortfolio);
    setSaving(true);
    setError('');

    try {
      const updated = await portfolioService.updatePortfolio(enhancedPortfolio._id, enhancedPortfolio);
      setPortfolio((prev) => ({
        ...prev,
        ...updated,
      }));
      setIsDirty(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      setError(err.message || 'Failed to auto-save enhancements.');
    } finally {
      setSaving(false);
    }
  };

  // Save and Continue to Next Section
  const handleContinue = async () => {
    const saved = await handleSave(true);
    if (!saved) return;

    const tabSequence = [
      'overview',
      'personal',
      'summary',
      'skills',
      'education',
      'experience',
      'projects',
      'certifications',
      'achievements',
      'social',
      'theme',
    ];

    const currentIndex = tabSequence.indexOf(activeTab);
    if (currentIndex < tabSequence.length - 1) {
      const nextTab = tabSequence[currentIndex + 1];
      setActiveTab(nextTab);
      if (formScrollRef.current) {
        formScrollRef.current.scrollTop = 0;
      }
    } else {
      // Completed last tab: go to live page or overview
      navigate(`/p/${portfolio.slug}`);
    }
  };

  // State update helpers (marks dirty)
  const updateField = (updater) => {
    setPortfolio((prev) => {
      const next = updater(prev);
      return next;
    });
    setIsDirty(true);
  };

  const updatePersonalInfo = (field, value) => {
    updateField((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));
  };

  // --- 1. Personal Information Helpers ---
  // (uses updatePersonalInfo)

  // --- 2. Professional Summary Helpers ---
  const handleSummaryAI = async () => {
    setAiSummaryLoading(true);
    try {
      const res = await aiService.enhanceSummary(
        portfolio.summary,
        portfolio.experience,
        portfolio.skills
      );
      if (res.enhancedText) {
        updateField((prev) => ({ ...prev, summary: res.enhancedText }));
      }
    } catch (err) {
      alert(err.message || 'AI summary enhancement failed.');
    } finally {
      setAiSummaryLoading(false);
    }
  };

  // --- 3. Skills Helpers ---
  const addSkillCategory = () => {
    const name = newSkillCategoryName.trim();
    if (!name) return;
    updateField((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), { category: name, items: [] }],
    }));
    setNewSkillCategoryName('');
  };

  const removeSkillCategory = (catIndex) => {
    updateField((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, idx) => idx !== catIndex),
    }));
  };

  const updateCategoryName = (catIndex, newName) => {
    updateField((prev) => {
      const copy = [...prev.skills];
      copy[catIndex].category = newName;
      return { ...prev, skills: copy };
    });
  };

  const addSkillToCategory = (catIndex) => {
    const skill = (newCategorySkillInput[catIndex] || '').trim();
    if (!skill) return;
    updateField((prev) => {
      const copy = [...prev.skills];
      if (!copy[catIndex].items.includes(skill)) {
        copy[catIndex].items = [...copy[catIndex].items, skill];
      }
      return { ...prev, skills: copy };
    });
    setNewCategorySkillInput((prev) => ({ ...prev, [catIndex]: '' }));
  };

  const removeSkillFromCategory = (catIndex, skillIndex) => {
    updateField((prev) => {
      const copy = [...prev.skills];
      copy[catIndex].items = copy[catIndex].items.filter((_, idx) => idx !== skillIndex);
      return { ...prev, skills: copy };
    });
  };

  const addSoftSkill = (skillName) => {
    const name = (skillName || newSoftSkillInput).trim();
    if (!name) return;
    updateField((prev) => {
      const existing = prev.softSkills || [];
      if (!existing.includes(name)) {
        return { ...prev, softSkills: [...existing, name] };
      }
      return prev;
    });
    setNewSoftSkillInput('');
  };

  const removeSoftSkill = (idx) => {
    updateField((prev) => ({
      ...prev,
      softSkills: (prev.softSkills || []).filter((_, i) => i !== idx),
    }));
  };

  // --- 4. Education Helpers ---
  const addEducation = () => {
    updateField((prev) => ({
      ...prev,
      education: [
        {
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Computer Science',
          institution: 'University Name',
          graduationDate: '2022',
          gpa: '',
          highlights: [],
        },
        ...(prev.education || []),
      ],
    }));
  };

  const updateEducation = (index, field, value) => {
    updateField((prev) => {
      const copy = [...prev.education];
      copy[index][field] = value;
      return { ...prev, education: copy };
    });
  };

  const removeEducation = (index) => {
    updateField((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  // --- 5. Experience Helpers ---
  const addExperience = () => {
    updateField((prev) => ({
      ...prev,
      experience: [
        {
          role: 'Software Engineer',
          company: 'Company Name',
          location: '',
          startDate: '2022',
          endDate: 'Present',
          current: true,
          description: '',
          highlights: ['Built and shipped scalable features.'],
        },
        ...(prev.experience || []),
      ],
    }));
  };

  const updateExperience = (index, field, value) => {
    updateField((prev) => {
      const copy = [...prev.experience];
      copy[index][field] = value;
      if (field === 'current' && value === true) {
        copy[index].endDate = 'Present';
      }
      return { ...prev, experience: copy };
    });
  };

  const removeExperience = (index) => {
    updateField((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const addExperienceHighlight = (expIndex) => {
    updateField((prev) => {
      const copy = [...prev.experience];
      copy[expIndex].highlights = [...(copy[expIndex].highlights || []), ''];
      return { ...prev, experience: copy };
    });
  };

  const updateExperienceHighlight = (expIndex, hlIndex, val) => {
    updateField((prev) => {
      const copy = [...prev.experience];
      copy[expIndex].highlights[hlIndex] = val;
      return { ...prev, experience: copy };
    });
  };

  const removeExperienceHighlight = (expIndex, hlIndex) => {
    updateField((prev) => {
      const copy = [...prev.experience];
      copy[expIndex].highlights = copy[expIndex].highlights.filter((_, i) => i !== hlIndex);
      return { ...prev, experience: copy };
    });
  };

  const handleExperienceAI = async (expIndex) => {
    const exp = portfolio.experience[expIndex];
    if (!exp || !exp.highlights || exp.highlights.length === 0) return;

    setAiHighlightLoadingIdx(expIndex);
    try {
      const res = await aiService.enhanceHighlights(exp.role, exp.company, exp.highlights);
      if (res.enhancedHighlights) {
        updateField((prev) => {
          const newExp = [...prev.experience];
          newExp[expIndex].highlights = res.enhancedHighlights;
          return { ...prev, experience: newExp };
        });
      }
    } catch (err) {
      alert(err.message || 'AI highlights enhancement failed.');
    } finally {
      setAiHighlightLoadingIdx(null);
    }
  };

  // --- 6. Projects Helpers ---
  const addProject = () => {
    updateField((prev) => ({
      ...prev,
      projects: [
        {
          title: 'Featured Project',
          description: 'A full-stack application built to solve a concrete problem.',
          technologies: ['React', 'Node.js', 'MongoDB'],
          liveUrl: '',
          repoUrl: '',
          highlights: [],
        },
        ...(prev.projects || []),
      ],
    }));
  };

  const updateProject = (index, field, value) => {
    updateField((prev) => {
      const copy = [...prev.projects];
      copy[index][field] = value;
      return { ...prev, projects: copy };
    });
  };

  const removeProject = (index) => {
    updateField((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  // --- 7. Certifications Helpers ---
  const addCertification = () => {
    updateField((prev) => ({
      ...prev,
      certifications: [
        {
          name: 'Professional Certification',
          issuer: 'Certifying Body / Organization',
          issueDate: '2023',
          credentialUrl: '',
        },
        ...(prev.certifications || []),
      ],
    }));
  };

  const updateCertification = (index, field, value) => {
    updateField((prev) => {
      const copy = [...prev.certifications];
      copy[index][field] = value;
      return { ...prev, certifications: copy };
    });
  };

  const removeCertification = (index) => {
    updateField((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  // --- 8. Achievements Helpers ---
  const addAchievement = () => {
    updateField((prev) => ({
      ...prev,
      achievements: ['Won 1st place in National Engineering Hackathon 2023', ...(prev.achievements || [])],
    }));
  };

  const updateAchievement = (index, value) => {
    updateField((prev) => {
      const copy = [...prev.achievements];
      copy[index] = value;
      return { ...prev, achievements: copy };
    });
  };

  const removeAchievement = (index) => {
    updateField((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index),
    }));
  };

  // Download ZIP
  const handleDownloadZip = async () => {
    try {
      await portfolioService.downloadPortfolioZip(portfolio._id, portfolio.slug);
    } catch (err) {
      alert(err.message || 'Error downloading ZIP archive.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-xs text-slate-500 font-medium">Loading resume review studio...</p>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center p-8 bg-white border border-slate-200 rounded-2xl max-w-md">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">Portfolio Not Found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            The requested portfolio could not be found or you do not have permission to view it.
          </p>
          <Link to="/dashboard">
            <Button variant="primary" size="sm">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const publicUrl = `${window.location.origin}/p/${portfolio.slug}`;
  const hasErrors = Object.keys(validationErrors).length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans overflow-x-hidden w-full">
      {/* Top Studio Navbar */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 sm:gap-4 shrink-0 z-30 shadow-subtle max-w-full">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 truncate max-w-[140px] sm:max-w-[320px]">
                {portfolio.personalInfo?.fullName
                  ? `${portfolio.personalInfo.fullName}'s Portfolio`
                  : portfolio.title}
              </h1>
              <Badge variant="indigo" size="sm">
                {portfolio.theme}
              </Badge>
              {isDirty && (
                <span className="text-[11px] font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="hidden sm:inline">Unsaved edits</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-mono truncate max-w-[180px] sm:max-w-none"
              >
                <span>/p/{portfolio.slug}</span>
                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
              </a>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(publicUrl);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
                title="Copy Public Portfolio Link"
              >
                {copiedLink ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                <span className="hidden sm:inline">{copiedLink ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Studio Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Toggle Full Editor / Split Preview */}
          <button
            onClick={() => setIsFullEditor(!isFullEditor)}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors hidden sm:flex items-center gap-1.5 text-xs font-medium"
            title={isFullEditor ? 'Switch to Split Preview' : 'Expand Editor Fullscreen'}
          >
            {isFullEditor ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullEditor ? 'Split View' : 'Focus Editor'}</span>
          </button>

          <button
            onClick={() => setShowQRModal(true)}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
            title="Share & QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAIEnhancerModal(true)}
            icon={Wrench}
            className="text-xs text-[#176B67] bg-[#176B67]/10 border-[#176B67]/30 hover:bg-[#176B67]/20 hover:text-[#135653] hidden md:inline-flex"
          >
            AI Polish &amp; Generate
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadZip}
            icon={Download}
            className="hidden md:inline-flex text-xs"
          >
            Download ZIP
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSave(false)}
            loading={saving}
            icon={saveSuccess ? Check : Save}
            className={`text-xs ${saveSuccess ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
          >
            <span className="hidden sm:inline">{saveSuccess ? 'Saved to MongoDB!' : 'Save Changes'}</span>
            <span className="sm:hidden">{saveSuccess ? 'Saved' : 'Save'}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleContinue}
            icon={ArrowRight}
            className="text-xs"
          >
            {activeTab === 'theme' ? 'View Live' : 'Continue'}
          </Button>
        </div>
      </div>

      {/* Extraction Banner (Shows after new upload) */}
      {newUploadInfo && (
        <div className="bg-[#176B67] text-[#F7F5EF] px-4 py-2 text-xs flex items-center justify-between border-b border-[#0E4340] shadow-subtle">
          <div className="flex items-center gap-2 max-w-6xl mx-auto w-full">
            <ClipboardCheck className="w-4 h-4 text-[#A3D1CE] shrink-0" />
            <span className="font-medium">
              {newUploadInfo.extractionSource === 'ai_gemini'
                ? 'Resume extracted using Google Gemini AI with structured schema. Review all details below before generation.'
                : 'Resume parsed via Portify Rule Engine. Factually grounded in your uploaded resume. Review and edit any field below.'}
            </span>
          </div>
          <button
            onClick={() => setNewUploadInfo(null)}
            className="text-[#A3D1CE] hover:text-white p-1 transition-colors"
            title="Dismiss notice"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Studio Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Form Controls */}
        <div
          className={`bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-120px)] transition-all duration-300 ${
            isFullEditor ? 'w-full' : 'w-full lg:w-[50%] xl:w-[48%]'
          }`}
        >
          {/* Navigation Tabs Bar */}
          <div className="flex items-center overflow-x-auto border-b border-slate-200 px-4 py-2 gap-1.5 bg-slate-50/90 shrink-0 scrollbar-none">
            {SECTION_TABS.map((tab) => {
              const Icon = tab.icon;
              const itemCount =
                tab.countKey && Array.isArray(portfolio[tab.countKey])
                  ? portfolio[tab.countKey].length
                  : null;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-indigo-600 shadow-subtle border border-slate-200 ring-1 ring-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.name}</span>
                  {itemCount !== null && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        activeTab === tab.id
                          ? 'bg-indigo-100 text-indigo-700 font-bold'
                          : 'bg-slate-200/80 text-slate-600'
                      }`}
                    >
                      {itemCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Form Scroll Area */}
          <div ref={formScrollRef} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Global Error Banner */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* TAB: REVIEW ALL / OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-[#F7F5EF] p-5 rounded-2xl border border-[#E6E2D8] shadow-subtle">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#176B67] flex items-center gap-1.5">
                      <ClipboardCheck className="w-4 h-4" />
                      Resume Review &amp; Readiness Checklist
                    </span>
                    <Badge variant={hasErrors ? 'amber' : 'emerald'} size="sm">
                      {hasErrors ? 'Needs Attention' : 'Ready to Generate'}
                    </Badge>
                  </div>
                  <h2 className="text-base font-bold text-[#252B2A]">
                    Review Extracted Details Before Portfolio Generation
                  </h2>
                  <p className="text-xs text-[#5A6260] mt-1">
                    Every piece of information below was extracted from your document. You can edit any field, add new records, or remove items in each of the 9 sections.
                  </p>
                  <div className="mt-4 pt-3 border-t border-[#E6E2D8] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-[#176B67]" />
                      <span className="text-xs font-semibold text-[#252B2A]">
                        AI Content Polish &amp; Generation Engine
                      </span>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowAIEnhancerModal(true)}
                      icon={Wrench}
                      className="text-xs"
                    >
                      Enhance Descriptions &amp; Grammar
                    </Button>
                  </div>
                </div>

                {/* Section Review Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Card 1: Personal Info */}
                  <div
                    onClick={() => setActiveTab('personal')}
                    className="p-4 rounded-xl border border-[#E6E2D8] bg-white hover:border-[#176B67]/50 hover:shadow-subtle transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-[#252B2A] flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#176B67]" />
                          1. Personal Information
                        </span>
                        {portfolio.personalInfo?.fullName ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-1.5 rounded">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#5A6260] truncate font-medium">
                        {portfolio.personalInfo?.fullName || 'No name provided'}
                      </p>
                      <p className="text-[11px] text-[#878F8D] truncate">
                        {portfolio.personalInfo?.headline || 'No headline'}
                      </p>
                    </div>
                    <span className="text-[11px] text-[#176B67] font-semibold mt-3 flex items-center gap-1">
                      Edit Section <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>

                  {/* Card 2: Summary */}
                  <div
                    onClick={() => setActiveTab('summary')}
                    className="p-4 rounded-xl border border-[#E6E2D8] bg-white hover:border-[#176B67]/50 hover:shadow-subtle transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-[#252B2A] flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#176B67]" />
                          2. Professional Summary
                        </span>
                        {portfolio.summary ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <span className="text-[10px] text-slate-400">Empty</span>
                        )}
                      </div>
                      <p className="text-xs text-[#5A6260] line-clamp-2">
                        {portfolio.summary || 'No summary entered.'}
                      </p>
                    </div>
                    <span className="text-[11px] text-[#176B67] font-semibold mt-3 flex items-center gap-1">
                      Edit Section <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>

                  {/* Card 3: Skills */}
                  <div
                    onClick={() => setActiveTab('skills')}
                    className="p-4 rounded-xl border border-[#E6E2D8] bg-white hover:border-[#176B67]/50 hover:shadow-subtle transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-[#252B2A] flex items-center gap-1.5">
                          <Wrench className="w-3.5 h-3.5 text-[#176B67]" />
                          3. Skills &amp; Competencies
                        </span>
                        <Badge variant="teal" size="sm">
                          {(portfolio.skills || []).flatMap((g) => g.items || []).length +
                            (portfolio.softSkills || []).length}{' '}
                          skills
                        </Badge>
                      </div>
                      <p className="text-xs text-[#5A6260] truncate">
                        {(portfolio.skills || []).map((s) => s.category).join(', ') || 'No categories'}
                      </p>
                      <p className="text-[11px] text-[#878F8D] mt-0.5">
                        {(portfolio.softSkills || []).length} soft skills
                      </p>
                    </div>
                    <span className="text-[11px] text-[#176B67] font-semibold mt-3 flex items-center gap-1">
                      Edit Section <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>

                  {/* Card 4: Education */}
                  <div
                    onClick={() => setActiveTab('education')}
                    className="p-4 rounded-xl border border-[#E6E2D8] bg-white hover:border-[#176B67]/50 hover:shadow-subtle transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-[#252B2A] flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-[#176B67]" />
                          4. Education
                        </span>
                        <Badge variant="teal" size="sm">
                          {(portfolio.education || []).length === 1
                            ? '1 degree'
                            : `${(portfolio.education || []).length} degrees`}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#5A6260] truncate">
                        {portfolio.education?.[0]?.degree || 'No education records'}
                      </p>
                      <p className="text-[11px] text-[#878F8D] truncate">
                        {portfolio.education?.[0]?.institution || ''}
                      </p>
                    </div>
                    <span className="text-[11px] text-[#176B67] font-semibold mt-3 flex items-center gap-1">
                      Edit Section <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>

                  {/* Card 5: Experience */}
                  <div
                    onClick={() => setActiveTab('experience')}
                    className="p-4 rounded-xl border border-[#E6E2D8] bg-white hover:border-[#176B67]/50 hover:shadow-subtle transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-[#252B2A] flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-[#176B67]" />
                          5. Work Experience
                        </span>
                        <Badge variant="teal" size="sm">
                          {(portfolio.experience || []).length === 1
                            ? '1 role'
                            : `${(portfolio.experience || []).length} roles`}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#5A6260] truncate">
                        {portfolio.experience?.[0]?.role
                          ? `${portfolio.experience[0].role} at ${portfolio.experience[0].company}`
                          : 'No experience records'}
                      </p>
                      <p className="text-[11px] text-[#878F8D] truncate">
                        {portfolio.experience?.[0]?.startDate || ''} —{' '}
                        {portfolio.experience?.[0]?.endDate || ''}
                      </p>
                    </div>
                    <span className="text-[11px] text-[#176B67] font-semibold mt-3 flex items-center gap-1">
                      Edit Section <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>

                  {/* Card 6: Projects */}
                  <div
                    onClick={() => setActiveTab('projects')}
                    className="p-4 rounded-xl border border-[#E6E2D8] bg-white hover:border-[#176B67]/50 hover:shadow-subtle transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-[#252B2A] flex items-center gap-1.5">
                          <FolderGit2 className="w-3.5 h-3.5 text-[#176B67]" />
                          6. Featured Projects
                        </span>
                        <Badge variant="teal" size="sm">
                          {(portfolio.projects || []).length === 1
                            ? '1 project'
                            : `${(portfolio.projects || []).length} projects`}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#5A6260] truncate">
                        {portfolio.projects?.[0]?.title || 'No projects listed'}
                      </p>
                      <p className="text-[11px] text-[#878F8D] truncate">
                        {(portfolio.projects?.[0]?.technologies || []).join(', ')}
                      </p>
                    </div>
                    <span className="text-[11px] text-[#176B67] font-semibold mt-3 flex items-center gap-1">
                      Edit Section <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>

                  {/* Card 7: Certifications */}
                  <div
                    onClick={() => setActiveTab('certifications')}
                    className="p-4 rounded-xl border border-[#E6E2D8] bg-white hover:border-[#176B67]/50 hover:shadow-subtle transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-[#252B2A] flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-[#176B67]" />
                          7. Certifications
                        </span>
                        <Badge variant="teal" size="sm">
                          {(portfolio.certifications || []).length === 1
                            ? '1 certification'
                            : `${(portfolio.certifications || []).length} certs`}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#5A6260] truncate">
                        {portfolio.certifications?.[0]?.name || 'No certifications added'}
                      </p>
                      <p className="text-[11px] text-[#878F8D] truncate">
                        {portfolio.certifications?.[0]?.issuer || ''}
                      </p>
                    </div>
                    <span className="text-[11px] text-[#176B67] font-semibold mt-3 flex items-center gap-1">
                      Edit Section <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>

                  {/* Card 8: Achievements */}
                  <div
                    onClick={() => setActiveTab('achievements')}
                    className="p-4 rounded-xl border border-[#E6E2D8] bg-white hover:border-[#176B67]/50 hover:shadow-subtle transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-[#252B2A] flex items-center gap-1.5">
                          <Trophy className="w-3.5 h-3.5 text-[#176B67]" />
                          8. Key Achievements
                        </span>
                        <Badge variant="teal" size="sm">
                          {(portfolio.achievements || []).length === 1
                            ? '1 honor'
                            : `${(portfolio.achievements || []).length} honors`}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#5A6260] line-clamp-1">
                        {portfolio.achievements?.[0] || 'No achievements listed'}
                      </p>
                    </div>
                    <span className="text-[11px] text-[#176B67] font-semibold mt-3 flex items-center gap-1">
                      Edit Section <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>

                  {/* Card 9: Social Links */}
                  <div
                    onClick={() => setActiveTab('social')}
                    className="p-4 rounded-xl border border-[#E6E2D8] bg-white hover:border-[#176B67]/50 hover:shadow-subtle transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-[#252B2A] flex items-center gap-1.5">
                          <Share2 className="w-3.5 h-3.5 text-[#176B67]" />
                          9. Social &amp; Web Links
                        </span>
                        <Badge variant="teal" size="sm">
                          {[
                            portfolio.personalInfo?.github,
                            portfolio.personalInfo?.linkedin,
                            portfolio.personalInfo?.twitter,
                            portfolio.personalInfo?.website,
                          ].filter(Boolean).length}{' '}
                          links
                        </Badge>
                      </div>
                      <p className="text-xs text-[#5A6260] truncate">
                        {portfolio.personalInfo?.github ||
                          portfolio.personalInfo?.linkedin ||
                          portfolio.personalInfo?.website ||
                          'No social links added'}
                      </p>
                    </div>
                    <span className="text-[11px] text-[#176B67] font-semibold mt-3 flex items-center gap-1">
                      Edit Section <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>

                  {/* Card 10: Themes */}
                  <div
                    onClick={() => setActiveTab('theme')}
                    className="p-4 rounded-xl border border-[#176B67]/30 bg-[#176B67]/5 hover:bg-[#176B67]/10 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-[#176B67] flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5 text-[#176B67]" />
                          Theme &amp; Generation
                        </span>
                        <Badge variant="teal" size="sm">
                          Active
                        </Badge>
                      </div>
                      <p className="text-xs text-[#252B2A] font-semibold">
                        Theme: {portfolio.theme}
                      </p>
                      <p className="text-[11px] text-[#5A6260] truncate mt-0.5">
                        Public URL: /p/{portfolio.slug}
                      </p>
                    </div>
                    <span className="text-[11px] text-[#176B67] font-semibold mt-3 flex items-center gap-1">
                      Customize Theme <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* Bottom Actions on Overview */}
                <div className="pt-4 pb-8 border-t border-[#E6E2D8] flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-[#5A6260]">
                    Ready to generate and polish your portfolio website?
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => setShowAIEnhancerModal(true)}
                      icon={Wrench}
                      className="text-xs"
                    >
                      AI Polish &amp; Generate
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleContinue}
                      icon={ArrowRight}
                      className="text-xs"
                    >
                      Start Section-by-Section Review
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 1: PERSONAL INFORMATION */}
            {activeTab === 'personal' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Section 1: Personal Information
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your name, professional title, and primary contact coordinates.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Full Name *"
                      value={portfolio.personalInfo?.fullName || ''}
                      onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                      placeholder="e.g. Diana Prince"
                      error={validationErrors.fullName}
                    />
                  </div>
                  <div>
                    <Input
                      label="Professional Headline"
                      value={portfolio.personalInfo?.headline || ''}
                      onChange={(e) => updatePersonalInfo('headline', e.target.value)}
                      placeholder="e.g. Principal Cloud Architect"
                    />
                  </div>
                  <div>
                    <Input
                      label="Email Address"
                      type="email"
                      value={portfolio.personalInfo?.email || ''}
                      onChange={(e) => updatePersonalInfo('email', e.target.value)}
                      placeholder="diana@example.com"
                      error={validationErrors.email}
                    />
                  </div>
                  <div>
                    <Input
                      label="Phone Number"
                      value={portfolio.personalInfo?.phone || ''}
                      onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                      placeholder="+1 (555) 019-2834"
                    />
                  </div>
                  <div>
                    <Input
                      label="Location / Region"
                      value={portfolio.personalInfo?.location || ''}
                      onChange={(e) => updatePersonalInfo('location', e.target.value)}
                      placeholder="Seattle, WA"
                    />
                  </div>
                  <div>
                    <Input
                      label="Direct Avatar URL (Alternative)"
                      value={portfolio.personalInfo?.avatarUrl?.startsWith('data:') ? '' : (portfolio.personalInfo?.avatarUrl || '')}
                      onChange={(e) => updatePersonalInfo('avatarUrl', e.target.value)}
                      placeholder="https://images.unsplash.com/... or upload below"
                    />
                  </div>
                </div>

                {/* Profile Photo Upload Component (Phase 6) */}
                <div className="p-4 bg-white border border-[#E6E2D8] rounded-xl shadow-subtle space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#252B2A] flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-[#176B67]" />
                        Professional Profile Photo (Optional)
                      </span>
                      <p className="text-[11px] text-[#5A6260] mt-0.5">
                        JPEG, PNG, or WebP up to 5MB. EXIF location metadata is automatically stripped for your privacy.
                      </p>
                    </div>
                    {portfolio.personalInfo?.avatarUrl && (
                      <Badge variant="teal" size="sm">
                        Photo Active
                      </Badge>
                    )}
                  </div>

                  {avatarError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{avatarError}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                    {/* Photo Preview Circle */}
                    <div className="relative group shrink-0">
                      {portfolio.personalInfo?.avatarUrl ? (
                        <img
                          src={portfolio.personalInfo.avatarUrl}
                          alt="Profile Preview"
                          className="w-16 h-16 rounded-full object-cover border-2 border-[#176B67] shadow-subtle"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-[#F7F5EF] border-2 border-dashed border-[#E6E2D8] flex items-center justify-center text-[#878F8D]">
                          <User className="w-7 h-7" />
                        </div>
                      )}
                      {avatarUploading && (
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Actions and Explanation */}
                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleAvatarFileChange}
                          className="hidden"
                          id="avatar-file-input"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Upload}
                          disabled={avatarUploading}
                          onClick={() => avatarInputRef.current?.click()}
                          className="text-xs"
                        >
                          {portfolio.personalInfo?.avatarUrl ? 'Replace Photo' : 'Upload Photo'}
                        </Button>
                        {portfolio.personalInfo?.avatarUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            disabled={avatarUploading}
                            onClick={handleAvatarRemove}
                            className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          >
                            Remove Photo
                          </Button>
                        )}
                      </div>
                      <p className="text-[11px] text-[#878F8D]">
                        {portfolio.personalInfo?.avatarUrl
                          ? 'This photo will be displayed in your portfolio hero with theme-specific styling.'
                          : 'No photo uploaded. Your portfolio theme will automatically adapt with a clean typography layout.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PROFESSIONAL SUMMARY */}
            {activeTab === 'summary' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Section 2: Professional Summary
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      A high-impact bio summarizing your experience, strengths, and impact.
                    </p>
                  </div>
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={handleSummaryAI}
                    loading={aiSummaryLoading}
                    icon={Sparkles}
                    className="text-xs"
                  >
                    AI Polish Summary
                  </Button>
                </div>

                <Input
                  as="textarea"
                  rows={6}
                  value={portfolio.summary || ''}
                  onChange={(e) => updateField((prev) => ({ ...prev, summary: e.target.value }))}
                  placeholder="Accomplished systems architect with 8+ years leading distributed systems and cloud platforms..."
                  helperText="AI enhancement refines vocabulary and impact verbs using only verified facts from your resume."
                />

                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>Characters: {(portfolio.summary || '').length}</span>
                  <span>
                    Words: {(portfolio.summary || '').trim().split(/\s+/).filter(Boolean).length}
                  </span>
                </div>
              </div>
            )}

            {/* TAB 3: SKILLS (TECHNICAL + SOFT) */}
            {activeTab === 'skills' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Section 3: Skills &amp; Competencies
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Organize your technical capabilities into categories and highlight core soft skills.
                  </p>
                </div>

                {/* Sub-section A: Technical Skills by Category */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Technical Skill Groups
                    </h4>
                  </div>

                  {/* Add New Category Input */}
                  <div className="flex gap-2">
                    <Input
                      value={newSkillCategoryName}
                      onChange={(e) => setNewSkillCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkillCategory();
                        }
                      }}
                      placeholder="Add category (e.g. Cloud & DevOps, Languages...)"
                      className="text-xs"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addSkillCategory}
                      icon={Plus}
                      className="shrink-0 text-xs"
                    >
                      Add Category
                    </Button>
                  </div>

                  {/* Existing Categories */}
                  <div className="space-y-4">
                    {(portfolio.skills || []).map((group, catIdx) => (
                      <div
                        key={catIdx}
                        className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={group.category || ''}
                            onChange={(e) => updateCategoryName(catIdx, e.target.value)}
                            className="text-xs font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 focus:outline-none px-1 py-0.5"
                          />
                          <button
                            onClick={() => removeSkillCategory(catIdx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Remove Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Chips for this category */}
                        <div className="flex flex-wrap gap-1.5">
                          {(group.items || []).map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="inline-flex items-center gap-1.5 text-xs font-mono bg-white text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 shadow-subtle"
                            >
                              <span>{skill}</span>
                              <button
                                onClick={() => removeSkillFromCategory(catIdx, sIdx)}
                                className="text-slate-400 hover:text-rose-600"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>

                        {/* Add Skill to this Category */}
                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            value={newCategorySkillInput[catIdx] || ''}
                            onChange={(e) =>
                              setNewCategorySkillInput((prev) => ({
                                ...prev,
                                [catIdx]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addSkillToCategory(catIdx);
                              }
                            }}
                            placeholder="Add skill (press Enter)..."
                            className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500"
                          />
                          <Button
                            variant="subtle"
                            size="sm"
                            onClick={() => addSkillToCategory(catIdx)}
                            className="text-xs py-1"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sub-section B: Soft Skills */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Soft Skills &amp; Core Competencies
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Interpersonal strengths, leadership attributes, and work methodology.
                  </p>

                  {/* Soft Skill Chips */}
                  <div className="flex flex-wrap gap-1.5 min-h-[36px] p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    {(portfolio.softSkills || []).length === 0 && (
                      <span className="text-xs text-slate-400 italic">No soft skills added yet.</span>
                    )}
                    {(portfolio.softSkills || []).map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg"
                      >
                        <span>{skill}</span>
                        <button
                          onClick={() => removeSoftSkill(idx)}
                          className="text-indigo-400 hover:text-rose-600"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add Soft Skill Input */}
                  <div className="flex gap-2">
                    <Input
                      value={newSoftSkillInput}
                      onChange={(e) => setNewSoftSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSoftSkill();
                        }
                      }}
                      placeholder="Add soft skill (e.g. Cross-functional Collaboration)..."
                      className="text-xs"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addSoftSkill()}
                      icon={Plus}
                      className="shrink-0 text-xs"
                    >
                      Add
                    </Button>
                  </div>

                  {/* Suggested Soft Skills Quick-Add */}
                  <div className="pt-1">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                      Suggested Soft Skills (Click to add):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {SOFT_SKILLS_SUGGESTIONS.filter(
                        (s) => !(portfolio.softSkills || []).includes(s)
                      ).map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => addSoftSkill(s)}
                          className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 transition-colors"
                        >
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: EDUCATION */}
            {activeTab === 'education' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Section 4: Education</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Degrees, academic institutions, graduation dates, and achievements.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addEducation}
                    icon={Plus}
                    className="text-xs"
                  >
                    Add Degree
                  </Button>
                </div>

                {(portfolio.education || []).length === 0 && (
                  <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">No education records added.</p>
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={addEducation}
                      className="mt-3 text-xs"
                    >
                      + Add Education Record
                    </Button>
                  </div>
                )}

                {(portfolio.education || []).map((edu, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 font-mono">
                        Degree #{idx + 1}
                      </span>
                      <button
                        onClick={() => removeEducation(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Remove Degree"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Degree *"
                        value={edu.degree || ''}
                        onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                        placeholder="e.g. M.S. in Software Engineering"
                        error={validationErrors[`edu_${idx}_degree`]}
                      />
                      <Input
                        label="Field of Study"
                        value={edu.fieldOfStudy || ''}
                        onChange={(e) => updateEducation(idx, 'fieldOfStudy', e.target.value)}
                        placeholder="e.g. Computer Science"
                      />
                      <Input
                        label="Institution *"
                        value={edu.institution || ''}
                        onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                        placeholder="e.g. MIT"
                        error={validationErrors[`edu_${idx}_institution`]}
                      />
                      <Input
                        label="Graduation Date / Year"
                        value={edu.graduationDate || ''}
                        onChange={(e) => updateEducation(idx, 'graduationDate', e.target.value)}
                        placeholder="e.g. 2018"
                      />
                      <Input
                        label="GPA / Honors (Optional)"
                        value={edu.gpa || ''}
                        onChange={(e) => updateEducation(idx, 'gpa', e.target.value)}
                        placeholder="e.g. 3.9 / Magna Cum Laude"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 5: EXPERIENCE */}
            {activeTab === 'experience' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Section 5: Work Experience
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Career history, roles, key impact metrics, and leadership highlights.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addExperience}
                    icon={Plus}
                    className="text-xs"
                  >
                    Add Role
                  </Button>
                </div>

                {(portfolio.experience || []).length === 0 && (
                  <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">No experience records added.</p>
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={addExperience}
                      className="mt-3 text-xs"
                    >
                      + Add Work Experience
                    </Button>
                  </div>
                )}

                {(portfolio.experience || []).map((exp, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 font-mono">
                        Role #{idx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="subtle"
                          size="sm"
                          onClick={() => handleExperienceAI(idx)}
                          loading={aiHighlightLoadingIdx === idx}
                          icon={Sparkles}
                          className="text-[11px] py-1 px-2.5"
                        >
                          AI Polish Highlights
                        </Button>
                        <button
                          onClick={() => removeExperience(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Remove Role"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Role / Title *"
                        value={exp.role || ''}
                        onChange={(e) => updateExperience(idx, 'role', e.target.value)}
                        placeholder="e.g. Principal Cloud Engineer"
                        error={validationErrors[`exp_${idx}_role`]}
                      />
                      <Input
                        label="Company *"
                        value={exp.company || ''}
                        onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                        placeholder="e.g. CloudSphere Inc."
                        error={validationErrors[`exp_${idx}_company`]}
                      />
                      <Input
                        label="Location"
                        value={exp.location || ''}
                        onChange={(e) => updateExperience(idx, 'location', e.target.value)}
                        placeholder="Seattle, WA"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="Start Date"
                          value={exp.startDate || ''}
                          onChange={(e) => updateExperience(idx, 'startDate', e.target.value)}
                          placeholder="2020"
                        />
                        <Input
                          label="End Date"
                          value={exp.endDate || ''}
                          onChange={(e) => updateExperience(idx, 'endDate', e.target.value)}
                          disabled={exp.current}
                          placeholder="Present"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id={`curr-${idx}`}
                        checked={Boolean(exp.current)}
                        onChange={(e) => updateExperience(idx, 'current', e.target.checked)}
                        className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300"
                      />
                      <label htmlFor={`curr-${idx}`} className="text-xs text-slate-700 font-medium">
                        I currently work here
                      </label>
                    </div>

                    {/* Bullet Highlights */}
                    <div className="pt-2 border-t border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                          Key Achievements &amp; Responsibilities
                        </label>
                        <button
                          type="button"
                          onClick={() => addExperienceHighlight(idx)}
                          className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Bullet
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(exp.highlights || []).map((hl, hlIdx) => (
                          <div key={hlIdx} className="flex gap-2 items-start">
                            <span className="text-xs text-slate-400 font-mono mt-2">•</span>
                            <textarea
                              rows={2}
                              value={hl}
                              onChange={(e) =>
                                updateExperienceHighlight(idx, hlIdx, e.target.value)
                              }
                              placeholder="Spearheaded multi-region cloud migration reducing infrastructure cost by 35%..."
                              className="flex-1 text-xs p-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500 resize-y"
                            />
                            <button
                              type="button"
                              onClick={() => removeExperienceHighlight(idx, hlIdx)}
                              className="p-1 text-slate-400 hover:text-rose-600 mt-2"
                              title="Delete bullet"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 6: PROJECTS */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Section 6: Featured Projects
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Showcase technical architectures, open-source work, and live demos.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addProject}
                    icon={Plus}
                    className="text-xs"
                  >
                    Add Project
                  </Button>
                </div>

                {(portfolio.projects || []).length === 0 && (
                  <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <FolderGit2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">No projects listed yet.</p>
                    <Button variant="subtle" size="sm" onClick={addProject} className="mt-3 text-xs">
                      + Add Featured Project
                    </Button>
                  </div>
                )}

                {(portfolio.projects || []).map((proj, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 font-mono">
                        Project #{idx + 1}
                      </span>
                      <button
                        onClick={() => removeProject(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Remove Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <Input
                      label="Project Title *"
                      value={proj.title || ''}
                      onChange={(e) => updateProject(idx, 'title', e.target.value)}
                      placeholder="e.g. HyperRender 3D"
                      error={validationErrors[`proj_${idx}_title`]}
                    />

                    <Input
                      label="Description"
                      as="textarea"
                      rows={2}
                      value={proj.description || ''}
                      onChange={(e) => updateProject(idx, 'description', e.target.value)}
                      placeholder="WebGL 3D rendering pipeline built with React and Three.js..."
                    />

                    <Input
                      label="Technologies (comma separated)"
                      value={(proj.technologies || []).join(', ')}
                      onChange={(e) =>
                        updateProject(
                          idx,
                          'technologies',
                          e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                        )
                      }
                      placeholder="React, Three.js, WebGL, Tailwind CSS"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Input
                          label="Live Demo URL"
                          value={proj.liveUrl || ''}
                          onChange={(e) => updateProject(idx, 'liveUrl', e.target.value)}
                          placeholder="https://myproject.app"
                        />
                        {proj.liveUrl && (
                          <a
                            href={proj.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-indigo-600 hover:underline inline-flex items-center gap-1 mt-1 font-mono"
                          >
                            <span>Test Live Link</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                      <div>
                        <Input
                          label="GitHub / Repo URL"
                          value={proj.repoUrl || ''}
                          onChange={(e) => updateProject(idx, 'repoUrl', e.target.value)}
                          placeholder="https://github.com/..."
                        />
                        {proj.repoUrl && (
                          <a
                            href={proj.repoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-indigo-600 hover:underline inline-flex items-center gap-1 mt-1 font-mono"
                          >
                            <span>Test Repo Link</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 7: CERTIFICATIONS */}
            {activeTab === 'certifications' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Section 7: Certifications &amp; Licenses
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verified professional credentials, cloud certificates, and accreditations.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addCertification}
                    icon={Plus}
                    className="text-xs"
                  >
                    Add Certification
                  </Button>
                </div>

                {(portfolio.certifications || []).length === 0 && (
                  <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">
                      No certifications added yet.
                    </p>
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={addCertification}
                      className="mt-3 text-xs"
                    >
                      + Add Professional Certification
                    </Button>
                  </div>
                )}

                {(portfolio.certifications || []).map((cert, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 font-mono">
                        Credential #{idx + 1}
                      </span>
                      <button
                        onClick={() => removeCertification(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Remove Certification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        label="Certification Name *"
                        value={cert.name || ''}
                        onChange={(e) => updateCertification(idx, 'name', e.target.value)}
                        placeholder="e.g. AWS Certified Solutions Architect Professional"
                        error={validationErrors[`cert_${idx}_name`]}
                      />
                      <Input
                        label="Issuing Organization"
                        value={cert.issuer || ''}
                        onChange={(e) => updateCertification(idx, 'issuer', e.target.value)}
                        placeholder="e.g. Amazon Web Services"
                      />
                      <Input
                        label="Issue Date / Year"
                        value={cert.issueDate || ''}
                        onChange={(e) => updateCertification(idx, 'issueDate', e.target.value)}
                        placeholder="e.g. 2021"
                      />
                      <Input
                        label="Credential URL / Verification Link"
                        value={cert.credentialUrl || ''}
                        onChange={(e) => updateCertification(idx, 'credentialUrl', e.target.value)}
                        placeholder="https://www.credly.com/..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 8: ACHIEVEMENTS */}
            {activeTab === 'achievements' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Section 8: Key Achievements &amp; Honors
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Awards, competitive recognitions, academic honors, and outstanding milestones.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addAchievement}
                    icon={Plus}
                    className="text-xs"
                  >
                    Add Achievement
                  </Button>
                </div>

                {(portfolio.achievements || []).length === 0 && (
                  <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <Trophy className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">No achievements added yet.</p>
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={addAchievement}
                      className="mt-3 text-xs"
                    >
                      + Add Key Achievement
                    </Button>
                  </div>
                )}

                {(portfolio.achievements || []).map((ach, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 flex items-start gap-3 relative"
                  >
                    <span className="text-xs font-bold text-indigo-600 font-mono mt-2.5">
                      #{idx + 1}
                    </span>
                    <div className="flex-1">
                      <Input
                        as="textarea"
                        rows={2}
                        value={ach}
                        onChange={(e) => updateAchievement(idx, e.target.value)}
                        placeholder="e.g. Awarded Outstanding Graduate Honors 2018..."
                      />
                    </div>
                    <button
                      onClick={() => removeAchievement(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 mt-1"
                      title="Remove Achievement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 9: SOCIAL LINKS */}
            {activeTab === 'social' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Section 9: Social Links &amp; Online Profiles
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Connect your professional profiles, GitHub repositories, and personal blog.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* GitHub */}
                  <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Github className="w-4 h-4 text-slate-700" />
                        GitHub Profile
                      </label>
                      {portfolio.personalInfo?.github && (
                        <a
                          href={portfolio.personalInfo.github}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-indigo-600 hover:underline inline-flex items-center gap-1 font-mono"
                        >
                          <span>Test Profile</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                    <Input
                      value={portfolio.personalInfo?.github || ''}
                      onChange={(e) => updatePersonalInfo('github', e.target.value)}
                      placeholder="https://github.com/yourusername"
                    />
                  </div>

                  {/* LinkedIn */}
                  <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                        LinkedIn Profile
                      </label>
                      {portfolio.personalInfo?.linkedin && (
                        <a
                          href={portfolio.personalInfo.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-indigo-600 hover:underline inline-flex items-center gap-1 font-mono"
                        >
                          <span>Test Profile</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                    <Input
                      value={portfolio.personalInfo?.linkedin || ''}
                      onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/yourusername"
                    />
                  </div>

                  {/* Twitter / X */}
                  <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Twitter className="w-4 h-4 text-slate-800" />
                        Twitter / X Profile
                      </label>
                      {portfolio.personalInfo?.twitter && (
                        <a
                          href={portfolio.personalInfo.twitter}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-indigo-600 hover:underline inline-flex items-center gap-1 font-mono"
                        >
                          <span>Test Profile</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                    <Input
                      value={portfolio.personalInfo?.twitter || ''}
                      onChange={(e) => updatePersonalInfo('twitter', e.target.value)}
                      placeholder="https://x.com/yourhandle"
                    />
                  </div>

                  {/* Website */}
                  <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-emerald-600" />
                        Personal Website / Tech Blog
                      </label>
                      {portfolio.personalInfo?.website && (
                        <a
                          href={portfolio.personalInfo.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-indigo-600 hover:underline inline-flex items-center gap-1 font-mono"
                        >
                          <span>Test Website</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                    <Input
                      value={portfolio.personalInfo?.website || ''}
                      onChange={(e) => updatePersonalInfo('website', e.target.value)}
                      placeholder="https://myportfolio.dev"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: THEME & SETTINGS */}
            {activeTab === 'theme' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Theme Selection &amp; Public Visibility
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose one of Portify AI&apos;s 5 bespoke designer themes and set your public address.
                  </p>
                </div>

                {/* Theme Cards */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Select Portfolio Theme (5 Distinct Designer Themes)
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {THEMES.map((t) => {
                      const isSelected = portfolio.theme === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => updateField((prev) => ({ ...prev, theme: t.id }))}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/60 shadow-card ring-1 ring-indigo-600'
                              : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                {t.badge}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Palette preview dots */}
                              <div className="flex items-center -space-x-1">
                                {t.palette.map((color, cIdx) => (
                                  <span
                                    key={cIdx}
                                    className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                              {isSelected && (
                                <Badge variant="indigo" size="sm">
                                  Active Theme
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{t.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <Input
                    label="Custom Public URL Slug"
                    value={portfolio.slug || ''}
                    onChange={(e) =>
                      updateField((prev) => ({
                        ...prev,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                      }))
                    }
                    helperText={`Public web address: ${window.location.origin}/p/${portfolio.slug}`}
                  />

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-slate-900">Public Visibility</span>
                      <p className="text-[11px] text-slate-500">
                        Allow visitors to access your portfolio via your unique URL
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(portfolio.isPublished)}
                      onChange={(e) =>
                        updateField((prev) => ({ ...prev, isPublished: e.target.checked }))
                      }
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Section Action Bar: Continue Button */}
            {activeTab !== 'overview' && (
              <div className="pt-4 border-t border-[#E6E2D8] flex items-center justify-between sticky bottom-0 bg-white/95 backdrop-blur-sm py-3 -mx-5 px-5 sm:-mx-6 sm:px-6 shadow-subtle z-10">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSave(false)}
                    loading={saving}
                    icon={saveSuccess ? Check : Save}
                    className="text-xs"
                  >
                    {saveSuccess ? 'Saved!' : 'Save Draft'}
                  </Button>
                  {saveSuccess && (
                    <span className="text-[11px] text-emerald-600 font-medium hidden sm:inline">
                      Changes saved to MongoDB
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {activeTab === 'theme' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowAIEnhancerModal(true)}
                      icon={Wrench}
                      className="text-xs"
                    >
                      Polish &amp; Enhance
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleContinue}
                    loading={saving}
                    icon={ArrowRight}
                    className="text-xs"
                  >
                    {activeTab === 'theme' ? 'View Live Portfolio' : 'Continue to Next Section'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Interactive Live Preview with Viewport Simulator */}
        {!isFullEditor && (
          <div className="w-full lg:w-[50%] xl:w-[52%] bg-slate-900 flex flex-col h-[calc(100vh-120px)] overflow-hidden">
            {/* Device Switcher Bar */}
            <DeviceSwitcher device={device} setDevice={setDevice} publicUrl={publicUrl} />

            {/* Viewport Frame Simulator */}
            <div className="flex-1 bg-slate-950/60 p-4 sm:p-6 overflow-y-auto flex items-start justify-center">
              <div
                className={`bg-white transition-all duration-300 shadow-2xl overflow-hidden ${
                  device === 'mobile'
                    ? 'w-[375px] rounded-[36px] border-[8px] border-slate-800 min-h-[667px]'
                    : device === 'tablet'
                    ? 'w-[768px] rounded-2xl border-4 border-slate-800 min-h-[800px]'
                    : 'w-full rounded-xl border border-slate-800'
                }`}
              >
                <ThemeRenderer
                  portfolio={portfolio}
                  qrCodeUrl={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                    publicUrl
                  )}`}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QR Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        portfolio={portfolio}
      />

      {/* AI Portfolio Generation & Content Enhancer Modal */}
      <AIGenerationModal
        isOpen={showAIEnhancerModal}
        onClose={() => setShowAIEnhancerModal(false)}
        portfolio={portfolio}
        onApplyEnhancements={handleApplyAIEnhancements}
      />
    </div>
  );
}
