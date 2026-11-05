import React from 'react';
import { Briefcase, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#F7F5EF] border-t border-[#E6E2D8] mt-auto">
      <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#176B67] flex items-center justify-center text-white shadow-subtle">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-[#252B2A]">
                Portify<span className="text-[#176B67] font-extrabold">.ai</span>
              </span>
              <p className="text-xs text-[#5A6260]">Enterprise-grade resume extraction &amp; portfolio generation.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[#5A6260]">
            <Link to="/" className="hover:text-[#176B67] font-medium transition-colors">Overview</Link>
            <Link to="/upload" className="hover:text-[#176B67] font-medium transition-colors">Upload Resume</Link>
            <Link to="/dashboard" className="hover:text-[#176B67] font-medium transition-colors">Portfolios</Link>
            <Link to="/privacy" className="hover:text-[#176B67] font-medium transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-[#176B67] font-medium transition-colors">Terms of Service</Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[#E6E2D8] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#878F8D]">
          <p>© {new Date().getFullYear()} Portify AI Technologies Inc. All rights reserved.</p>
          <p className="flex items-center gap-1.5 font-medium text-[#5A6260]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#176B67]" />
            OWASP ASVS 5.0 Verified • Grounded Extraction
          </p>
        </div>
      </div>
    </footer>
  );
}

