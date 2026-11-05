import React from 'react';
import {
  Terminal,
  GitBranch,
  ExternalLink,
  Mail,
  MapPin,
  Globe,
  Github,
  Linkedin,
  Twitter,
  Code2,
  FolderGit2,
  CheckCircle2,
  Award,
} from 'lucide-react';

export default function DarkDeveloperTheme({ portfolio, qrCodeUrl }) {
  const p = portfolio || {};
  const info = p.personalInfo || {};

  // Check which sections have content for navigation
  const navTabs = [
    { label: '~/about', href: '#about', show: Boolean(p.summary) },
    { label: '~/experience', href: '#experience', show: Boolean(p.experience && p.experience.length > 0) },
    { label: '~/projects', href: '#projects', show: Boolean(p.projects && p.projects.length > 0) },
    { label: '~/stack', href: '#stack', show: Boolean((p.skills && p.skills.length > 0) || (p.softSkills && p.softSkills.length > 0)) },
    { label: '~/education', href: '#education', show: Boolean(p.education && p.education.length > 0) },
    { label: '~/credentials', href: '#credentials', show: Boolean(p.certifications && p.certifications.length > 0) },
    { label: '~/honors', href: '#honors', show: Boolean(p.achievements && p.achievements.length > 0) },
    { label: '~/contact', href: '#contact', show: Boolean(info.email || qrCodeUrl) },
  ].filter((item) => item.show);

  // Generate deterministic mock commit hashes for aesthetic git log
  const getCommitHash = (index) => {
    const hashes = ['7f2a1b9', '3e8c04d', 'a1b2c3d', 'e5f6a7b', '90c8d1e'];
    return hashes[index % hashes.length];
  };

  return (
    <div className="bg-[#090D16] text-slate-100 min-h-screen font-mono selection:bg-emerald-500/20 selection:text-emerald-300 scroll-smooth">
      {/* Sticky Terminal Header Bar */}
      <nav className="sticky top-0 z-30 bg-[#090D16]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3 transition-all">
        <div className="max-w-6xl xl:max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-hidden">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="text-xs text-slate-400 font-bold ml-1 hidden sm:inline">
              developer.config.ts
            </span>
          </div>

          {navTabs.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar text-xs">
              {navTabs.map((tab) => (
                <a
                  key={tab.href}
                  href={tab.href}
                  className="px-2 py-0.5 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800/70 transition-colors whitespace-nowrap text-[11px]"
                >
                  <span className="text-slate-600 mr-1">$</span>
                  {tab.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        {/* Terminal Window Header */}
        <header
          id="about"
          className="border border-slate-800 rounded-2xl bg-slate-900/70 p-5 sm:p-8 mb-12 shadow-2xl backdrop-blur relative overflow-hidden scroll-mt-20"
        >
          {/* Top subtle glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Terminal File Path */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800/80 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300">portfolio.ts</span>
              <span className="text-slate-600 hidden sm:inline">— git:(main) [clean]</span>
            </div>
            <span className="text-slate-500 text-[11px]">Node v24.21.0</span>
          </div>

          <div className="flex flex-col-reverse md:flex-row justify-between items-start gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <span className="text-slate-500">export const</span>
                <span className="text-indigo-400">engineer</span>
                <span className="text-slate-400">=</span>
                <span className="text-amber-300">&#123;</span>
              </div>

              <div className="pl-3 sm:pl-4 space-y-2 border-l border-slate-800">
                <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
                  {info.fullName || 'Software Engineer'}
                </h1>
                <p className="text-sm sm:text-lg text-emerald-400">
                  // {info.headline || 'Full Stack Engineer'}
                </p>

                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-400 pt-1">
                  {info.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{info.location}</span>
                    </span>
                  )}
                  {info.email && (
                    <a
                      href={`mailto:${info.email}`}
                      className="inline-flex items-center gap-1.5 hover:text-emerald-300 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{info.email}</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="text-xs text-amber-300">&#125;;</div>
            </div>

            {info.avatarUrl && (
              <img
                src={info.avatarUrl}
                alt={info.fullName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-slate-700 shadow-lg shrink-0"
              />
            )}
          </div>

          {/* Terminal Command Actions / External Links */}
          <div className="flex flex-wrap gap-2 pt-6 mt-6 border-t border-slate-800/80 text-xs">
            {info.github && (
              <a
                href={info.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
              >
                <Github className="w-3.5 h-3.5 text-slate-300" />
                <span>github()</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            )}
            {info.linkedin && (
              <a
                href={info.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5 text-slate-300" />
                <span>linkedin()</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            )}
            {info.website && (
              <a
                href={info.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-slate-300" />
                <span>website()</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            )}
            {info.twitter && (
              <a
                href={info.twitter}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
              >
                <Twitter className="w-3.5 h-3.5 text-slate-300" />
                <span>twitter()</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            )}
          </div>
        </header>

        {/* Readme Section */}
        {p.summary && (
          <section className="mb-12 scroll-mt-20">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>// README.md</span>
            </div>
            <div className="p-4 sm:p-6 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-300 leading-relaxed text-xs sm:text-sm">
              <p className="font-sans text-slate-300 leading-relaxed">{p.summary}</p>
            </div>
          </section>
        )}

        {/* Git Log / Experience Timeline */}
        {p.experience && p.experience.length > 0 && (
          <section id="experience" className="mb-12 scroll-mt-20">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
              <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
              <span>// git log --graph --career</span>
            </div>
            <div className="relative border-l border-slate-800 ml-2 sm:ml-4 pl-4 sm:pl-6 space-y-8">
              {p.experience.map((exp, idx) => (
                <div key={idx} className="relative group">
                  {/* Git branch node circle */}
                  <span className="absolute -left-[21px] sm:-left-[29px] top-1.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 border-2 border-[#090D16] group-hover:scale-125 transition-transform" />

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
                    <h3 className="text-sm sm:text-base font-semibold text-white">
                      {exp.role} <span className="text-emerald-400">@ {exp.company}</span>
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="text-indigo-400">{getCommitHash(idx)}</span>
                      <span>
                        {exp.startDate} -&gt; {exp.current ? 'HEAD (Present)' : exp.endDate}
                      </span>
                    </div>
                  </div>

                  {exp.location && (
                    <div className="text-[11px] text-slate-500 mb-2">{exp.location}</div>
                  )}

                  {exp.description && (
                    <p className="font-sans text-xs sm:text-sm text-slate-400 mb-3 leading-relaxed">
                      {exp.description}
                    </p>
                  )}

                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
                      {exp.highlights.map((h, hIdx) => (
                        <li key={hIdx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-mono select-none">&gt;</span>
                          <span className="leading-relaxed">{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Repositories / Projects */}
        {p.projects && p.projects.length > 0 && (
          <section id="projects" className="mb-12 scroll-mt-20">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>// featured_repositories</span>
            </div>
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
                    className={`rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 transition-colors flex flex-col justify-between ${
                      isSingle ? 'p-6 sm:p-8' : 'p-5'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <h4 className={`font-bold text-white flex items-center gap-2 ${isSingle ? 'text-base sm:text-lg' : 'text-sm'}`}>
                            <FolderGit2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>{proj.title}</span>
                          </h4>
                          {proj.dates && (
                            <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                              // {proj.dates}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2.5 text-xs shrink-0 font-mono">
                          {proj.liveUrl && (
                            <a
                              href={proj.liveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 hover:underline px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/40"
                            >
                              [live]
                            </a>
                          )}
                          {proj.repoUrl && (
                            <a
                              href={proj.repoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-300 hover:text-white hover:underline px-2 py-0.5 rounded bg-slate-800/60 border border-slate-700/50"
                            >
                              [src]
                            </a>
                          )}
                        </div>
                      </div>
                      {proj.description && (
                        <p className={`font-sans text-slate-300 mb-3 leading-relaxed ${isSingle ? 'text-sm sm:text-base max-w-3xl' : 'text-xs'}`}>
                          {proj.description}
                        </p>
                      )}
                      {uniqueHighlights.length > 0 && (
                        <ul className="space-y-1.5 text-xs text-slate-400 font-sans mb-4">
                          {uniqueHighlights.slice(0, 4).map((hl, hlIdx) => (
                            <li key={hlIdx} className="flex items-start gap-2">
                              <span className="text-emerald-500 font-mono select-none">&gt;</span>
                              <span className="leading-relaxed">{hl}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 text-[11px] pt-3 border-t border-slate-800/80">
                        {proj.technologies.map((t, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded bg-slate-800/80 text-emerald-300/90 border border-slate-700/60 font-mono text-[11px]"
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

        {/* Tech Stack / Skills */}
        {((p.skills && p.skills.length > 0) || (p.softSkills && p.softSkills.length > 0)) && (
          <section id="stack" className="mb-12 scroll-mt-20">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>// dependencies &amp; stack</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {p.skills &&
                p.skills.map((group, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                    <h5 className="text-xs text-slate-400 uppercase tracking-wider mb-3">
                      {group.category}
                    </h5>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      {group.items.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-1 bg-slate-800 text-emerald-300 rounded border border-slate-700/80"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

              {p.softSkills && p.softSkills.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 sm:col-span-2">
                  <h5 className="text-xs text-slate-400 uppercase tracking-wider mb-3">
                    // interpersonal_skills &amp; leadership
                  </h5>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {p.softSkills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2.5 py-1 bg-slate-800/80 text-indigo-300 rounded border border-indigo-900/50"
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
          <section id="education" className="mb-12 scroll-mt-20">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
              <span>// academic_credentials</span>
            </div>
            <div className="space-y-3 text-xs">
              {p.education.map((edu, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col sm:flex-row justify-between gap-2"
                >
                  <div>
                    <span className="text-white font-semibold">{edu.degree}</span> in{' '}
                    <span className="text-emerald-400">{edu.fieldOfStudy}</span>
                    <div className="text-slate-400 mt-1 font-sans">
                      {edu.institution} {edu.gpa && `• GPA: ${edu.gpa}`}
                    </div>
                  </div>
                  <span className="text-slate-500">{edu.graduationDate}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {p.certifications && p.certifications.length > 0 && (
          <section id="credentials" className="mb-12 scroll-mt-20">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>// verified_certifications</span>
            </div>
            <div className="space-y-3 text-xs">
              {p.certifications.map((cert, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col sm:flex-row justify-between gap-2 items-start sm:items-center"
                >
                  <div>
                    <span className="text-white font-semibold flex items-center gap-1.5">
                      {cert.name}
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:text-emerald-300"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </span>
                    <div className="text-slate-400 mt-0.5">{cert.issuer}</div>
                  </div>
                  {cert.issueDate && <span className="text-slate-500">{cert.issueDate}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements */}
        {p.achievements && p.achievements.length > 0 && (
          <section id="honors" className="mb-12 scroll-mt-20">
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
              <span>// honors_and_achievements</span>
            </div>
            <div className="p-4 sm:p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2.5 text-xs text-slate-300">
              {p.achievements.map((ach, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">&gt;</span>
                  <span className="font-sans leading-relaxed">{ach}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* QR Code / Contact Section */}
        <footer
          id="contact"
          className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 scroll-mt-20"
        >
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-xs text-emerald-400 uppercase tracking-wider">
              $ curl -sL identity.sh | bash
            </h4>
            <p className="text-xs text-slate-400">
              Direct connection with {info.fullName || 'Engineer'}
            </p>
            {info.email && (
              <a
                href={`mailto:${info.email}`}
                className="text-xs text-indigo-400 hover:underline block pt-1"
              >
                {info.email}
              </a>
            )}
          </div>
          {qrCodeUrl && (
            <img
              src={qrCodeUrl}
              alt="QR"
              className="w-20 h-20 p-1 bg-white rounded-lg border border-slate-700 shrink-0"
            />
          )}
        </footer>
      </main>
    </div>
  );
}
