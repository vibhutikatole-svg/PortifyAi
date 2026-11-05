import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Upload, LayoutGrid, LogOut, User as UserIcon, Menu, X, ArrowRight } from 'lucide-react';
import Button from './Button';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F7F5EF]/95 backdrop-blur-md border-b border-[#252B2A]/10 transition-colors">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-20">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#176B67] flex items-center justify-center text-white shadow-subtle">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-[#252B2A]">
                Portify<span className="text-[#176B67] font-extrabold">.ai</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Center) */}
          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              to="/"
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive('/') ? 'text-[#176B67] bg-[#176B67]/10 font-semibold' : 'text-[#252B2A]/70 hover:text-[#252B2A] hover:bg-[#252B2A]/5'
              }`}
            >
              Overview
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard') ? 'text-[#176B67] bg-[#176B67]/10 font-semibold' : 'text-[#252B2A]/70 hover:text-[#252B2A] hover:bg-[#252B2A]/5'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/upload"
                  className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive('/upload') ? 'text-[#176B67] bg-[#176B67]/10 font-semibold' : 'text-[#252B2A]/70 hover:text-[#252B2A] hover:bg-[#252B2A]/5'
                  }`}
                >
                  Upload Resume
                </Link>
              </>
            )}
          </nav>

          {/* Desktop User Actions (Right) */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  data-testid="navbar-user-badge"
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E6E2D8] hover:border-[#176B67]/40 rounded-lg text-xs font-medium text-[#252B2A] transition-colors shadow-subtle"
                  title="Go to Dashboard"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#176B67]" />
                  <span data-testid="user-display-name">{user?.name}</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} icon={LogOut} id="sign-out-btn">
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" icon={ArrowRight}>
                    Build Portfolio
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#252B2A] hover:bg-[#252B2A]/5 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E6E2D8] bg-[#F7F5EF] px-4 pt-2 pb-6 space-y-2 shadow-subtle animate-fadeIn">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/') ? 'text-[#176B67] bg-[#176B67]/10 font-semibold' : 'text-[#252B2A] hover:bg-[#252B2A]/5'
            }`}
          >
            Overview
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/dashboard') ? 'text-[#176B67] bg-[#176B67]/10 font-semibold' : 'text-[#252B2A] hover:bg-[#252B2A]/5'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/upload"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/upload') ? 'text-[#176B67] bg-[#176B67]/10 font-semibold' : 'text-[#252B2A] hover:bg-[#252B2A]/5'
                }`}
              >
                Upload Resume
              </Link>
              <div className="pt-3 border-t border-[#E6E2D8] flex items-center justify-between">
                <span className="text-xs text-[#5A6260] font-medium">{user?.name}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout} icon={LogOut}>
                  Sign out
                </Button>
              </div>
            </>
          ) : (
            <div className="pt-3 border-t border-[#E6E2D8] flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  Sign in
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="sm" className="w-full" icon={ArrowRight}>
                  Build Portfolio
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

