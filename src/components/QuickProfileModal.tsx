import React, { useState } from 'react';
import type { Profile } from '../../shared/types.ts';
import { updateProfile } from '../lib/api.ts';
import {
  X,
  User,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Sparkles,
  Check,
  Building,
  Calendar,
} from 'lucide-react';

interface QuickProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  onProfileUpdated: () => void;
}

const EDUCATION_LEVELS = [
  'Undergraduate (B.Tech / B.E. / B.S.)',
  'Postgraduate (M.Tech / M.S. / MCA)',
  'Diploma / Polytechnic',
  'Self-taught / Bootcamp Graduate',
];

const TARGET_ROLES = [
  'Junior Software Developer',
  'Backend Systems Engineer',
  'Full Stack Developer',
  'Cloud & DevOps Engineer',
  'Data / Analytics Engineer',
];

const EXPERIENCE_LEVELS = [
  'Student (No Prior Internships)',
  '1 Internship Completed',
  'Open Source & Freelance Contributor',
  '1-2 Years Early Career',
];

const SKILL_OPTIONS = [
  { id: 'c-memory', label: 'Memory Safety & C Debugging', task: 'debug-c-program' },
  { id: 'observability', label: 'Production Incident Triage', task: 'analyse-dataset' },
  { id: 'client-comms', label: 'Stakeholder Communication', task: 'client-bug-response' },
  { id: 'edge-cases', label: 'Edge-Case Reasoning & Boundaries' },
  { id: 'architecture', label: 'System Architecture & Caching' },
];

export const QuickProfileModal: React.FC<QuickProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
}) => {
  const [displayName, setDisplayName] = useState(profile.displayName || 'Aarav Patel');
  const [educationLevel, setEducationLevel] = useState(
    profile.educationLevel || 'Undergraduate (B.Tech / B.E. / B.S.)',
  );
  const [college, setCollege] = useState(profile.college || 'Dr. A.P.J. Abdul Kalam Technical University');
  const [degree, setDegree] = useState(profile.degree || 'Computer Science & Engineering');
  const [gradYear, setGradYear] = useState(profile.gradYear || 2026);
  const [targetRole, setTargetRole] = useState(profile.targetRole || 'Junior Software Developer');
  const [experienceLevel, setExperienceLevel] = useState(
    profile.experienceLevel || 'Student (No Prior Internships)',
  );
  const [skillsToImprove, setSkillsToImprove] = useState<string[]>(
    profile.skillsToImprove && profile.skillsToImprove.length > 0
      ? profile.skillsToImprove
      : ['Memory Safety & C Debugging', 'Production Incident Triage', 'Stakeholder Communication'],
  );

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSkill = (skillLabel: string) => {
    setSkillsToImprove((prev) =>
      prev.includes(skillLabel)
        ? prev.filter((s) => s !== skillLabel)
        : [...prev, skillLabel],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMessage('Please provide your name.');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage(null);

      await updateProfile({
        displayName: displayName.trim(),
        educationLevel,
        college: college.trim() || 'Engineering Institute',
        degree: degree.trim() || 'Computer Science',
        gradYear: Number(gradYear) || 2026,
        targetRole,
        experienceLevel,
        skillsToImprove,
      });

      onProfileUpdated();
      onClose();
    } catch {
      setErrorMessage('Failed to save profile changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#2D1822]/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#FFFFFF] border-2 border-[#ECCCD5] rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-[#FFF5F8] via-[#FAF0F3] to-[#FCE8EE] p-5 sm:p-6 border-b border-[#ECCCD5] flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#9E3D58] text-white flex items-center justify-center shadow-md shadow-[#9E3D58]/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2D1822]">
                Personalize Your Simulation Profile
              </h2>
              <p className="text-xs text-[#7A5060]">
                Customize your career goals & focus skills instantly — no lengthy registration or password required.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#7A5060] hover:text-[#2D1822] hover:bg-[#FFF0F4] rounded-xl transition-colors"
            aria-label="Close profile modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* SECTION 1: NAME & EDUCATION LEVEL */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9E3D58]">
              <User className="w-4 h-4" />
              <span>1. Name & Education Background</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#5C3B48] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Aarav Patel"
                  className="w-full bg-[#FFF8FA] border border-[#ECCCD5] focus:border-[#9E3D58] rounded-xl px-3.5 py-2 text-xs text-[#2D1822] focus:outline-none focus:ring-1 focus:ring-[#9E3D58]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C3B48] mb-1">
                  College / University
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. Dr. A.P.J. Abdul Kalam Technical University"
                  className="w-full bg-[#FFF8FA] border border-[#ECCCD5] focus:border-[#9E3D58] rounded-xl px-3.5 py-2 text-xs text-[#2D1822] focus:outline-none focus:ring-1 focus:ring-[#9E3D58]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C3B48] mb-1">
                  Degree / Major
                </label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. B.Tech Computer Science"
                  className="w-full bg-[#FFF8FA] border border-[#ECCCD5] focus:border-[#9E3D58] rounded-xl px-3.5 py-2 text-xs text-[#2D1822] focus:outline-none focus:ring-1 focus:ring-[#9E3D58]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C3B48] mb-1">
                  Graduation Year
                </label>
                <input
                  type="number"
                  min="2020"
                  max="2035"
                  value={gradYear}
                  onChange={(e) => setGradYear(Number(e.target.value))}
                  className="w-full bg-[#FFF8FA] border border-[#ECCCD5] focus:border-[#9E3D58] rounded-xl px-3.5 py-2 text-xs text-[#2D1822] focus:outline-none focus:ring-1 focus:ring-[#9E3D58]"
                  required
                />
              </div>
            </div>

            {/* Education Level Chips */}
            <div className="pt-1">
              <label className="block text-xs font-semibold text-[#5C3B48] mb-1.5">
                Current Education Level
              </label>
              <div className="flex flex-wrap gap-2">
                {EDUCATION_LEVELS.map((level) => {
                  const isSelected = educationLevel === level;
                  return (
                    <button
                      type="button"
                      key={level}
                      onClick={() => setEducationLevel(level)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all text-left flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#9E3D58] text-white shadow-sm border border-[#7D263B]'
                          : 'bg-[#FFF8FA] text-[#5C3B48] hover:bg-[#FCE8EE] border border-[#ECCCD5]'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{level}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 2: TARGET CAREER ROLE */}
          <div className="space-y-2.5 pt-3 border-t border-[#F2D7DE]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9E3D58]">
              <Briefcase className="w-4 h-4" />
              <span>2. Target Career Role</span>
            </div>
            <p className="text-xs text-[#7A5060]">
              We customize simulation briefs and passport badges to match your desired job trajectory.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {TARGET_ROLES.map((role) => {
                const isSelected = targetRole === role;
                return (
                  <button
                    type="button"
                    key={role}
                    onClick={() => setTargetRole(role)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#9E3D58] text-white shadow-sm border border-[#7D263B]'
                        : 'bg-[#FFF8FA] text-[#5C3B48] hover:bg-[#FCE8EE] border border-[#ECCCD5]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{role}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: CURRENT EXPERIENCE LEVEL */}
          <div className="space-y-2.5 pt-3 border-t border-[#F2D7DE]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9E3D58]">
              <TrendingUp className="w-4 h-4" />
              <span>3. Current Practical Experience</span>
            </div>
            <p className="text-xs text-[#7A5060]">
              Used to contextualize senior engineer mentoring heuristics and review expectations.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {EXPERIENCE_LEVELS.map((exp) => {
                const isSelected = experienceLevel === exp;
                return (
                  <button
                    type="button"
                    key={exp}
                    onClick={() => setExperienceLevel(exp)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#9E3D58] text-white shadow-sm border border-[#7D263B]'
                        : 'bg-[#FFF8FA] text-[#5C3B48] hover:bg-[#FCE8EE] border border-[#ECCCD5]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{exp}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: SKILLS THE STUDENT WANTS TO IMPROVE */}
          <div className="space-y-2.5 pt-3 border-t border-[#F2D7DE]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9E3D58]">
                <Sparkles className="w-4 h-4" />
                <span>4. Skills You Want to Focus & Prove</span>
              </div>
              <span className="text-[11px] text-[#7A5060]">
                {skillsToImprove.length} selected
              </span>
            </div>
            <p className="text-xs text-[#7A5060]">
              Select competencies you want to strengthen. These will be highlighted on your dashboard task recommendations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {SKILL_OPTIONS.map((skill) => {
                const isSelected = skillsToImprove.includes(skill.label);
                return (
                  <div
                    key={skill.id}
                    onClick={() => toggleSkill(skill.label)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#FFF0F4] border-[#9E3D58] text-[#8C2E47] font-semibold shadow-xs'
                        : 'bg-[#FFF8FA] border-[#ECCCD5] text-[#5C3B48] hover:bg-[#FCE8EE]'
                    }`}
                  >
                    <span>{skill.label}</span>
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                        isSelected
                          ? 'bg-[#9E3D58] border-[#9E3D58] text-white'
                          : 'border-[#ECCCD5] bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {errorMessage && (
            <div className="text-xs text-red-600 font-medium">
              {errorMessage}
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="pt-4 border-t border-[#F2D7DE] flex items-center justify-between">
            <span className="text-[11px] text-[#7A5060]">
              Profile updates instantly and persists across simulation attempts.
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5C3B48] hover:bg-[#FFF0F4] border border-[#ECCCD5] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider bg-[#9E3D58] hover:bg-[#862E45] text-white shadow-sm transition-colors border border-[#7D263B]"
              >
                {saving ? 'Saving...' : 'Save & Personalize'}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
