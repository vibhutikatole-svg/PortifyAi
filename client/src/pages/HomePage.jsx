import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { THEMES } from '../components/themes/ThemeRenderer';
import ThemeRenderer from '../components/themes/ThemeRenderer';
import {
  Upload,
  ArrowRight,
  ShieldCheck,
  Download,
  QrCode,
  Layout,
  FileCheck2,
  CheckCircle2,
  Sparkles as SparklesIcon,
} from 'lucide-react';

// Sample mock data for interactive theme showcase
const DEMO_PORTFOLIO = {
  theme: 'minimal-pro',
  title: 'Elena Rostova — Principal Systems Architect',
  personalInfo: {
    fullName: 'Elena Rostova',
    headline: 'Principal Systems Architect & Distributed Systems Engineer',
    email: 'elena.rostova@engineer.dev',
    phone: '+1 (415) 890-4321',
    location: 'San Francisco, CA',
    website: 'https://elena-rostova.dev',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
  },
  summary:
    'Systems architect with 8+ years specializing in fault-tolerant distributed backends, real-time message brokers, and cloud infrastructure processing 50M+ daily events.',
  experience: [
    {
      role: 'Principal Systems Architect',
      company: 'Aether Cloud Systems',
      location: 'San Francisco, CA',
      startDate: '2021',
      endDate: 'Present',
      current: true,
      description: 'Lead engineering for next-generation event mesh architecture.',
      highlights: [
        'Designed multi-region Kafka ingestion pipeline reducing p99 latency by 38%.',
        'Spearheaded Kubernetes zero-downtime cluster migrations across 4 global regions.',
      ],
    },
    {
      role: 'Senior Backend Engineer',
      company: 'Veloce Data Platforms',
      location: 'New York, NY',
      startDate: '2018',
      endDate: '2021',
      current: false,
      description: 'Scaled core real-time analytics engine and distributed storage clusters.',
      highlights: [
        'Re-architected PostgreSQL time-series partitioning saving $140,000 annually.',
      ],
    },
  ],
  education: [
    {
      institution: 'Carnegie Mellon University',
      degree: 'Master of Science',
      fieldOfStudy: 'Computer Science & Distributed Systems',
      graduationDate: '2018',
      gpa: '3.92',
    },
  ],
  skills: [
    { category: 'Languages', items: ['Go', 'Rust', 'TypeScript', 'Python', 'SQL'] },
    { category: 'Infrastructure', items: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'Kafka'] },
    { category: 'Databases', items: ['PostgreSQL', 'Redis', 'Cassandra', 'ClickHouse'] },
  ],
  projects: [
    {
      title: 'AuraMesh Distributed Broker',
      description: 'Ultra-low latency Raft consensus distributed key-value storage engine in Go.',
      technologies: ['Go', 'Raft', 'gRPC', 'Prometheus'],
      liveUrl: 'https://github.com',
      repoUrl: 'https://github.com',
    },
  ],
};

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [activeTheme, setActiveTheme] = useState('minimal-pro');

  const previewPortfolio = { ...DEMO_PORTFOLIO, theme: activeTheme };

  return (
    <div className="bg-[#F7F5EF] text-[#252B2A] min-h-screen font-sans selection:bg-[#176B67]/20 selection:text-[#176B67]">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden border-b border-[#E6E2D8] bg-[#F7F5EF]">
        <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#176B67]/10 border border-[#176B67]/20 text-xs font-semibold text-[#176B67] mb-6 shadow-subtle">
            <FileCheck2 className="w-3.5 h-3.5 text-[#176B67]" />
            <span>Factual ATS Resume to Web Portfolio Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#252B2A] max-w-4xl mx-auto leading-[1.12]">
            Your Resume, Your Identity,{' '}
            <span className="text-[#176B67]">
              Your Portfolio.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-[#5A6260] max-w-2xl mx-auto leading-relaxed">
            Convert your PDF or DOCX resume into an editable, interactive personal portfolio website in seconds. Five handcrafted themes, custom slugs, QR sharing, and standalone ZIP exports.
          </p>

          {/* Primary Call to Action */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={isAuthenticated ? '/upload' : '/register'}>
              <Button size="lg" variant="primary" icon={Upload} className="w-full sm:w-auto shadow-elevated">
                Upload Resume &amp; Generate
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Explore Demo Portfolios
              </Button>
            </Link>
          </div>

          {/* Value Highlights */}
          <div className="mt-12 pt-8 border-t border-[#E6E2D8] flex flex-wrap items-center justify-center gap-y-3 gap-x-8 text-xs text-[#5A6260]">
            <span className="flex items-center gap-1.5 font-medium text-[#252B2A]">
              <ShieldCheck className="w-4 h-4 text-[#176B67]" />
              100% Grounded Extraction (Zero Hallucinations)
            </span>
            <span className="flex items-center gap-1.5 font-medium text-[#252B2A]">
              <Layout className="w-4 h-4 text-[#176B67]" />
              5 Curated Themes + Auto-Rotation
            </span>
            <span className="flex items-center gap-1.5 font-medium text-[#252B2A]">
              <Download className="w-4 h-4 text-[#176B67]" />
              Offline Self-Contained ZIP Export
            </span>
            <span className="flex items-center gap-1.5 font-medium text-[#252B2A]">
              <QrCode className="w-4 h-4 text-[#176B67]" />
              Instant Mobile QR Deep Link
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Theme Showcase */}
      <section className="py-20 bg-white border-b border-[#E6E2D8]">
        <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252B2A]">
              Five Professional Themes. Zero Generic Templates.
            </h2>
            <p className="mt-3 text-sm text-[#5A6260]">
              Select any theme below to preview how your extracted resume instantly transforms into a distinct visual identity.
            </p>
          </div>

          {/* Theme Selector Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTheme(t.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all select-none ${
                  activeTheme === t.id
                    ? 'bg-[#176B67] text-white shadow-subtle'
                    : 'bg-[#F7F5EF] text-[#252B2A] border border-[#E6E2D8] hover:border-[#176B67]/40'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* Live Preview Container Window */}
          <div className="border border-[#E6E2D8] rounded-2xl shadow-elevated bg-white overflow-hidden max-w-6xl mx-auto">
            {/* Window Frame Bar */}
            <div className="bg-[#F7F5EF] border-b border-[#E6E2D8] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#D8D2C4]"></span>
                <span className="w-3 h-3 rounded-full bg-[#D8D2C4]"></span>
                <span className="w-3 h-3 rounded-full bg-[#D8D2C4]"></span>
                <span className="ml-3 text-xs font-mono text-[#5A6260]">
                  portify.ai/p/elena-rostova ({activeTheme})
                </span>
              </div>
              <Badge variant="teal" size="sm">
                Live Interactive Preview
              </Badge>
            </div>

            {/* Embedded Portfolio */}
            <div className="max-h-[580px] overflow-y-auto">
              <ThemeRenderer portfolio={previewPortfolio} qrCodeUrl="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://portify.ai" />
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Workflow Section */}
      <section className="py-20 bg-[#F7F5EF] border-b border-[#E6E2D8]">
        <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252B2A]">
              How Portify AI Works
            </h2>
            <p className="mt-3 text-sm text-[#5A6260]">
              A frictionless workflow designed to save hours of manual portfolio design and coding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-[#E6E2D8] bg-white shadow-subtle flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-[#176B67]/10 text-[#176B67] flex items-center justify-center font-bold text-sm mb-4">
                  1
                </div>
                <h3 className="font-bold text-base text-[#252B2A] mb-2">Upload Resume</h3>
                <p className="text-xs text-[#5A6260] leading-relaxed">
                  Drop your existing PDF or DOCX file. Our engine parses raw text into clean, structured career records.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E6E2D8] text-xs text-[#176B67] font-medium">
                Supports standard ATS formats
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-[#E6E2D8] bg-white shadow-subtle flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-[#176B67]/10 text-[#176B67] flex items-center justify-center font-bold text-sm mb-4">
                  2
                </div>
                <h3 className="font-bold text-base text-[#252B2A] mb-2">AI &amp; Rule Extraction</h3>
                <p className="text-xs text-[#5A6260] leading-relaxed">
                  Gemini AI structures your personal info, experience, skills, education, and projects without inventing false qualifications.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E6E2D8] text-xs text-[#176B67] font-medium">
                Strict factual integrity guaranteed
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-[#E6E2D8] bg-white shadow-subtle flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-[#176B67]/10 text-[#176B67] flex items-center justify-center font-bold text-sm mb-4">
                  3
                </div>
                <h3 className="font-bold text-base text-[#252B2A] mb-2">Live Studio &amp; Share</h3>
                <p className="text-xs text-[#5A6260] leading-relaxed">
                  Fine-tune any field in the live studio. Publish to your unique public link, download a static ZIP website, or share via QR code.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E6E2D8] text-xs text-[#176B67] font-medium">
                Instant public slug &amp; offline ZIP
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 bg-[#252B2A] text-white relative overflow-hidden border-t border-[#353D3B]">
        <div className="absolute inset-0 bg-radial-gradient from-[#176B67]/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Build Your Personal Portfolio?
          </h2>
          <p className="mt-4 text-base text-[#E6E2D8]/80 max-w-xl mx-auto">
            Upload your resume now and launch your online portfolio in under 30 seconds.
          </p>
          <div className="mt-8 flex justify-center">
            <Link to={isAuthenticated ? '/upload' : '/register'}>
              <Button size="lg" variant="primary" icon={ArrowRight} className="shadow-elevated">
                Start Building Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

