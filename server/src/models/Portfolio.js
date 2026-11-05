const mongoose = require('mongoose');

const THEME_LIST = [
  'minimal-pro',
  'dark-developer',
  'creative-gradient',
  'corporate-elite',
  'modern-glass',
];

const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'My Professional Portfolio',
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    theme: {
      type: String,
      enum: THEME_LIST,
      default: 'minimal-pro',
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    extractionSource: {
      type: String,
      enum: ['ai_gemini', 'deterministic_engine', 'manual'],
      default: 'deterministic_engine',
    },
    originalFileName: {
      type: String,
      default: '',
    },
    personalInfo: {
      fullName: { type: String, default: '' },
      headline: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      avatarUrl: { type: String, default: '' },
      website: { type: String, default: '' },
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
    },
    summary: {
      type: String,
      default: '',
    },
    experience: [
      {
        role: { type: String, default: '' },
        company: { type: String, default: '' },
        location: { type: String, default: '' },
        startDate: { type: String, default: '' },
        endDate: { type: String, default: '' },
        current: { type: Boolean, default: false },
        description: { type: String, default: '' },
        highlights: [{ type: String }],
      },
    ],
    education: [
      {
        institution: { type: String, default: '' },
        degree: { type: String, default: '' },
        fieldOfStudy: { type: String, default: '' },
        graduationDate: { type: String, default: '' },
        gpa: { type: String, default: '' },
        highlights: [{ type: String }],
      },
    ],
    skills: [
      {
        category: { type: String, default: 'Technical Skills' },
        items: [{ type: String }],
      },
    ],
    softSkills: [{ type: String }],
    projects: [
      {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        technologies: [{ type: String }],
        dates: { type: String, default: '' },
        liveUrl: { type: String, default: '' },
        repoUrl: { type: String, default: '' },
        highlights: [{ type: String }],
        sourceEvidence: [{ type: String }],
        confidence: { type: Number, default: 0.85 },
        verificationStatus: {
          type: String,
          enum: ['verified', 'inferred', 'pending'],
          default: 'verified',
        },
      },
    ],
    certifications: [
      {
        name: { type: String, default: '' },
        issuer: { type: String, default: '' },
        issueDate: { type: String, default: '' },
        credentialUrl: { type: String, default: '' },
      },
    ],
    achievements: [{ type: String }],
    customSections: [
      {
        title: { type: String, default: '' },
        content: { type: String, default: '' },
      },
    ],
    themeSettings: {
      primaryColor: { type: String, default: '#7c3aed' },
      fontStyle: { type: String, default: 'sans' },
      showQrCode: { type: Boolean, default: true },
      customCss: { type: String, default: '' },
    },
    analytics: {
      views: { type: Number, default: 0 },
      lastViewedAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = {
  Portfolio: mongoose.model('Portfolio', portfolioSchema),
  THEME_LIST,
};

