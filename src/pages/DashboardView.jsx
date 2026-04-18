import React from 'react';
import Panel from '../components/Panel';
import SectionTitle from '../components/SectionTitle';
import MetricCard from '../components/MetricCard';
import AppButton from '../components/AppButton';
import { FolderKanban, CheckCircle, Clock, Users, ArrowRight, Bell, Calendar } from 'lucide-react';

const DashboardView = ({ overview, projects, currentUser, onRefresh }) => {
  if (!overview) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  const recentProjects = projects?.slice(0, 3) || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            欢迎回来，{currentUser?.name || '用户'}
          </h1>
          <p className="text-gray-400 mt-1">
            这是您的工作台概览 · {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <AppButton variant="secondary" onClick={onRefresh}>
          刷新数据
        </AppButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="项目总数"
          value={overview.totalProjects}
          change={8}
          icon={FolderKanban}
          color="cyan"
        />
        <MetricCard
          title="活跃项目"
          value={overview.activeProjects}
          change={12}
          icon={Clock}
          color="green"
        />
        <MetricCard
          title="任务总数"
          value={overview.totalTasks}
          change={-3}
          icon={CheckCircle}
          color="cyan"
        />
        <MetricCard
          title="已完成任务"
          value={overview.completedTasks}
          change={15}
          icon={CheckCircle}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Panel className="h-full">
            <SectionTitle title="最近动态" desc="团队的最新活动" eyebrow="实时信号" />
            <div className="space-y-3">
              {overview.recentSignals?.map((signal) => (
                <div key={signal.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{signal.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{signal.time}</p>
                  </div>
                </div>
              ))}
              {(!overview.recentSignals || overview.recentSignals.length === 0) && (
                <p className="text-gray-400 text-sm text-center py-8">暂无动态</p>
              )}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel>
            <SectionTitle title="当前重点项目" desc="进行中的项目" />
            <div className="space-y-3">
              {recentProjects.map(project => (
                <div key={project.id} className="p-3 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{project.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      project.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {project.status === 'active' ? '进行中' : '规划中'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-1">{project.description || '暂无描述'}</p>
                </div>
              ))}
              {recentProjects.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">暂无项目</p>
              )}
            </div>
            <div className="mt-4">
              <AppButton variant="ghost" size="sm" className="w-full justify-center">
                查看所有项目 <ArrowRight className="w-3 h-3 ml-1" />
              </AppButton>
            </div>
          </Panel>

          <Panel>
            <SectionTitle title="即将到来" desc="待办提醒" />
            <div className="flex items-center gap-3 text-gray-400">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">暂无截止提醒</span>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;