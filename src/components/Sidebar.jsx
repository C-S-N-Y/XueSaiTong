import React from 'react';
import { LayoutDashboard, FolderKanban, CheckSquare, Users, LogOut } from 'lucide-react';

const navItems = [
  { id: 'overview', label: '概览', icon: LayoutDashboard },
  { id: 'projects', label: '项目', icon: FolderKanban },
  { id: 'myTasks', label: '我的任务', icon: CheckSquare },
  { id: 'users', label: '用户', icon: Users },
];

const Sidebar = ({ currentView, onViewChange, onLogout, currentUser }) => {
  return (
    <div className="w-64 h-screen glass-panel rounded-none border-t-0 border-l-0 border-b-0 flex flex-col relative z-10">
      <div className="p-6 border-b border-white/5">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent">学赛通</h1>
        <p className="text-xs text-gray-400 mt-1">智能工作台</p>
      </div>
      {currentUser && (
        <div className="mx-4 mt-4 p-3 glass-panel rounded-xl">
          <p className="text-sm font-medium text-white">{currentUser.name}</p>
          <p className="text-xs text-gray-400">{currentUser.role}</p>
        </div>
      )}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map(item => (
          <button key={item.id} onClick={() => onViewChange(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${currentView === item.id ? 'bg-cyan-500/20 text-white border border-cyan-500/30 shadow-lg shadow-cyan-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <item.icon className="w-5 h-5" /> {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-white/5">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200">
          <LogOut className="w-5 h-5" /> 退出登录
        </button>
      </div>
    </div>
  );
};

export default Sidebar;