import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const ProjectContext = createContext();

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_ENDPOINTS.PROJECTS, {
        withCredentials: true,
      });
      setProjects(response.data.projects || []);
      
      // Set first project as current if none selected
      if (!currentProject && response.data.projects?.length > 0) {
        setCurrentProject(response.data.projects[0]);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData) => {
    try {
      const response = await axios.post(
        API_ENDPOINTS.PROJECTS,
        projectData,
        { withCredentials: true }
      );
      
      const newProject = response.data.project;
      setProjects(prev => [...prev, newProject]);
      return { success: true, project: newProject };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create project',
      };
    }
  };

  const updateProject = async (projectId, projectData) => {
    try {
      const response = await axios.put(
        API_ENDPOINTS.PROJECT_BY_ID(projectId),
        projectData,
        { withCredentials: true }
      );
      
      const updatedProject = response.data.project;
      setProjects(prev =>
        prev.map(p => (p._id === projectId ? updatedProject : p))
      );
      
      if (currentProject?._id === projectId) {
        setCurrentProject(updatedProject);
      }
      
      return { success: true, project: updatedProject };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update project',
      };
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await axios.delete(API_ENDPOINTS.PROJECT_BY_ID(projectId), {
        withCredentials: true,
      });
      
      setProjects(prev => prev.filter(p => p._id !== projectId));
      
      if (currentProject?._id === projectId) {
        setCurrentProject(projects[0] || null);
      }
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete project',
      };
    }
  };

  const selectProject = (project) => {
    setCurrentProject(project);
    localStorage.setItem('currentProjectId', project._id);
  };

  const value = {
    projects,
    currentProject,
    loading,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    selectProject,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};
