import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sun, 
  Moon, 
  Menu, 
  Bell, 
  User, 
  LogOut,
  Search
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import logolight from '../../assets/images/logolight.png';
import logo4 from '../../assets/images/logo4.png';

const TopBar = ({ sidebarCollapsed, setSidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 h-16 ${
        isDark
          ? 'bg-gradient-to-r from-black to-[#1a3a4e] text-white border-b border-gray-700'
          : 'bg-gradient-to-r from-[#b1fafe] to-white text-black border-b border-gray-200'
      } z-50 px-4 flex items-center justify-between shadow-sm`}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`p-2 rounded-lg transition-colors ${
            isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
        >
          <Menu size={20} />
        </button>

        <div onClick={() => navigate('/dashboard')} className="cursor-pointer">
          <img className="h-8" src={isDark ? logo4 : logolight} alt="Logo" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-2xl mx-4">
        <div className={`relative ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={18} />
          <input
            type="text"
            placeholder="Search pages, cards, projects..."
            className={`w-full pl-10 pr-4 py-2 rounded-lg ${
              isDark
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
            } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-colors ${
            isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
          title={isDark ? 'Light Mode' : 'Dark Mode'}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <button
          className={`p-2 rounded-lg transition-colors relative ${
            isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
          title="Notifications"
        >
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isDark ? 'bg-blue-600' : 'bg-blue-500'
              } text-white font-medium`}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium hidden md:block">
              {user?.name || 'User'}
            </span>
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              ></div>
              <div
                className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                } border ${
                  isDark ? 'border-gray-700' : 'border-gray-200'
                } z-50 animate-fade-in`}
              >
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowUserMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <User size={16} />
                    <span className="text-sm">Profile Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-red-600 ${
                      isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <LogOut size={16} />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
