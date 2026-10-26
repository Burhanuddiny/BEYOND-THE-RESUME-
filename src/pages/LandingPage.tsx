import React from 'react';
import { Page } from '../types';
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Code2,
  BarChart3,
  MessageSquare,
  ShieldCheck,
  Target,
  Sparkles,
  ChevronRight,
  Layers,
  Award,
  Bookmark,
  Feather
} from 'lucide-react';
import { PUBLIC_TASKS } from '../../shared/tasks/index.ts';

interface LandingPageProps {
  onNavigate: (page: Page) => void;
  onSelectTask: (taskId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSelectTask }) => {
  return (
    <div className="bg-[#FAF0F3] text-[#2D1822] min-h-screen">
      {/* VINTAGE HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-[#ECCCD5] bg-gradient-to-b from-[#FFF5F8] via-[#FAF0F3] to-[#FCECEF]">
        {/* Subtle vintage paper grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#D996A8_0.8px,transparent_0.8px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[650px] h-[340px] bg-[#F7C5D2]/35 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Vintage Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF0F4] border border-[#E5B5C3] text-[#8C2E47] text-xs font-semibold tracking-wider uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#9E3D58]" />
              <span>Show your skills. Don't just list them.</span>
            </div>

            {/* Main Headline in Vintage Editorial Serif */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-[#2D1822] leading-tight">
              Your resume tells them what you know.{' '}
              <span className="italic font-normal block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-[#9E3D58] via-[#B54A66] to-[#80253B]">
                Prove what you can do.
              </span>
            </h1>

            {/* Problem Subheading */}
            <p className="text-base sm:text-xl text-[#5C3B48] leading-relaxed font-normal max-w-2xl mx-auto">
              College students, especially from tier-2 and tier-3 colleges, get filtered out by automated ATS scanners before ever writing a line of code. Beyond the Resume offers authentic workplace simulations to demonstrate your practical engineering capability.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => onNavigate('tasks')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#9E3D58] hover:bg-[#862E45] text-[#FFF9FA] font-sans font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-[#9E3D58]/25 transition-all transform hover:-translate-y-0.5 text-sm tracking-wider uppercase border border-[#7D263B]"
              >
                <span>Start My Assessment</span>
                <ArrowRight className="w-4 h-4 text-[#FFF9FA]" />
              </button>

              <button
                onClick={() => onNavigate('dashboard')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FFFFFF] hover:bg-[#FFF4F7] text-[#4A2936] border border-[#ECCCD5] font-semibold px-6 py-3.5 rounded-xl transition-colors text-sm shadow-sm"
              >
                <span>View Student Dashboard</span>
                <ChevronRight className="w-4 h-4 text-[#8C5263]" />
              </button>
            </div>

            {/* Reassurance pills */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[#6B4655]">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#9E3D58]" />
                No ATS keyword filtering
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#9E3D58]" />
                Authentic workplace scenarios
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#9E3D58]" />
                Evidence-backed Skill Passport
              </span>
            </div>
          </div>

          {/* Aesthetic Vintage Simulation Preview Showcase Card */}
          <div className="mt-14 max-w-4xl mx-auto bg-[#FFFFFF] border border-[#ECCCD5] rounded-2xl p-5 sm:p-7 shadow-[0_8px_30px_-5px_rgba(158,61,88,0.1)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F2D7DE] gap-3">
              <div className="flex items-center gap-3">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#E5899F]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#D6A16B]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#8EAF9D]"></div>
                </div>
                <span className="text-xs font-mono text-[#7D5262]">
                  simulation://workplace-task/junior-dev/core-debugging
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-[#FCE8EE] text-[#8C2E47] border border-[#ECC2CE] px-3 py-0.5 rounded-full font-serif font-medium">
                  ✦ Workplace Simulation
                </span>
                <span className="text-xs text-[#7A5060]">Track: Junior Software Engineer</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
              <button
                onClick={() => onSelectTask('debug-c-program')}
                className="text-left p-4 rounded-xl bg-[#FFF8FA] hover:bg-[#FFF0F4] border border-[#F2D4DD] hover:border-[#D68EA1] transition-all group shadow-sm focus:outline-none"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-[#9E3D58] font-serif font-bold text-base">
                    <Code2 className="w-4 h-4" />
                    <span>Real Codebase Bugs</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#9E3D58] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-[#613E4D] leading-relaxed">
                  Spot memory leaks, pointer bugs, and off-by-one errors in real C systems.
                </p>
                <div className="mt-2 text-[11px] font-semibold text-[#8C2E47]">
                  Start C Simulation →
                </div>
              </button>

              <button
                onClick={() => onSelectTask('analyse-dataset')}
                className="text-left p-4 rounded-xl bg-[#FFF8FA] hover:bg-[#FFF0F4] border border-[#F2D4DD] hover:border-[#D68EA1] transition-all group shadow-sm focus:outline-none"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-[#9E3D58] font-serif font-bold text-base">
                    <BarChart3 className="w-4 h-4" />
                    <span>Production Metrics</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#9E3D58] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-[#613E4D] leading-relaxed">
                  Analyze latency spikes, DB pool saturation, and articulate findings clearly.
                </p>
                <div className="mt-2 text-[11px] font-semibold text-[#8C2E47]">
                  Start Data Simulation →
                </div>
              </button>

              <button
                onClick={() => onSelectTask('client-bug-response')}
                className="text-left p-4 rounded-xl bg-[#FFF8FA] hover:bg-[#FFF0F4] border border-[#F2D4DD] hover:border-[#D68EA1] transition-all group shadow-sm focus:outline-none"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-[#9E3D58] font-serif font-bold text-base">
                    <MessageSquare className="w-4 h-4" />
                    <span>Stakeholder Triage</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#9E3D58] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-[#613E4D] leading-relaxed">
                  Respond to critical client escalations with calm composure and clear SLA timelines.
                </p>
                <div className="mt-2 text-[11px] font-semibold text-[#8C2E47]">
                  Start Triage Simulation →
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* THE PROBLEM SECTION */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold text-[#9E3D58] uppercase tracking-widest bg-[#FCE8EE] px-3 py-1 rounded-full border border-[#ECC2CE]">
            The College Hiring Reality
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#2D1822] mt-4 mb-4">
            Why Tier-2 & Tier-3 Students Get Overlooked
          </h2>
          <p className="text-[#5C3B48] text-sm sm:text-base leading-relaxed">
            Talent is everywhere, but opportunity is heavily gated by automated resume filtering.
            Here is the fundamental gap in today's entry-level recruitment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1 */}
          <div className="bg-[#FFFFFF] border border-[#ECCCD5] p-6 sm:p-7 rounded-2xl shadow-sm hover:border-[#DDA5B5] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#FCE8EE] border border-[#ECC2CE] flex items-center justify-center text-[#9E3D58] mb-5">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#2D1822] mb-2">
              The Keyword & Pedigree Trap
            </h3>
            <p className="text-xs sm:text-sm text-[#5C3B48] leading-relaxed">
              Recruiters receive 2,000+ applicants for a single junior vacancy. ATS algorithms automatically screen out resumes that lack elite college brand names or exact buzzwords, regardless of actual engineering competence.
            </p>
            <div className="mt-4 pt-4 border-t border-[#F2D7DE] text-xs text-[#8C2E47] font-medium italic">
              Over 70% of capable students are rejected before an engineer ever reads their work.
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#FFFFFF] border border-[#ECCCD5] p-6 sm:p-7 rounded-2xl shadow-sm hover:border-[#DDA5B5] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#FFF0E8] border border-[#F2D0C2] flex items-center justify-center text-[#C25828] mb-5">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#2D1822] mb-2">
              Textbook Theory vs. Day-1 Workplace
            </h3>
            <p className="text-xs sm:text-sm text-[#5C3B48] leading-relaxed">
              College syllabi test syntax memorization and textbook definitions. But on your first day at work, nobody asks you to write binary search on a whiteboard—they hand you a broken service and an angry client email.
            </p>
            <div className="mt-4 pt-4 border-t border-[#F2D7DE] text-xs text-[#A84518] font-medium italic">
              Hiring managers want proof of real debugging, edge-case vigilance, and clear communication.
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#FFFFFF] border border-[#ECCCD5] p-6 sm:p-7 rounded-2xl shadow-sm hover:border-[#DDA5B5] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#FCE8EE] border border-[#ECC2CE] flex items-center justify-center text-[#9E3D58] mb-5">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#2D1822] mb-2">
              Claims vs. Audited Evidence
            </h3>
            <p className="text-xs sm:text-sm text-[#5C3B48] leading-relaxed">
              Every resume looks identical: "Proficient in Python, C++, SQL, Git". Recruiters have learned to discount these claims. A verifiable Skill Passport backed by scored workplace simulations proves what you can actually deliver.
            </p>
            <div className="mt-4 pt-4 border-t border-[#F2D7DE] text-xs text-[#8C2E47] font-medium italic">
              Turn unsubstantiated claims into an indisputable portfolio of workplace readiness.
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS IN THREE STEPS */}
      <section className="py-16 sm:py-24 bg-[#FFF5F8] border-y border-[#ECCCD5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#9E3D58] uppercase tracking-widest bg-[#FCE8EE] px-3 py-1 rounded-full border border-[#ECC2CE]">
              Simple, Practical, Action-Oriented
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#2D1822] mt-4 mb-4">
              How Beyond the Resume Works in 3 Steps
            </h2>
            <p className="text-[#5C3B48] text-sm sm:text-base leading-relaxed">
              No generic questionnaires. Complete realistic workplace challenges designed to mirror day-1 job responsibilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-[#FFFFFF] border border-[#ECCCD5] rounded-2xl p-7 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-3xl font-serif font-bold text-[#9E3D58]">01</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FCE8EE] text-[#8C2E47] border border-[#ECC2CE]">
                    Step 1: Selection
                  </span>
                </div>
                <h3 className="text-xl font-serif font-bold text-[#2D1822] mb-2">
                  Pick a Workplace Task
                </h3>
                <p className="text-xs sm:text-sm text-[#5C3B48] leading-relaxed">
                  Select a simulation from our Junior Developer track: debug an unstable C buffer, interpret production metric logs during an outage, or draft a professional incident response to a client.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F2D7DE] text-xs text-[#9E3D58] font-medium flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Targeted at core software competencies
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#FFFFFF] border border-[#ECCCD5] rounded-2xl p-7 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-3xl font-serif font-bold text-[#9E3D58]">02</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FCE8EE] text-[#8C2E47] border border-[#ECC2CE]">
                    Step 2: Simulation
                  </span>
                </div>
                <h3 className="text-xl font-serif font-bold text-[#2D1822] mb-2">
                  Solve the Workplace Challenge
                </h3>
                <p className="text-xs sm:text-sm text-[#5C3B48] leading-relaxed">
                  Inspect the source code or data table, reason through the system constraints, handle edge cases, and submit your structured solution through the built-in engineering console.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F2D7DE] text-xs text-[#9E3D58] font-medium flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" />
                Demonstrates real day-to-day work
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#FFFFFF] border border-[#ECCCD5] rounded-2xl p-7 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-3xl font-serif font-bold text-[#9E3D58]">03</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FCE8EE] text-[#8C2E47] border border-[#ECC2CE]">
                    Step 3: Verification
                  </span>
                </div>
                <h3 className="text-xl font-serif font-bold text-[#2D1822] mb-2">
                  Build Your Skill Passport
                </h3>
                <p className="text-xs sm:text-sm text-[#5C3B48] leading-relaxed">
                  Review actionable rubric feedback across technical correctness, problem-solving, edge cases, and communication. Your completed simulations build an evidence-backed Skill Passport you can share.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F2D7DE] text-xs text-[#9E3D58] font-medium flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                Verifiable proof for recruiters & leads
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => onNavigate('tasks')}
              className="inline-flex items-center gap-2 bg-[#9E3D58] hover:bg-[#862E45] text-white font-semibold px-7 py-3 rounded-xl transition-all shadow-md text-xs uppercase tracking-wider border border-[#7D263B]"
            >
              <span>Explore The 3 Sample Workplace Tasks</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-[#9E3D58] uppercase tracking-widest bg-[#FCE8EE] px-3 py-1 rounded-full border border-[#ECC2CE]">
            Why Practical Simulations Win
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#2D1822] mt-4 mb-4">
            The Benefits of Practical Skill Assessments
          </h2>
          <p className="text-[#5C3B48] text-sm sm:text-base leading-relaxed">
            Move away from rote memorization and show hiring managers the traits that actually predict on-the-job success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-[#FFFFFF] border border-[#ECCCD5] p-6 rounded-2xl flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#FCE8EE] text-[#9E3D58] flex items-center justify-center shrink-0 border border-[#ECC2CE]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#2D1822] mb-1">
                Level the Playing Field for Tier-2 & Tier-3 Colleges
              </h3>
              <p className="text-xs sm:text-sm text-[#5C3B48] leading-relaxed">
                When you share a verifiable Skill Passport with audited performance in pointer memory management and incident triage, recruiters judge you on proven execution rather than university ranking.
              </p>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#ECCCD5] p-6 rounded-2xl flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#FCE8EE] text-[#9E3D58] flex items-center justify-center shrink-0 border border-[#ECC2CE]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#2D1822] mb-1">
                Comprehensive 4-Pillar Evaluation
              </h3>
              <p className="text-xs sm:text-sm text-[#5C3B48] leading-relaxed">
                Coding interviews only check if code passes basic test cases. Beyond the Resume tests Technical Accuracy, Problem-Solving, Edge-Case Handling, and Workplace Communication.
              </p>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#ECCCD5] p-6 rounded-2xl flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#FCE8EE] text-[#9E3D58] flex items-center justify-center shrink-0 border border-[#ECC2CE]">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#2D1822] mb-1">
                Safe Environment to Make Early Mistakes
              </h3>
              <p className="text-xs sm:text-sm text-[#5C3B48] leading-relaxed">
                Discover your blind spots—like forgetting to deallocate heap memory or misdiagnosing connection pool saturation—in a low-pressure simulation before entering high-stakes hiring rounds.
              </p>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#ECCCD5] p-6 rounded-2xl flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#FCE8EE] text-[#9E3D58] flex items-center justify-center shrink-0 border border-[#ECC2CE]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#2D1822] mb-1">
                Actionable Feedback Tailored for Growth
              </h3>
              <p className="text-xs sm:text-sm text-[#5C3B48] leading-relaxed">
                Instead of a silent rejection email, receive specific breakdown notes highlighting what you did well and where you can sharpen your engineering instincts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WORKPLACE TASKS TEASER CARDS */}
      <section className="py-16 sm:py-20 bg-[#FFF5F8] border-t border-[#ECCCD5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold text-[#9E3D58] uppercase tracking-widest bg-[#FCE8EE] px-3 py-1 rounded-full border border-[#ECC2CE]">
                Hands-On Challenges
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2D1822] mt-2">
                Current Workplace Tasks
              </h2>
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs sm:text-sm font-semibold text-[#9E3D58] hover:text-[#78283E] inline-flex items-center gap-1.5"
            >
              <span>View all tasks and rubrics</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PUBLIC_TASKS.map((task) => (
              <div
                key={task.id}
                className="bg-[#FFFFFF] border border-[#ECCCD5] rounded-xl p-6 flex flex-col justify-between hover:border-[#D68EA1] transition-all group shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-mono text-[#9E3D58] font-bold">{task.code}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FFF0F4] text-[#8C2E47] border border-[#ECC2CE] text-[11px] font-medium">
                      {task.difficulty}
                    </span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#2D1822] group-hover:text-[#9E3D58] transition-colors mb-2">
                    {task.title}
                  </h3>
                  <p className="text-xs text-[#5C3B48] line-clamp-3 mb-4 leading-relaxed">
                    {task.objective}
                  </p>
                </div>
                <div className="pt-4 border-t border-[#F2D7DE] flex items-center justify-between text-xs">
                  <span className="text-[#7A5060]">{task.estimatedMinutes} mins est.</span>
                  <button
                    onClick={() => onSelectTask(task.id)}
                    className="font-semibold text-[#9E3D58] group-hover:text-[#78283E] inline-flex items-center gap-1"
                  >
                    <span>Start Task</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION BANNER */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#9E3D58] via-[#892E46] to-[#6E2235] border border-[#7D243A] rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-xl text-white">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-serif font-bold">
              Ready to replace guesswork with proof?
            </h2>
            <p className="text-[#FCE8EE] text-sm sm:text-base leading-relaxed">
              Join students who are stepping beyond the resume to showcase real workplace ability to engineering teams.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('tasks')}
                className="w-full sm:w-auto bg-[#FFFFFF] hover:bg-[#FFF5F8] text-[#8C2E47] font-sans font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider"
              >
                Start My Assessment
              </button>
              <button
                onClick={() => onNavigate('passport')}
                className="w-full sm:w-auto bg-[#83263E] hover:bg-[#721E33] text-white border border-[#B3526E] font-semibold px-6 py-3.5 rounded-xl transition-colors text-xs uppercase tracking-wider"
              >
                Inspect Sample Skill Passport
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
