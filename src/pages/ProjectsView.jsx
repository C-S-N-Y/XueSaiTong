import React, { useState } from 'react';
import Panel from '../components/Panel';
import SectionTitle from '../components/SectionTitle';
import AppButton from '../components/AppButton';
import Modal from '../components/Modal';
import { Input, Textarea, Select } from '../components/Field';
import { api } from '../api/request';
import { runAction } from '../utils/helpers';
import { Plus, Edit, Trash2, User, CheckSquare, X, FolderKanban } from 'lucide-react';

const ProjectsView = ({ projects, users, currentUserId, selectedProjectId, projectDetail, onSelectProject, onDataChange }) => {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', status: 'active' });
  const [taskForm, setTaskForm] = useState({ title: '', status: 'TODO', assigneeId: '' });

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
    await runAction(
      async () => {
        if (editingProject) {
          await api.updateProject(editingProject.id, projectForm);
        } else {
          await api.createProject({ ...projectForm, ownerId: currentUserId });
        }
        setShowProjectModal(false);
        onDataChange();
      },
      { successMessage: editingProject ? '项目更新成功' : '项目创建成功' }
    );
  };

  const handleDeleteProject = async (id) => {
    if (!confirm('确定删除此项目吗？相关任务也将被删除。')) return;
    await runAction(
      async () => {
        await api.deleteProject(id);
        if (selectedProjectId === id) onSelectProject(null);
        onDataChange();
      },
      { successMessage: '项目已删除' }
    );
  };

  const openCreateTask = () => {
    if (!selectedProjectId) return;
    setTaskForm({ title: '', status: 'TODO', assigneeId: users[0]?.id || '' });
    setShowTaskModal(true);
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    await runAction(
      async () => {
        await api.createTask({
          ...taskForm,
          projectId: selectedProjectId,
        });
        setShowTaskModal(false);
        onDataChange();
        onSelectProject(selectedProjectId);
      },
      { successMessage: '任务创建成功' }
    );
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    await runAction(
      async () => {
        await api.updateTaskStatus(taskId, newStatus);
        onDataChange();
        onSelectProject(selectedProjectId);
      },
      { successMessage: '任务状态已更新' }
    );
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('确定删除此任务吗？')) return;
    await runAction(
      async () => {
        await api.deleteTask(taskId);
        onDataChange();
        onSelectProject(selectedProjectId);
      },
      { successMessage: '任务已删除' }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">项目管理</h1>
        <AppButton onClick={openCreateProject}>
          <Plus className="w-4 h-4 mr-2" />
          新建项目
        </AppButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Panel className="h-full">
            <SectionTitle title="项目列表" desc={`共 ${projects.length} 个项目`} />
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {projects.map(project => (
                <div
                  key={project.id}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedProjectId === project.id
                      ? 'border-cyan-500/50 bg-cyan-500/10'
                      : 'border-white/5 hover:border-white/10 bg-dark-surface/40'
                  }`}
                  onClick={() => onSelectProject(project.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{project.name}</h3>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{project.description || '暂无描述'}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditProject(project); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      project.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {project.status === 'active' ? '进行中' : '规划中'}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {users.find(u => u.id === project.ownerId)?.name || '未知'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="lg:col-span-2">
          {selectedProjectId && projectDetail ? (
            <Panel>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">{projectDetail.name}</h2>
                  <p className="text-gray-400 text-sm mt-1">{projectDetail.description || '暂无描述'}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-500">创建者: {projectDetail.owner?.name}</span>
                    <span className="text-xs text-gray-500">
                      任务统计: 总计 {projectDetail.stats?.total} ·
                      进行中 {projectDetail.stats?.inProgress} ·
                      已完成 {projectDetail.stats?.done}
                    </span>
                  </div>
                </div>
                <AppButton size="sm" onClick={openCreateTask}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  新建任务
                </AppButton>
              </div>

              <SectionTitle title="任务列表" />
              <div className="space-y-2">
                {projectDetail.tasks?.map(task => {
                  const assignee = task.assignee;
                  return (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 hover:border-white/10 bg-dark-surface/40">
                      <div className="flex items-center gap-3">
                        <CheckSquare className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-white">{task.title}</p>
                          <p className="text-xs text-gray-500">负责人: {assignee?.name || '未分配'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={task.status}
                          onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                          className="text-xs bg-dark-surface border border-white/10 rounded-lg px-2 py-1 text-white"
                        >
                          <option value="TODO">待处理</option>
                          <option value="IN_PROGRESS">进行中</option>
                          <option value="DONE">已完成</option>
                        </select>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-gray-400 hover:text-red-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {(!projectDetail.tasks || projectDetail.tasks.length === 0) && (
                  <p className="text-gray-400 text-sm text-center py-8">暂无任务，点击上方按钮创建</p>
                )}
              </div>
            </Panel>
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

      <Modal isOpen={showProjectModal} onClose={() => setShowProjectModal(false)} title={editingProject ? '编辑项目' : '新建项目'}>
        <form onSubmit={handleSubmitProject}>
          <Input label="项目名称" value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} required />
          <Textarea label="项目描述" value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} />
          <Select
            label="状态"
            value={projectForm.status}
            onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
            options={[{ value: 'active', label: '进行中' }, { value: 'planning', label: '规划中' }]}
          />
          <div className="flex justify-end gap-3 mt-6">
            <AppButton type="button" variant="secondary" onClick={() => setShowProjectModal(false)}>取消</AppButton>
            <AppButton type="submit">{editingProject ? '保存' : '创建'}</AppButton>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="新建任务">
        <form onSubmit={handleSubmitTask}>
          <Input label="任务标题" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
          <Select
            label="负责人"
            value={taskForm.assigneeId}
            onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
            options={users.map(u => ({ value: u.id, label: u.name }))}
          />
          <Select
            label="初始状态"
            value={taskForm.status}
            onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
            options={[{ value: 'TODO', label: '待处理' }, { value: 'IN_PROGRESS', label: '进行中' }, { value: 'DONE', label: '已完成' }]}
          />
          <div className="flex justify-end gap-3 mt-6">
            <AppButton type="button" variant="secondary" onClick={() => setShowTaskModal(false)}>取消</AppButton>
            <AppButton type="submit">创建任务</AppButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsView;