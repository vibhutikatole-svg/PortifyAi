import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import EditorPage from './pages/EditorPage';
import PublicPortfolioPage from './pages/PublicPortfolioPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      {/* Public Landing & Marketing */}
      <Route
        path="/"
        element={
          <AppShell>
            <HomePage />
          </AppShell>
        }
      />

      {/* Auth Pages */}
      <Route
        path="/login"
        element={
          <AppShell>
            <LoginPage />
          </AppShell>
        }
      />

      <Route
        path="/register"
        element={
          <AppShell>
            <RegisterPage />
          </AppShell>
        }
      />

      {/* Protected Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppShell>
              <DashboardPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Protected Upload Resume */}
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <AppShell>
              <UploadPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Protected Split-Screen Editor & Resume Review Studio */}
      <Route
        path="/review/:id"
        element={
          <ProtectedRoute>
            <AppShell showFooter={false} fullWidth>
              <EditorPage initialTab="overview" />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/editor/:id"
        element={
          <ProtectedRoute>
            <AppShell showFooter={false} fullWidth>
              <EditorPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Public Portfolio View (Unique Slug) */}
      <Route path="/p/:slug" element={<PublicPortfolioPage />} />

      {/* Legal Infrastructure */}
      <Route
        path="/privacy"
        element={
          <AppShell>
            <PrivacyPolicyPage />
          </AppShell>
        }
      />
      <Route
        path="/terms"
        element={
          <AppShell>
            <TermsPage />
          </AppShell>
        }
      />

      {/* 404 Catch-All */}
      <Route
        path="*"
        element={
          <AppShell>
            <NotFoundPage />
          </AppShell>
        }
      />
    </Routes>
  );
}
