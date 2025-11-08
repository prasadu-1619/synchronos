import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, FileText, Plus, MoreVertical, Trash, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const PageTreeItem = ({ page, level = 0, onDelete, onRename, isDark, projectId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/project/${projectId}/page/${page._id}`);
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer group ${
          isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {page.children && page.children.length > 0 ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="p-0.5"
          >
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <div className="w-4" />
        )}

        <FileText size={16} className="text-blue-500" />
        
        <span
          onClick={handleClick}
          className="flex-1 text-sm truncate"
        >
          {page.title}
        </span>

        <div className="relative opacity-0 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <MoreVertical size={14} />
          </button>

          {showMenu && (
            <div
              className={`absolute right-0 mt-1 w-40 rounded-lg shadow-lg border z-10 ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <button
                onClick={() => {
                  onRename(page);
                  setShowMenu(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <Edit size={14} />
                Rename
              </button>
              <button
                onClick={() => {
                  onDelete(page._id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {isOpen && page.children && page.children.length > 0 && (
        <div>
          {page.children.map((child) => (
            <PageTreeItem
              key={child._id}
              page={child}
              level={level + 1}
              onDelete={onDelete}
              onRename={onRename}
              isDark={isDark}
              projectId={projectId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const PageNavigationTree = ({ projectId, isDark, currentPageId }) => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPages();
  }, [projectId]);

  const fetchPages = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.PAGES}?projectId=${projectId}`, {
        withCredentials: true,
      });
      
      // Build tree structure
      const pagesData = response.data.pages || [];
      const tree = buildTree(pagesData);
      setPages(tree);
    } catch (error) {
      console.error('Failed to fetch pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (pages) => {
    const map = {};
    const roots = [];

    pages.forEach((page) => {
      map[page._id] = { ...page, children: [] };
    });

    pages.forEach((page) => {
      if (page.parent) {
        if (map[page.parent]) {
          map[page.parent].children.push(map[page._id]);
        }
      } else {
        roots.push(map[page._id]);
      }
    });

    return roots;
  };

  const handleDelete = async (pageId) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      await axios.delete(API_ENDPOINTS.PAGE_BY_ID(pageId), {
        withCredentials: true,
      });
      fetchPages();
    } catch (error) {
      console.error('Failed to delete page:', error);
    }
  };

  const handleRename = async (page) => {
    const newTitle = prompt('Enter new title:', page.title);
    if (!newTitle || newTitle === page.title) return;

    try {
      await axios.put(
        API_ENDPOINTS.PAGE_BY_ID(page._id),
        { title: newTitle },
        { withCredentials: true }
      );
      fetchPages();
    } catch (error) {
      console.error('Failed to rename page:', error);
    }
  };

  const handleCreatePage = async () => {
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
      fetchPages();
    } catch (error) {
      console.error('Failed to create page:', error);
    }
  };

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Loading pages...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-sm">Pages</h3>
        <button
          onClick={handleCreatePage}
          className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700`}
          title="New Page"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {pages.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500">
            <FileText size={32} className="mx-auto mb-2 opacity-50" />
            <p>No pages yet</p>
            <button
              onClick={handleCreatePage}
              className="mt-2 text-blue-500 hover:underline"
            >
              Create your first page
            </button>
          </div>
        ) : (
          pages.map((page) => (
            <PageTreeItem
              key={page._id}
              page={page}
              onDelete={handleDelete}
              onRename={handleRename}
              isDark={isDark}
              projectId={projectId}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PageNavigationTree;
