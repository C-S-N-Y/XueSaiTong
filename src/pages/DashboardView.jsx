// src/pages/DashboardView.jsx
import React from 'react';
import Panel from '../components/Panel';
import SectionTitle from '../components/SectionTitle';
import MetricCard from '../components/MetricCard';
import AppButton from '../components/AppButton';
import { FolderKanban, CheckCircle, Clock, Users, Bell, Calendar, AlertTriangle } from 'lucide-react';

const DashboardView = ({ overview, onRefresh }) => {
  if (!overview) return <div className="text-gray-400 text-center py-8">加载中...</div>;

  const { userCount, activeUserCount, projectCount, taskCount, todoCount, inProgressCount, doneCount, overdueTaskCount, recentActivities, upcomingDueTasks } = overview;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">工作台概览</h1>
        <AppButton variant="secondary" onClick={onRefresh}>刷新</AppButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="用户总数" value={userCount} icon={Users} color="cyan" />
        <MetricCard title="活跃用户" value={activeUserCount} icon={Users} color="green" />
        <MetricCard title="项目总数" value={projectCount} icon={FolderKanban} color="cyan" />
        <MetricCard title="任务总数" value={taskCount} icon={CheckCircle} color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Panel>
            <SectionTitle title="任务概览" />
            <div className="grid grid-cols-4 gap-4 text-center">
              <div><span className="text-2xl font-bold text-amber-400">{todoCount}</span><p className="text-gray-400">待处理</p></div>
              <div><span className="text-2xl font-bold text-blue-400">{inProgressCount}</span><p className="text-gray-400">进行中</p></div>
              <div><span className="text-2xl font-bold text-emerald-400">{doneCount}</span><p className="text-gray-400">已完成</p></div>
              <div><span className="text-2xl font-bold text-red-400">{overdueTaskCount}</span><p className="text-gray-400">逾期</p></div>
            </div>
          </Panel>
          <Panel>
            <SectionTitle title="最近动态" eyebrow="实时" />
            <div className="space-y-3">
              {recentActivities?.map((act, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2 hover:bg-white/5 rounded">
                  <Bell className="w-4 h-4 text-cyan-400 mt-0.5" />
                  <div><p className="text-sm text-white">{act.description}</p><p className="text-xs text-gray-500">{act.time}</p></div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel>
            <SectionTitle title="即将到期任务" icon={<Calendar />} />
            {upcomingDueTasks?.map(task => (
              <div key={task.id} className="p-3 border border-white/5 rounded-lg mb-2">
                <p className="text-sm text-white">{task.title}</p>
                <p className="text-xs text-gray-400">截止: {task.deadline}</p>
              </div>
            ))}
            {upcomingDueTasks?.length === 0 && <p className="text-gray-400 text-sm">暂无即将到期任务</p>}
          </Panel>
          <Panel>
            <SectionTitle title="逾期任务" icon={<AlertTriangle />} />
            {/* 逾期任务展示 */}
            <p className="text-gray-400 text-sm">共 {overdueTaskCount} 个逾期任务</p>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;