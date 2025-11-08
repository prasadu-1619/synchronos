import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home, 
  FolderKanban, 
  FileText, 
  Activity, 
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import { useTheme } from '../../contexts/ThemeContext';
import CreateProjectModal from '../Modals/CreateProjectModal';

const Sidebar = ({ collapsed }) => {
  const { projects, currentProject, selectProject } = useProject();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Activity, label: 'Activity Feed', path: '/activity' },
    { icon: SettingsIcon, label: 'Settings', path: '/settings' },
  ];

  const handleProjectClick = (project) => {
    selectProject(project);
    navigate(`/project/${project._id}`);
  };

  return (
    <>
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] ${
          collapsed ? 'w-16' : 'w-64'
        } ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-r transition-all duration-300 sidebar overflow-y-auto`}
      >
        <div className="p-4">
          {/* Main Menu */}
          <nav className="space-y-2 mb-6">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                title={collapsed ? item.label : ''}
              >
                <item.icon size={20} />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            ))}
          </nav>

          {/* Projects Section */}
          {!collapsed && (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3
                  className={`text-xs font-semibold uppercase ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Projects
                </h3>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className={`p-1 rounded hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors`}
                  title="Create Project"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="space-y-1">
                {projects.map((project) => (
                  <button
                    key={project._id}
                    onClick={() => handleProjectClick(project)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                      currentProject?._id === project._id
                        ? isDark
                          ? 'bg-blue-900 text-blue-200'
                          : 'bg-blue-50 text-blue-600'
                        : isDark
                        ? 'hover:bg-gray-700 text-gray-300'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <FolderKanban size={18} />
                    <span className="text-sm truncate">{project.name}</span>
                  </button>
                ))}

                {projects.length === 0 && (
                  <p
                    className={`text-xs ${
                      isDark ? 'text-gray-500' : 'text-gray-400'
                    } text-center py-4`}
                  >
                    No projects yet
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </aside>

      {showCreateModal && (
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
