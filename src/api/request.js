import { showToast } from '../utils/helpers';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟用户数据库（存储在 localStorage 中，实现注册后数据持久化）
const getUsersDB = () => {
  const stored = localStorage.getItem('xst_users_db');
  if (stored) {
    return JSON.parse(stored);
  }
  // 初始默认用户（密码统一为 123456）
  const defaultUsers = [
    { id: '1', username: 'admin', password: '123456', name: '管理员', email: 'admin@xst.com', role: '管理员' },
    { id: '2', username: 'pm', password: '123456', name: '产品经理', email: 'pm@xst.com', role: '产品经理' },
    { id: '3', username: 'dev', password: '123456', name: '开发工程师', email: 'dev@xst.com', role: '开发工程师' },
  ];
  localStorage.setItem('xst_users_db', JSON.stringify(defaultUsers));
  return defaultUsers;
};

const saveUsersDB = (users) => {
  localStorage.setItem('xst_users_db', JSON.stringify(users));
};

// Mock 业务数据（项目、任务等，与用户关联）
let mockDB = {
  projects: [
    { id: '101', name: '学赛通平台', description: '核心工作台系统', status: 'active', ownerId: '1' },
    { id: '102', name: '数据可视化', description: '实时监控仪表盘', status: 'active', ownerId: '2' },
    { id: '103', name: '用户中心', description: '统一身份管理', status: 'planning', ownerId: '3' },
  ],
  tasks: [
    { id: '201', title: '完成首页概览设计', status: 'DONE', projectId: '101', assigneeId: '1' },
    { id: '202', title: '对接项目列表接口', status: 'IN_PROGRESS', projectId: '101', assigneeId: '2' },
    { id: '203', title: '实现任务看板', status: 'TODO', projectId: '101', assigneeId: '3' },
    { id: '204', title: '配置 ECharts 主题', status: 'IN_PROGRESS', projectId: '102', assigneeId: '1' },
    { id: '205', title: '设计用户权限模型', status: 'TODO', projectId: '103', assigneeId: '2' },
  ]
};

// 辅助函数
const getOverviewData = () => ({
  totalProjects: mockDB.projects.length,
  activeProjects: mockDB.projects.filter(p => p.status === 'active').length,
  totalTasks: mockDB.tasks.length,
  completedTasks: mockDB.tasks.filter(t => t.status === 'DONE').length,
  recentSignals: [
    { id: 1, type: 'project_created', message: '项目 "学赛通平台" 已创建', time: '2分钟前' },
    { id: 2, type: 'task_completed', message: '任务 "完成首页概览设计" 已完成', time: '1小时前' },
    { id: 3, type: 'user_joined', message: '新成员 王五 加入团队', time: '3小时前' },
  ]
});

const getProjectDetail = (projectId) => {
  const project = mockDB.projects.find(p => p.id === projectId);
  if (!project) throw new Error('项目不存在');
  const usersDB = getUsersDB();
  const owner = usersDB.find(u => u.id === project.ownerId);
  const tasks = mockDB.tasks.filter(t => t.projectId === projectId).map(t => ({
    ...t,
    assignee: usersDB.find(u => u.id === t.assigneeId)
  }));
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: tasks.filter(t => t.status === 'DONE').length,
  };
  return { ...project, owner, tasks, stats };
};

// 统一请求处理
const request = async (method, url, data = null) => {
  await delay(400);
  const urlParts = url.split('/').filter(Boolean);
  
  try {
    // ========== 认证接口 ==========
    if (method === 'POST' && url === '/auth/login') {
      const { username, password } = data;
      const usersDB = getUsersDB();
      const user = usersDB.find(u => u.username === username && u.password === password);
      if (!user) throw new Error('用户名或密码错误');
      // 返回用户信息（不含密码）
      const { password: _, ...userInfo } = user;
      return { token: `mock_token_${user.id}`, user: userInfo };
    }

    if (method === 'POST' && url === '/auth/register') {
      const { username, password, name } = data;
      const usersDB = getUsersDB();
      if (usersDB.find(u => u.username === username)) {
        throw new Error('用户名已存在');
      }
      const newUser = {
        id: Date.now().toString(),
        username,
        password,
        name: name || username,
        email: `${username}@xst.com`,
        role: '成员',
      };
      usersDB.push(newUser);
      saveUsersDB(usersDB);
      const { password: _, ...userInfo } = newUser;
      return { token: `mock_token_${newUser.id}`, user: userInfo };
    }

    // ========== 业务接口（需认证，此处简化为直接可用） ==========
    if (method === 'GET' && url === '/dashboard/overview') {
      return getOverviewData();
    }
    
    if (method === 'GET' && url === '/users') {
      const usersDB = getUsersDB();
      return usersDB.map(({ password, ...rest }) => rest);
    }
    
    if (method === 'GET' && urlParts[0] === 'users' && urlParts.length === 2) {
      const usersDB = getUsersDB();
      const user = usersDB.find(u => u.id === urlParts[1]);
      if (!user) throw new Error('用户不存在');
      const { password, ...userInfo } = user;
      return userInfo;
    }
    
    if (method === 'GET' && urlParts[0] === 'users' && urlParts[2] === 'tasks') {
      const userId = urlParts[1];
      const usersDB = getUsersDB();
      return mockDB.tasks.filter(t => t.assigneeId === userId).map(t => ({
        ...t,
        project: mockDB.projects.find(p => p.id === t.projectId),
        assignee: usersDB.find(u => u.id === t.assigneeId)
      }));
    }
    
    if (method === 'GET' && url === '/projects') {
      return mockDB.projects;
    }
    
    if (method === 'GET' && urlParts[0] === 'projects' && urlParts[2] === 'detail') {
      return getProjectDetail(urlParts[1]);
    }
    
    if (method === 'POST' && url === '/projects') {
      const newProject = { ...data, id: Date.now().toString() };
      mockDB.projects.push(newProject);
      return newProject;
    }
    
    if (method === 'PUT' && urlParts[0] === 'projects' && urlParts.length === 2) {
      const index = mockDB.projects.findIndex(p => p.id === urlParts[1]);
      if (index === -1) throw new Error('项目不存在');
      mockDB.projects[index] = { ...mockDB.projects[index], ...data };
      return mockDB.projects[index];
    }
    
    if (method === 'DELETE' && urlParts[0] === 'projects' && urlParts.length === 2) {
      const id = urlParts[1];
      mockDB.projects = mockDB.projects.filter(p => p.id !== id);
      mockDB.tasks = mockDB.tasks.filter(t => t.projectId !== id);
      return { success: true };
    }
    
    if (method === 'POST' && url === '/tasks') {
      const newTask = { ...data, id: Date.now().toString() };
      mockDB.tasks.push(newTask);
      return newTask;
    }
    
    if (method === 'PUT' && urlParts[0] === 'tasks' && urlParts[2] === 'status') {
      const task = mockDB.tasks.find(t => t.id === urlParts[1]);
      if (!task) throw new Error('任务不存在');
      task.status = data.status;
      return task;
    }
    
    if (method === 'DELETE' && urlParts[0] === 'tasks' && urlParts.length === 2) {
      mockDB.tasks = mockDB.tasks.filter(t => t.id !== urlParts[1]);
      return { success: true };
    }
    
    if (method === 'POST' && url === '/users') {
      const usersDB = getUsersDB();
      const newUser = { ...data, id: Date.now().toString() };
      usersDB.push(newUser);
      saveUsersDB(usersDB);
      const { password, ...userInfo } = newUser;
      return userInfo;
    }

    throw new Error(`未实现的接口: ${method} ${url}`);
  } catch (error) {
    showToast(error.message, 'error');
    throw error;
  }
};

// 导出 API 方法
export const api = {
  // 认证
  login: (username, password) => request('POST', '/auth/login', { username, password }),
  register: (username, password, name) => request('POST', '/auth/register', { username, password, name }),
  
  // 业务
  loadOverview: () => request('GET', '/dashboard/overview'),
  loadUsers: () => request('GET', '/users'),
  getUser: (id) => request('GET', `/users/${id}`),
  createUser: (data) => request('POST', '/users', data),
  loadMyTasks: (userId) => request('GET', `/users/${userId}/tasks`),
  loadProjects: () => request('GET', '/projects'),
  loadProjectDetail: (id) => request('GET', `/projects/${id}/detail`),
  createProject: (data) => request('POST', '/projects', data),
  updateProject: (id, data) => request('PUT', `/projects/${id}`, data),
  deleteProject: (id) => request('DELETE', `/projects/${id}`),
  createTask: (data) => request('POST', '/tasks', data),
  updateTaskStatus: (id, status) => request('PUT', `/tasks/${id}/status`, { status }),
  deleteTask: (id) => request('DELETE', `/tasks/${id}`),
};