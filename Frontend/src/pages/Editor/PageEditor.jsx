import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, MessageSquare, Users } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import useSocket from '../../hooks/useSocket';
import RichTextEditor from '../../Components/Editor/RichTextEditor';
import EditorToolbar from '../../Components/Editor/EditorToolbar';
import LiveCursor from '../../Components/Collaboration/LiveCursor';
import ActiveUsers from '../../Components/Collaboration/ActiveUsers';
import CommentThread from '../../Components/Comments/CommentThread';
import Breadcrumbs from '../../Components/Navigation/Breadcrumbs';
import VersionDiffViewer from '../../Components/Version/VersionDiffViewer';

const PageEditor = () => {
  const { projectId, pageId } = useParams();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const [page, setPage] = useState(null);
  const [title, setTitle] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [cursors, setCursors] = useState({});
  const [showComments, setShowComments] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [editor, setEditor] = useState(null);
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    if (pageId) {
      fetchPage();
    }

    // Cleanup function
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [pageId]);

  // Socket.IO real-time collaboration
  useEffect(() => {
    if (!socket || !isConnected || !pageId || !user) return;

    // Join page room
    socket.emit('join-page', {
      pageId,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

    // Listen for user events
    socket.on('user-joined', (data) => {
      setActiveUsers((prev) => {
        const exists = prev.find((u) => u.id === data.user.id);
        if (exists) return prev;
        return [...prev, data.user];
      });
    });

    socket.on('user-left', (data) => {
      setActiveUsers((prev) => prev.filter((u) => u.id !== data.userId));
      setCursors((prev) => {
        const newCursors = { ...prev };
        delete newCursors[data.userId];
        return newCursors;
      });
    });

    socket.on('cursor-update', (data) => {
      console.log('👆 Cursor update received:', data);
      if (data.userId !== user._id) {
        setCursors((prev) => ({
          ...prev,
          [data.userId]: data,
        }));
      }
    });

    return () => {
      socket.emit('leave-page', { pageId });
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('cursor-update');
    };
  }, [socket, isConnected, pageId, user]);

  const fetchPage = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.PAGE_BY_ID(pageId), {
        withCredentials: true,
      });

      const pageData = response.data.page;
      setPage(pageData);
      setTitle(pageData.title);
      setLastSaved(new Date(pageData.updatedAt));
    } catch (error) {
      console.error('Failed to fetch page:', error);
    }
  };

  const handleContentUpdate = useCallback(async (newContent) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set saving indicator
    setSaving(true);

    // Debounce the save operation
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('💾 Saving page content...');
        await axios.put(
          API_ENDPOINTS.PAGE_BY_ID(pageId),
          {
            title,
            content: newContent,
          },
          { withCredentials: true }
        );

        setLastSaved(new Date());
        console.log('✅ Page saved successfully');
      } catch (error) {
        console.error('❌ Failed to save page:', error);
      } finally {
        setSaving(false);
      }
    }, 1000); // Save after 1 second of inactivity
  }, [pageId, title]);

  const handleTitleChange = async (newTitle) => {
    setTitle(newTitle);
    try {
      await axios.put(
        API_ENDPOINTS.PAGE_BY_ID(pageId),
        {
          title: newTitle,
          content: page?.content || '',
        },
        { withCredentials: true }
      );
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save title:', error);
    }
  };

  if (!page) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} p-4`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/project/${projectId}`)}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
            >
              <ChevronLeft size={20} />
            </button>
            <Breadcrumbs pageId={pageId} projectId={projectId} isDark={isDark} />
          </div>

          <div className="flex items-center gap-3">
            {/* Active Users */}
            <ActiveUsers users={activeUsers} isDark={isDark} />

            {/* Version History */}
            <button
              onClick={() => setShowVersions(true)}
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
              title="Version History"
            >
              <Clock size={20} />
            </button>

            {/* Comments Toggle */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
            >
              <MessageSquare size={20} />
            </button>

            {/* Last Saved / Saving Indicator */}
            <div className="flex items-center gap-2">
              {saving ? (
                <span className="text-sm text-blue-500 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                  Saving...
                </span>
              ) : lastSaved ? (
                <span className="text-sm text-gray-400">
                  Saved {new Date(lastSaved).toLocaleTimeString()}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className={`w-full text-3xl font-bold bg-transparent border-none outline-none ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
          placeholder="Untitled Page"
        />
      </div>

      {/* Editor with Toolbar */}
      <div className="flex-1 overflow-hidden relative">
        {/* Editor Toolbar */}
        {editor && <EditorToolbar editor={editor} isDark={isDark} />}

        {/* Rich Text Editor with Live Cursors */}
        <div className="relative h-full">
          <RichTextEditor
            pageId={pageId}
            initialContent={page.content}
            onUpdate={handleContentUpdate}
            socket={socket}
            user={user}
            isDark={isDark}
            onEditorReady={setEditor}
          />

          {/* Live Cursors */}
          {Object.values(cursors).map((cursor) => (
            <LiveCursor
              key={cursor.userId}
              position={cursor.position}
              user={{ name: cursor.userName }}
              color={cursor.userColor}
            />
          ))}
        </div>
      </div>

      {/* Comment Thread Panel */}
      {showComments && (
        <CommentThread
          pageId={pageId}
          isDark={isDark}
          onClose={() => setShowComments(false)}
        />
      )}

      {/* Version Diff Viewer */}
      {showVersions && (
        <VersionDiffViewer
          pageId={pageId}
          isDark={isDark}
          onClose={() => setShowVersions(false)}
        />
      )}
    </div>
  );
};

export default PageEditor;
