import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Lock, Eye, FileText, Database } from 'lucide-react';
import Button from '../components/common/Button';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#F7F5EF] text-[#252B2A] min-h-screen py-12 sm:py-16 font-sans">
      <div className="w-full max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[#176B67] hover:underline mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#176B67]/10 text-[#176B67] text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy &amp; Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#252B2A]">
            Privacy Policy
          </h1>
          <p className="text-sm text-[#5A6260] mt-2">
            Last Updated: November 4, 2026 • Effective Date: November 4, 2026
          </p>
        </div>

        <div className="bg-white border border-[#E6E2D8] rounded-2xl p-6 sm:p-10 shadow-subtle space-y-8 text-sm leading-relaxed text-[#252B2A]">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#252B2A] flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#176B67]" />
              1. Information We Collect
            </h2>
            <p className="text-[#5A6260]">
              Portify AI collects information necessary to parse, generate, and maintain your professional portfolios. This includes:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-[#5A6260] pl-2">
              <li><strong className="text-[#252B2A]">Account Information:</strong> Name, email address, and encrypted authentication credentials.</li>
              <li><strong className="text-[#252B2A]">Resume &amp; Career Content:</strong> Text, work history, education, skills, project links, and optional profile photos uploaded directly by you.</li>
              <li><strong className="text-[#252B2A]">Telemetry &amp; Analytics:</strong> Aggregated page view counts on your public portfolio slugs. We do not track individual visitor identities or sell telemetry.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#252B2A] flex items-center gap-2">
              <Database className="w-4 h-4 text-[#176B67]" />
              2. How We Use &amp; Protect Your Data
            </h2>
            <p className="text-[#5A6260]">
              Your uploaded resume documents are processed solely to structure career data into personal portfolios.
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-[#5A6260] pl-2">
              <li><strong className="text-[#252B2A]">No Training on Private Resumes:</strong> We do not use your confidential resume documents or personal details to train generalized foundational AI models.</li>
              <li><strong className="text-[#252B2A]">EXIF Metadata Stripping:</strong> Uploaded avatar images are automatically stripped of sensitive EXIF location and camera metadata before storage.</li>
              <li><strong className="text-[#252B2A]">Secure Transmission:</strong> All data is encrypted in transit using TLS 1.3 and at rest with AES-256 encryption.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#252B2A] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#176B67]" />
              3. Data Ownership &amp; Deletion
            </h2>
            <p className="text-[#5A6260]">
              You retain 100% intellectual property ownership of your resume and generated portfolio content. You can modify, unpublish, or permanently delete your portfolio and all associated records at any time from your Dashboard.
            </p>
          </section>

          <section className="space-y-3 border-t border-[#E6E2D8] pt-6">
            <h2 className="text-base font-bold text-[#252B2A]">4. Contact Our Data Protection Team</h2>
            <p className="text-xs text-[#5A6260]">
              If you have any questions regarding data privacy or wish to request data erasure under GDPR/CCPA, contact our security officer at <a href="mailto:privacy@portify.dev" className="text-[#176B67] font-semibold underline">privacy@portify.dev</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

