// src/api/request.js
const API_BASE = "http://127.0.0.1:8080"; // 替换为您的后端地址

// Token 管理
const TOKEN_KEY = 'xst_token';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// 全局错误处理（可被外部覆盖）
let onUnauthorized = () => {
  clearToken();
  window.location.href = '/'; // 跳转登录页
};

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

const showError = (message) => {
  if (window?.alert) window.alert(message);
};

async function httpRequest(method, url, data = null, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    method,
    headers,
    body: data ? JSON.stringify(data) : null,
  };

  try {
    const response = await fetch(`${API_BASE}${url}`, config);

    // 处理 401 未授权
    if (response.status === 401) {
      onUnauthorized();
      throw new Error("登录已过期，请重新登录");
    }

    let payload = null;
    try {
      payload = await response.json();
    } catch (e) {
      payload = null;
    }

    if (!response.ok) {
      const message = payload?.message || `请求失败：${response.status}`;
      throw new Error(message);
    }

    return payload?.data ?? payload;
  } catch (error) {
    if (!options.silent) {
      showError(error.message || "请求失败");
    }
    throw error;
  }
}

// 带静默选项的请求（用于不弹窗的场景）
const silentRequest = (method, url, data) => httpRequest(method, url, data, { silent: true });

export const api = {
  // ========== 认证 ==========
  login: (username, password) => httpRequest("POST", "/auth/login", { username, password }),
  register: (data) => httpRequest("POST", "/auth/register", data),
  getCurrentUser: () => httpRequest("GET", "/auth/me"),

  // ========== 首页工作台 ==========
  getDashboardOverview: () => httpRequest("GET", "/dashboard/overview"),

  // ========== 用户 ==========
  getUsers: () => httpRequest("GET", "/users"),
  getUser: (id) => httpRequest("GET", `/users/${id}`),
  createUser: (data) => httpRequest("POST", "/users", data),
  getMyWorkspace: (userId) => httpRequest("GET", `/users/${userId}/workspace`),
  getMyTasks: (userId) => httpRequest("GET", `/users/${userId}/tasks`),

  // ========== 项目 ==========
  getProjects: () => httpRequest("GET", "/projects"),
  createProject: (data) => httpRequest("POST", "/projects", data),
  getProjectOverview: (id) => httpRequest("GET", `/projects/${id}/overview`),
  getProjectDetail: (id) => httpRequest("GET", `/projects/${id}/detail`),
  updateProject: (id, data) => httpRequest("PUT", `/projects/${id}`, data),
  deleteProject: (id) => httpRequest("DELETE", `/projects/${id}`),
  getProjectBoard: (id) => httpRequest("GET", `/projects/${id}/board`),
  getProjectActivities: (id) => httpRequest("GET", `/projects/${id}/activities`),
  getProjectMemberTasks: (id) => httpRequest("GET", `/projects/${id}/member-tasks`),

  // ========== 项目成员 ==========
  getProjectMembers: (projectId) => httpRequest("GET", `/projects/${projectId}/members`),
  searchAvailableUsers: (projectId, keyword) =>
    httpRequest("GET", `/projects/${projectId}/available-users?keyword=${encodeURIComponent(keyword || '')}`),
  addProjectMember: (projectId, userId, projectRole = 'MEMBER') =>
    httpRequest("POST", `/projects/${projectId}/members`, { userId, projectRole }),
  updateMemberRole: (projectId, userId, projectRole) =>
    httpRequest("PUT", `/projects/${projectId}/members/${userId}/role`, { projectRole }),
  removeProjectMember: (projectId, userId) =>
    httpRequest("DELETE", `/projects/${projectId}/members/${userId}`),

  // ========== 任务 ==========
  createTask: (data) => httpRequest("POST", "/tasks", data),
  getTask: (id) => httpRequest("GET", `/tasks/${id}`),
  updateTask: (id, data) => httpRequest("PUT", `/tasks/${id}`, data),
  updateTaskStatus: (id, status) => httpRequest("PUT", `/tasks/${id}/status`, { status }),
  updateTaskAssignee: (id, assigneeId) => httpRequest("PUT", `/tasks/${id}/assignee`, { assigneeId }),
  deleteTask: (id) => httpRequest("DELETE", `/tasks/${id}`),

  // ========== 评论 ==========
  getTaskComments: (taskId) => httpRequest("GET", `/tasks/${taskId}/comments`),
  createTaskComment: (taskId, content) => httpRequest("POST", `/tasks/${taskId}/comments`, { content }),
  deleteTaskComment: (taskId, commentId) => httpRequest("DELETE", `/tasks/${taskId}/comments/${commentId}`),

  // ========== 附件 ==========
  getTaskResources: (taskId) => httpRequest("GET", `/tasks/${taskId}/resources`),
  uploadTaskResource: (taskId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_BASE}/tasks/${taskId}/resources`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    }).then(res => res.json());
  },
  downloadResource: (resourceId) => {
    window.open(`${API_BASE}/task-resources/${resourceId}/download?token=${getToken()}`, '_blank');
  },
  deleteTaskResource: (resourceId) => httpRequest("DELETE", `/task-resources/${resourceId}`),

  // ========== 通知 ==========
  getNotifications: () => httpRequest("GET", "/notifications/me"),
};