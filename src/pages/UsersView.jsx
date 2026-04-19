// src/pages/UsersView.jsx
import React from 'react';
import Panel from '../components/Panel';
import SectionTitle from '../components/SectionTitle';
import { Mail, Briefcase, Hash } from 'lucide-react';

const UsersView = ({ users }) => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">团队成员</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <Panel key={user.id}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center text-white font-bold text-lg">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-white">{user.username}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1"><Hash className="w-3 h-3" />{user.id}</p>
                <p className="text-sm text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</p>
                <p className="text-sm text-gray-400 flex items-center gap-1"><Briefcase className="w-3 h-3" />{user.role}</p>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
};

export default UsersView;