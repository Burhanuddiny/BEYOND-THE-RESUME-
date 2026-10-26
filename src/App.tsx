/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import type { Page } from './types';
import { PUBLIC_TASKS, getPublicTask } from '../shared/tasks/index.ts';
import { useMe } from './lib/useMe.ts';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { TasksPage } from './pages/TasksPage.tsx';
import { AssessmentPage } from './pages/AssessmentPage.tsx';
import { SkillPassportPage } from './pages/SkillPassportPage.tsx';
import { PublicPassportPage } from './pages/PublicPassportPage.tsx';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [selectedTaskId, setSelectedTaskId] = useState<string>(PUBLIC_TASKS[0].id);
  const [publicPassportId, setPublicPassportId] = useState<string | null>(null);

  const { data: me, refresh: refreshMe } = useMe();

  // Handle URL path initialization and browser back/forward
  useEffect(() => {
    const handleLocation = () => {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/p/')) {
        const id = pathname.slice(3).trim();
        if (id) {
          setPublicPassportId(id);
          setCurrentPage('public_passport');
          return;
        }
      }
      if (pathname === '/dashboard') {
        setCurrentPage('dashboard');
      } else if (pathname === '/tasks') {
        setCurrentPage('tasks');
      } else if (pathname === '/passport') {
        setCurrentPage('passport');
      } else if (pathname === '/assessment') {
        setCurrentPage('assessment');
      } else {
        setCurrentPage('landing');
      }
    };

    handleLocation();
    window.addEventListener('popstate', handleLocation);
    return () => window.removeEventListener('popstate', handleLocation);
  }, []);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setPublicPassportId(null);
    let targetPath = '/';
    if (page === 'dashboard') targetPath = '/dashboard';
    else if (page === 'tasks') targetPath = '/tasks';
    else if (page === 'passport') targetPath = '/passport';
    else if (page === 'assessment') targetPath = '/assessment';
    window.history.pushState({}, '', targetPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setCurrentPage('assessment');
    window.history.pushState({}, '', '/assessment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentTask = getPublicTask(selectedTaskId) || PUBLIC_TASKS[0];
  const completedCount = me?.passport?.coverage?.completed ?? 0;

  // Recruiter Public Passport View
  if (currentPage === 'public_passport' && publicPassportId) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF0F3] text-[#2D1822] selection:bg-[#FCE8EE] selection:text-[#8C2E47] font-sans">
        <main className="flex-1">
          <PublicPassportPage
            passportId={publicPassportId}
            onGoHome={() => handleNavigate('landing')}
          />
        </main>
        <Footer onNavigate={handleNavigate} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF0F3] text-[#2D1822] selection:bg-[#FCE8EE] selection:text-[#8C2E47] font-sans">
      {/* Universal Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        completedTasksCount={completedCount}
        targetRole={me?.profile?.targetRole}
        studentName={me?.profile?.displayName}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {currentPage === 'landing' && (
          <LandingPage
            onNavigate={handleNavigate}
            onSelectTask={handleSelectTask}
          />
        )}
        {currentPage === 'dashboard' && (
          <DashboardPage
            onNavigate={handleNavigate}
            onSelectTask={handleSelectTask}
          />
        )}
        {currentPage === 'tasks' && (
          <TasksPage
            onNavigate={handleNavigate}
            onSelectTask={handleSelectTask}
          />
        )}
        {currentPage === 'assessment' && (
          <AssessmentPage
            key={currentTask.id}
            task={currentTask}
            allTasks={PUBLIC_TASKS}
            onSelectTask={handleSelectTask}
            onNavigate={handleNavigate}
            onTaskCompleted={refreshMe}
          />
        )}
        {currentPage === 'passport' && (
          <SkillPassportPage
            onNavigate={handleNavigate}
            onSelectTask={handleSelectTask}
          />
        )}
      </main>

      {/* Universal Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
