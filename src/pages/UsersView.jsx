import React, { useState } from 'react';
import Panel from '../components/Panel';
import SectionTitle from '../components/SectionTitle';
import AppButton from '../components/AppButton';
import Modal from '../components/Modal';
import { Input, Select } from '../components/Field';
import { api } from '../api/request';
import { runAction } from '../utils/helpers';
import { UserPlus, Mail, Briefcase, Eye } from 'lucide-react';

const UsersView = ({ users, projects, onDataChange }) => {
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', email: '', role: '成员' });
  const [selectedUserId, setSelectedUserId] = useState(null);

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    await runAction(
      async () => {
        await api.createUser(userForm);
        setShowUserModal(false);
        setUserForm({ name: '', email: '', role: '成员' });
        onDataChange();
      },
      { successMessage: '用户创建成功' }
    );
  };

  const getUserTaskCount = (userId) => {
    return projects.reduce((acc, p) => acc + (p.ownerId === userId ? 1 : 0), 0);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">团队成员</h1>
        <AppButton onClick={() => setShowUserModal(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          添加成员
        </AppButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <Panel key={user.id} className="group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center text-white font-bold text-lg">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{user.name}</h3>
                <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3" />
                  {user.email}
                </p>
                <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
                  <Briefcase className="w-3 h-3" />
                  {user.role}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-gray-400">负责项目: {getUserTaskCount(user.id)}</span>
              <button
                className="text-xs text-cyan-400 hover:text-fuchsia-400 flex items-center gap-1"
                onClick={() => setSelectedUserId(selectedUserId === user.id ? null : user.id)}
              >
                <Eye className="w-3 h-3" />
                查看任务
              </button>
            </div>
            {selectedUserId === user.id && (
              <div className="mt-3 p-3 rounded-lg bg-dark-surface/60 text-xs text-gray-400">
                点击"我的任务"查看完整列表
              </div>
            )}
          </Panel>
        ))}
      </div>

      <Modal isOpen={showUserModal} onClose={() => setShowUserModal(false)} title="添加新成员">
        <form onSubmit={handleSubmitUser}>
          <Input label="姓名" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} required />
          <Input label="邮箱" type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
          <Select
            label="角色"
            value={userForm.role}
            onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
            options={[
              { value: '管理员', label: '管理员' },
              { value: '产品经理', label: '产品经理' },
              { value: '开发工程师', label: '开发工程师' },
              { value: '设计师', label: '设计师' },
              { value: '成员', label: '成员' },
            ]}
          />
          <div className="flex justify-end gap-3 mt-6">
            <AppButton type="button" variant="secondary" onClick={() => setShowUserModal(false)}>取消</AppButton>
            <AppButton type="submit">添加</AppButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersView;