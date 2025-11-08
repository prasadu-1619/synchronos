import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProjectProvider } from './contexts/ProjectContext';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import ProjectView from './pages/Project/ProjectView';
import PageEditor from './pages/Editor/PageEditor';
import KanbanBoard from './pages/Kanban/KanbanBoard';
import ActivityFeed from './pages/Activity/ActivityFeed';
import Settings from './pages/Settings/Settings';
import AcceptInvitationPage from './Components/Invitation/AcceptInvitationPage';

// Layout
import MainLayout from './layouts/MainLayout';
import Loader from './Components/Loader/Loader';

import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      
      {/* Accept Invitation Route (Public) */}
      <Route path="/accept-invitation/:token" element={<AcceptInvitationPage />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="project/:projectId" element={<ProjectView />} />
        <Route path="project/:projectId/page/:pageId" element={<PageEditor />} />
        <Route path="project/:projectId/board/:boardId" element={<KanbanBoard />} />
        <Route path="activity" element={<ActivityFeed />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProjectProvider>
          <Router>
            <AppRoutes />
          </Router>
        </ProjectProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
