// src/pages/NotificationsView.jsx
import React, { useState, useEffect } from 'react';
import Panel from '../components/Panel';
import SectionTitle from '../components/SectionTitle';
import { api } from '../api/request';
import { Bell, Calendar, AlertTriangle, Activity } from 'lucide-react';

const NotificationsView = () => {
  const [notifications, setNotifications] = useState(null);

  useEffect(() => {
    api.getNotifications().then(setNotifications).catch(console.error);
  }, []);

  if (!notifications) return <div className="text-gray-400">加载中...</div>;

  const { overdueTasks, upcomingDueTasks, recentActivities } = notifications;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">通知中心</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel>
          <SectionTitle title="逾期任务" icon={<AlertTriangle className="text-red-400" />} />
          {overdueTasks?.map(task => (
            <div key={task.id} className="p-2 border-l-4 border-red-500 mb-2 bg-red-500/5">
              <p className="text-white">{task.title}</p>
              <p className="text-xs text-gray-400">截止: {task.deadline}</p>
            </div>
          ))}
        </Panel>
        <Panel>
          <SectionTitle title="即将到期" icon={<Calendar className="text-yellow-400" />} />
          {upcomingDueTasks?.map(task => (
            <div key={task.id} className="p-2 border-l-4 border-yellow-500 mb-2 bg-yellow-500/5">
              <p className="text-white">{task.title}</p>
              <p className="text-xs text-gray-400">截止: {task.deadline}</p>
            </div>
          ))}
        </Panel>
        <Panel>
          <SectionTitle title="最近动态" icon={<Activity className="text-cyan-400" />} />
          {recentActivities?.map((act, i) => (
            <div key={i} className="text-sm text-gray-300 py-1 border-b border-white/5">
              {act.description}
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
};

export default NotificationsView;