import React, { useState } from 'react';
import type { Page } from '../types';
import { PUBLIC_TASKS } from '../../shared/tasks/index.ts';
import { useMe } from '../lib/useMe.ts';
import {
  Code2,
  Clock,
  ArrowRight,
  CheckCircle2,
  Terminal,
  Database,
  Mail,
  Filter,
  Sparkles,
} from 'lucide-react';

interface TasksPageProps {
  onNavigate: (page: Page) => void;
  onSelectTask: (taskId: string) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({
  onNavigate,
  onSelectTask,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'coding' | 'data' | 'communication'>('all');
  const { data: me } = useMe();

  const attempts = me?.attempts || [];
  const completedAttempts = attempts.filter((a) => a.status === 'complete' && a.result);
  const completedTaskIds = new Set(completedAttempts.map((a) => a.taskId));

  const filteredTasks = PUBLIC_TASKS.filter((task) => {
    if (selectedFilter === 'coding') return task.id === 'debug-c-program';
    if (selectedFilter === 'data') return task.id === 'analyse-dataset';
    if (selectedFilter === 'communication') return task.id === 'client-bug-response';
    return true;
  });

  const getTaskIcon = (taskId: string) => {
    switch (taskId) {
      case 'debug-c-program':
        return <Terminal className="w-6 h-6 text-[#9E3D58]" />;
      case 'analyse-dataset':
        return <Database className="w-6 h-6 text-[#9E3D58]" />;
      case 'client-bug-response':
        return <Mail className="w-6 h-6 text-[#9E3D58]" />;
      default:
        return <Code2 className="w-6 h-6 text-[#9E3D58]" />;
    }
  };

  return (
    <div className="bg-[#FAF0F3] text-[#2D1822] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* PAGE HEADER */}
        <div className="bg-[#FFFFFF] border border-[#ECCCD5] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FCE8EE] border border-[#ECC2CE] text-[#8C2E47] text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#9E3D58]" />
                <span>Junior Software Developer Track</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#2D1822]">
                Workplace Job Simulations
              </h1>
              <p className="text-sm text-[#5C3B48] max-w-2xl mt-1 leading-relaxed">
                Step into authentic engineering scenarios. Select a task below to read the system context, analyze the requirements, and submit your workplace solution.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-[#FFF8FA] border border-[#ECCCD5] p-3.5 rounded-2xl shadow-inner">
              <div className="text-right">
                <div className="text-xs text-[#7A5060] font-medium">Session Progress</div>
                <div className="text-sm font-serif font-bold text-[#2D1822]">
                  {completedTaskIds.size} of {PUBLIC_TASKS.length} Completed
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#FCE8EE] border border-[#ECC2CE] flex items-center justify-center font-serif font-bold text-[#8C2E47] text-base">
                {Math.round((completedTaskIds.size / PUBLIC_TASKS.length) * 100)}%
              </div>
            </div>
          </div>

          {/* FILTER PILLS */}
          <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-[#F2D7DE]">
            <span className="text-xs text-[#7A5060] mr-2 flex items-center gap-1 font-medium">
              <Filter className="w-3.5 h-3.5 text-[#9E3D58]" /> Filter by:
            </span>
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedFilter === 'all'
                  ? 'bg-[#9E3D58] text-white shadow-sm'
                  : 'bg-[#FFF8FA] text-[#5C3B48] hover:bg-[#FCE8EE] border border-[#ECCCD5]'
              }`}
            >
              All Tasks ({PUBLIC_TASKS.length})
            </button>
            <button
              onClick={() => setSelectedFilter('coding')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedFilter === 'coding'
                  ? 'bg-[#9E3D58] text-white shadow-sm'
                  : 'bg-[#FFF8FA] text-[#5C3B48] hover:bg-[#FCE8EE] border border-[#ECCCD5]'
              }`}
            >
              Systems & Core
            </button>
            <button
              onClick={() => setSelectedFilter('data')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedFilter === 'data'
                  ? 'bg-[#9E3D58] text-white shadow-sm'
                  : 'bg-[#FFF8FA] text-[#5C3B48] hover:bg-[#FCE8EE] border border-[#ECCCD5]'
              }`}
            >
              Data & Observability
            </button>
            <button
              onClick={() => setSelectedFilter('communication')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedFilter === 'communication'
                  ? 'bg-[#9E3D58] text-white shadow-sm'
                  : 'bg-[#FFF8FA] text-[#5C3B48] hover:bg-[#FCE8EE] border border-[#ECCCD5]'
              }`}
            >
              Client & Triage
            </button>
          </div>
        </div>

        {/* TASK CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredTasks.map((task) => {
            const isCompleted = completedTaskIds.has(task.id);
            const bestAttempt = completedAttempts
              .filter((a) => a.taskId === task.id)
              .sort((a, b) => (b.result?.overall ?? 0) - (a.result?.overall ?? 0))[0];

            return (
              <div
                key={task.id}
                className="bg-[#FFFFFF] border border-[#ECCCD5] rounded-2xl p-6 shadow-sm hover:border-[#9E3D58] transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-12 h-12 rounded-xl bg-[#FFF0F4] border border-[#ECC2CE] flex items-center justify-center">
                      {getTaskIcon(task.id)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-[#9E3D58] bg-[#FFF0F4] px-2 py-0.5 rounded border border-[#ECC2CE]">
                        {task.code}
                      </span>
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-[#2D6A2E] bg-[#EAF5EA] px-2 py-0.5 rounded-full border border-[#C5E3C5]">
                          <CheckCircle2 className="w-3 h-3" />
                          {bestAttempt?.result?.overall}/100
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-[#7A5060]">
                      {task.category} • {task.difficulty}
                    </div>
                    <h2 className="text-xl font-serif font-bold text-[#2D1822]">
                      {task.title}
                    </h2>
                    <p className="text-xs text-[#5C3B48] leading-relaxed">
                      {task.objective}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#F2D7DE] flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-[#7A5060]">
                    <Clock className="w-3.5 h-3.5 text-[#9E3D58]" />
                    {task.estimatedMinutes} mins
                  </span>

                  <button
                    onClick={() => onSelectTask(task.id)}
                    className="bg-[#9E3D58] hover:bg-[#862E45] text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>{isCompleted ? 'Review / Retake' : 'Begin Simulation'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
