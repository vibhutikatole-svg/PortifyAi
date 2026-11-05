import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { portfolioService } from '../../services/portfolioService';
import { Sparkles, RefreshCw, Check, ArrowRight, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AIGenerationModal({
  isOpen,
  onClose,
  portfolio,
  onApplyEnhancements,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [diff, setDiff] = useState(null);
  const [enhancedData, setEnhancedData] = useState(null);
  const [sourceInfo, setSourceInfo] = useState('');

  // Selected sections to accept
  const [selectedSections, setSelectedSections] = useState({
    headline: true,
    summary: true,
    experience: true,
    projects: true,
    achievements: true,
  });

  const generateEnhancements = async () => {
    if (!portfolio?._id) return;
    setLoading(true);
    setError('');

    try {
      const res = await portfolioService.generatePortfolio(portfolio._id, {
        reviewedData: portfolio,
        applyImmediately: false,
      });

      setEnhancedData(res.enhancedData);
      setDiff(res.diff);
      setSourceInfo(
        res.source === 'ai_gemini'
          ? 'Enhanced using Google Gemini AI'
          : 'Enhanced using Portify Presentation Engine'
      );
    } catch (err) {
      setError(err.message || 'Failed to generate enhancements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && portfolio) {
      generateEnhancements();
    }
  }, [isOpen, portfolio?._id]);

  const toggleSection = (sectionKey) => {
    setSelectedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const handleApply = () => {
    if (!enhancedData) return;

    // Build the updated portfolio object by merging only the checked sections,
    // thereby strictly preserving all manual edits in unchecked sections!
    const updated = {
      ...portfolio,
      personalInfo: {
        ...portfolio.personalInfo,
        headline: selectedSections.headline
          ? enhancedData.personalInfo?.headline || portfolio.personalInfo?.headline
          : portfolio.personalInfo?.headline,
      },
      summary: selectedSections.summary
        ? enhancedData.summary || portfolio.summary
        : portfolio.summary,
      experience: selectedSections.experience
        ? enhancedData.experience || portfolio.experience
        : portfolio.experience,
      projects: selectedSections.projects
        ? enhancedData.projects || portfolio.projects
        : portfolio.projects,
      achievements: selectedSections.achievements
        ? enhancedData.achievements || portfolio.achievements
        : portfolio.achievements,
    };

    onApplyEnhancements(updated);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Portfolio Content Enhancer & Generator"
      size="xl"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-subtle">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Professional Polish &amp; Presentation Engine
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Elevates grammar, punchy action verbs, and impact while strictly preserving your factual resume truth.
              </p>
            </div>
          </div>
          {sourceInfo && (
            <Badge variant="indigo" size="sm" className="whitespace-nowrap shrink-0">
              <ShieldCheck className="w-3 h-3 mr-1 inline" />
              {sourceInfo}
            </Badge>
          )}
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-7 h-7 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">
              Analyzing reviewed content and generating grounded improvements...
            </p>
          </div>
        ) : diff ? (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {/* 1. Hero Headline Diff */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedSections.headline}
                    onChange={() => toggleSection('headline')}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Hero Headline
                  </span>
                </label>
                {diff.headline.isDifferent ? (
                  <Badge variant="amber" size="sm">
                    Improved
                  </Badge>
                ) : (
                  <Badge variant="slate" size="sm">
                    Unchanged
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div className="text-[11px] font-semibold text-slate-500 mb-1">Current:</div>
                  <div className="text-slate-700">{diff.headline.current || 'None'}</div>
                </div>
                <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100">
                  <div className="text-[11px] font-semibold text-indigo-700 mb-1">AI Polish:</div>
                  <div className="text-indigo-950 font-medium">{diff.headline.enhanced}</div>
                </div>
              </div>
            </div>

            {/* 2. Professional Summary Diff */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedSections.summary}
                    onChange={() => toggleSection('summary')}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    About / Professional Summary
                  </span>
                </label>
                {diff.summary.isDifferent ? (
                  <Badge variant="amber" size="sm">
                    Improved
                  </Badge>
                ) : (
                  <Badge variant="slate" size="sm">
                    Unchanged
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div className="text-[11px] font-semibold text-slate-500 mb-1">Current:</div>
                  <p className="text-slate-700 leading-relaxed">{diff.summary.current || 'None'}</p>
                </div>
                <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100">
                  <div className="text-[11px] font-semibold text-indigo-700 mb-1">AI Polish:</div>
                  <p className="text-indigo-950 font-medium leading-relaxed">
                    {diff.summary.enhanced}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Experience Highlights Diff */}
            {diff.experience && diff.experience.length > 0 && (
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedSections.experience}
                      onChange={() => toggleSection('experience')}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Work Experience Highlights ({diff.experience.length} Roles)
                    </span>
                  </label>
                  <Badge variant="indigo" size="sm">
                    Action Verbs Polish
                  </Badge>
                </div>
                <div className="space-y-3">
                  {diff.experience.map((exp, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
                      <div className="font-bold text-slate-900 mb-2">
                        {exp.role} @ {exp.company}
                      </div>
                      <div className="space-y-1.5">
                        {exp.enhancedHighlights &&
                          exp.enhancedHighlights.map((h, hIdx) => (
                            <div key={hIdx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                              <span className="text-slate-800 leading-relaxed">{h}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Projects Diff */}
            {diff.projects && diff.projects.length > 0 && (
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedSections.projects}
                      onChange={() => toggleSection('projects')}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Projects ({diff.projects.length} Works)
                    </span>
                  </label>
                  <Badge variant="indigo" size="sm">
                    Problem-Solution Flow
                  </Badge>
                </div>
                <div className="space-y-2">
                  {diff.projects.map((proj, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
                      <div className="font-bold text-slate-900 mb-1">{proj.title}</div>
                      <p className="text-slate-700 leading-relaxed">{proj.enhancedDescription}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Modal Action Footer */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={generateEnhancements}
            loading={loading}
            icon={RefreshCw}
            className="text-xs"
          >
            Regenerate Suggestions
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel &amp; Keep Current
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApply}
              disabled={loading || !enhancedData}
              icon={Check}
              className="text-xs"
            >
              Apply Selected Improvements
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

