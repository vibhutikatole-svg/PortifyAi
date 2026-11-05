import React from 'react';
import { ExternalLink, Mail, MapPin, Phone, Globe, Github, Linkedin, Twitter, ArrowUpRight } from 'lucide-react';

export default function MinimalProTheme({ portfolio, qrCodeUrl }) {
  const p = portfolio || {};
  const info = p.personalInfo || {};

  // Check which sections have content for navigation
  const navItems = [
    { label: 'About', href: '#about', show: Boolean(p.summary) },
    { label: 'Experience', href: '#experience', show: Boolean(p.experience && p.experience.length > 0) },
    { label: 'Projects', href: '#projects', show: Boolean(p.projects && p.projects.length > 0) },
    { label: 'Skills', href: '#skills', show: Boolean((p.skills && p.skills.length > 0) || (p.softSkills && p.softSkills.length > 0)) },
    { label: 'Education', href: '#education', show: Boolean(p.education && p.education.length > 0) },
    { label: 'Credentials', href: '#credentials', show: Boolean(p.certifications && p.certifications.length > 0) },
    { label: 'Honors', href: '#honors', show: Boolean(p.achievements && p.achievements.length > 0) },
    { label: 'Contact', href: '#contact', show: Boolean(info.email || info.phone || qrCodeUrl) },
  ].filter((item) => item.show);

  // Initials for editorial monogram
  const initials = (info.fullName || 'P')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="bg-[#FAFAFA] text-slate-900 min-h-screen font-sans selection:bg-slate-200 selection:text-slate-900 scroll-smooth">
      {/* Sticky Editorial Navigation Bar */}
      <nav className="sticky top-0 z-30 bg-[#FAFAFA]/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-6xl xl:max-w-7xl mx-auto flex items-center justify-between gap-4">
          <a href="#about" className="flex items-center gap-2 group">
            <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-serif text-xs font-semibold tracking-wider group-hover:bg-indigo-600 transition-colors">
              {initials}
            </span>
            <span className="font-serif font-bold text-sm tracking-tight text-slate-900 hidden sm:inline">
              {info.fullName || 'Portfolio'}
            </span>
          </a>

          {navItems.length > 0 && (
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 no-scrollbar text-xs">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 font-medium transition-colors whitespace-nowrap"
                >
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-6xl xl:max-w-7xl mx-auto px-5 sm:px-10 py-12 sm:py-20">
        {/* Header Section */}
        <header id="about" className="border-b border-slate-200/80 pb-12 mb-14 scroll-mt-20">
          <div className="flex flex-col-reverse md:flex-row md:items-start justify-between gap-6 sm:gap-8">
            <div className="space-y-4 flex-1">
              <div className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-mono rounded tracking-wider uppercase">
                Curriculum Vitae
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-slate-900 leading-tight">
                {info.fullName || 'Your Name'}
              </h1>
              <p className="text-lg sm:text-2xl text-slate-600 font-light font-serif">
                {info.headline || 'Professional Headline'}
              </p>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs sm:text-sm text-slate-500 pt-2">
                {info.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{info.location}</span>
                  </span>
                )}
                {info.email && (
                  <a
                    href={`mailto:${info.email}`}
                    className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{info.email}</span>
                  </a>
                )}
                {info.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{info.phone}</span>
                  </span>
                )}
              </div>
            </div>

            {info.avatarUrl && (
              <img
                src={info.avatarUrl}
                alt={info.fullName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-slate-200 shadow-subtle shrink-0"
              />
            )}
          </div>

          {/* Social Links */}
          {(info.website || info.github || info.linkedin || info.twitter) && (
            <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-slate-200/60 text-xs sm:text-sm">
              {info.website && (
                <a
                  href={info.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium hover:text-indigo-600 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" /> Website <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
              {info.github && (
                <a
                  href={info.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium hover:text-indigo-600 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" /> GitHub <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
              {info.linkedin && (
                <a
                  href={info.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium hover:text-indigo-600 transition-colors"
                >
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
              {info.twitter && (
                <a
                  href={info.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium hover:text-indigo-600 transition-colors"
                >
                  <Twitter className="w-3.5 h-3.5" /> Twitter <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
            </div>
          )}
        </header>

        {/* Professional Summary */}
        {p.summary && (
          <section className="mb-14 scroll-mt-20">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 font-mono">
              Profile &amp; Perspective
            </h2>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-serif">
              {p.summary}
            </p>
          </section>
        )}

        {/* Work Experience */}
        {p.experience && p.experience.length > 0 && (
          <section id="experience" className="mb-14 scroll-mt-20">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6 font-mono">
              Experience History
            </h2>
            <div className="space-y-8 sm:space-y-10">
              {p.experience.map((exp, idx) => (
                <div key={idx} className="border-l-2 border-slate-200 pl-5 relative">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                    <h3 className="text-base font-semibold text-slate-900 font-serif">
                      {exp.role}
                    </h3>
                    <span className="text-xs text-slate-500 font-mono">
                      {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-600 mb-2">
                    {exp.company} {exp.location && `• ${exp.location}`}
                  </p>
                  {exp.description && (
                    <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 space-y-1.5">
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

        {/* Key Projects */}
        {p.projects && p.projects.length > 0 && (
          <section id="projects" className="mb-14 scroll-mt-20">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6 font-mono">
              Selected Works &amp; Projects
            </h2>
            <div
              className={
                p.projects.length === 1
                  ? 'grid grid-cols-1'
                  : p.projects.length === 2
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
                  : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6'
              }
            >
              {p.projects.map((proj, idx) => {
                const uniqueHighlights = (proj.highlights || []).filter(
                  (hl) => hl && hl.trim().toLowerCase() !== (proj.description || '').trim().toLowerCase()
                );
                const isSingle = p.projects.length === 1;

                return (
                  <div
                    key={idx}
                    className={`border border-slate-200 rounded-xl hover:border-slate-400 transition-colors bg-white flex flex-col justify-between shadow-subtle ${
                      isSingle ? 'p-6 sm:p-8' : 'p-5 sm:p-6'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <h3 className={`font-serif font-bold text-slate-900 ${isSingle ? 'text-lg sm:text-xl' : 'text-base'}`}>
                            {proj.title}
                          </h3>
                          {proj.dates && (
                            <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                              {proj.dates}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs shrink-0">
                          {proj.liveUrl && (
                            <a
                              href={proj.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-medium text-slate-900 hover:text-indigo-600 hover:underline"
                            >
                              Live <ArrowUpRight className="w-3 h-3" />
                            </a>
                          )}
                          {proj.repoUrl && (
                            <a
                              href={proj.repoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 hover:underline"
                            >
                              Code <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                      {proj.description && (
                        <p className={`text-slate-600 mb-3 leading-relaxed ${isSingle ? 'text-sm sm:text-base max-w-3xl' : 'text-xs sm:text-sm'}`}>
                          {proj.description}
                        </p>
                      )}
                      {uniqueHighlights.length > 0 && (
                        <ul className="list-disc list-inside text-xs sm:text-sm text-slate-500 space-y-1 mb-4">
                          {uniqueHighlights.slice(0, 4).map((hl, hlIdx) => (
                            <li key={hlIdx} className="leading-relaxed">
                              {hl}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
                        {proj.technologies.map((t, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded"
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

        {/* Skills & Expertise */}
        {((p.skills && p.skills.length > 0) || (p.softSkills && p.softSkills.length > 0)) && (
          <section id="skills" className="mb-14 scroll-mt-20">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-5 font-mono">
              Skills &amp; Capabilities
            </h2>
            <div className="space-y-4">
              {p.skills &&
                p.skills.map((group, idx) => (
                  <div key={idx}>
                    <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                      {group.category}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-xs font-mono bg-white text-slate-800 px-3 py-1 rounded border border-slate-200 shadow-subtle"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

              {p.softSkills && p.softSkills.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                    Professional &amp; Interpersonal Proficiencies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {p.softSkills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-xs font-mono bg-indigo-50/70 text-indigo-700 px-3 py-1 rounded border border-indigo-100 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Education */}
        {p.education && p.education.length > 0 && (
          <section id="education" className="mb-14 scroll-mt-20">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6 font-mono">
              Academic Background
            </h2>
            <div className="space-y-4">
              {p.education.map((edu, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-slate-200/60 pb-3 gap-1"
                >
                  <div>
                    <h3 className="font-serif font-bold text-slate-900 text-sm">
                      {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600">
                      {edu.institution} {edu.gpa && `• GPA: ${edu.gpa}`}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    {edu.graduationDate}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {p.certifications && p.certifications.length > 0 && (
          <section id="credentials" className="mb-14 scroll-mt-20">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6 font-mono">
              Certifications &amp; Credentials
            </h2>
            <div className="space-y-4">
              {p.certifications.map((cert, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-slate-200/60 pb-3 gap-1"
                >
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
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
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">{cert.issuer}</p>
                  </div>
                  {cert.issueDate && (
                    <span className="text-xs text-slate-500 font-mono">{cert.issueDate}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements */}
        {p.achievements && p.achievements.length > 0 && (
          <section id="honors" className="mb-14 scroll-mt-20">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6 font-mono">
              Key Honors &amp; Recognitions
            </h2>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
              {p.achievements.map((ach, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-slate-900 font-bold mt-0.5">—</span>
                  <span>{ach}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Contact / QR Code Footer */}
        <footer id="contact" className="border-t border-slate-200 pt-8 mt-12 scroll-mt-20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-subtle">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                Direct Contact &amp; Mobile Link
              </span>
              <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900">
                Get in Touch with {info.fullName || 'Candidate'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md">
                Scan with your phone to instantly access or save this portfolio.
              </p>
              {info.email && (
                <a
                  href={`mailto:${info.email}`}
                  className="inline-block text-xs font-medium text-indigo-600 hover:underline pt-2 font-mono"
                >
                  {info.email}
                </a>
              )}
            </div>

            {qrCodeUrl && (
              <img
                src={qrCodeUrl}
                alt="Portfolio QR Code"
                className="w-24 h-24 bg-white p-1 rounded-xl border border-slate-200 shadow-subtle shrink-0"
              />
            )}
          </div>
        </footer>
      </main>
    </div>
  );
}
