import React from 'react';
import Panel from '../components/Panel';
import SectionTitle from '../components/SectionTitle';
import TaskChip from '../components/TaskChip';
import { api } from '../api/request';
import { runAction } from '../utils/helpers';
import { CheckCircle, Clock, AlertCircle, ChevronRight } from 'lucide-react';

const MyTasksView = ({ tasks, users, projects, currentUserId, onDataChange }) => {
  const handleStatusChange = async (taskId, newStatus) => {
    await runAction(
      async () => {
        await api.updateTaskStatus(taskId, newStatus);
        onDataChange();
      },
      { successMessage: '任务状态已更新' }
    );
  };

  const groupedTasks = {
    TODO: tasks.filter(t => t.status === 'TODO'),
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
    DONE: tasks.filter(t => t.status === 'DONE'),
  };

  const columns = [
    { id: 'TODO', label: '待处理', icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { id: 'IN_PROGRESS', label: '进行中', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'DONE', label: '已完成', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">我的任务</h1>
        <div className="text-sm text-gray-400">共 {tasks.length} 个任务</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(col => {
          const colTasks = groupedTasks[col.id] || [];
          const Icon = col.icon;
          return (
            <Panel key={col.id} className="h-full">
              <div className="flex items-center gap-2 mb-4">
                <div className={`p-2 rounded-lg ${col.bg}`}>
                  <Icon className={`w-4 h-4 ${col.color}`} />
                </div>
                <h3 className="font-semibold text-white">{col.label}</h3>
                <span className="ml-auto text-xs text-gray-400">{colTasks.length}</span>
              </div>

              <div className="space-y-2">
                {colTasks.map(task => {
                  const project = projects.find(p => p.id === task.projectId);
                  return (
                    <div key={task.id} className="p-3 rounded-xl border border-white/5 bg-dark-surface/40 hover:border-white/10 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm text-white">{task.title}</p>
                        <TaskChip status={task.status} size="sm" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <ChevronRight className="w-3 h-3" />
                          {project?.name || '未知项目'}
                        </span>
                        {col.id !== 'DONE' && (
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            className="text-xs bg-dark-surface border border-white/10 rounded-lg px-2 py-0.5 text-white"
                          >
                            <option value="TODO">待处理</option>
                            <option value="IN_PROGRESS">进行中</option>
                            <option value="DONE">已完成</option>
                          </select>
                        )}
                      </div>
                    </div>
                  );
                })}
                {colTasks.length === 0 && (
                  <p className="text-gray-500 text-xs text-center py-4">暂无任务</p>
                )}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
};

export default MyTasksView;