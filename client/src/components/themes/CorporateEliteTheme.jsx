import React from 'react';
import {
  Mail,
  MapPin,
  Phone,
  Globe,
  Linkedin,
  Award,
  Briefcase,
  GraduationCap,
  CheckCircle,
  ExternalLink,
  FolderGit2,
  ShieldCheck,
} from 'lucide-react';

export default function CorporateEliteTheme({ portfolio, qrCodeUrl }) {
  const p = portfolio || {};
  const info = p.personalInfo || {};

  // Check which sections have content for navigation
  const navItems = [
    { label: 'Profile', href: '#profile', show: Boolean(p.summary || info.fullName) },
    { label: 'Leadership', href: '#leadership', show: Boolean(p.experience && p.experience.length > 0) },
    { label: 'Initiatives', href: '#initiatives', show: Boolean(p.projects && p.projects.length > 0) },
    { label: 'Competencies', href: '#competencies', show: Boolean((p.skills && p.skills.length > 0) || (p.softSkills && p.softSkills.length > 0)) },
    { label: 'Credentials', href: '#credentials', show: Boolean(p.certifications && p.certifications.length > 0) },
    { label: 'Education', href: '#education', show: Boolean(p.education && p.education.length > 0) },
  ].filter((item) => item.show);

  return (
    <div className="bg-[#F1F5F9] text-slate-900 min-h-screen py-8 sm:py-12 px-3 sm:px-8 font-sans selection:bg-slate-300 scroll-smooth">
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto bg-white border border-slate-200 shadow-card rounded-2xl overflow-hidden">
        {/* Executive Header Banner */}
        <header className="bg-slate-900 text-white p-6 sm:p-10 border-b-4 border-indigo-600 relative">
          <div className="flex flex-col-reverse sm:flex-row justify-between items-start gap-6">
            <div className="space-y-2 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/40 text-[11px] uppercase tracking-widest text-indigo-300 font-semibold">
                <ShieldCheck className="w-3 h-3 text-indigo-400" />
                <span>Executive Dossier</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold uppercase tracking-wider text-white">
                {info.fullName || 'Executive Candidate'}
              </h1>
              <p className="text-base sm:text-xl text-slate-300 font-medium">
                {info.headline || 'Senior Technology Executive'}
              </p>
            </div>

            {info.avatarUrl && (
              <img
                src={info.avatarUrl}
                alt={info.fullName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border-2 border-slate-700 shadow-md shrink-0"
              />
            )}
          </div>

          {/* Contact Bar */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 pt-6 border-t border-slate-800 text-xs text-slate-300">
            {info.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>{info.location}</span>
              </span>
            )}
            {info.email && (
              <a
                href={`mailto:${info.email}`}
                className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>{info.email}</span>
              </a>
            )}
            {info.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span>{info.phone}</span>
              </span>
            )}
            {info.linkedin && (
              <a
                href={info.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5 text-indigo-400" />
                <span>LinkedIn</span>
              </a>
            )}
            {info.website && (
              <a
                href={info.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>Website</span>
              </a>
            )}
          </div>
        </header>

        {/* Executive Quick-Jump Sticky Navigation */}
        {navItems.length > 0 && (
          <nav className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 px-4 sm:px-8 py-2.5 flex items-center justify-between gap-3 shadow-subtle">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 hidden sm:inline">
              Sections
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar text-xs">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="px-2.5 py-1 text-slate-700 hover:text-indigo-700 hover:bg-slate-200/70 rounded font-semibold transition-colors whitespace-nowrap text-[11px]"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>
        )}

        {/* Two-Column Split Layout on Desktop */}
        <div className="p-5 sm:p-8 lg:p-10 flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Left Column (35% on Desktop): Profile, Competencies, Certifications, QR */}
          <aside className="w-full lg:w-[35%] space-y-8 order-2 lg:order-1">
            {/* Executive Profile */}
            {p.summary && (
              <section id="profile" className="scroll-mt-16">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-200 pb-2 mb-3">
                  Executive Profile
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
                  {p.summary}
                </p>
              </section>
            )}

            {/* Core Competencies */}
            {((p.skills && p.skills.length > 0) || (p.softSkills && p.softSkills.length > 0)) && (
              <section id="competencies" className="scroll-mt-16">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-200 pb-2 mb-3">
                  <Award className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Core Competencies</span>
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {p.skills &&
                    p.skills.flatMap((g) => g.items).map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-800 font-medium rounded text-[11px]"
                      >
                        {skill}
                      </span>
                    ))}
                  {p.softSkills &&
                    p.softSkills.map((skill, sIdx) => (
                      <span
                        key={`soft-${sIdx}`}
                        className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 font-medium rounded text-[11px]"
                      >
                        {skill}
                      </span>
                    ))}
                </div>
              </section>
            )}

            {/* Professional Certifications */}
            {p.certifications && p.certifications.length > 0 && (
              <section id="credentials" className="scroll-mt-16">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-200 pb-2 mb-3">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Licenses &amp; Certifications</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  {p.certifications.map((cert, idx) => (
                    <div key={idx} className="pb-2 border-b border-slate-100 last:border-0">
                      <div className="font-bold text-slate-900 flex items-center justify-between">
                        <span>{cert.name}</span>
                        {cert.credentialUrl && (
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        {cert.issuer} {cert.issueDate && `• ${cert.issueDate}`}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Honors & Key Achievements */}
            {p.achievements && p.achievements.length > 0 && (
              <section className="scroll-mt-16">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-200 pb-2 mb-3">
                  <Award className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Honors &amp; Recognitions</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
                  {p.achievements.map((ach, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-700 font-bold">•</span>
                      <span>{ach}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Digital Verification QR */}
            {qrCodeUrl && (
              <section className="pt-4 border-t border-slate-200">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 block">
                      Digital Verification
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Scan to verify authentic credentials
                    </p>
                  </div>
                  <img
                    src={qrCodeUrl}
                    alt="QR"
                    className="w-16 h-16 p-1 bg-white border border-slate-300 rounded shrink-0"
                  />
                </div>
              </section>
            )}
          </aside>

          {/* Right Main Column (65% on Desktop): Leadership History & Strategic Initiatives */}
          <main className="w-full lg:w-[65%] space-y-10 order-1 lg:order-2">
            {/* Leadership & Experience */}
            {p.experience && p.experience.length > 0 && (
              <section id="leadership" className="scroll-mt-16">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-200 pb-2 mb-6">
                  <Briefcase className="w-4 h-4 text-indigo-700" />
                  <span>Executive Leadership History</span>
                </div>
                <div className="space-y-8">
                  {p.experience.map((exp, idx) => (
                    <div key={idx} className="relative pl-4 border-l-2 border-indigo-700">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                        <h3 className="text-base font-bold text-slate-900">
                          {exp.role}
                        </h3>
                        <span className="text-xs font-semibold text-slate-500 font-mono">
                          {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-indigo-900 mb-2">
                        {exp.company} {exp.location && `| ${exp.location}`}
                      </div>
                      {exp.description && (
                        <p className="text-xs sm:text-sm text-slate-600 mb-2 leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                      {exp.highlights && exp.highlights.length > 0 && (
                        <ul className="list-disc list-outside ml-4 text-xs sm:text-sm text-slate-700 space-y-1.5">
                          {exp.highlights.map((h, hIdx) => (
                            <li key={hIdx} className="leading-relaxed">
                              {h}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Strategic Initiatives & Projects */}
            {p.projects && p.projects.length > 0 && (
              <section id="initiatives" className="scroll-mt-16">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-200 pb-2 mb-6">
                  <FolderGit2 className="w-4 h-4 text-indigo-700" />
                  <span>Strategic Initiatives &amp; Projects</span>
                </div>
                <div className="space-y-4">
                  {p.projects.map((proj, idx) => {
                    const uniqueHighlights = (proj.highlights || []).filter(
                      (hl) => hl && hl.trim().toLowerCase() !== (proj.description || '').trim().toLowerCase()
                    );

                    return (
                      <div
                        key={idx}
                        className="p-5 sm:p-6 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm sm:text-base">{proj.title}</h4>
                            {proj.dates && (
                              <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
                                {proj.dates}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs shrink-0">
                            {proj.liveUrl && (
                              <a
                                href={proj.liveUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-indigo-700 hover:underline flex items-center gap-1"
                              >
                                <span>Demo</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                            {proj.repoUrl && (
                              <a
                                href={proj.repoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1"
                              >
                                <span>Code</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                        {proj.description && (
                          <p className="text-xs sm:text-sm text-slate-600 mb-2.5 leading-relaxed">
                            {proj.description}
                          </p>
                        )}
                        {uniqueHighlights.length > 0 && (
                          <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 mb-3">
                            {uniqueHighlights.slice(0, 3).map((hl, hlIdx) => (
                              <li key={hlIdx} className="leading-relaxed">
                                {hl}
                              </li>
                            ))}
                          </ul>
                        )}
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-200/60">
                            {proj.technologies.map((t, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Academic Background */}
            {p.education && p.education.length > 0 && (
              <section id="education" className="scroll-mt-16">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-200 pb-2 mb-4">
                  <GraduationCap className="w-4 h-4 text-indigo-700" />
                  <span>Higher Education &amp; Degrees</span>
                </div>
                <div className="space-y-3">
                  {p.education.map((edu, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row justify-between sm:items-baseline text-xs pb-3 border-b border-slate-100 last:border-0 gap-1"
                    >
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{edu.degree}</span>{' '}
                        {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                        <div className="text-slate-600 mt-0.5">
                          {edu.institution} {edu.gpa && `• GPA: ${edu.gpa}`}
                        </div>
                      </div>
                      <span className="font-semibold text-slate-500 font-mono text-[11px]">
                        {edu.graduationDate}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
