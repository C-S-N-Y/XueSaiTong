const API_BASE = "http://127.0.0.1:8080";

const showError = (message) => {
  if (window?.alert) {
    window.alert(message);
  }
};

async function httpRequest(method, url, data = null) {
  try {
    const response = await fetch(`${API_BASE}${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : null,
    });

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
    showError(error.message || "请求失败");
    throw error;
  }
}

export const api = {
  // 演示登录：通过用户 id 获取用户
  loginByUserId: (userId) => httpRequest("GET", `/users/${userId}`),

  // 注册：真实调用后端新增用户接口
  register: (username, role) =>
    httpRequest("POST", "/users", { username, role }),

  // 业务接口
  loadOverview: () => httpRequest("GET", "/dashboard/overview"),
  loadUsers: () => httpRequest("GET", "/users"),
  getUser: (id) => httpRequest("GET", `/users/${id}`),
  loadMyTasks: (userId) => httpRequest("GET", `/users/${userId}/tasks`),

  loadProjects: () => httpRequest("GET", "/projects"),
  loadProjectDetail: (id) => httpRequest("GET", `/projects/${id}/detail`),
  createProject: (data) => httpRequest("POST", "/projects", data),
  updateProject: (id, data) => httpRequest("PUT", `/projects/${id}`, data),
  deleteProject: (id) => httpRequest("DELETE", `/projects/${id}`),

  createTask: (data) => httpRequest("POST", "/tasks", data),
  updateTaskStatus: (id, status) =>
    httpRequest("PUT", `/tasks/${id}/status`, { status }),
  deleteTask: (id) => httpRequest("DELETE", `/tasks/${id}`),

  createUser: (data) => httpRequest("POST", "/users", data),
};