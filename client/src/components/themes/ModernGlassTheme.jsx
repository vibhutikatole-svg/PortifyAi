import React from 'react';
import {
  ExternalLink,
  Mail,
  MapPin,
  Globe,
  Github,
  Linkedin,
  Twitter,
  ArrowUpRight,
  Layers,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Award,
} from 'lucide-react';

export default function ModernGlassTheme({ portfolio, qrCodeUrl }) {
  const p = portfolio || {};
  const info = p.personalInfo || {};

  // Check which sections have content for navigation
  const navItems = [
    { label: 'About', href: '#about', show: Boolean(p.summary || info.fullName) },
    { label: 'Experience', href: '#experience', show: Boolean(p.experience && p.experience.length > 0) },
    { label: 'Projects', href: '#projects', show: Boolean(p.projects && p.projects.length > 0) },
    { label: 'Stack', href: '#stack', show: Boolean((p.skills && p.skills.length > 0) || (p.softSkills && p.softSkills.length > 0)) },
    { label: 'Education', href: '#education', show: Boolean(p.education && p.education.length > 0) },
    { label: 'Credentials', href: '#credentials', show: Boolean(p.certifications && p.certifications.length > 0) },
    { label: 'Connect', href: '#connect', show: Boolean(info.email || qrCodeUrl) },
  ].filter((item) => item.show);

  return (
    <div className="bg-[#030712] text-slate-100 min-h-screen py-6 sm:py-12 px-3 sm:px-8 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden scroll-smooth">
      {/* Subtle ambient lighting gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Translucent Glass Navigation Bar */}
      <nav className="sticky top-4 z-30 max-w-5xl xl:max-w-6xl mx-auto px-4 mb-8">
        <div className="bg-slate-950/70 backdrop-blur-2xl border border-white/[0.1] shadow-2xl rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <a href="#about" className="flex items-center gap-2 group">
            <span className="w-6 h-6 rounded-full bg-white/[0.08] border border-white/[0.15] flex items-center justify-center text-indigo-300 text-xs font-bold">
              ✦
            </span>
            <span className="font-bold text-xs tracking-tight text-white hidden sm:inline">
              {info.fullName || 'Glass Portfolio'}
            </span>
          </a>

          {navItems.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar text-xs">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-white/[0.08] rounded-full transition-colors whitespace-nowrap text-[11px] sm:text-xs"
                >
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-6xl xl:max-w-7xl mx-auto relative z-10 space-y-10">
        {/* Glass Hero Header */}
        <header
          id="about"
          className="p-6 sm:p-12 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-glass scroll-mt-24"
        >
          <div className="flex flex-col-reverse sm:flex-row justify-between items-start gap-6">
            <div className="flex-1 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-mono text-indigo-300 mb-2">
                <Layers className="w-3 h-3 text-indigo-400" />
                <span>modern-glass</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
                {info.fullName || 'Digital Architect'}
              </h1>
              <p className="text-lg sm:text-2xl text-indigo-200/90 font-medium">
                {info.headline || 'Full Stack Engineer & Designer'}
              </p>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-400 pt-2">
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
              </div>

              {p.summary && (
                <p className="pt-3 text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl font-light">
                  {p.summary}
                </p>
              )}
            </div>

            {info.avatarUrl && (
              <img
                src={info.avatarUrl}
                alt={info.fullName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-white/[0.15] shadow-lg shrink-0"
              />
            )}
          </div>

          {/* Social Links */}
          {(info.website || info.github || info.linkedin || info.twitter) && (
            <div className="flex flex-wrap gap-2.5 mt-6 pt-6 border-t border-white/[0.06] text-xs">
              {info.website && (
                <a
                  href={info.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-slate-200 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Website</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </a>
              )}
              {info.github && (
                <a
                  href={info.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-slate-200 transition-colors"
                >
                  <Github className="w-3.5 h-3.5 text-slate-300" />
                  <span>GitHub</span>
                </a>
              )}
              {info.linkedin && (
                <a
                  href={info.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-slate-200 transition-colors"
                >
                  <Linkedin className="w-3.5 h-3.5 text-blue-400" />
                  <span>LinkedIn</span>
                </a>
              )}
              {info.twitter && (
                <a
                  href={info.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-slate-200 transition-colors"
                >
                  <Twitter className="w-3.5 h-3.5 text-sky-400" />
                  <span>Twitter</span>
                </a>
              )}
            </div>
          )}
        </header>

        {/* Glass Experience Section */}
        {p.experience && p.experience.length > 0 && (
          <section id="experience" className="scroll-mt-24">
            <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-4 px-1 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              <span>Experience</span>
            </h2>
            <div className="space-y-4">
              {p.experience.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-5 sm:p-7 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl hover:border-white/[0.15] transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                    <h3 className="text-sm sm:text-base font-semibold text-white">
                      {exp.role} <span className="text-indigo-400 font-normal">@ {exp.company}</span>
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  {exp.location && (
                    <div className="text-xs text-slate-400 mb-2">{exp.location}</div>
                  )}
                  {exp.description && (
                    <p className="text-xs sm:text-sm text-slate-300 mb-2 leading-relaxed font-light">
                      {exp.description}
                    </p>
                  )}
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-inside text-xs sm:text-sm text-slate-300 space-y-1.5 mt-3 font-light">
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

        {/* Glass Projects Grid */}
        {p.projects && p.projects.length > 0 && (
          <section id="projects" className="scroll-mt-24">
            <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-4 px-1 flex items-center gap-1.5">
              <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Featured Projects</span>
            </h2>
            <div
              className={
                p.projects.length === 1
                  ? 'grid grid-cols-1'
                  : p.projects.length === 2
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
                  : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
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
                    className={`rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between ${
                      isSingle ? 'p-6 sm:p-8' : 'p-5 sm:p-6'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className={`font-bold text-white ${isSingle ? 'text-base sm:text-lg' : 'text-sm'}`}>{proj.title}</h4>
                          {proj.dates && (
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
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
                              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                            >
                              <span>Demo</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </a>
                          )}
                          {proj.repoUrl && (
                            <a
                              href={proj.repoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-400 hover:text-white flex items-center gap-1"
                            >
                              <span>Code</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                      {proj.description && (
                        <p className={`text-slate-300 mb-3 leading-relaxed font-light ${isSingle ? 'text-sm sm:text-base max-w-3xl' : 'text-xs sm:text-sm'}`}>
                          {proj.description}
                        </p>
                      )}
                      {uniqueHighlights.length > 0 && (
                        <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 mb-3 font-light">
                          {uniqueHighlights.slice(0, 4).map((hl, hlIdx) => (
                            <li key={hlIdx} className="leading-relaxed">
                              {hl}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/[0.06]">
                        {proj.technologies.map((t, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/[0.04] text-indigo-300 border border-white/[0.08]"
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

        {/* Glass Skills */}
        {((p.skills && p.skills.length > 0) || (p.softSkills && p.softSkills.length > 0)) && (
          <section id="stack" className="scroll-mt-24">
            <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-4 px-1">
              Capabilities &amp; Stack
            </h2>
            <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl space-y-4">
              {p.skills && p.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {p.skills.flatMap((g) => g.items).map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-slate-200 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
              {p.softSkills && p.softSkills.length > 0 && (
                <div className="pt-2 border-t border-white/[0.06]">
                  <div className="text-[11px] font-mono text-indigo-300 uppercase tracking-wider mb-2">
                    Core Competencies
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.softSkills.map((skill, sIdx) => (
                      <span
                        key={`soft-${sIdx}`}
                        className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-400/20 text-xs text-indigo-200 font-medium"
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
          <section id="education" className="scroll-mt-24">
            <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-4 px-1 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Education</span>
            </h2>
            <div className="space-y-3">
              {p.education.map((edu, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl flex flex-col sm:flex-row justify-between sm:items-baseline text-xs gap-1"
                >
                  <div>
                    <h4 className="font-semibold text-white">
                      {edu.degree} in {edu.fieldOfStudy}
                    </h4>
                    <p className="text-slate-400 mt-0.5">
                      {edu.institution} {edu.gpa && `• GPA: ${edu.gpa}`}
                    </p>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {edu.graduationDate}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {p.certifications && p.certifications.length > 0 && (
          <section id="credentials" className="scroll-mt-24">
            <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-4 px-1 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span>Certifications &amp; Licenses</span>
            </h2>
            <div className="space-y-3">
              {p.certifications.map((cert, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl flex justify-between items-baseline text-xs"
                >
                  <div>
                    <h4 className="font-semibold text-white flex items-center gap-2">
                      <span>{cert.name}</span>
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-400 hover:text-indigo-300"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </h4>
                    <p className="text-slate-400 mt-0.5">{cert.issuer}</p>
                  </div>
                  {cert.issueDate && (
                    <span className="text-slate-400 font-mono text-[11px]">{cert.issueDate}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Key Achievements */}
        {p.achievements && p.achievements.length > 0 && (
          <section className="scroll-mt-24">
            <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-4 px-1">
              Key Achievements
            </h2>
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl space-y-2.5 text-xs text-slate-300">
              {p.achievements.map((ach, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="text-indigo-400 font-bold mt-0.5">✦</span>
                  <span className="leading-relaxed">{ach}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* QR Code / Connect */}
        <footer
          id="connect"
          className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 scroll-mt-24"
        >
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-xs text-indigo-400 uppercase tracking-wider font-semibold">
              Live Mobile Connection
            </h4>
            <p className="text-xs text-slate-400">
              Scan to preview or connect with {info.fullName || 'Architect'}
            </p>
            {info.email && (
              <a
                href={`mailto:${info.email}`}
                className="text-xs text-indigo-300 hover:underline block pt-1"
              >
                {info.email}
              </a>
            )}
          </div>
          {qrCodeUrl && (
            <img
              src={qrCodeUrl}
              alt="QR"
              className="w-20 h-20 bg-white p-1 rounded-xl shrink-0"
            />
          )}
        </footer>
      </main>
    </div>
  );
}
