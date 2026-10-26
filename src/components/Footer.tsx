import React from 'react';
import { Page } from '../types';
import { ShieldCheck, Info, Award, ArrowUpRight, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#FAF0F3] text-[#694654] border-t border-[#ECCCD5] text-sm">
      {/* Demo Notice Banner with Vintage Pink Styling */}
      <div className="bg-[#FFF4F7] border-b border-[#ECCCD5] py-3.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#7E2940]">
            <Info className="w-4 h-4 shrink-0 text-[#9E3D58]" />
            <span>
              <strong>Simulation Notice:</strong> All rubric evaluations, benchmark percentiles, and scores currently reflect demonstration rubrics.
            </span>
          </div>
          <span className="text-[#874154] text-[11px] bg-[#FCE8EE] px-3 py-1 rounded-full border border-[#ECC2CE] font-mono font-medium">
            Automated Semantic AI Engine: Roadmap V2
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#9E3D58] to-[#78283E] flex items-center justify-center font-serif font-bold text-white text-lg border border-[#FCE2E9] shadow-sm">
                B
              </div>
              <span className="font-serif font-bold text-2xl text-[#2D1822] tracking-tight">
                Beyond the Resume
              </span>
            </div>
            <p className="text-[#9E3D58] font-serif italic text-base">
              Show your skills. Don't just list them.
            </p>
            <p className="text-[#694654] text-xs leading-relaxed max-w-md">
              A workplace simulation platform designed for college students—especially from tier-2 and tier-3 engineering institutions—to validate practical software engineering skills, debug real systems, and earn an evidence-backed Skill Passport.
            </p>
            <div className="flex items-center gap-2 text-xs pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF5F8] border border-[#ECCCD5] text-[#8C2E47] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#9E3D58]" />
                Evidence-Based Readiness
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF5F8] border border-[#ECCCD5] text-[#5C3B48]">
                <Award className="w-3.5 h-3.5 text-[#B87D43]" />
                Junior Developer Track
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-serif font-bold text-[#2D1822] uppercase tracking-wider mb-3">
              Platform Pages
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('landing')}
                  className="hover:text-[#9E3D58] transition-colors"
                >
                  Landing Page
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-[#9E3D58] transition-colors"
                >
                  Student Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('tasks')}
                  className="hover:text-[#9E3D58] transition-colors"
                >
                  Workplace Tasks (3 Scenarios)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('passport')}
                  className="hover:text-[#9E3D58] transition-colors"
                >
                  Skill Passport & Rubrics
                </button>
              </li>
            </ul>
          </div>

          {/* Assessment Modules */}
          <div>
            <h4 className="text-xs font-serif font-bold text-[#2D1822] uppercase tracking-wider mb-3">
              Simulations
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between text-[#694654]">
                <span>C Memory & Pointer Debug</span>
                <span className="text-[10px] text-[#9E3D58] font-mono">20m</span>
              </li>
              <li className="flex items-center justify-between text-[#694654]">
                <span>API Latency Spike Analysis</span>
                <span className="text-[10px] text-[#9E3D58] font-mono">25m</span>
              </li>
              <li className="flex items-center justify-between text-[#694654]">
                <span>Client Incident Triage</span>
                <span className="text-[10px] text-[#9E3D58] font-mono">15m</span>
              </li>
              <li className="pt-2">
                <button
                  onClick={() => onNavigate('tasks')}
                  className="text-[#9E3D58] hover:text-[#78283E] inline-flex items-center gap-1 font-semibold"
                >
                  Explore simulations <ArrowUpRight className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright and vintage stamp */}
        <div className="pt-8 border-t border-[#ECCCD5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#876472]">
          <p className="flex items-center gap-1">
            © {new Date().getFullYear()} Beyond the Resume. Handcrafted for aspiring engineers.
          </p>
          <div className="flex items-center gap-4">
            <span className="hover:text-[#2D1822]">Merit-First Hiring</span>
            <span>•</span>
            <span className="hover:text-[#2D1822]">No Pedigree Bias</span>
            <span>•</span>
            <span className="hover:text-[#2D1822]">Free Student Access</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
