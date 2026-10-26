import React, { useState } from 'react';
import type { Page } from '../types';
import { PUBLIC_TASKS } from '../../shared/tasks/index.ts';
import { PILLARS, BAND_LABEL } from '../../shared/pillars.ts';
import { useMe } from '../lib/useMe.ts';
import { QuickProfileModal } from '../components/QuickProfileModal.tsx';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  Award,
  Sparkles,
  ChevronRight,
  Play,
  ShieldCheck,
  Terminal,
  Database,
  Mail,
  Edit3,
  Target,
  GraduationCap,
  Briefcase,
  Layers,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (page: Page) => void;
  onSelectTask: (taskId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onSelectTask,
}) => {
  const { data: me, loading, refresh } = useMe();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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

  const attempts = me?.attempts || [];
  const completedAttempts = attempts.filter((a) => a.status === 'complete' && a.result);
  const completedTaskIds = new Set(completedAttempts.map((a) => a.taskId));

  const completedCount = completedTaskIds.size;

  // Intelligent task recommendation based on chosen skills to improve
  const recommendedTask = (() => {
    const skills = profile.skillsToImprove || [];
    if (skills.some((s) => s.includes('Memory') || s.includes('C Debugging')) && !completedTaskIds.has('debug-c-program')) {
      return PUBLIC_TASKS.find((t) => t.id === 'debug-c-program') || PUBLIC_TASKS[0];
    }
    if (skills.some((s) => s.includes('Incident') || s.includes('Observability')) && !completedTaskIds.has('analyse-dataset')) {
      return PUBLIC_TASKS.find((t) => t.id === 'analyse-dataset') || PUBLIC_TASKS[0];
    }
    if (skills.some((s) => s.includes('Client') || s.includes('Communication')) && !completedTaskIds.has('client-bug-response')) {
      return PUBLIC_TASKS.find((t) => t.id === 'client-bug-response') || PUBLIC_TASKS[0];
    }
    return PUBLIC_TASKS.find((t) => !completedTaskIds.has(t.id)) || PUBLIC_TASKS[0];
  })();

  const allCompleted = completedCount >= PUBLIC_TASKS.length;
  const passport = me?.passport;

  if (loading) {
    return (
      <div className="bg-[#FAF0F3] min-h-screen py-16 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#9E3D58] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#7A5060]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF0F3] text-[#2D1822] min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* WELCOME HEADER & QUICK NEXT-STEP ACTION */}
        <div className="bg-[#FFFFFF] border border-[#ECCCD5] rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="uppercase font-bold tracking-wider text-[#8C2E47] bg-[#FCE8EE] px-2.5 py-0.5 rounded-full border border-[#ECC2CE] text-[10px]">
                {profile.targetRole || 'Junior Software Developer'}
              </span>
              <span className="text-[#7A5060]">• {profile.educationLevel || 'Undergraduate'}</span>
              <span className="text-[#7A5060]">• Class of {profile.gradYear}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D1822]">
                Welcome back, {profile.displayName}! 👋
              </h1>
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="bg-[#FFF8FA] hover:bg-[#FCE8EE] text-[#8C2E47] border border-[#ECC2CE] px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
                title="Edit your target role, education, and target skills"
              >
                <Edit3 className="w-3 h-3 text-[#9E3D58]" />
                <span>Personalize Profile</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#5C3B48]">
              {profile.degree} • {profile.college} ({profile.experienceLevel || 'Student'})
            </p>

            {/* Personalized Target Skills Tags */}
            {profile.skillsToImprove && profile.skillsToImprove.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-[#7A5060] mr-1">Focus Areas:</span>
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

          {/* Quick Action Card */}
          <div className="bg-[#FFF8FA] border border-[#ECCCD5] p-4 rounded-xl flex items-center justify-between gap-4 lg:w-96 shadow-inner shrink-0">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-[#9E3D58] tracking-wider block">
                {allCompleted ? 'All Tasks Completed' : 'Recommended Next Task'}
              </span>
              <div className="text-sm font-serif font-bold text-[#2D1822] truncate max-w-[200px]">
                {allCompleted ? 'Inspect Skill Passport' : recommendedTask.title}
              </div>
              <span className="text-[11px] text-[#7A5060]">
                {allCompleted
                  ? `Overall Score: ${passport?.overall ?? 0}/100`
                  : `Tailored to your focus skills • ${recommendedTask.estimatedMinutes}m`}
              </span>
            </div>

            <button
              onClick={() => {
                if (allCompleted) {
                  onNavigate('passport');
                } else {
                  onSelectTask(recommendedTask.id);
                }
              }}
              className="bg-[#9E3D58] hover:bg-[#862E45] text-white font-semibold px-4 py-2 rounded-xl text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shrink-0 shadow-sm border border-[#7D263B] transition-colors"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>{allCompleted ? 'View' : 'Start'}</span>
            </button>
          </div>
        </div>

        {/* OVERALL READINESS METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#FFFFFF] border border-[#ECCCD5] rounded-2xl p-5 shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A5060]">
              Overall Readiness
            </span>
            <div className="text-3xl font-serif font-bold text-[#9E3D58]">
              {passport?.overall !== null && passport?.overall !== undefined
                ? `${passport.overall}/100`
                : 'Pending'}
            </div>
            <p className="text-xs text-[#5C3B48]">
              {passport?.band ? BAND_LABEL[passport.band] : 'Complete a task to earn rating'}
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#ECCCD5] rounded-2xl p-5 shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A5060]">
              Tasks Completed
            </span>
            <div className="text-3xl font-serif font-bold text-[#9E3D58]">
              {completedCount} / {PUBLIC_TASKS.length}
            </div>
            <p className="text-xs text-[#5C3B48]">
              {allCompleted ? 'All workplace tasks verified' : `${PUBLIC_TASKS.length - completedCount} tasks remaining`}
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#ECCCD5] rounded-2xl p-5 shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A5060]">
              Target Role Alignment
            </span>
            <div className="text-lg font-serif font-bold text-[#9E3D58] truncate">
              {profile.targetRole}
            </div>
            <p className="text-xs text-[#5C3B48]">
              {profile.skillsToImprove?.length || 0} priority competencies selected
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#ECCCD5] rounded-2xl p-5 shadow-sm space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A5060]">
              Passport Status
            </span>
            <div className="text-xl font-serif font-bold text-[#9E3D58] truncate">
              {me?.published ? 'Publicly Live' : completedCount > 0 ? 'Ready to Publish' : 'Draft'}
            </div>
            <p className="text-xs text-[#5C3B48]">
              {me?.published ? 'Read-only link active' : 'Complete work to share'}
            </p>
          </div>
        </div>

        {/* WORKPLACE TASKS LIST */}
        <div className="bg-[#FFFFFF] border border-[#ECCCD5] rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#2D1822]">
                Workplace Engineering Tasks
              </h2>
              <p className="text-xs text-[#7A5060]">
                Simulations tailored to prove competencies in systems programming, telemetry analysis, and client de-escalation.
              </p>
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs font-semibold text-[#8C2E47] hover:underline flex items-center gap-1"
            >
              <span>View All Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PUBLIC_TASKS.map((t) => {
              const isDone = completedTaskIds.has(t.id);
              const bestAttempt = completedAttempts
                .filter((a) => a.taskId === t.id)
                .sort((a, b) => (b.result?.overall ?? 0) - (a.result?.overall ?? 0))[0];

              // Check if task matches a skill the student wants to improve
              const matchesTarget = (profile.skillsToImprove || []).some((s) => {
                if (t.id === 'debug-c-program' && (s.includes('Memory') || s.includes('C Debugging'))) return true;
                if (t.id === 'analyse-dataset' && (s.includes('Incident') || s.includes('Observability'))) return true;
                if (t.id === 'client-bug-response' && (s.includes('Client') || s.includes('Communication'))) return true;
                return false;
              });

              return (
                <div
                  key={t.id}
                  onClick={() => onSelectTask(t.id)}
                  className={`border rounded-xl p-5 cursor-pointer transition-all hover:shadow-sm space-y-3 flex flex-col justify-between ${
                    matchesTarget && !isDone
                      ? 'bg-[#FFF5F8] border-[#9E3D58]/60 ring-1 ring-[#9E3D58]/20'
                      : 'bg-[#FFF8FA] border-[#ECCCD5] hover:border-[#9E3D58]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-[#9E3D58] bg-[#FFF0F4] px-2 py-0.5 rounded border border-[#ECC2CE]">
                          {t.code}
                        </span>
                        {matchesTarget && !isDone && (
                          <span className="text-[10px] font-bold text-[#8C2E47] bg-[#FCE8EE] px-1.5 py-0.5 rounded border border-[#ECC2CE]">
                            Target Skill
                          </span>
                        )}
                      </div>

                      {isDone ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-[#2D6A2E] bg-[#EAF5EA] px-2 py-0.5 rounded-full border border-[#C5E3C5]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {bestAttempt?.result?.overall}/100
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#7A5060] bg-white px-2 py-0.5 rounded border border-[#ECCCD5]">
                          {t.estimatedMinutes} mins
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-serif font-bold text-[#2D1822]">
                      {t.title}
                    </h3>
                    <p className="text-xs text-[#5C3B48] line-clamp-2">
                      {t.subtitle}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#F2D7DE] flex items-center justify-between text-xs font-semibold text-[#8C2E47]">
                    <span>{isDone ? 'Retake / Review' : 'Start Simulation'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COMPETENCY PILLARS OVERVIEW */}
        <div className="bg-[#FFFFFF] border border-[#ECCCD5] rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-serif font-bold text-[#2D1822]">
              Workplace Competency Framework
            </h2>
            <p className="text-xs text-[#7A5060]">
              Four pillars evaluating technical depth, root cause finding, edge-case defense, and calm communication.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PILLARS.map((p) => {
              const scoreItem = passport?.pillars.find((sp) => sp.pillar === p.id);
              return (
                <div key={p.id} className="bg-[#FFF8FA] border border-[#ECCCD5] p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#2D1822]">{p.label}</span>
                    {scoreItem && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FCE8EE] text-[#8C2E47]">
                        {BAND_LABEL[scoreItem.band]}
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-serif font-bold text-[#9E3D58]">
                    {scoreItem ? `${scoreItem.score}/100` : '—'}
                  </div>
                  <p className="text-xs text-[#7A5060] leading-tight">
                    {p.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* PROFILE PERSONALIZATION MODAL */}
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
