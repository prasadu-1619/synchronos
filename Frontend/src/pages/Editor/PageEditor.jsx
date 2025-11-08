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
  
  // Edit locking states
  const [isPageLocked, setIsPageLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState(null);
  const [hasEditLock, setHasEditLock] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const lastContentRef = useRef(''); // To prevent infinite loops

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

    // Listen for page lock status
    socket.on('page-locked', (data) => {
      setIsPageLocked(data.isLocked);
      setLockedBy(data.lockedBy || null);
      
      if (data.isLocked && data.lockedBy) {
        console.log(`🔒 Page locked by ${data.lockedBy.userName}`);
      } else {
        console.log('🔓 Page unlocked');
      }
    });

    // Listen for edit lock granted
    socket.on('edit-lock-granted', () => {
      setHasEditLock(true);
      console.log('✅ Edit lock granted');
    });

    // Listen for edit lock denied
    socket.on('edit-lock-denied', (data) => {
      setHasEditLock(false);
      alert(`This page is currently being edited by ${data.lockedBy.userName}. You can view but cannot edit.`);
      console.log(`❌ Edit lock denied - locked by ${data.lockedBy.userName}`);
    });

    // Listen for unauthorized edit attempts
    socket.on('edit-unauthorized', (data) => {
      console.error('🚫 Unauthorized edit attempt:', data.message);
      setIsEditing(false);
      setHasEditLock(false);
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

    // Listen for content updates from other users (prevent infinite loop)
    socket.on('content-update', (data) => {
      if (data.userId !== user._id && editor && data.content !== lastContentRef.current) {
        console.log('📝 Received content update from another user');
        lastContentRef.current = data.content;
        
        // Update editor content without triggering onChange
        const currentPos = editor.state.selection.anchor;
        editor.commands.setContent(data.content, false);
        
        // Try to restore cursor position
        if (currentPos && currentPos <= editor.state.doc.content.size) {
          editor.commands.setTextSelection(currentPos);
        }
      }
    });

    return () => {
      // Release edit lock if we have it
      if (hasEditLock) {
        socket.emit('release-edit-lock', { pageId });
      }
      
      socket.emit('leave-page', { pageId });
      socket.off('page-locked');
      socket.off('edit-lock-granted');
      socket.off('edit-lock-denied');
      socket.off('edit-unauthorized');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('cursor-update');
      socket.off('content-update');
    };
  }, [socket, isConnected, pageId, user, editor, hasEditLock]);

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
    // Prevent infinite loop by checking if content actually changed
    if (newContent === lastContentRef.current) {
      return;
    }
    
    lastContentRef.current = newContent;
    
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

  const requestEditLock = () => {
    if (socket && isConnected) {
      socket.emit('request-edit-lock', { pageId });
      setIsEditing(true);
    }
  };

  const releaseEditLock = () => {
    if (socket && isConnected && hasEditLock) {
      socket.emit('release-edit-lock', { pageId });
      setHasEditLock(false);
      setIsEditing(false);
    }
  };

  // Set up socket listeners for user presence

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
      <div className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} p-3 md:p-4`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <button
              onClick={() => navigate(`/project/${projectId}`)}
              className={`p-2 rounded ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
            >
              <ChevronLeft size={18} className="md:w-5 md:h-5" />
            </button>
            <Breadcrumbs pageId={pageId} projectId={projectId} isDark={isDark} />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Active Users */}
            <ActiveUsers users={activeUsers} isDark={isDark} />

            {/* Version History */}
            <button
              onClick={() => setShowVersions(true)}
              className={`hidden md:flex items-center gap-2 px-3 py-2 rounded ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
              title="Version History"
            >
              <Clock size={20} />
            </button>

            {/* Comments Toggle */}
            <button
              onClick={() => setShowComments(!showComments)}
              className={`hidden md:flex items-center gap-2 px-3 py-2 rounded ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
            >
              <MessageSquare size={20} />
            </button>

            {/* Last Saved / Saving Indicator */}
            <div className="hidden md:flex items-center gap-2">
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
        {/* Editor Toolbar - Always show when editor is ready */}
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
            editable={true}
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
