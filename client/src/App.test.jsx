import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import ThemeRenderer, { THEMES } from './components/themes/ThemeRenderer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfileSettingsModal from './components/dashboard/ProfileSettingsModal';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

const mockPortfolio = {
  theme: 'minimal-pro',
  title: 'Test Portfolio',
  personalInfo: {
    fullName: 'Jane Doe',
    headline: 'Senior Full Stack Engineer',
    email: 'jane@example.com',
    location: 'Seattle, WA',
  },
  summary: 'Passionate developer building resilient systems.',
  experience: [
    {
      role: 'Staff Engineer',
      company: 'CloudWorks',
      startDate: '2020',
      endDate: 'Present',
      current: true,
      highlights: ['Designed distributed cache layer.'],
    },
  ],
  education: [
    {
      degree: 'B.S.',
      fieldOfStudy: 'Computer Engineering',
      institution: 'University of Washington',
      graduationDate: '2019',
    },
  ],
  skills: [
    { category: 'Languages', items: ['TypeScript', 'Go', 'Rust'] },
  ],
  projects: [
    {
      title: 'Microservices Framework',
      description: 'Ultra-fast event bus in Go.',
      technologies: ['Go', 'gRPC'],
    },
  ],
};

describe('Portify AI Client Theme Suite', () => {
  it('should render all 5 themes cleanly without errors', () => {
    THEMES.forEach((themeItem) => {
      const themedPortfolio = { ...mockPortfolio, theme: themeItem.id };
      const { unmount } = render(
        <ThemeRenderer portfolio={themedPortfolio} qrCodeUrl="https://api.qrserver.com/test" />
      );
      expect(screen.getAllByText('Jane Doe').length).toBeGreaterThan(0);
      expect(screen.getByText(/Senior Full Stack Engineer/i)).toBeInTheDocument();
      unmount();
    });
  });

  it('should render the HomePage with tagline and call to action', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <HomePage />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Your Resume, Your Identity,/i)).toBeVisible();
    expect(screen.getByText(/Upload Resume & Generate/i)).toBeVisible();
  });

  it('should render the LoginPage with 1-click demo button', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <LoginPage />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Sign in to Portify AI/i)).toBeVisible();
    expect(screen.getByText(/1-Click Demo Sign In/i)).toBeVisible();
  });

  it('should render the RegisterPage with full name, email, and password fields', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <RegisterPage />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Create your Portify account/i)).toBeVisible();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeVisible();
  });

  it('should render ProfileSettingsModal with profile details and tabs', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <ProfileSettingsModal isOpen={true} onClose={() => {}} />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Account & Profile Settings/i)).toBeInTheDocument();
    expect(screen.getByText(/Profile Details/i)).toBeInTheDocument();
    expect(screen.getByText(/Security & Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Profile/i })).toBeInTheDocument();
  });
});

