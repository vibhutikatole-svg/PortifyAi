import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EditorPage from './pages/EditorPage';
import { portfolioService } from './services/portfolioService';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

vi.mock('./services/portfolioService', () => ({
  portfolioService: {
    getPortfolioById: vi.fn(),
    updatePortfolio: vi.fn(),
    downloadPortfolioZip: vi.fn(),
  },
}));

vi.mock('./services/aiService', () => ({
  aiService: {
    enhanceSummary: vi.fn().mockResolvedValue({ enhancedText: 'Polished AI Summary' }),
    enhanceHighlights: vi.fn().mockResolvedValue({ enhancedHighlights: ['AI Enhanced Bullet'] }),
  },
}));

const mockFullPortfolio = {
  _id: 'port_123',
  title: 'Diana Prince Portfolio',
  slug: 'diana-prince',
  theme: 'minimal-pro',
  isPublished: true,
  personalInfo: {
    fullName: 'Diana Prince',
    headline: 'Principal Cloud Architect',
    email: 'diana@example.com',
    phone: '555-019-2834',
    location: 'Seattle, WA',
    github: 'https://github.com/dianaprince',
    linkedin: 'https://linkedin.com/in/dianaprince',
    twitter: 'https://x.com/dianaprince',
    website: 'https://dianaprince.dev',
  },
  summary: 'Accomplished cloud architect with 8+ years experience.',
  skills: [
    { category: 'Cloud Infrastructure', items: ['Kubernetes', 'AWS', 'Terraform'] },
  ],
  softSkills: ['Leadership', 'Strategic Planning'],
  education: [
    {
      degree: 'M.S. in Software Engineering',
      fieldOfStudy: 'Distributed Systems',
      institution: 'MIT',
      graduationDate: '2018',
      gpa: '3.9',
    },
  ],
  experience: [
    {
      role: 'Principal Engineer',
      company: 'CloudSphere Inc.',
      location: 'Seattle, WA',
      startDate: '2020',
      endDate: 'Present',
      current: true,
      description: 'Overseeing multi-region infrastructure.',
      highlights: ['Reduced cloud spend by 35%.'],
    },
  ],
  projects: [
    {
      title: 'Global Mesh Router',
      description: 'Distributed ingress gateway.',
      technologies: ['Go', 'eBPF'],
      liveUrl: 'https://mesh.dev',
      repoUrl: 'https://github.com/dianaprince/mesh',
      highlights: [],
    },
  ],
  certifications: [
    {
      name: 'AWS Solutions Architect Professional',
      issuer: 'Amazon Web Services',
      issueDate: '2021',
      credentialUrl: 'https://aws.cert/123',
    },
  ],
  achievements: ['Speaker at AWS re:Invent 2022', 'MIT Outstanding Graduate 2018'],
};

function renderEditor(initialEntry = '/editor/port_123') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/editor/:id" element={<EditorPage />} />
            <Route path="/review/:id" element={<EditorPage initialTab="overview" />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Resume Review & Multi-Section Editor Client Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    portfolioService.getPortfolioById.mockResolvedValue(JSON.parse(JSON.stringify(mockFullPortfolio)));
    portfolioService.updatePortfolio.mockImplementation((id, data) => Promise.resolve(data));
  });

  it('should render the Review Overview tab with all 9 section cards and checklist', async () => {
    renderEditor('/review/port_123');

    await waitFor(() => {
      expect(screen.getByText(/Resume Review & Readiness Checklist/i)).toBeInTheDocument();
    });

    // Check all section cards on overview (using getAllByText because preview or tabs also match)
    expect(screen.getAllByText(/1\. Personal Information/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2\. Professional Summary/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/3\. Skills/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/4\. Education/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/5\. Work Experience/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/6\. Featured Projects/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/7\. Certifications/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/8\. Key Achievements/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/9\. Social/i).length).toBeGreaterThan(0);
  });

  it('should allow editing personal information and validate required fields', async () => {
    renderEditor('/editor/port_123');

    // Click on Personal Info tab
    await waitFor(() => {
      const personalTab = screen.getByRole('button', { name: /1\. Personal Info/i });
      fireEvent.click(personalTab);
    });

    const nameInput = screen.getByLabelText(/Full Name \*/i);
    expect(nameInput.value).toBe('Diana Prince');

    // Edit full name
    fireEvent.change(nameInput, { target: { value: 'Diana Prince-Wayne' } });
    expect(nameInput.value).toBe('Diana Prince-Wayne');

    // Clear name to test validation
    fireEvent.change(nameInput, { target: { value: '' } });
    await waitFor(() => {
      expect(screen.getByText(/Full Name is required for your portfolio/i)).toBeInTheDocument();
    });

    // Restore name
    fireEvent.change(nameInput, { target: { value: 'Diana Prince' } });
  });

  it('should allow adding new soft skills and technical categories in Section 3', async () => {
    renderEditor('/editor/port_123');

    await waitFor(() => {
      const skillsTab = screen.getByRole('button', { name: /3\. Skills/i });
      fireEvent.click(skillsTab);
    });

    expect(screen.getAllByText(/Leadership/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Kubernetes/i).length).toBeGreaterThan(0);

    // Add a new soft skill using suggestion button
    const mentoringBtn = screen.getByRole('button', { name: /\+ Mentoring/i });
    fireEvent.click(mentoringBtn);

    expect(screen.getAllByText('Mentoring').length).toBeGreaterThan(0);
  });

  it('should allow adding a new certification in Section 7 and removing it', async () => {
    renderEditor('/editor/port_123');

    await waitFor(() => {
      const certTab = screen.getByRole('button', { name: /7\. Certifications/i });
      fireEvent.click(certTab);
    });

    expect(screen.getAllByText(/AWS Solutions Architect Professional/i).length).toBeGreaterThan(0);

    // Add new certification
    const addBtn = screen.getByRole('button', { name: /Add Certification/i });
    fireEvent.click(addBtn);

    expect(screen.getAllByDisplayValue(/Professional Certification/i).length).toBeGreaterThan(0);

    // Remove certification
    const removeBtns = screen.getAllByTitle(/Remove Certification/i);
    fireEvent.click(removeBtns[0]);

    // Professional Certification was removed, remaining is AWS cert
    expect(screen.queryByDisplayValue(/Professional Certification/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/AWS Solutions Architect Professional/i).length).toBeGreaterThan(0);
  });

  it('should allow adding a new achievement in Section 8 and editing it', async () => {
    renderEditor('/editor/port_123');

    await waitFor(() => {
      const achTab = screen.getByRole('button', { name: /8\. Achievements/i });
      fireEvent.click(achTab);
    });

    expect(screen.getAllByText(/Speaker at AWS re:Invent 2022/i).length).toBeGreaterThan(0);

    // Add achievement
    const addBtn = screen.getByRole('button', { name: /Add Achievement/i });
    fireEvent.click(addBtn);

    // Edit the newly added achievement
    const textareas = screen.getAllByRole('textbox');
    fireEvent.change(textareas[0], { target: { value: 'Published O\'Reilly Book on Cloud Native' } });
    expect(textareas[0].value).toBe('Published O\'Reilly Book on Cloud Native');
  });

  it('should save changes to MongoDB when Continue or Save Draft is clicked', async () => {
    renderEditor('/editor/port_123');

    await waitFor(() => {
      expect(screen.getByText(/Save Changes/i)).toBeInTheDocument();
    });

    // Click Save Changes in top navbar
    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(portfolioService.updatePortfolio).toHaveBeenCalledWith(
        'port_123',
        expect.objectContaining({
          _id: 'port_123',
          slug: 'diana-prince',
        })
      );
    });
  });

  it('should advance to next section sequentially when Continue is clicked', async () => {
    renderEditor('/editor/port_123');

    // Go to Personal Info tab
    await waitFor(() => {
      const personalTab = screen.getByRole('button', { name: /1\. Personal Info/i });
      fireEvent.click(personalTab);
    });

    expect(screen.getByText(/Section 1: Personal Information/i)).toBeInTheDocument();

    // Click Continue
    const continueBtn = screen.getByRole('button', { name: /Continue to Next Section/i });
    fireEvent.click(continueBtn);

    // Should advance to Section 2: Summary
    await waitFor(() => {
      expect(screen.getByText(/Section 2: Professional Summary/i)).toBeInTheDocument();
    });
  });
});
