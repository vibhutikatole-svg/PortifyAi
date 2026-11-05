import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeService } from '../services/resumeService';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  FileUp,
} from 'lucide-react';

export default function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [parsingStep, setParsingStep] = useState('');
  const [error, setError] = useState('');
  const [isScannedError, setIsScannedError] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    setIsScannedError(false);
    if (!selectedFile) return;

    const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    const fileName = selectedFile.name.toLowerCase();
    const isAllowed = allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!isAllowed) {
      setError('Please select a valid PDF, DOCX, or text resume document.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds the maximum 10MB limit.');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUploadAndGenerate = async () => {
    if (!file) return;

    setUploading(true);
    setError('');
    setIsScannedError(false);

    try {
      setParsingStep('Extracting text from resume...');
      await new Promise((r) => setTimeout(r, 600));

      setParsingStep('Structuring career history & categorizing skills...');
      const response = await resumeService.uploadResume(file);

      setParsingStep('Generating customized portfolio theme...');
      await new Promise((r) => setTimeout(r, 400));

      if (response.success && response.portfolio?._id) {
        navigate(`/editor/${response.portfolio._id}`, {
          state: {
            isNewUpload: true,
            extractionSource: response.source,
            sourceMessage: response.sourceMessage,
          },
        });
      } else {
        throw new Error('Portfolio creation failed. Invalid response.');
      }
    } catch (err) {
      setError(err.message || 'Failed to process resume. Please try again.');
      setIsScannedError(Boolean(err.isScanned));
      setUploading(false);
    }
  };

  // Generate quick mock resume file for rapid testing
  const handleUseSampleResume = () => {
    const sampleResumeContent = `
Alexander Vance
Senior Full Stack Engineer
alex.vance@example.com | (555) 234-5678 | San Francisco, CA
https://github.com/alexvance | https://linkedin.com/in/alexvance

PROFESSIONAL SUMMARY
Experienced full-stack engineer with 6+ years designing and scaling distributed web applications and high-throughput microservices using React, Node.js, and TypeScript.

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, Go, SQL, HTML5, CSS3
Frameworks & Libraries: React, Next.js, Node.js, Express, Tailwind CSS, Redux
Databases & Cloud: MongoDB, PostgreSQL, Redis, Docker, AWS, Kubernetes
Tools: Git, GitHub Actions, Jest, Vitest, Figma, Linux

WORK EXPERIENCE
Senior Software Engineer | TechCorp Inc.
Jan 2021 - Present
San Francisco, CA
- Spearheaded migration of legacy monolith to microservices architecture using Node.js and MongoDB.
- Reduced API p99 latency by 42% through strategic Redis caching and database query optimization.
- Mentored a team of 5 junior engineers and established automated CI/CD pipelines with GitHub Actions.

Frontend Developer | InnovateX Labs
Jun 2018 - Dec 2020
Austin, TX
- Developed responsive client portals using React and Tailwind CSS, increasing user retention by 28%.
- Integrated Stripe payment gateway and real-time notification websockets.

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley
2014 - 2018
GPA: 3.85

PROJECTS
CloudScale Monitoring Dashboard
https://cloudscale-demo.app | https://github.com/alexvance/cloudscale
- Real-time cloud metrics visualizer built with Next.js, WebSockets, and Tailwind CSS.
- Handled over 10,000 simulated telemetry events per second with zero frame drops.
    `;
    const blob = new Blob([sampleResumeContent], { type: 'text/plain' });
    const sampleFile = new File([blob], 'Alexander_Vance_Resume.txt', { type: 'text/plain' });
    setFile(sampleFile);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Parsing &amp; Theme Auto-Rotation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Upload Your Resume
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto mt-1">
            Upload your PDF or DOCX file. Our engine parses your experience, skills, and projects, automatically assigns the next theme, and generates a live website.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">{error}</span>
              {isScannedError && (
                <p className="text-slate-600 font-normal">
                  Recommendation: Scanned photocopies or image-only documents lack an extractable text layer. Please export your resume directly as a PDF or DOCX file from Microsoft Word, Google Docs, or Canva.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Drag and Drop Box */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-indigo-600 bg-indigo-50/50 scale-[1.01]'
              : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleChange}
            className="hidden"
          />

          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-subtle">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-base font-bold text-slate-900 mb-1">
            {file ? file.name : 'Drop your resume here, or browse files'}
          </h3>

          <p className="text-xs text-slate-500 mb-4">
            Supports PDF and DOCX files up to 10MB
          </p>

          {file ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>{(file.size / 1024).toFixed(1)} KB • Ready to parse</span>
            </div>
          ) : (
            <Button variant="outline" size="sm" type="button">
              Select Document
            </Button>
          )}
        </div>

        {/* Quick Sample Resume Option */}
        <div className="flex items-center justify-between mt-4 px-2 text-xs text-slate-500">
          <span>Need a resume to test right now?</span>
          <button
            type="button"
            onClick={handleUseSampleResume}
            className="text-indigo-600 hover:text-indigo-700 font-semibold inline-flex items-center gap-1"
          >
            <FileUp className="w-3.5 h-3.5" />
            Load Sample Engineering Resume
          </button>
        </div>

        {/* Upload Action Button */}
        {file && (
          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              variant="primary"
              onClick={handleUploadAndGenerate}
              loading={uploading}
              icon={Sparkles}
              className="w-full sm:w-auto px-8 shadow-elevated"
            >
              {uploading ? (parsingStep || 'Processing...') : 'Generate Portfolio Website'}
            </Button>
          </div>
        )}

        {/* Strict Grounding Guarantee Box */}
        <div className="mt-12 p-5 bg-white border border-slate-200 rounded-2xl flex items-start gap-3.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-900">Strict Factual Integrity Guarantee</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Portify AI strictly preserves your actual qualifications, dates, roles, and accomplishments without hallucinating false credentials or fabricating statistics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
