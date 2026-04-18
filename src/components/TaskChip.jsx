import React from 'react';

const statusConfig = {
  TODO: { label: '待处理', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  IN_PROGRESS: { label: '进行中', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  DONE: { label: '已完成', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
};

const TaskChip = ({ status, size = 'md' }) => {
  const config = statusConfig[status] || statusConfig.TODO;
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';
  return <span className={`inline-flex items-center rounded-full border font-medium ${config.color} ${sizeClass}`}>{config.label}</span>;
};

export default TaskChip;