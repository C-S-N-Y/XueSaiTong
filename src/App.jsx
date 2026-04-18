import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WelcomePage from './pages/WelcomePage';
import DashboardView from './pages/DashboardView';
import ProjectsView from './pages/ProjectsView';
import MyTasksView from './pages/MyTasksView';
import UsersView from './pages/UsersView';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/Toast';
import LoadingSpinner from './components/LoadingSpinner';
import GlobalBackground from './components/GlobalBackground';
import { api } from './api/request';
import { showToast } from './utils/helpers';

function App() {
  const [entered, setEntered] = useState(false);
  const [view, setView] = useState('overview');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectDetail, setProjectDetail] = useState(null);
  const [myTasks, setMyTasks] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentUser = users.find(u => u.id === currentUserId);

  const refreshCoreData = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const [overviewData, usersData, projectsData] = await Promise.all([
        api.loadOverview(),
        api.loadUsers(),
        api.loadProjects(),
      ]);
      setOverview(overviewData);
      setUsers(usersData);
      setProjects(projectsData);

      if (currentUserId) {
        const tasksData = await api.loadMyTasks(currentUserId);
        setMyTasks(tasksData);
      }

      if (selectedProjectId) {
        try {
          const detail = await api.loadProjectDetail(selectedProjectId);
          setProjectDetail(detail);
        } catch (e) {
          setSelectedProjectId(null);
          setProjectDetail(null);
        }
      }
    } catch (error) {
      showToast('刷新数据失败', 'error');
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, [currentUserId, selectedProjectId]);

  const handleEnter = async (user) => {
    setCurrentUserId(user.id);
    setEntered(true);
    setView('overview');
    setIsLoading(true);
    try {
      const [overviewData, usersData, projectsData] = await Promise.all([
        api.loadOverview(),
        api.loadUsers(),
        api.loadProjects(),
      ]);
      setOverview(overviewData);
      setUsers(usersData);
      setProjects(projectsData);
      const tasksData = await api.loadMyTasks(user.id);
      setMyTasks(tasksData);
    } catch (error) {
      showToast('加载数据失败', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setEntered(false);
    setCurrentUserId(null);
    setSelectedProjectId(null);
    setOverview(null);
    setMyTasks([]);
    setProjectDetail(null);
  };

  const handleSelectProject = async (projectId) => {
    setSelectedProjectId(projectId);
    if (projectId) {
      try {
        const detail = await api.loadProjectDetail(projectId);
        setProjectDetail(detail);
      } catch (error) {
        showToast('加载项目详情失败', 'error');
      }
    } else {
      setProjectDetail(null);
    }
  };

  const handleDataChange = () => {
    refreshCoreData(true);
  };

  useEffect(() => {
    if (!entered) {
      api.loadUsers().then(setUsers).catch(() => {});
    }
  }, [entered]);

  if (!entered) {
    return (
      <>
        <WelcomePage onEnter={handleEnter} users={users} />
        <ToastContainer />
      </>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      <GlobalBackground />
      <Sidebar
        currentView={view}
        onViewChange={(v) => {
          setView(v);
          if (v !== 'projects') setSelectedProjectId(null);
        }}
        onLogout={handleLogout}
        currentUser={currentUser}
      />
      <main className="flex-1 overflow-auto p-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(5px)' }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="h-full"
          >
            {view === 'overview' && (
              <DashboardView overview={overview} projects={projects} currentUser={currentUser} onRefresh={handleDataChange} />
            )}
            {view === 'projects' && (
              <ProjectsView
                projects={projects} users={users} currentUserId={currentUserId}
                selectedProjectId={selectedProjectId} projectDetail={projectDetail}
                onSelectProject={handleSelectProject} onDataChange={handleDataChange}
              />
            )}
            {view === 'myTasks' && (
              <MyTasksView tasks={myTasks} users={users} projects={projects} currentUserId={currentUserId} onDataChange={handleDataChange} />
            )}
            {view === 'users' && (
              <UsersView users={users} projects={projects} onDataChange={handleDataChange} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      {isRefreshing && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="glass-panel px-4 py-2 flex items-center gap-2">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-gray-400">同步中...</span>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

export default App;