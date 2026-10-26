import React, { useState, useEffect, useRef } from 'react';
import type { Page } from '../types';
import type { PublicTask, AttemptView } from '../../shared/types.ts';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Info,
  Copy,
  ChevronRight,
  ChevronLeft,
  Code2,
  BookOpen,
  Send,
  Award,
  Terminal,
  Database,
  Mail,
  HelpCircle,
  FileText,
  MessageSquare,
  RotateCcw,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import { startAttempt, submitAttempt, submitFollowUp, getAttempt } from '../lib/api.ts';
import { useIntegrity } from '../lib/useIntegrity.ts';
import { BAND_LABEL } from '../../shared/pillars.ts';

interface AssessmentPageProps {
  task: PublicTask;
  allTasks: readonly PublicTask[];
  onSelectTask: (taskId: string) => void;
  onNavigate: (page: Page) => void;
  onTaskCompleted?: () => void;
}

export const AssessmentPage: React.FC<AssessmentPageProps> = ({
  task,
  allTasks,
  onSelectTask,
  onNavigate,
  onTaskCompleted,
}) => {
  const [attempt, setAttempt] = useState<AttemptView | null>(null);
  const [answer, setAnswer] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evalProgressText, setEvalProgressText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [activeTab, setActiveTab] = useState<'material' | 'rubric' | 'hints' | 'modelSolution'>('material');

  const { textareaRef, signals, onPaste, onBeforeInput, resetIntegrity } = useIntegrity();
  const evaluationLiveRef = useRef<HTMLDivElement | null>(null);

  const currentIndex = allTasks.findIndex((t) => t.id === task.id);
  const prevTask = currentIndex > 0 ? allTasks[currentIndex - 1] : null;
  const nextTask = currentIndex < allTasks.length - 1 ? allTasks[currentIndex + 1] : null;

  // Initialize or fetch attempt for this task
  useEffect(() => {
    let active = true;
    async function init() {
      try {
        setLoading(true);
        setErrorMessage(null);
        resetIntegrity();
        const res = await startAttempt(task.id);
        if (!active) return;
        setAttempt(res.attempt);
        if (res.attempt.answer) {
          setAnswer(res.attempt.answer);
        } else {
          // Restore draft if any
          const draft = localStorage.getItem(`btr_draft_${task.id}`);
          if (draft) setAnswer(draft);
          else setAnswer('');
        }
        if (res.attempt.followUpAnswer) {
          setFollowUpAnswer(res.attempt.followUpAnswer);
        }
      } catch (err) {
        if (!active) return;
        setErrorMessage('Failed to connect to assessment service.');
      } finally {
        if (active) setLoading(false);
      }
    }
    init();
    return () => {
      active = false;
    };
  }, [task.id, resetIntegrity]);

  // Draft auto-save
  useEffect(() => {
    if (attempt?.status === 'in_progress' && answer) {
      localStorage.setItem(`btr_draft_${task.id}`, answer);
    }
  }, [task.id, answer, attempt?.status]);

  const handleInsertOutline = () => {
    setAnswer(task.answerOutline);
    setErrorMessage(null);
  };

  const handleCopySnippet = () => {
    if (task.codeSnippet) {
      navigator.clipboard.writeText(task.codeSnippet.code);
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    }
  };

  // Submit initial answer
  const handleSubmitMainAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attempt) return;

    const trimmed = answer.trim();
    if (trimmed.length < 40) {
      setErrorMessage('Please provide a complete solution (minimum 40 characters) to demonstrate workplace engineering capability.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);
      setEvalProgressText('Senior engineer reviewing your solution against rubric criteria...');

      // Update progress announcement after 2.5s
      const timer = setTimeout(() => {
        setEvalProgressText('Synthesizing evidence quotes and simulating stakeholder response...');
      }, 2500);

      const res = await submitAttempt(attempt.id, trimmed, signals);
      clearTimeout(timer);
      localStorage.removeItem(`btr_draft_${task.id}`);
      setAttempt(res.attempt);
    } catch {
      setErrorMessage('Evaluation temporarily unavailable. Please retry submitting your answer.');
    } finally {
      setSubmitting(false);
      setEvalProgressText('');
    }
  };

  // Submit follow-up reply
  const handleSubmitFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attempt) return;

    const trimmed = followUpAnswer.trim();
    if (trimmed.length < 10) {
      setErrorMessage('Please provide a constructive response (minimum 10 characters) to your stakeholder.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);
      setEvalProgressText('Evaluating workplace communication and computing rubric scores...');

      const res = await submitFollowUp(attempt.id, trimmed);
      setAttempt(res.attempt);
      onTaskCompleted?.();
    } catch {
      setErrorMessage('Unable to submit follow-up evaluation. Please retry.');
    } finally {
      setSubmitting(false);
      setEvalProgressText('');
    }
  };

  const handleRetakeTask = async () => {
    try {
      setLoading(true);
      localStorage.removeItem(`btr_draft_${task.id}`);
      setAnswer('');
      setFollowUpAnswer('');
      resetIntegrity();
      // Force start new attempt by refreshing
      const res = await startAttempt(task.id);
      setAttempt(res.attempt);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#FAF0F3] min-h-screen py-16 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#9E3D58] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#7A5060]">Loading simulation workspace...</p>
        </div>
      </div>
    );
  }

  const isComplete = attempt?.status === 'complete';
  const isAwaitingFollowUp = attempt?.status === 'awaiting_follow_up';

  return (
    <div className="bg-[#FAF0F3] text-[#2D1822] min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* FAST-SWITCH TASK BAR */}
        <div className="bg-[#FFFFFF] border border-[#ECCCD5] rounded-2xl p-2.5 sm:p-3 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-serif font-bold text-[#7A5060] uppercase tracking-wider px-2 shrink-0">
              Tasks:
            </span>
            {allTasks.map((t, idx) => {
              const isCurrent = t.id === task.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onSelectTask(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isCurrent
                      ? 'bg-[#9E3D58] text-white shadow-sm'
                      : 'bg-[#FFF8FA] text-[#5C3B48] hover:bg-[#FCE8EE] border border-[#ECCCD5]'
                  }`}
                >
                  <span className="font-mono text-[11px] opacity-80">{t.code}</span>
                  <span>Task {idx + 1}</span>
                  {isCurrent && isComplete && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end text-xs">
            {prevTask && (
              <button
                onClick={() => onSelectTask(prevTask.id)}
                className="px-2.5 py-1 rounded-lg text-[#5C3B48] hover:bg-[#FFF0F4] border border-[#ECCCD5] flex items-center gap-1 font-medium"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev Task</span>
              </button>
            )}
            {nextTask && (
              <button
                onClick={() => onSelectTask(nextTask.id)}
                className="px-2.5 py-1 rounded-lg text-[#8C2E47] hover:bg-[#FFF0F4] border border-[#ECC2CE] bg-[#FCE8EE] flex items-center gap-1 font-semibold"
              >
                <span>Next: {nextTask.code}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs text-[#7A5060] hover:text-[#2D1822] px-2 py-1 font-medium"
            >
              All Tasks
            </button>
          </div>
        </div>

        {/* ACCESSIBLE LIVE ANNOUNCER */}
        <div
          ref={evaluationLiveRef}
          aria-live="polite"
          className="sr-only"
        >
          {evalProgressText}
        </div>

        {/* TASK HEADER CARD */}
        <div className="bg-[#FFFFFF] border border-[#ECCCD5] rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[#9E3D58] font-bold text-xs bg-[#FFF0F4] px-2.5 py-0.5 rounded-full border border-[#ECC2CE]">
                  {task.code}
                </span>
                <span className="text-xs text-[#7A5060] bg-[#FFF8FA] px-2 py-0.5 rounded-full border border-[#ECCCD5]">
                  {task.difficulty}
                </span>
                <span className="text-xs text-[#7A5060] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#9E3D58]" />
                  {task.estimatedMinutes} mins est.
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D1822]">
                {task.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#5C3B48]">
                {task.subtitle}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[#7A5060] block tracking-wider">
                Assigned Stakeholder
              </span>
              <span className="text-xs font-semibold text-[#8C2E47]">
                {task.stakeholder.name}
              </span>
              <span className="text-[11px] text-[#7A5060] block">
                {task.stakeholder.role}
              </span>
            </div>
          </div>
        </div>

        {/* EVALUATION PROGRESS CARD */}
        {submitting && (
          <div className="bg-gradient-to-r from-[#FFF0F4] to-[#FCE8EE] border-2 border-[#9E3D58] rounded-2xl p-6 text-center space-y-3 shadow-md">
            <div className="w-8 h-8 border-3 border-[#9E3D58] border-t-transparent rounded-full animate-spin mx-auto" />
            <h3 className="text-base font-serif font-bold text-[#2D1822]">
              {evalProgressText || 'Evaluating your work...'}
            </h3>
            <p className="text-xs text-[#7A5060] max-w-md mx-auto">
              Our automated SME evaluator is checking your solution against the published rubric and verifying exact quote citations.
            </p>
          </div>
        )}

        {/* COMPLETED RESULT BANNER & BREAKDOWN */}
        {isComplete && attempt?.result && (
          <div className="bg-[#FFFFFF] border-2 border-[#9E3D58] rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F2D7DE]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF0F4] border border-[#ECC2CE] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-7 h-7 text-[#9E3D58]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-serif font-bold text-[#2D1822]">
                      Task Evaluated & Verified
                    </h2>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#9E3D58] text-white">
                      {BAND_LABEL[attempt.result.band]}
                    </span>
                  </div>
                  <p className="text-xs text-[#7A5060]">
                    Evaluated against the published rubric with quoted evidence verification.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#7A5060] block tracking-wider">
                    Computed Task Score
                  </span>
                  <div className="text-3xl font-serif font-bold text-[#9E3D58]">
                    {attempt.result.overall}/100
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('passport')}
                  className="bg-[#9E3D58] hover:bg-[#862E45] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  View Skill Passport
                </button>
              </div>
            </div>

            {/* Pillar Breakdown */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A5060]">
                Workplace Competency Pillars Evaluated
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {attempt.result.pillars.map((p) => (
                  <div key={p.pillar} className="bg-[#FFF8FA] border border-[#ECCCD5] p-3 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#2D1822] capitalize">{p.pillar}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FCE8EE] text-[#8C2E47]">
                        {BAND_LABEL[p.band]}
                      </span>
                    </div>
                    <div className="text-xl font-serif font-bold text-[#9E3D58]">
                      {p.score}/100
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkpoints Hit */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A5060]">
                Engineering Checkpoints ({attempt.result.checkpoints.filter((c) => c.hit).length}/{attempt.result.checkpoints.length} passed)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {attempt.result.checkpoints.map((cp) => (
                  <div
                    key={cp.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                      cp.hit
                        ? 'bg-[#EAF5EA] border-[#C5E3C5] text-[#2D6A2E]'
                        : 'bg-[#FFF8FA] border-[#ECCCD5] text-[#7A5060]'
                    }`}
                  >
                    <span className="font-medium">{cp.label}</span>
                    {cp.hit ? (
                      <span className="flex items-center gap-1 font-bold text-xs shrink-0">
                        <Check className="w-4 h-4 text-[#2D6A2E]" />
                        Met
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] shrink-0 opacity-70">
                        <X className="w-3.5 h-3.5" />
                        Missed
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#FFF8FA] border border-[#ECCCD5] p-4 rounded-xl space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2D6A2E] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Identified Strengths
                </span>
                <ul className="text-xs text-[#2D1822] space-y-1 list-disc pl-4">
                  {attempt.result.strengths.map((str, i) => (
                    <li key={i}>{str}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#FFF8FA] border border-[#ECCCD5] p-4 rounded-xl space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9E3D58] flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Areas for Growth
                </span>
                <ul className="text-xs text-[#2D1822] space-y-1 list-disc pl-4">
                  {attempt.result.improvements.map((imp, i) => (
                    <li key={i}>{imp}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Criteria Breakdown */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A5060]">
                Rubric Criteria & Verified Quoted Evidence
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {attempt.result.criteria.map((c) => (
                  <div key={c.criterionId} className="bg-[#FFFFFF] border border-[#ECCCD5] p-3.5 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#2D1822]">{c.criterion}</span>
                      <span className="font-mono text-[#9E3D58] font-bold">
                        Level {c.level}/4 {c.capped ? '(Capped: No quotes)' : ''}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5C3B48]">{c.rationale}</p>
                    {c.verifiedEvidence.length > 0 && (
                      <div className="pt-1 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-[#7A5060] block">
                          Verified Quotes from Your Text:
                        </span>
                        {c.verifiedEvidence.map((quote, idx) => (
                          <div key={idx} className="bg-[#FFF8FA] border border-[#F2D7DE] text-[11px] text-[#8C2E47] px-2 py-0.5 rounded font-mono">
                            "{quote}"
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Revealed Model Solution tab if available */}
            {attempt.modelAnswer && (
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab(activeTab === 'modelSolution' ? 'material' : 'modelSolution')}
                  className="bg-[#FFF8FA] hover:bg-[#FCE8EE] text-[#8C2E47] border border-[#ECC2CE] px-3.5 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#9E3D58]" />
                  <span>{activeTab === 'modelSolution' ? 'Hide Reference Answer' : 'Compare with Reference Answer'}</span>
                </button>
              </div>
            )}

            {activeTab === 'modelSolution' && attempt.modelAnswer && (
              <div className="bg-[#FFFFFF] border border-[#ECCCD5] p-5 rounded-2xl space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9E3D58]">
                  Senior Engineer Reference Solution (Official Grader Key)
                </span>
                <pre className="bg-[#FFF8FA] border border-[#ECCCD5] p-4 rounded-xl text-xs font-mono text-[#2D1822] whitespace-pre-wrap max-h-80 overflow-y-auto">
                  {attempt.modelAnswer}
                </pre>
              </div>
            )}

            {/* Footer action */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F2D7DE]">
              <button
                onClick={handleRetakeTask}
                className="text-xs text-[#7A5060] hover:text-[#2D1822] flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Task Attempt</span>
              </button>

              <div className="flex items-center gap-2">
                {nextTask && (
                  <button
                    onClick={() => onSelectTask(nextTask.id)}
                    className="bg-[#9E3D58] hover:bg-[#862E45] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Proceed to Next Task: {nextTask.code}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => onNavigate('passport')}
                  className="bg-[#FFF0F4] hover:bg-[#FCE8EE] text-[#8C2E47] border border-[#ECC2CE] px-3.5 py-2 rounded-xl text-xs font-semibold"
                >
                  View Skill Passport
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STAKEHOLDER FOLLOW-UP DIALOGUE (When awaiting follow up) */}
        {isAwaitingFollowUp && attempt?.followUp && (
          <div className="bg-[#FFFFFF] border-2 border-[#9E3D58] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0F4] border border-[#ECC2CE] flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-[#9E3D58]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#9E3D58]">
                    Stakeholder Follow-Up Interaction
                  </span>
                  <span className="text-[10px] bg-[#FFF0F4] text-[#8C2E47] px-2 py-0.5 rounded-full border border-[#ECC2CE]">
                    Step 2 of 2
                  </span>
                </div>
                <h3 className="text-base font-serif font-bold text-[#2D1822]">
                  {attempt.followUp.from} ({attempt.followUp.role}) has followed up:
                </h3>
              </div>
            </div>

            <div className="bg-[#FFF8FA] border border-[#ECCCD5] rounded-xl p-4 text-xs sm:text-sm text-[#2D1822] italic font-medium leading-relaxed">
              "{attempt.followUp.message}"
            </div>

            <form onSubmit={handleSubmitFollowUp} className="space-y-3 pt-2">
              <label htmlFor="followup-reply" className="block text-xs font-bold uppercase tracking-wider text-[#7A5060]">
                Your Workplace Reply (Demonstrating Edge-Case Reasoning & Composure)
              </label>
              <textarea
                id="followup-reply"
                rows={4}
                value={followUpAnswer}
                onChange={(e) => setFollowUpAnswer(e.target.value)}
                placeholder="Type your response to the stakeholder directly..."
                className="w-full bg-[#FFFFFF] border border-[#ECCCD5] focus:border-[#9E3D58] rounded-xl p-3.5 text-xs text-[#2D1822] focus:outline-none focus:ring-1 focus:ring-[#9E3D58]"
              />

              {errorMessage && (
                <div className="text-xs text-red-600 font-medium">
                  {errorMessage}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#7A5060]">
                  {followUpAnswer.length} characters (min 10)
                </span>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#9E3D58] hover:bg-[#862E45] text-white font-semibold px-4 py-2 rounded-xl text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Evaluating Reply...' : 'Submit Final Reply'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MAIN WORKSPACE: SCENARIO MATERIAL & ANSWER INPUT (Only when in_progress or reviewing) */}
        {!isComplete && !isAwaitingFollowUp && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: SCENARIO & CONTEXT (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* TABS */}
              <div className="flex items-center gap-2 border-b border-[#ECCCD5] pb-2 text-xs">
                <button
                  onClick={() => setActiveTab('material')}
                  className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'material'
                      ? 'bg-[#9E3D58] text-white'
                      : 'bg-[#FFFFFF] text-[#5C3B48] hover:bg-[#FFF0F4] border border-[#ECCCD5]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Scenario Material</span>
                </button>
                <button
                  onClick={() => setActiveTab('rubric')}
                  className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'rubric'
                      ? 'bg-[#9E3D58] text-white'
                      : 'bg-[#FFFFFF] text-[#5C3B48] hover:bg-[#FFF0F4] border border-[#ECCCD5]'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Evaluation Rubric</span>
                </button>
                <button
                  onClick={() => setActiveTab('hints')}
                  className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'hints'
                      ? 'bg-[#9E3D58] text-white'
                      : 'bg-[#FFFFFF] text-[#5C3B48] hover:bg-[#FFF0F4] border border-[#ECCCD5]'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Senior Guidance</span>
                </button>
              </div>

              {/* TAB 1: SCENARIO MATERIAL */}
              {activeTab === 'material' && (
                <div className="bg-[#FFFFFF] border border-[#ECCCD5] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#9E3D58]">
                      Context & Background
                    </h2>
                    <p className="text-xs sm:text-sm text-[#2D1822] leading-relaxed">
                      {task.context}
                    </p>
                    <p className="text-xs text-[#5C3B48] leading-relaxed">
                      {task.scenarioDetail}
                    </p>
                  </div>

                  {/* CODE SNIPPET (debug-c-program) */}
                  {task.codeSnippet && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-[#7A5060]">
                        <span className="font-mono font-bold text-[#8C2E47]">
                          {task.codeSnippet.filename}
                        </span>
                        <button
                          onClick={handleCopySnippet}
                          className="hover:text-[#9E3D58] flex items-center gap-1"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedSnippet ? 'Copied!' : 'Copy Code'}</span>
                        </button>
                      </div>
                      <pre className="bg-[#2D1822] text-[#FDE8EE] p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-80">
                        {task.codeSnippet.code}
                      </pre>
                    </div>
                  )}

                  {/* DATA SNIPPET (analyse-dataset) */}
                  {task.dataSnippet && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-[#7A5060] uppercase tracking-wider block">
                        Observed Service Metrics Table
                      </span>
                      <div className="border border-[#ECCCD5] rounded-xl overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#FFF5F8] border-b border-[#ECCCD5] text-[#8C2E47]">
                            <tr>
                              {task.dataSnippet.headers.map((h, i) => (
                                <th key={i} className="p-2.5 font-bold whitespace-nowrap">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#F2D7DE]">
                            {task.dataSnippet.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-[#FFF8FA]">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-2.5 whitespace-nowrap text-[#2D1822] font-mono text-[11px]">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* CLIENT MESSAGE (client-bug-response) */}
                  {task.clientMessage && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-[#7A5060] uppercase tracking-wider block">
                        Incoming Stakeholder Email
                      </span>
                      <div className="bg-[#FFF8FA] border border-[#ECCCD5] rounded-xl p-4 space-y-2">
                        <div className="text-xs text-[#5C3B48] border-b border-[#F2D7DE] pb-2 space-y-0.5">
                          <div>From: <strong>{task.clientMessage.from}</strong></div>
                          <div>Subject: <strong>{task.clientMessage.subject}</strong></div>
                          <div>Time: {task.clientMessage.timestamp}</div>
                        </div>
                        <p className="text-xs text-[#2D1822] whitespace-pre-line leading-relaxed">
                          {task.clientMessage.body}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* INSTRUCTIONS */}
                  <div className="space-y-2 pt-2 border-t border-[#F2D7DE]">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#9E3D58]">
                      Instructions & Deliverables
                    </h3>
                    <ul className="text-xs text-[#2D1822] space-y-1.5 list-disc pl-4">
                      {task.instructions.map((ins, i) => (
                        <li key={i}>{ins}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 2: RUBRIC */}
              {activeTab === 'rubric' && (
                <div className="bg-[#FFFFFF] border border-[#ECCCD5] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#9E3D58]">
                      Evaluation Rubric (Criterion Scale 0-4)
                    </h2>
                    <p className="text-xs text-[#7A5060]">
                      Reviewers rate each criterion based on verified evidence in your solution.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {task.rubric.map((r) => (
                      <div key={r.id} className="bg-[#FFF8FA] border border-[#ECCCD5] p-3.5 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#2D1822]">{r.criterion}</span>
                          <span className="font-mono text-[#8C2E47] text-[11px] capitalize">Pillar: {r.pillar}</span>
                        </div>
                        <p className="text-xs text-[#5C3B48]">{r.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: HINTS */}
              {activeTab === 'hints' && (
                <div className="bg-[#FFFFFF] border border-[#ECCCD5] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#9E3D58]">
                      Senior Engineer Guidance & Framing
                    </h2>
                    <p className="text-xs text-[#7A5060]">
                      Heuristics used by seasoned staff engineers to reason through this situation.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {task.hints.map((hint, idx) => (
                      <div key={idx} className="bg-[#FFF8FA] border border-[#ECCCD5] p-3 rounded-xl flex items-start gap-2.5 text-xs text-[#2D1822]">
                        <span className="w-5 h-5 rounded-full bg-[#FFF0F4] border border-[#ECC2CE] text-[#9E3D58] font-bold flex items-center justify-center shrink-0 text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{hint}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: CANDIDATE ANSWER INPUT (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#FFFFFF] border border-[#ECCCD5] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#9E3D58]">
                    Your Workplace Response
                  </h2>
                  <button
                    type="button"
                    onClick={handleInsertOutline}
                    className="text-xs text-[#8C2E47] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Insert Answer Outline</span>
                  </button>
                </div>

                <form onSubmit={handleSubmitMainAnswer} className="space-y-3">
                  <textarea
                    ref={textareaRef}
                    rows={16}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onPaste={onPaste}
                    onBeforeInput={onBeforeInput}
                    placeholder="Type or format your complete solution here..."
                    className="w-full bg-[#FFF8FA] border border-[#ECCCD5] focus:border-[#9E3D58] rounded-xl p-3.5 text-xs font-mono text-[#2D1822] focus:outline-none focus:ring-1 focus:ring-[#9E3D58]"
                  />

                  {errorMessage && (
                    <div className="text-xs text-red-600 font-medium">
                      {errorMessage}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-[#7A5060]">
                    <span>
                      {answer.length} chars (min 40)
                    </span>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-[#9E3D58] hover:bg-[#862E45] text-white font-semibold px-4 py-2 rounded-xl text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submitting ? 'Submitting...' : 'Submit to Reviewer'}</span>
                    </button>
                  </div>
                </form>

                <div className="text-[11px] text-[#7A5060] border-t border-[#F2D7DE] pt-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#9E3D58]" />
                  <span>
                    Your solution will be evaluated against the rubric, followed by a simulated workplace interaction.
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
