import React, { useState, useEffect } from 'react';
import Panel from '../components/Panel';
import SectionTitle from '../components/SectionTitle';
import AppButton from '../components/AppButton';
import Modal from '../components/Modal';
import { Input, Textarea, Select } from '../components/Field';
import { api } from '../api/request';
import { runAction } from '../utils/helpers';
import {
  Plus, Edit, Trash2, User, CheckSquare, X, FolderKanban,
  UserPlus, Search, UserMinus, Shield, Calendar, Flag, AlertTriangle
} from 'lucide-react';

const priorityOptions = [
  { value: 'LOW', label: '低' },
  { value: 'MEDIUM', label: '中' },
  { value: 'HIGH', label: '高' },
  { value: 'URGENT', label: '紧急' },
];

const priorityConfig = {
  LOW: { color: 'text-gray-400', bg: 'bg-gray-500/10' },
  MEDIUM: { color: 'text-blue-400', bg: 'bg-blue-500/10' },
  HIGH: { color: 'text-orange-400', bg: 'bg-orange-500/10' },
  URGENT: { color: 'text-red-400', bg: 'bg-red-500/10' },
};

const ProjectsView = ({ projects, currentUser, selectedProjectId, onSelectProject, onDataChange }) => {
  const [projectDetail, setProjectDetail] = useState(null);
  const [members, setMembers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [boardData, setBoardData] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', status: 'active' });
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', status: 'TODO', priority: 'MEDIUM', deadline: '', assigneeId: ''
  });
  const [availableUsers, setAvailableUsers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showAddMemberPanel, setShowAddMemberPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('board'); // 'board' 或 'list'

  const currentMember = members.find(m => m.userId === currentUser?.id);
  const projectRole = currentMember?.projectRole;

  const canManageProject = projectRole === 'OWNER';
  const canManageMembers = projectRole === 'OWNER';
  const canManageTasks = projectRole === 'OWNER' || projectRole === 'MANAGER';
  const canEditTaskStatus = (task) => {
    if (projectRole === 'OWNER' || projectRole === 'MANAGER') return true;
    return task.assigneeId === currentUser?.id;
  };

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectData();
    } else {
      setProjectDetail(null);
      setMembers([]);
      setActivities([]);
      setBoardData(null);
    }
  }, [selectedProjectId]);

  const loadProjectData = async () => {
    try {
      const [detail, membersRes, activitiesRes, boardRes] = await Promise.all([
        api.getProjectDetail(selectedProjectId),
        api.getProjectMembers(selectedProjectId),
        api.getProjectActivities(selectedProjectId),
        api.getProjectBoard(selectedProjectId),
      ]);
      setProjectDetail(detail);
      setMembers(membersRes);
      setActivities(activitiesRes);
      setBoardData(boardRes);
    } catch (error) {
      console.error('加载项目数据失败', error);
    }
  };

  const openCreateProject = () => {
    setEditingProject(null);
    setProjectForm({ name: '', description: '', status: 'active' });
    setShowProjectModal(true);
  };

  const openEditProject = (project) => {
    setEditingProject(project);
    setProjectForm({ name: project.name, description: project.description || '', status: project.status });
    setShowProjectModal(true);
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    await runAction(async () => {
      if (editingProject) {
        await api.updateProject(editingProject.id, projectForm);
      } else {
        await api.createProject(projectForm);
      }
      setShowProjectModal(false);
      onDataChange();
    }, { successMessage: editingProject ? '项目更新成功' : '项目创建成功' });
  };

  const handleDeleteProject = async (id) => {
    if (!confirm('确定删除此项目吗？')) return;
    await runAction(async () => {
      await api.deleteProject(id);
      if (selectedProjectId === id) onSelectProject(null);
      onDataChange();
    }, { successMessage: '项目已删除' });
  };

  const openCreateTask = () => {
    if (members.length === 0) { alert('请先添加项目成员'); return; }
    setTaskForm({
      title: '', description: '', status: 'TODO', priority: 'MEDIUM', deadline: '', assigneeId: members[0]?.userId || ''
    });
    setShowTaskModal(true);
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    await runAction(async () => {
      await api.createTask({ ...taskForm, projectId: selectedProjectId });
      setShowTaskModal(false);
      loadProjectData();
      onDataChange();
    }, { successMessage: '任务已创建' });
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    await runAction(async () => {
      await api.updateTaskStatus(taskId, newStatus);
      loadProjectData();
      onDataChange();
    }, { successMessage: '状态已更新' });
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('确定删除此任务？')) return;
    await runAction(async () => {
      await api.deleteTask(taskId);
      loadProjectData();
      onDataChange();
    }, { successMessage: '任务已删除' });
  };

  const handleAddMember = async (userId) => {
    await runAction(async () => {
      await api.addProjectMember(selectedProjectId, userId);
      loadProjectData();
      setShowAddMemberPanel(false);
      setSearchKeyword('');
    }, { successMessage: '成员已添加' });
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('确定移除此成员？')) return;
    await runAction(async () => {
      await api.removeProjectMember(selectedProjectId, userId);
      loadProjectData();
    }, { successMessage: '成员已移除' });
  };

  const handleChangeRole = async (userId, newRole) => {
    await runAction(async () => {
      await api.updateMemberRole(selectedProjectId, userId, newRole);
      loadProjectData();
    }, { successMessage: '角色已更新' });
  };

  const handleSearchAvailableUsers = async () => {
    try {
      const res = await api.searchAvailableUsers(selectedProjectId, searchKeyword);
      setAvailableUsers(res);
    } catch (error) {
      setAvailableUsers([]);
    }
  };

  // 渲染任务卡片
  const renderTaskCard = (task) => (
    <div key={task.id} className={`p-3 rounded-xl border bg-dark-surface/40 ${task.overdue ? 'border-red-500/50' : 'border-white/5'} hover:border-cyan-500/30 transition-all`}>
      <div className="flex items-start justify-between">
        <p className="text-sm text-white font-medium">{task.title}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityConfig[task.priority]?.bg} ${priorityConfig[task.priority]?.color}`}>
          {priorityConfig[task.priority]?.label}
        </span>
      </div>
      {task.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{task.description}</p>}
      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
        <span className="flex items-center gap-1"><User className="w-3 h-3" />{task.assignee?.username || '未分配'}</span>
        {task.deadline && (
          <span className={`flex items-center gap-1 ${task.overdue ? 'text-red-400' : ''}`}>
            <Calendar className="w-3 h-3" />{task.deadline}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between mt-3">
        <select
          value={task.status}
          onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
          disabled={!canEditTaskStatus(task)}
          className="text-xs bg-dark-surface border border-white/10 rounded-lg px-2 py-1 text-white disabled:opacity-50"
        >
          <option value="TODO">待处理</option>
          <option value="IN_PROGRESS">进行中</option>
          <option value="DONE">已完成</option>
        </select>
        {canManageTasks && (
          <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-gray-400 hover:text-red-400">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">项目管理</h1>
        <AppButton onClick={openCreateProject}><Plus className="w-4 h-4 mr-2" />新建项目</AppButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧项目列表 */}
        <div className="lg:col-span-1">
          <Panel className="h-full">
            <SectionTitle title="项目列表" desc={`共 ${projects.length} 个项目`} />
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {projects.map(project => (
                <div
                  key={project.id}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedProjectId === project.id ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-white/5 hover:border-white/10 bg-dark-surface/40'
                  }`}
                  onClick={() => onSelectProject(project.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{project.name}</h3>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{project.description || '暂无描述'}</p>
                    </div>
                    {canManageProject && (
                      <div className="flex gap-1 ml-2">
                        <button onClick={(e) => { e.stopPropagation(); openEditProject(project); }} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* 右侧详情区 */}
        <div className="lg:col-span-2">
          {selectedProjectId && projectDetail ? (
            <div className="space-y-6">
              {/* 基本信息 */}
              <Panel>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">{projectDetail.name}</h2>
                    <p className="text-gray-400 text-sm mt-1">{projectDetail.description || '暂无描述'}</p>
                  </div>
                  {canManageTasks && (
                    <AppButton size="sm" onClick={openCreateTask}><Plus className="w-3.5 h-3.5 mr-1" />新建任务</AppButton>
                  )}
                </div>
              </Panel>

              {/* 成员管理 */}
              <Panel>
                <div className="flex items-center justify-between mb-4">
                  <SectionTitle title={`项目成员 (${members.length})`} />
                  {canManageMembers && (
                    <AppButton size="sm" variant="ghost" onClick={() => setShowAddMemberPanel(!showAddMemberPanel)}>
                      <UserPlus className="w-4 h-4 mr-1" />添加成员
                    </AppButton>
                  )}
                </div>
                {showAddMemberPanel && (
                  <div className="mb-4 p-3 border border-white/10 rounded-xl bg-dark-surface/40">
                    <div className="flex gap-2 mb-2">
                      <Input placeholder="搜索用户..." value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} className="flex-1" />
                      <AppButton size="sm" onClick={handleSearchAvailableUsers}>搜索</AppButton>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {availableUsers.map(u => (
                        <div key={u.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded">
                          <span className="text-sm text-white">{u.username} ({u.email})</span>
                          <AppButton size="sm" variant="ghost" onClick={() => handleAddMember(u.id)}>添加</AppButton>
                        </div>
                      ))}
                      {availableUsers.length === 0 && searchKeyword && <p className="text-gray-400 text-xs text-center py-2">未找到用户</p>}
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  {members.map(m => (
                    <div key={m.userId} className="flex items-center justify-between p-2 border border-white/5 rounded">
                      <div>
                        <span className="text-white">{m.username}</span>
                        <span className="ml-2 text-xs text-gray-400">{m.email}</span>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${m.projectRole === 'OWNER' ? 'bg-yellow-500/20 text-yellow-400' : m.projectRole === 'MANAGER' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {m.projectRole}
                        </span>
                      </div>
                      {canManageMembers && m.projectRole !== 'OWNER' && (
                        <div className="flex gap-1">
                          <select value={m.projectRole} onChange={e => handleChangeRole(m.userId, e.target.value)} className="text-xs bg-dark-surface border border-white/10 rounded px-1 py-0.5">
                            <option value="MANAGER">管理员</option>
                            <option value="MEMBER">成员</option>
                          </select>
                          <button onClick={() => handleRemoveMember(m.userId)} className="text-gray-400 hover:text-red-400"><UserMinus className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Panel>

              {/* 任务看板 */}
              <Panel>
                <div className="flex items-center justify-between mb-4">
                  <SectionTitle title="任务看板" />
                  <div className="flex gap-2">
                    <button onClick={() => setActiveTab('board')} className={`px-3 py-1 text-sm rounded ${activeTab === 'board' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400'}`}>看板</button>
                    <button onClick={() => setActiveTab('list')} className={`px-3 py-1 text-sm rounded ${activeTab === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400'}`}>列表</button>
                  </div>
                </div>
                {activeTab === 'board' && boardData && (
                  <div className="grid grid-cols-3 gap-4">
                    {['TODO', 'IN_PROGRESS', 'DONE'].map(status => (
                      <div key={status} className="space-y-2">
                        <h4 className="font-medium text-white mb-2">{status === 'TODO' ? '待处理' : status === 'IN_PROGRESS' ? '进行中' : '已完成'}</h4>
                        {boardData.columns?.[status]?.map(task => renderTaskCard(task))}
                        {(!boardData.columns?.[status] || boardData.columns[status].length === 0) && (
                          <p className="text-gray-400 text-xs text-center py-4">暂无任务</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'list' && (
                  <div className="space-y-2">
                    {boardData?.allTasks?.map(task => renderTaskCard(task))}
                    {(!boardData?.allTasks || boardData.allTasks.length === 0) && (
                      <p className="text-gray-400 text-sm text-center py-8">暂无任务</p>
                    )}
                  </div>
                )}
              </Panel>

              {/* 最近动态 */}
              <Panel>
                <SectionTitle title="最近动态" />
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {activities.map(act => (
                    <div key={act.id} className="text-sm text-gray-300 border-b border-white/5 pb-2">
                      <p>{act.description}</p>
                      <p className="text-xs text-gray-500">{act.createdAt}</p>
                    </div>
                  ))}
                  {activities.length === 0 && <p className="text-gray-400 text-sm">暂无动态</p>}
                </div>
              </Panel>
            </div>
          ) : (
            <Panel className="h-full flex items-center justify-center">
              <div className="text-center">
                <FolderKanban className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">选择一个项目查看详情</p>
              </div>
            </Panel>
          )}
        </div>
      </div>

      {/* 项目表单弹窗 */}
      <Modal isOpen={showProjectModal} onClose={() => setShowProjectModal(false)} title={editingProject ? '编辑项目' : '新建项目'}>
        <form onSubmit={handleSubmitProject}>
          <Input label="项目名称" value={projectForm.name} onChange={e => setProjectForm({...projectForm, name: e.target.value})} required />
          <Textarea label="项目描述" value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} />
          <Select label="状态" value={projectForm.status} onChange={e => setProjectForm({...projectForm, status: e.target.value})} options={[{ value: 'active', label: '进行中' }, { value: 'planning', label: '规划中' }]} />
          <div className="flex justify-end gap-3 mt-6">
            <AppButton type="button" variant="secondary" onClick={() => setShowProjectModal(false)}>取消</AppButton>
            <AppButton type="submit">{editingProject ? '保存' : '创建'}</AppButton>
          </div>
        </form>
      </Modal>

      {/* 任务表单弹窗 */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="新建任务" size="lg">
        <form onSubmit={handleSubmitTask}>
          <Input label="标题" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} required />
          <Textarea label="描述" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="优先级" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})} options={priorityOptions} />
            <Input label="截止时间" type="datetime-local" value={taskForm.deadline} onChange={e => setTaskForm({...taskForm, deadline: e.target.value})} />
          </div>
          <Select label="执行人" value={taskForm.assigneeId} onChange={e => setTaskForm({...taskForm, assigneeId: e.target.value})} options={members.map(m => ({ value: m.userId, label: m.username }))} required />
          <div className="flex justify-end gap-3 mt-6">
            <AppButton type="button" variant="secondary" onClick={() => setShowTaskModal(false)}>取消</AppButton>
            <AppButton type="submit">创建</AppButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsView;