import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, CheckCircle2, AlertTriangle, Scale, Globe } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="bg-[#F7F5EF] text-[#252B2A] min-h-screen py-12 sm:py-16 font-sans">
      <div className="w-full max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[#176B67] hover:underline mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#176B67]/10 text-[#176B67] text-xs font-semibold mb-3">
            <Scale className="w-3.5 h-3.5" />
            <span>User Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#252B2A]">
            Terms of Service
          </h1>
          <p className="text-sm text-[#5A6260] mt-2">
            Last Updated: November 4, 2026 • Effective Date: November 4, 2026
          </p>
        </div>

        <div className="bg-white border border-[#E6E2D8] rounded-2xl p-6 sm:p-10 shadow-subtle space-y-8 text-sm leading-relaxed text-[#252B2A]">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#252B2A] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#176B67]" />
              1. Acceptance of Terms
            </h2>
            <p className="text-[#5A6260]">
              By creating an account, uploading a resume, or publishing a portfolio on Portify AI (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not access or use the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#252B2A] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#176B67]" />
              2. Acceptable Use &amp; User Conduct
            </h2>
            <p className="text-[#5A6260]">
              Portify AI is intended for genuine professional portfolio creation and career representation. You agree that:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-[#5A6260] pl-2">
              <li>You will upload only resumes, images, and content that you have legal authority to use.</li>
              <li>You will not upload malicious code, spoofed files, or attempt to bypass rate limits or access controls.</li>
              <li>You will not use public portfolio slugs to host spam, phishing links, illegal content, or intellectual property infringements.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#252B2A] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#176B67]" />
              3. Service Availability &amp; Export Licensing
            </h2>
            <p className="text-[#5A6260]">
              Portify AI provides offline ZIP exports of generated portfolios under an open, royalty-free license for your personal career use. You are free to host downloaded ZIP archives on your own domain or server without dependency on Portify AI infrastructure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#252B2A] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              4. Disclaimer of Warranties &amp; Limitation of Liability
            </h2>
            <p className="text-[#5A6260]">
              The Service is provided &quot;as is&quot; and &quot;as available&quot;. While our AI and deterministic parsing engines enforce strict factual integrity standards, you are responsible for reviewing and confirming the accuracy of your portfolio content before public dissemination.
            </p>
          </section>

          <section className="space-y-3 border-t border-[#E6E2D8] pt-6">
            <h2 className="text-base font-bold text-[#252B2A]">5. Termination &amp; Questions</h2>
            <p className="text-xs text-[#5A6260]">
              We reserve the right to suspend accounts that violate these terms. For inquiries regarding enterprise terms or legal notices, contact <a href="mailto:legal@portify.dev" className="text-[#176B67] font-semibold underline">legal@portify.dev</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

