import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ThemeRenderer, { THEMES } from './components/themes/ThemeRenderer';
import MinimalProTheme from './components/themes/MinimalProTheme';
import DarkDeveloperTheme from './components/themes/DarkDeveloperTheme';
import CreativeGradientTheme from './components/themes/CreativeGradientTheme';
import CorporateEliteTheme from './components/themes/CorporateEliteTheme';
import ModernGlassTheme from './components/themes/ModernGlassTheme';

const fullPortfolioSample = {
  _id: 'sample-portfolio-123',
  title: 'Full Stack Engineering Portfolio',
  slug: 'alex-morgan-lead',
  theme: 'minimal-pro',
  isPublished: true,
  personalInfo: {
    fullName: 'Alex Morgan',
    headline: 'Senior Cloud & Systems Architect',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    bio: 'Pioneering distributed resilient architectures.',
    website: 'https://alexmorgan.dev',
    github: 'https://github.com/alexmorgan',
    linkedin: 'https://linkedin.com/in/alexmorgan',
    twitter: 'https://x.com/alexmorgan_dev',
  },
  summary:
    'Dedicated systems architect with 10+ years architecting zero-trust cloud platforms and high-throughput real-time streaming engines.',
  skills: [
    { category: 'Cloud Infrastructure', items: ['AWS', 'Kubernetes', 'Terraform', 'Docker'] },
    { category: 'Backend Engineering', items: ['Node.js', 'Go', 'PostgreSQL', 'Redis'] },
  ],
  softSkills: ['Executive Leadership', 'Cross-functional Alignment', 'System Design Mentoring'],
  experience: [
    {
      company: 'Apex Cloud Systems',
      role: 'Principal Architect',
      location: 'San Francisco, CA',
      startDate: '2021',
      endDate: 'Present',
      current: true,
      description: 'Overseeing global cloud reliability and microservice infrastructure.',
      highlights: [
        'Reduced 99th percentile API latency by 42% across 80M daily requests.',
        'Mentored 14 senior engineers across distributed platform teams.',
      ],
    },
    {
      company: 'StreamScale Networks',
      role: 'Senior Infrastructure Engineer',
      location: 'Seattle, WA',
      startDate: '2018',
      endDate: '2021',
      current: false,
      description: 'Built distributed telemetry and event stream pipelines.',
      highlights: ['Designed multi-region Kafka ingestion pipeline.'],
    },
  ],
  education: [
    {
      institution: 'University of California, Berkeley',
      degree: 'B.S.',
      fieldOfStudy: 'Computer Science & Distributed Systems',
      graduationDate: '2017',
      gpa: '3.85',
    },
  ],
  projects: [
    {
      title: 'KubePulse Observer',
      description: 'Real-time telemetry and anomaly detection agent for Kubernetes clusters.',
      technologies: ['Go', 'eBPF', 'Prometheus', 'React'],
      liveUrl: 'https://kubepulse.io',
      repoUrl: 'https://github.com/alexmorgan/kubepulse',
    },
    {
      title: 'HyperLog Serverless',
      description: 'Ultra-fast event storage engine with sub-millisecond querying.',
      technologies: ['Rust', 'Wasm', 'TypeScript'],
      liveUrl: 'https://hyperlog.dev',
      repoUrl: 'https://github.com/alexmorgan/hyperlog',
    },
  ],
  certifications: [
    {
      name: 'AWS Certified Solutions Architect — Professional',
      issuer: 'Amazon Web Services',
      issueDate: '2023',
      credentialUrl: 'https://aws.amazon.com/verification/123456',
    },
  ],
  achievements: [
    'Keynote Speaker at AWS re:Invent 2023 on High-Scale Distributed Systems',
    'Recipient of Outstanding Engineering Leadership Award 2022',
  ],
};

const emptyPortfolioSample = {
  _id: 'minimal-portfolio-456',
  personalInfo: {
    fullName: 'Jane Doe',
  },
  skills: [],
  softSkills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  achievements: [],
};

describe('Portify AI — 5 Portfolio Themes Unit & Visual Hierarchy Suite', () => {
  it('THEMES catalog exports all 5 specified themes with metadata', () => {
    expect(THEMES).toHaveLength(5);
    const themeIds = THEMES.map((t) => t.id);
    expect(themeIds).toEqual([
      'minimal-pro',
      'dark-developer',
      'creative-gradient',
      'corporate-elite',
      'modern-glass',
    ]);
  });

  describe('Theme 1: Minimal Pro Theme', () => {
    it('renders with full portfolio data and editorial navigation', () => {
      render(<MinimalProTheme portfolio={fullPortfolioSample} qrCodeUrl="https://qr.test/1" />);

      expect(screen.getAllByText('Alex Morgan').length).toBeGreaterThan(0);
      expect(screen.getByText('Senior Cloud & Systems Architect')).toBeDefined();
      expect(screen.getByText(/Dedicated systems architect with 10\+ years/i)).toBeDefined();

      // Navigation links
      expect(screen.getByText('Experience')).toBeDefined();
      expect(screen.getByText('Projects')).toBeDefined();
      expect(screen.getByText('Skills')).toBeDefined();

      // Experience & Projects
      expect(screen.getByText('Apex Cloud Systems • San Francisco, CA')).toBeDefined();
      expect(screen.getByText('KubePulse Observer')).toBeDefined();
      expect(screen.getByText('AWS Certified Solutions Architect — Professional')).toBeDefined();
      expect(
        screen.getByText(/Keynote Speaker at AWS re:Invent 2023/i)
      ).toBeDefined();
    });

    it('handles empty portfolio gracefully without crashing or broken layout', () => {
      const { container } = render(<MinimalProTheme portfolio={emptyPortfolioSample} />);
      expect(screen.getAllByText('Jane Doe').length).toBeGreaterThan(0);
      // Should not render experience or projects section headers when empty
      expect(container.querySelector('#experience')).toBeNull();
      expect(container.querySelector('#projects')).toBeNull();
    });
  });

  describe('Theme 2: Dark Developer Theme', () => {
    it('renders terminal console header, bash tabs, and git branch tree', () => {
      render(<DarkDeveloperTheme portfolio={fullPortfolioSample} qrCodeUrl="https://qr.test/2" />);

      expect(screen.getByRole('heading', { name: 'Alex Morgan' })).toBeDefined();
      expect(screen.getByText('portfolio.ts')).toBeDefined();
      expect(screen.getByText(/git log --graph --career/i)).toBeDefined();
      expect(screen.getByText(/featured_repositories/i)).toBeDefined();

      // Bash tabs
      expect(screen.getByText('~/experience')).toBeDefined();
      expect(screen.getByText('~/projects')).toBeDefined();

      // Projects
      expect(screen.getByText('KubePulse Observer')).toBeDefined();
      expect(screen.getAllByText('[live]').length).toBeGreaterThan(0);
    });

    it('handles empty data gracefully without crashing', () => {
      const { container } = render(<DarkDeveloperTheme portfolio={emptyPortfolioSample} />);
      expect(screen.getByRole('heading', { name: 'Jane Doe' })).toBeDefined();
      expect(container.querySelector('#experience')).toBeNull();
    });
  });

  describe('Theme 3: Creative Gradient Theme', () => {
    it('renders pastel gradient hero, floating pill nav, and creations grid', () => {
      render(
        <CreativeGradientTheme portfolio={fullPortfolioSample} qrCodeUrl="https://qr.test/3" />
      );

      expect(screen.getAllByText('Alex Morgan').length).toBeGreaterThan(0);
      expect(screen.getByText(/Creative Showcase/i)).toBeDefined();
      expect(screen.getByText('Featured Work & Creations')).toBeDefined();
      expect(screen.getByText('Career Journey')).toBeDefined();
      expect(screen.getByText('KubePulse Observer')).toBeDefined();
    });

    it('handles missing fields gracefully', () => {
      const { container } = render(<CreativeGradientTheme portfolio={emptyPortfolioSample} />);
      expect(screen.getAllByText('Jane Doe').length).toBeGreaterThan(0);
      expect(container.querySelector('#projects')).toBeNull();
    });
  });

  describe('Theme 4: Corporate Elite Theme', () => {
    it('renders executive 2-column split layout with leadership & strategic initiatives', () => {
      render(<CorporateEliteTheme portfolio={fullPortfolioSample} qrCodeUrl="https://qr.test/4" />);

      expect(screen.getByRole('heading', { name: 'Alex Morgan' })).toBeDefined();
      expect(screen.getByText('Executive Dossier')).toBeDefined();
      expect(screen.getByText('Executive Leadership History')).toBeDefined();
      expect(screen.getByText('Strategic Initiatives & Projects')).toBeDefined();
      expect(screen.getByText('Core Competencies')).toBeDefined();
      expect(screen.getByText('KubePulse Observer')).toBeDefined();
    });

    it('handles empty data gracefully', () => {
      const { container } = render(<CorporateEliteTheme portfolio={emptyPortfolioSample} />);
      expect(screen.getByRole('heading', { name: 'Jane Doe' })).toBeDefined();
      expect(container.querySelector('#leadership')).toBeNull();
    });
  });

  describe('Theme 5: Modern Glass Theme', () => {
    it('renders frosted glassmorphic hero, floating glass navbar, and glass cards', () => {
      render(<ModernGlassTheme portfolio={fullPortfolioSample} qrCodeUrl="https://qr.test/5" />);

      expect(screen.getAllByText('Alex Morgan').length).toBeGreaterThan(0);
      expect(screen.getByText('modern-glass')).toBeDefined();
      expect(screen.getByText('Featured Projects')).toBeDefined();
      expect(screen.getByText('Capabilities & Stack')).toBeDefined();
      expect(screen.getByText('KubePulse Observer')).toBeDefined();
    });

    it('handles empty data gracefully', () => {
      const { container } = render(<ModernGlassTheme portfolio={emptyPortfolioSample} />);
      expect(screen.getAllByText('Jane Doe').length).toBeGreaterThan(0);
      expect(container.querySelector('#experience')).toBeNull();
    });
  });

  describe('ThemeRenderer Component Switching', () => {
    it('renders null safe placeholder when portfolio is not passed', () => {
      render(<ThemeRenderer portfolio={null} />);
      expect(screen.getByText(/No portfolio data available/i)).toBeDefined();
    });

    it('dynamically switches components based on portfolio.theme', () => {
      const { rerender } = render(
        <ThemeRenderer portfolio={{ ...fullPortfolioSample, theme: 'minimal-pro' }} />
      );
      expect(screen.getByText('Curriculum Vitae')).toBeDefined();

      rerender(<ThemeRenderer portfolio={{ ...fullPortfolioSample, theme: 'dark-developer' }} />);
      expect(screen.getByText('developer.config.ts')).toBeDefined();

      rerender(<ThemeRenderer portfolio={{ ...fullPortfolioSample, theme: 'creative-gradient' }} />);
      expect(screen.getByText(/Creative Showcase/i)).toBeDefined();

      rerender(<ThemeRenderer portfolio={{ ...fullPortfolioSample, theme: 'corporate-elite' }} />);
      expect(screen.getByText('Executive Dossier')).toBeDefined();

      rerender(<ThemeRenderer portfolio={{ ...fullPortfolioSample, theme: 'modern-glass' }} />);
      expect(screen.getByText('modern-glass')).toBeDefined();
    });
  });
});
