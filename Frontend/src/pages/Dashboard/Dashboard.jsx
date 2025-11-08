import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Layout, Users, Calendar } from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import CreateProjectModal from '../../Components/Modals/CreateProjectModal';

const Dashboard = () => {
  const { projects, currentProject, fetchProjects } = useProject();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh dashboard data when component mounts or user navigates to it
  useEffect(() => {
    const refreshDashboard = async () => {
      setIsRefreshing(true);
      await fetchProjects();
      setIsRefreshing(false);
    };
    
    refreshDashboard();
  }, []);

  const stats = [
    {
      icon: Layout,
      label: 'Total Projects',
      value: projects.length,
      color: 'bg-blue-500',
    },
    {
      icon: FileText,
      label: 'Total Pages',
      value: projects.reduce((acc, p) => acc + (p.pagesCount || 0), 0),
      color: 'bg-green-500',
    },
    {
      icon: Users,
      label: 'Team Members',
      value: projects.reduce((acc, p) => acc + (p.membersCount || 0), 0),
      color: 'bg-purple-500',
    },
    {
      icon: Calendar,
      label: 'Active Tasks',
      value: projects.reduce((acc, p) => acc + (p.tasksCount || 0), 0),
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className={`p-8 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`rounded-xl p-6 ${
              isDark ? 'bg-gray-800' : 'bg-white'
            } shadow-sm hover:shadow-md transition-shadow card-hover`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  } mb-1`}
                >
                  {stat.label}
                </p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Projects Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Your Projects</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>New Project</span>
          </button>
        </div>

        {projects.length === 0 ? (
          <div
            className={`text-center py-16 rounded-xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <Layout
              className={`mx-auto mb-4 ${
                isDark ? 'text-gray-600' : 'text-gray-400'
              }`}
              size={48}
            />
            <h3
              className={`text-xl font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              No Projects Yet
            </h3>
            <p
              className={`mb-6 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Create your first project to get started with collaboration
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                onClick={() => navigate(`/project/${project._id}`)}
                className={`rounded-xl p-6 cursor-pointer ${
                  isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
                } shadow-sm hover:shadow-md transition-all card-hover`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-lg ${
                      project.color || 'bg-blue-500'
                    } flex items-center justify-center text-white text-xl font-bold`}
                  >
                    {project.name.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      isDark
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {project.role || 'Member'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                <p
                  className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  } mb-4 line-clamp-2`}
                >
                  {project.description || 'No description provided'}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <FileText size={14} />
                    <span>{project.pagesCount || 0} pages</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{project.membersCount || 0} members</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <div
          className={`rounded-xl p-6 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          } shadow-sm`}
        >
          {recentActivity.length === 0 ? (
            <p
              className={`text-center py-8 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              No recent activity to display
            </p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    {activity.user.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.action}</p>
                    <p
                      className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
