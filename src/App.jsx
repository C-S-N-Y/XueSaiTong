import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WelcomePage from './pages/WelcomePage';
import DashboardView from './pages/DashboardView';
import ProjectsView from './pages/ProjectsView';
import MyTasksView from './pages/MyTasksView';
import UsersView from './pages/UsersView';
import NotificationsView from './pages/NotificationsView';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/Toast';
import LoadingSpinner from './components/LoadingSpinner';
import GlobalBackground from './components/GlobalBackground';
import { api, getToken, clearToken, setUnauthorizedHandler } from './api/request';
import { showToast } from './utils/helpers';

function App() {
  const [entered, setEntered] = useState(false);
  const [view, setView] = useState('overview');
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearToken();
      setEntered(false);
      setCurrentUser(null);
      showToast('登录已过期，请重新登录', 'error');
    });
  }, []);

  useEffect(() => {
    const token = getToken();
    if (token) {
      api.getCurrentUser()
        .then(user => {
          setCurrentUser(user);
          setEntered(true);
          loadInitialData(user.id);
        })
        .catch(() => {
          clearToken();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadInitialData = async (userId) => {
    try {
      const [overviewData, usersData, projectsData, tasksData] = await Promise.all([
        api.getDashboardOverview(),
        api.getUsers(),
        api.getProjects(),
        api.getMyTasks(userId),
      ]);
      setOverview(overviewData);
      setUsers(usersData);
      setProjects(projectsData);
      setMyTasks(tasksData);
    } catch (error) {
      showToast('加载数据失败', 'error');
    }
  };

  const handleEnter = async (user) => {
    setCurrentUser(user);
    setEntered(true);
    setIsLoading(true);
    await loadInitialData(user.id);
    setIsLoading(false);
  };

  const handleLogout = () => {
    clearToken();
    setEntered(false);
    setCurrentUser(null);
  };

  const refreshData = useCallback(() => {
    if (currentUser) loadInitialData(currentUser.id);
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!entered) {
    return (
      <>
        <WelcomePage onEnter={handleEnter} />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      <GlobalBackground />
      <Sidebar currentView={view} onViewChange={setView} onLogout={handleLogout} currentUser={currentUser} />
      <main className="flex-1 overflow-auto p-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {view === 'overview' && <DashboardView overview={overview} onRefresh={refreshData} />}
            {view === 'projects' && (
              <ProjectsView
                projects={projects}
                currentUser={currentUser}
                selectedProjectId={selectedProjectId}
                onSelectProject={setSelectedProjectId}
                onDataChange={refreshData}
              />
            )}
            {view === 'myTasks' && <MyTasksView tasks={myTasks} onDataChange={refreshData} />}
            {view === 'users' && <UsersView users={users} />}
            {view === 'notifications' && <NotificationsView />}
          </motion.div>
        </AnimatePresence>
      </main>
      <ToastContainer />
    </div>
  );
}

export default App;