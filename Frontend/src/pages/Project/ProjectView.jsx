import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Plus, LayoutGrid, List, UserPlus, Search as SearchIcon } from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import PageNavigationTree from '../../Components/Navigation/PageNavigationTree';
import InviteMemberModal from '../../Components/Invitation/InviteMemberModal';
import InvitationList from '../../Components/Invitation/InvitationList';
import SearchModal from '../../Components/Search/SearchModal';

const ProjectView = () => {
  const { projectId } = useParams();
  const { currentProject, selectProject, projects } = useProject();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Global search keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (projectId) {
      const project = projects.find((p) => p._id === projectId);
      if (project && currentProject?._id !== projectId) {
        selectProject(project);
      }
      fetchProjectData();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      // Fetch pages and boards for this project
      const [pagesRes, boardsRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.PAGES}?projectId=${projectId}`, {
          withCredentials: true,
        }),
        axios.get(`${API_ENDPOINTS.BOARDS}?projectId=${projectId}`, {
          withCredentials: true,
        }),
      ]);

      setPages(pagesRes.data.pages || []);
      setBoards(boardsRes.data.boards || []);
    } catch (error) {
      console.error('Failed to fetch project data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract plain text from HTML content
  const getPlainTextPreview = (content) => {
    if (!content) return 'Empty page';
    
    // Remove HTML tags
    const text = content.replace(/<[^>]*>/g, '');
    // Remove extra whitespace
    const cleaned = text.replace(/\s+/g, ' ').trim();
    // Return first 100 characters
    return cleaned.substring(0, 100) || 'Empty page';
  };

  const createNewPage = async () => {
    try {
      const response = await axios.post(
        API_ENDPOINTS.PAGES,
        {
          project: projectId,
          title: 'Untitled Page',
          content: '',
        },
        { withCredentials: true }
      );

      const newPage = response.data.page;
      navigate(`/project/${projectId}/page/${newPage._id}`);
    } catch (error) {
      console.error('Failed to create page:', error);
    }
  };

  const createNewBoard = async () => {
    try {
      const response = await axios.post(
        API_ENDPOINTS.BOARDS,
        {
          project: projectId,
          name: 'New Board',
        },
        { withCredentials: true }
      );

      const newBoard = response.data.board;
      navigate(`/project/${projectId}/board/${newBoard._id}`);
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col md:flex-row h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Left Sidebar - Page Navigation Tree - Hidden on mobile, show as drawer */}
      <div className={`hidden md:block md:w-64 border-r ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} overflow-y-auto`}>
        <div className="p-4">
          <h3 className="font-semibold mb-3">Pages</h3>
          <PageNavigationTree projectId={projectId} isDark={isDark} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">{currentProject?.name}</h1>
              <p className={`text-sm md:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentProject?.description || 'No description'}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSearch(true)}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
                title="Search (Ctrl+K)"
              >
                <SearchIcon size={18} className="md:w-5 md:h-5" />
                <span className="hidden sm:inline text-sm">Ctrl+K</span>
              </button>
              
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm md:text-base"
              >
                <UserPlus size={18} className="md:w-5 md:h-5" />
                <span className="hidden sm:inline">Invite Member</span>
                <span className="sm:hidden">Invite</span>
              </button>
            </div>
          </div>

          {/* Invitations Link */}
          <button
            onClick={() => setShowInvitations(!showInvitations)}
            className="text-xs md:text-sm text-blue-500 hover:underline mb-3 md:mb-4"
          >
            {showInvitations ? 'Hide' : 'View'} Pending Invitations
          </button>

          {showInvitations && (
            <div className="mb-4 md:mb-6">
              <InvitationList projectId={projectId} isDark={isDark} />
            </div>
          )}
        </div>

        {/* Pages Section */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 md:mb-4 gap-3">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <FileText size={20} className="md:w-6 md:h-6" />
              Pages
            </h2>
            <button
              onClick={createNewPage}
              className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center text-sm md:text-base"
            >
              <Plus size={18} className="md:w-5 md:h-5" />
              New Page
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
            {pages.map((page) => (
              <div
                key={page._id}
                onClick={() => navigate(`/project/${projectId}/page/${page._id}`)}
                className={`p-3 md:p-4 rounded-lg cursor-pointer ${
                  isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
                } shadow-sm hover:shadow-md transition-all card-hover`}
              >
                <div className="flex items-start gap-2 md:gap-3">
                  <FileText size={18} className="text-blue-500 mt-1 flex-shrink-0 md:w-5 md:h-5" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 text-sm md:text-base truncate">{page.title}</h3>
                    <p
                      className={`text-xs md:text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      } line-clamp-2`}
                    >
                      {getPlainTextPreview(page.content)}
                    </p>
                    <p
                      className={`text-xs mt-2 ${
                        isDark ? 'text-gray-500' : 'text-gray-500'
                      }`}
                    >
                      Updated {new Date(page.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {pages.length === 0 && (
              <div
                className={`col-span-full text-center py-8 md:py-12 rounded-lg ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <p className={`text-sm md:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No pages yet. Create your first page to get started!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Boards Section */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 md:mb-4 gap-3">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <LayoutGrid size={20} className="md:w-6 md:h-6" />
              Kanban Boards
            </h2>
            <button
              onClick={createNewBoard}
              className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center text-sm md:text-base"
            >
              <Plus size={18} className="md:w-5 md:h-5" />
              New Board
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
            {boards.map((board) => (
              <div
                key={board._id}
                onClick={() => navigate(`/project/${projectId}/board/${board._id}`)}
                className={`p-3 md:p-4 rounded-lg cursor-pointer ${
                  isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
                } shadow-sm hover:shadow-md transition-all card-hover`}
              >
                <div className="flex items-start gap-2 md:gap-3">
                  <LayoutGrid size={18} className="text-green-500 mt-1 flex-shrink-0 md:w-5 md:h-5" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 text-sm md:text-base truncate">{board.name}</h3>
                    <p
                      className={`text-xs md:text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {board.cardsCount || 0} cards
                    </p>
                    <p
                      className={`text-xs mt-2 ${
                        isDark ? 'text-gray-500' : 'text-gray-500'
                      }`}
                    >
                      Updated {new Date(board.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {boards.length === 0 && (
              <div
                className={`col-span-full text-center py-8 md:py-12 rounded-lg ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <p className={`text-sm md:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No boards yet. Create your first Kanban board!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        projectId={projectId}
        isDark={isDark}
        onInviteSent={fetchProjectData}
      />

      <SearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        projectId={projectId}
        isDark={isDark}
      />
    </div>
  );
};

export default ProjectView;
