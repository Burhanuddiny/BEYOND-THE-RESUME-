import React, { useState } from 'react';
import {
  ShieldCheck,
  Share2,
  CheckCircle2,
  Copy,
  Printer,
  Sparkles,
  ExternalLink,
  Terminal,
  Database,
  Mail,
  Award,
  Globe,
  Trash2,
  Edit3,
} from 'lucide-react';
import type { Page } from '../types';
import { useMe } from '../lib/useMe.ts';
import { publishPassport, unpublishPassport } from '../lib/api.ts';
import { PILLARS, BAND_LABEL } from '../../shared/pillars.ts';
import { QuickProfileModal } from '../components/QuickProfileModal.tsx';

interface SkillPassportPageProps {
  onNavigate: (page: Page) => void;
  onSelectTask: (taskId: string) => void;
}

export const SkillPassportPage: React.FC<SkillPassportPageProps> = ({ onNavigate, onSelectTask }) => {
  const { data: me, loading, refresh } = useMe();
  const [publishing, setPublishing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const passport = me?.passport;
  const profile = me?.profile || {
    displayName: 'Aarav Patel',
    educationLevel: 'Undergraduate (B.Tech / B.E.)',
    college: 'Dr. A.P.J. Abdul Kalam Technical University',
    degree: 'B.Tech in Computer Science & Engineering',
    gradYear: 2026,
    targetRole: 'Junior Software Developer',
    experienceLevel: 'Student (No Prior Internships)',
    skillsToImprove: ['Memory Safety & C Debugging', 'Production Incident Triage', 'Stakeholder Communication'],
  };

  const isPublished = !!me?.published?.passportId;
  const shareableUrl = isPublished
    ? `${window.location.origin}/p/${me.published?.passportId}`
    : '';

  const handlePublish = async () => {
    try {
      setPublishing(true);
      await publishPassport();
      await refresh();
    } catch {
      // ignore
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    try {
      setPublishing(true);
      await unpublishPassport();
      await refresh();
    } catch {
      // ignore
    } finally {
      setPublishing(false);
    }
  };

  const handleCopyLink = () => {
    if (!shareableUrl) return;
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyResumeSnippet = () => {
    if (!passport || passport.overall === null) return;
    const summaryText = `Beyond the Resume — Verified Skill Passport
Candidate: ${profile.displayName}
Target Role: ${profile.targetRole || 'Junior Software Developer'}
Education: ${profile.educationLevel || 'Undergraduate'} (${profile.degree}, ${profile.college})
Overall Readiness: ${passport.overall}/100 (${passport.band ? BAND_LABEL[passport.band] : ''})
Pillars:
${passport.pillars.map((p) => `- ${p.pillar}: ${p.score}/100 (${BAND_LABEL[p.band]})`).join('\n')}
${isPublished ? `Verify: ${shareableUrl}` : ''}`;
    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  if (loading) {
    return (
      <div className="bg-[#FAF0F3] min-h-screen py-16 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#9E3D58] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#7A5060]">Loading your verified Skill Passport...</p>
        </div>
      </div>
    );
  }

  const hasCompletedTasks = (passport?.tasks.length ?? 0) > 0;

  return (
    <div className="bg-[#FAF0F3] text-[#2D1822] min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* PUBLISH STATUS BAR */}
        <div className="bg-[#FFFFFF] border border-[#ECCCD5] rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0F4] border border-[#ECC2CE] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#9E3D58]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#2D1822]">
                  {isPublished ? 'Your Passport is Live & Shareable' : 'Skill Passport Status'}
                </h2>
                {isPublished && (
                  <span className="bg-[#EAF5EA] text-[#2D6A2E] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#C5E3C5] flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    Publicly Shareable
                  </span>
                )}
              </div>
              <p className="text-xs text-[#7A5060]">
                {isPublished
                  ? `Recruiters can inspect your evidence and scores at /p/${me.published?.passportId}`
                  : hasCompletedTasks
                  ? 'Publish your passport to generate a read-only link for recruiters and LinkedIn.'
                  : 'Complete workplace tasks to generate your verified competency passport.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="bg-[#FFF8FA] hover:bg-[#FCE8EE] text-[#8C2E47] border border-[#ECC2CE] px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>

            {hasCompletedTasks && !isPublished && (
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="bg-[#9E3D58] hover:bg-[#862E45] text-white px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm transition-colors"
              >
                {publishing ? 'Publishing...' : 'Publish Passport'}
              </button>
            )}

            {isPublished && (
              <>
                <button
                  onClick={handleCopyLink}
                  className="bg-[#9E3D58] hover:bg-[#862E45] text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'Copied Public Link!' : 'Copy Recruiter Link'}</span>
                </button>
                <a
                  href={`/p/${me.published?.passportId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#FFF8FA] hover:bg-[#FCE8EE] text-[#8C2E47] border border-[#ECC2CE] px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Public Page</span>
                </a>
                <button
                  onClick={handleUnpublish}
                  disabled={publishing}
                  className="text-xs text-[#7A5060] hover:text-red-700 p-2"
                  title="Revoke public access"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={() => window.print()}
              className="bg-[#FFF8FA] hover:bg-[#FCE8EE] text-[#8C2E47] border border-[#ECC2CE] px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* CANDIDATE HEADER */}
        <div className="bg-[#FFFFFF] border border-[#ECCCD5] rounded-2xl p-6 sm:p-7 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#F2D7DE]">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#9E3D58] to-[#78283E] text-white font-serif font-bold text-2xl flex items-center justify-center shrink-0 shadow-md shadow-[#9E3D58]/20 border-2 border-[#FCE2E9]">
                {profile.displayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D1822]">
                    {profile.displayName}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FCE8EE] text-[#8C2E47] border border-[#ECC2CE]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#9E3D58]" />
                    Skill Passport
                  </span>
                </div>

                <p className="text-xs text-[#5C3B48]">
                  {profile.educationLevel || 'Undergraduate'} • {profile.degree} • {profile.college} (Class of {profile.gradYear})
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs text-[#7A5060]">
                  <span>Target Role: <strong className="text-[#9E3D58]">{profile.targetRole || 'Junior Software Developer'}</strong></span>
                  <span>•</span>
                  <span>Experience: <strong>{profile.experienceLevel || 'Student'}</strong></span>
                  {isPublished && (
                    <>
                      <span>•</span>
                      <span>Passport ID: <code className="text-[#9E3D58] font-mono">#{me.published?.passportId.toUpperCase()}</code></span>
                    </>
                  )}
                </div>

                {/* Priority Skills Chips */}
                {profile.skillsToImprove && profile.skillsToImprove.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-bold text-[#7A5060] mr-1">Target Competencies:</span>
                    {profile.skillsToImprove.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-[#FFF0F4] text-[#8C2E47] border border-[#F2D7DE] text-[11px] font-medium px-2 py-0.5 rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {hasCompletedTasks && passport?.overall !== null && (
                <div className="bg-gradient-to-br from-[#FFF5F8] to-[#FCE8EE] border border-[#ECC2CE] p-3.5 rounded-2xl text-center shrink-0 min-w-[140px]">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A5060] block">
                    Readiness Score
                  </span>
                  <div className="text-3xl font-serif font-bold text-[#9E3D58]">
                    {passport?.overall}/100
                  </div>
                  <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#9E3D58] text-white">
                    {passport?.band ? BAND_LABEL[passport.band] : ''}
                  </span>
                </div>
              )}

              <button
                onClick={handleCopyResumeSnippet}
                disabled={!hasCompletedTasks}
                className="bg-[#FFF8FA] hover:bg-[#FCE8EE] disabled:opacity-50 text-[#8C2E47] border border-[#ECC2CE] font-semibold px-3.5 py-2.5 rounded-xl text-xs inline-flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Copy className="w-3.5 h-3.5 text-[#9E3D58]" />
                <span>{copiedSummary ? '✓ Copied Summary!' : 'Copy Resume Snippet'}</span>
              </button>
            </div>
          </div>

          {/* PILLARS AGGREGATE */}
          <div className="pt-6 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#7A5060]">
              Competency Pillars ({passport?.coverage.completed || 0}/{passport?.coverage.total || 3} Tasks Completed)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {PILLARS.map((pillarDef) => {
                const scoreItem = passport?.pillars.find((p) => p.pillar === pillarDef.id);
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
                      {scoreItem ? `${scoreItem.score}/100` : '—'}
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

        {/* COMPLETED TASKS EVIDENCE */}
        {!hasCompletedTasks ? (
          <div className="bg-[#FFFFFF] border border-[#ECCCD5] rounded-2xl p-8 text-center space-y-4 shadow-sm">
            <Award className="w-12 h-12 text-[#9E3D58] mx-auto opacity-70" />
            <div className="space-y-1">
              <h3 className="text-xl font-serif font-bold text-[#2D1822]">
                No Tasks Completed Yet
              </h3>
              <p className="text-xs text-[#7A5060] max-w-md mx-auto">
                Complete realistic junior-engineer tasks in the workplace simulator to earn your verified Skill Passport with proof of work.
              </p>
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              className="bg-[#9E3D58] hover:bg-[#862E45] text-white px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm transition-colors"
            >
              Start Your First Task
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-serif font-bold text-[#2D1822]">
              Verified Workplace Simulation Proof
            </h2>

            {passport?.tasks.map((taskEntry) => {
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
                        {isExpanded ? 'Hide Details' : 'View Work & Evidence'}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 sm:p-6 border-t border-[#F2D7DE] space-y-5 bg-[#FAF0F3]/40">
                      <div className="bg-[#FFFFFF] border border-[#ECCCD5] p-4 rounded-xl space-y-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#9E3D58] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          Reviewer Summary
                        </span>
                        <p className="text-xs text-[#2D1822]">{taskEntry.summary}</p>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#7A5060]">
                          Your Submission
                        </span>
                        <pre className="bg-[#FFFFFF] border border-[#ECCCD5] p-4 rounded-xl text-xs text-[#2D1822] font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                          {taskEntry.answer}
                        </pre>
                      </div>

                      {taskEntry.followUp.message && (
                        <div className="bg-[#FFF8FA] border border-[#ECCCD5] rounded-xl p-4 space-y-2">
                          <span className="text-xs font-bold text-[#8C2E47]">
                            Follow-Up from {taskEntry.followUp.from} ({taskEntry.followUp.role}):
                          </span>
                          <p className="text-xs text-[#2D1822] italic">"{taskEntry.followUp.message}"</p>
                          {taskEntry.followUp.answer && (
                            <div className="pt-2 border-t border-[#ECCCD5]">
                              <span className="text-xs font-bold text-[#2D1822]">Your Reply:</span>
                              <p className="text-xs text-[#5C3B48] font-mono whitespace-pre-wrap">{taskEntry.followUp.answer}</p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#7A5060]">
                          Criteria & Quoted Evidence
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {taskEntry.criteria.map((c) => (
                            <div key={c.criterionId} className="bg-[#FFFFFF] border border-[#ECCCD5] p-3 rounded-xl space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-[#2D1822]">{c.criterion}</span>
                                <span className="font-mono text-[#9E3D58] font-bold">Level {c.level}/4</span>
                              </div>
                              <p className="text-[11px] text-[#5C3B48]">{c.rationale}</p>
                              {c.verifiedEvidence.length > 0 && (
                                <div className="pt-1">
                                  {c.verifiedEvidence.map((quote, idx) => (
                                    <div key={idx} className="bg-[#FFF8FA] border border-[#F2D7DE] text-[10px] text-[#8C2E47] px-2 py-0.5 rounded font-mono">
                                      "{quote}"
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => onSelectTask(taskEntry.taskId)}
                          className="bg-[#9E3D58] text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold hover:bg-[#862E45] transition-colors"
                        >
                          Retake Task to Improve Score
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* PROFILE MODAL */}
        <QuickProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          profile={profile}
          onProfileUpdated={refresh}
        />

      </div>
    </div>
  );
};
