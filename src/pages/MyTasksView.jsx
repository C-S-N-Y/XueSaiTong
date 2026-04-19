// src/pages/MyTasksView.jsx
import React from 'react';
import Panel from '../components/Panel';
import SectionTitle from '../components/SectionTitle';
import TaskChip from '../components/TaskChip';
import { api } from '../api/request';
import { runAction } from '../utils/helpers';
import { CheckCircle, Clock, AlertCircle, ChevronRight, Calendar, Flag } from 'lucide-react';

const priorityConfig = {
  LOW: { label: '低', color: 'text-gray-400' },
  MEDIUM: { label: '中', color: 'text-blue-400' },
  HIGH: { label: '高', color: 'text-orange-400' },
  URGENT: { label: '紧急', color: 'text-red-400' },
};

const MyTasksView = ({ tasks, onDataChange }) => {
  const handleStatusChange = async (taskId, newStatus) => {
    await runAction(async () => {
      await api.updateTaskStatus(taskId, newStatus);
      onDataChange();
    }, { successMessage: '状态已更新' });
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">我的任务</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(col => {
          const colTasks = groupedTasks[col.id] || [];
          const Icon = col.icon;
          return (
            <Panel key={col.id}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`p-2 rounded-lg ${col.bg}`}><Icon className={`w-4 h-4 ${col.color}`} /></div>
                <h3 className="font-semibold text-white">{col.label}</h3>
                <span className="ml-auto text-xs text-gray-400">{colTasks.length}</span>
              </div>
              <div className="space-y-2">
                {colTasks.map(task => (
                  <div key={task.taskId || task.id} className={`p-3 rounded-xl border bg-dark-surface/40 ${task.overdue ? 'border-red-500/50' : 'border-white/5'}`}>
                    <div className="flex items-start justify-between">
                      <p className="text-sm text-white">{task.title}</p>
                      <TaskChip status={task.status} />
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><ChevronRight className="w-3 h-3" />{task.projectName}</span>
                      <span className="flex items-center gap-1"><Flag className="w-3 h-3" /><span className={priorityConfig[task.priority]?.color}>{priorityConfig[task.priority]?.label}</span></span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{task.deadline}</span>
                    </div>
                    {col.id !== 'DONE' && (
                      <select value={task.status} onChange={e => handleStatusChange(task.taskId || task.id, e.target.value)} className="mt-2 text-xs bg-dark-surface border border-white/10 rounded px-2 py-1">
                        <option value="TODO">待处理</option>
                        <option value="IN_PROGRESS">进行中</option>
                        <option value="DONE">已完成</option>
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
};

export default MyTasksView;