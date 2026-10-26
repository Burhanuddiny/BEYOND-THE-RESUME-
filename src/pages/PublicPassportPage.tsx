import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Terminal,
  Database,
  Mail,
  Copy,
  Printer,
  ExternalLink,
  AlertTriangle,
  Award,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import type { PassportSnapshot, PassportTaskEntry } from '../types';
import { getPublicPassport } from '../lib/api.ts';
import { PILLARS, BAND_LABEL } from '../../shared/pillars.ts';

interface PublicPassportPageProps {
  passportId: string;
  onGoHome: () => void;
}

export const PublicPassportPage: React.FC<PublicPassportPageProps> = ({ passportId, onGoHome }) => {
  const [passport, setPassport] = useState<PassportSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getPublicPassport(passportId);
        setPassport(res.passport);
        if (res.passport.tasks.length > 0) {
          setExpandedTask(res.passport.tasks[0].taskId);
        }
      } catch {
        setError('This Skill Passport could not be found or has been revoked by the candidate.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [passportId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="bg-[#FAF0F3] min-h-screen py-16 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#9E3D58] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#7A5060] font-medium">Verifying and loading candidate Skill Passport...</p>
        </div>
      </div>
    );
  }

  if (error || !passport) {
    return (
      <div className="bg-[#FAF0F3] min-h-screen py-16 px-4 flex items-center justify-center">
        <div className="bg-white border border-[#ECCCD5] rounded-2xl p-8 max-w-md text-center space-y-4 shadow-sm">
          <AlertTriangle className="w-10 h-10 text-[#9E3D58] mx-auto" />
          <h2 className="text-xl font-serif font-bold text-[#2D1822]">Skill Passport Not Available</h2>
          <p className="text-xs text-[#7A5060]">{error || 'Unable to retrieve verification records.'}</p>
          <button
            onClick={onGoHome}
            className="bg-[#9E3D58] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#862E45] transition-colors"
          >
            Go to Beyond the Resume
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF0F3] text-[#2D1822] min-h-screen py-6 sm:py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* RECRUITER VERIFICATION HEADER NOTICE */}
        <div className="bg-[#FFFFFF] border-2 border-[#9E3D58] rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0F4] border border-[#ECC2CE] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#9E3D58]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9E3D58]">
                  Verified Candidate Skill Passport
                </span>
                <span className="bg-[#EAF5EA] text-[#2D6A2E] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#C5E3C5] flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  {passport.identityVerified ? 'Google Verified Identity' : 'Candidate Self-Declared'}
                </span>
              </div>
              <p className="text-xs text-[#7A5060]">
                All scores are computed from verifiable workplace simulation submissions and evidence quotes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopyLink}
              className="bg-[#FFF8FA] hover:bg-[#FCE8EE] text-[#8C2E47] border border-[#ECC2CE] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Copied Link!' : 'Share'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-[#9E3D58] hover:bg-[#862E45] text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* CANDIDATE PROFILE OVERVIEW */}
        <div className="bg-[#FFFFFF] border border-[#ECCCD5] rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#F2D7DE]">
            <div>
              <div className="text-xs font-mono text-[#9E3D58] mb-1">
                PASSPORT ID: #{passport.passportId.toUpperCase()}
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2D1822]">
                {passport.displayName}
              </h1>
              <p className="text-sm text-[#5C3B48] mt-1">
                {passport.educationLevel ? `${passport.educationLevel} • ` : ''}{passport.degree} • {passport.college} (Class of {passport.gradYear})
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#7A5060] mt-1">
                <span>Target Role: <strong className="text-[#9E3D58]">{passport.track}</strong></span>
                {passport.experienceLevel && (
                  <>
                    <span>•</span>
                    <span>Experience: <strong>{passport.experienceLevel}</strong></span>
                  </>
                )}
              </div>
              {passport.skillsToImprove && passport.skillsToImprove.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[11px] font-bold text-[#7A5060]">Verified Priority Skills:</span>
                  {passport.skillsToImprove.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="bg-[#FFF0F4] text-[#8C2E47] border border-[#F2D7DE] text-[11px] font-medium px-2 py-0.5 rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {passport.overall !== null && (
              <div className="bg-gradient-to-br from-[#FFF5F8] to-[#FCE8EE] border-2 border-[#ECC2CE] p-4 rounded-2xl text-center shrink-0 min-w-[160px]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A5060] block">
                  Overall Readiness
                </span>
                <div className="text-3xl font-serif font-bold text-[#9E3D58]">
                  {passport.overall}/100
                </div>
                <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#9E3D58] text-white">
                  {passport.band ? BAND_LABEL[passport.band] : ''}
                </span>
              </div>
            )}
          </div>

          {/* PILLAR SCORES GRID */}
          <div className="pt-6 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#7A5060]">
              Workplace Competency Pillars ({passport.coverage.completed}/{passport.coverage.total} tasks evaluated)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {PILLARS.map((pillarDef) => {
                const scoreItem = passport.pillars.find((p) => p.pillar === pillarDef.id);
                return (
                  <div
                    key={pillarDef.id}
                    className="bg-[#FFF8FA] border border-[#ECCCD5] p-3.5 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2D1822]">{pillarDef.label}</span>
                      {scoreItem && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FCE8EE] text-[#8C2E47]">
                          {BAND_LABEL[scoreItem.band]}
                        </span>
                      )}
                    </div>
                    <div className="text-xl font-serif font-bold text-[#9E3D58]">
                      {scoreItem ? `${scoreItem.score}/100` : 'Pending'}
                    </div>
                    <p className="text-[11px] text-[#7A5060] leading-tight">
                      {pillarDef.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* WORK EVIDENCE & TASK DEMONSTRATION CARDS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-[#2D1822]">
              Verified Workplace Simulation Proof
            </h2>
            <span className="text-xs text-[#7A5060]">
              Candidate work and reviewer evaluation trail
            </span>
          </div>

          {passport.tasks.map((taskEntry: PassportTaskEntry) => {
            const isExpanded = expandedTask === taskEntry.taskId;
            return (
              <div
                key={taskEntry.taskId}
                className="bg-[#FFFFFF] border border-[#ECCCD5] rounded-2xl overflow-hidden shadow-sm transition-all"
              >
                <div
                  onClick={() => setExpandedTask(isExpanded ? null : taskEntry.taskId)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-[#FFF8FA] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF0F4] border border-[#ECC2CE] flex items-center justify-center shrink-0">
                      {taskEntry.taskId === 'debug-c-program' && <Terminal className="w-5 h-5 text-[#9E3D58]" />}
                      {taskEntry.taskId === 'analyse-dataset' && <Database className="w-5 h-5 text-[#9E3D58]" />}
                      {taskEntry.taskId === 'client-bug-response' && <Mail className="w-5 h-5 text-[#9E3D58]" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#9E3D58] font-bold">{taskEntry.code}</span>
                        <span className="text-sm font-serif font-bold text-[#2D1822]">{taskEntry.title}</span>
                      </div>
                      <p className="text-xs text-[#7A5060]">
                        Completed on {new Date(taskEntry.completedAt).toLocaleDateString()} • {taskEntry.attemptsCount} attempt{taskEntry.attemptsCount > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-serif font-bold text-[#9E3D58]">
                        {taskEntry.overall}/100
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FCE8EE] text-[#8C2E47]">
                        {BAND_LABEL[taskEntry.band]}
                      </span>
                    </div>
                    <span className="text-xs text-[#9E3D58] font-semibold underline">
                      {isExpanded ? 'Hide Work' : 'Inspect Work & Evidence'}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 sm:p-6 border-t border-[#F2D7DE] space-y-6 bg-[#FAF0F3]/40">
                    
                    {/* Evaluator Summary */}
                    <div className="bg-[#FFFFFF] border border-[#ECCCD5] p-4 rounded-xl space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#9E3D58] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Senior Reviewer Summary
                      </div>
                      <p className="text-xs sm:text-sm text-[#2D1822] leading-relaxed">
                        {taskEntry.summary}
                      </p>
                    </div>

                    {/* Student Original Answer */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#7A5060]">
                        Candidate's Actual Submission
                      </div>
                      <pre className="bg-[#FFFFFF] border border-[#ECCCD5] p-4 rounded-xl text-xs text-[#2D1822] font-mono whitespace-pre-wrap overflow-x-auto max-h-72">
                        {taskEntry.answer}
                      </pre>
                    </div>

                    {/* Simulated Follow-Up Conversation */}
                    {taskEntry.followUp.message && (
                      <div className="space-y-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-[#7A5060]">
                          Stakeholder Follow-Up Interaction
                        </div>
                        <div className="bg-[#FFF8FA] border border-[#ECCCD5] rounded-xl p-4 space-y-3">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-[#8C2E47]">
                              {taskEntry.followUp.from} ({taskEntry.followUp.role}):
                            </span>
                            <p className="text-xs text-[#2D1822] italic">
                              "{taskEntry.followUp.message}"
                            </p>
                          </div>
                          {taskEntry.followUp.answer && (
                            <div className="pt-2 border-t border-[#ECCCD5] space-y-1">
                              <span className="text-xs font-bold text-[#2D1822]">
                                Candidate Reply:
                              </span>
                              <p className="text-xs text-[#5C3B48] font-mono whitespace-pre-wrap">
                                {taskEntry.followUp.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Criteria & Verified Evidence Quotes */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#7A5060]">
                        Criterion Breakdown & Quoted Evidence
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {taskEntry.criteria.map((c) => (
                          <div
                            key={c.criterionId}
                            className="bg-[#FFFFFF] border border-[#ECCCD5] p-3.5 rounded-xl space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#2D1822]">{c.criterion}</span>
                              <span className="text-xs font-mono font-bold text-[#9E3D58]">
                                Level {c.level}/4
                              </span>
                            </div>
                            <p className="text-[11px] text-[#5C3B48]">{c.rationale}</p>
                            {c.verifiedEvidence.length > 0 && (
                              <div className="pt-1.5 space-y-1">
                                <span className="text-[10px] uppercase font-bold text-[#7A5060] block">
                                  Verified Quotes in Answer:
                                </span>
                                {c.verifiedEvidence.map((quote, qIdx) => (
                                  <div
                                    key={qIdx}
                                    className="bg-[#FFF8FA] border border-[#F2D7DE] text-[11px] text-[#8C2E47] px-2 py-1 rounded font-mono"
                                  >
                                    "{quote}"
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Integrity Telemetry Signals */}
                    <div className="bg-[#FFFFFF] border border-[#ECCCD5] p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-[#7A5060]">
                      <div>
                        Duration: <strong className="text-[#2D1822]">{taskEntry.integrity.durationSec}s</strong>
                      </div>
                      <div>
                        Typed Chars: <strong className="text-[#2D1822]">{taskEntry.integrity.typedChars}</strong>
                      </div>
                      <div>
                        Pasted Chars: <strong className="text-[#2D1822]">{taskEntry.integrity.pastedChars}</strong>
                      </div>
                      <div>
                        Tab Switches: <strong className="text-[#2D1822]">{taskEntry.integrity.hiddenCount}</strong>
                      </div>
                      <div>
                        Injection Flag:{' '}
                        <strong className={taskEntry.integrity.injectionSuspected ? 'text-red-600' : 'text-green-700'}>
                          {taskEntry.integrity.injectionSuspected ? 'Flagged' : 'Clear'}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RECRUITER CALL TO ACTION */}
        <div className="bg-[#FFFFFF] border border-[#ECCCD5] rounded-2xl p-6 text-center space-y-3 shadow-sm">
          <h3 className="text-lg font-serif font-bold text-[#2D1822]">
            Interested in connecting with {passport.displayName}?
          </h3>
          <p className="text-xs text-[#7A5060] max-w-lg mx-auto">
            Beyond the Resume proves real problem-solving, code correctness, and communication capability for college candidates.
          </p>
          <div className="pt-2">
            <button
              onClick={onGoHome}
              className="bg-[#9E3D58] hover:bg-[#862E45] text-white px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm transition-colors"
            >
              Learn More About Beyond the Resume
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
