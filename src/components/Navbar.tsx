import React, { useState } from 'react';
import { Page } from '../types';
import {
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Award,
  BookMarked
} from 'lucide-react';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  completedTasksCount: number;
  targetRole?: string;
  studentName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  completedTasksCount,
  targetRole,
  studentName,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'landing' as Page, label: 'Home' },
    { id: 'dashboard' as Page, label: 'Student Dashboard' },
    { id: 'tasks' as Page, label: 'Workplace Tasks' },
    { id: 'passport' as Page, label: 'Skill Passport' },
  ];

  const handleNavClick = (page: Page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FFF7F9]/95 backdrop-blur-md border-b border-[#ECCCD5] text-[#2D1822] shadow-[0_2px_15px_-3px_rgba(164,66,96,0.07)]">
      {/* Top vintage banner */}
      <div className="bg-gradient-to-r from-[#FCE8EE] via-[#F8D7E0] to-[#FCE8EE] border-b border-[#ECC2CE] px-4 py-1.5 text-xs text-center text-[#73293D] font-medium tracking-wide">
        <span className="font-semibold text-[#8C2E47] mr-2">✦ Workplace Readiness Over Pedigree:</span>
        Empowering college students through authentic engineering simulations.
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo with Vintage Monogram */}
          <button
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9E3D58] to-[#78283E] flex items-center justify-center shadow-md shadow-[#9E3D58]/25 text-[#FFF2F5] font-serif font-bold text-xl border-2 border-[#FCE2E9]">
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-xl tracking-tight text-[#2D1822] group-hover:text-[#9E3D58] transition-colors">
                  Beyond the Resume
                </span>
                <span className="hidden sm:inline-flex text-[10px] font-sans font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#FCE8EE] text-[#8C2E47] border border-[#E8B8C6]">
                  Tier-2/3 Edition
                </span>
              </div>
              <p className="text-[11px] text-[#7E5766] font-medium hidden md:block italic">
                Show your skills. Don't just list them.
              </p>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${
                    isActive
                      ? 'bg-[#9E3D58] text-[#FFF7F9] shadow-sm shadow-[#9E3D58]/20'
                      : 'text-[#5C3B48] hover:text-[#2D1822] hover:bg-[#FCE8EE]/70'
                  }`}
                >
                  {item.label}
                  {item.id === 'passport' && (
                    <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-[#D67C94]"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Primary Action & Status */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-xs text-[#734E5D] bg-[#FFF0F4] border border-[#ECCCD5] px-3.5 py-1.5 rounded-full shadow-inner">
              <span className="w-2 h-2 rounded-full bg-[#9E3D58] animate-pulse"></span>
              <span>Role: <strong className="text-[#381B27]">{targetRole || 'Jr. Software Dev'}</strong></span>
              <span className="text-[#ECCCD5]">|</span>
              <span className="text-[#9E3D58] font-bold">{completedTasksCount}/3 Tasks</span>
            </div>

            <button
              onClick={() => handleNavClick('tasks')}
              className="inline-flex items-center gap-2 bg-[#9E3D58] hover:bg-[#862E45] text-[#FFF9FA] font-sans font-semibold text-xs tracking-wider uppercase px-4 py-2.5 rounded-xl shadow-md shadow-[#9E3D58]/20 transition-all transform hover:-translate-y-0.5 focus:outline-none border border-[#862E45]"
            >
              <span>Start Assessment</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#FFF9FA]" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => handleNavClick('tasks')}
              className="bg-[#9E3D58] text-[#FFF9FA] font-semibold text-xs px-2.5 py-1.5 rounded-lg"
            >
              Start
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#5C3B48] hover:text-[#2D1822] hover:bg-[#FCE8EE] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#ECCCD5] bg-[#FFF8FA] px-4 pt-3 pb-5 space-y-2">
          <div className="px-3 py-2 rounded-xl bg-[#FCE8EE] border border-[#ECC2CE] text-xs text-[#73293D] mb-2 font-medium">
            Track: <strong className="text-[#9E3D58]">Junior Software Developer</strong> • {completedTasksCount}/3 Done
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium ${
                currentPage === item.id
                  ? 'bg-[#9E3D58] text-white font-semibold'
                  : 'text-[#4A2B37] hover:bg-[#FCE8EE]'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2">
            <button
              onClick={() => handleNavClick('tasks')}
              className="w-full flex items-center justify-center gap-2 bg-[#9E3D58] text-white font-bold py-2.5 rounded-xl text-sm shadow"
            >
              <span>Go to Workplace Tasks</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
