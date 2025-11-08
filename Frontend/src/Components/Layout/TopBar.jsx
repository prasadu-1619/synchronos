import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sun, 
  Moon, 
  Menu, 
  Bell, 
  User, 
  LogOut,
  Search,
  FileText,
  Trello,
  Users,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import logolight from '../../assets/images/logolight.png';
import logo4 from '../../assets/images/logo4.png';

const TopBar = ({ sidebarCollapsed, setSidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ pages: [], cards: [], projects: [] });
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults({ pages: [], cards: [], projects: [] });
      setShowSearchResults(false);
      return;
    }

    const delaySearch = setTimeout(async () => {
      await performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const performSearch = async (query) => {
    setIsSearching(true);
    try {
      const response = await axios.get(API_ENDPOINTS.SEARCH, {
        params: { query },
        withCredentials: true,
      });

      const results = response.data.results || {};
      
      setSearchResults({
        pages: results.pages || [],
        cards: results.cards || [],
        projects: results.projects || [],
      });

      setShowSearchResults(true);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults({ pages: [], cards: [], projects: [] });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchItemClick = (type, item) => {
    setSearchQuery('');
    setShowSearchResults(false);

    switch (type) {
      case 'page':
        navigate(`/editor/${item._id}`);
        break;
      case 'card':
        navigate(`/project/${item.board?.project || item.project}/board/${item.board?._id || item.board}`);
        break;
      case 'project':
        navigate(`/project/${item._id}`);
        break;
      default:
        break;
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults({ pages: [], cards: [], projects: [] });
    setShowSearchResults(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const totalResults = searchResults.pages.length + searchResults.cards.length + searchResults.projects.length;

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
      <div className="flex-1 max-w-2xl mx-4" ref={searchRef}>
        <div className={`relative ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim().length >= 2 && setShowSearchResults(true)}
            placeholder="Search pages, cards, projects..."
            className={`w-full pl-10 pr-10 py-2 rounded-lg ${
              isDark
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
            } border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && (
          <div
            className={`absolute mt-2 w-full max-w-2xl rounded-lg shadow-2xl border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } max-h-96 overflow-y-auto z-50`}
          >
            {isSearching ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Searching...</p>
              </div>
            ) : totalResults === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Search size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No results found for "{searchQuery}"</p>
              </div>
            ) : (
              <>
                {/* Pages Results */}
                {searchResults.pages.length > 0 && (
                  <div className="p-2">
                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                      <FileText size={14} />
                      Pages ({searchResults.pages.length})
                    </div>
                    {searchResults.pages.map((page) => (
                      <button
                        key={page._id}
                        onClick={() => handleSearchItemClick('page', page)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={16} className="text-blue-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{page.title}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {page.project?.name || 'Unknown Project'}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Cards Results */}
                {searchResults.cards.length > 0 && (
                  <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                      <Trello size={14} />
                      Cards ({searchResults.cards.length})
                    </div>
                    {searchResults.cards.map((card) => (
                      <button
                        key={card._id}
                        onClick={() => handleSearchItemClick('card', card)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Trello size={16} className="text-green-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{card.title}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {card.column || 'No status'} • {card.board?.name || 'Unknown Board'}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Projects Results */}
                {searchResults.projects.length > 0 && (
                  <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                      <Users size={14} />
                      Projects ({searchResults.projects.length})
                    </div>
                    {searchResults.projects.map((project) => (
                      <button
                        key={project._id}
                        onClick={() => handleSearchItemClick('project', project)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Users size={16} className="text-purple-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{project.name}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {project.members?.length || 0} members
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
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
