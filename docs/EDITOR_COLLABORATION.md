# Editor Structure and Collaboration Logic

## Overview

The PageEditor is the core component enabling collaborative document editing with real-time synchronization, edit locking, and presence awareness. It uses Tiptap editor with Socket.IO for real-time features.

## Editor Architecture

### Component Structure

```
PageEditor (Container)
├── RichTextEditor (Main Editor)
│   ├── Tiptap Editor Instance
│   ├── Extensions (StarterKit, Link, Image, etc.)
│   └── SlashCommands (Command Palette)
├── EditorToolbar (Formatting Controls)
├── ActiveUsers (Presence Display)
├── LiveCursor (Other Users' Cursors)
├── CommentThread (Inline Comments)
├── VersionDiffViewer (Version History)
└── Breadcrumbs (Navigation)
```

### State Management

The PageEditor manages multiple state categories:

#### Document State
```javascript
const [page, setPage] = useState(null);           // Page data from API
const [title, setTitle] = useState('');           // Document title
const [editor, setEditor] = useState(null);       // Tiptap editor instance
const [lastSaved, setLastSaved] = useState(null); // Last save timestamp
const [saving, setSaving] = useState(false);      // Save in progress
```

#### Collaboration State
```javascript
const [activeUsers, setActiveUsers] = useState([]);    // List of users in page
const [cursors, setCursors] = useState({});            // Other users' cursors
const [isPageLocked, setIsPageLocked] = useState(false); // Page lock status
const [lockedBy, setLockedBy] = useState(null);        // Who locked the page
const [hasEditLock, setHasEditLock] = useState(false); // Current user has lock
const [isEditing, setIsEditing] = useState(false);     // User is editing
```

#### UI State
```javascript
const [showComments, setShowComments] = useState(false);   // Comments panel
const [showVersions, setShowVersions] = useState(false);   // Version history
```

## Tiptap Editor Configuration

### Extensions Used

#### 1. **StarterKit**
Base functionality including:
- Bold, Italic, Strike, Code
- Headings (H1-H6)
- Bullet Lists, Ordered Lists
- Blockquote, Code Block
- Horizontal Rule
- Hard Break, Paragraph

```javascript
StarterKit.configure({
  codeBlock: false,  // Using CodeBlockLowlight instead
  hardBreak: false,  // Custom HardBreak configuration
})
```

#### 2. **Link Extension**
```javascript
Link.configure({
  openOnClick: false,
  HTMLAttributes: {
    class: 'text-blue-500 underline cursor-pointer hover:text-blue-700',
  },
})
```

#### 3. **Image Extension**
```javascript
Image.configure({
  HTMLAttributes: {
    class: 'rounded-lg max-w-full h-auto',
  },
})
```

#### 4. **Table Extensions**
```javascript
Table.configure({ resizable: true })
TableRow
TableHeader
TableCell
```

#### 5. **Task List**
```javascript
TaskList
TaskItem.configure({ nested: true })
```

#### 6. **Code Block with Syntax Highlighting**
```javascript
CodeBlockLowlight.configure({
  lowlight: createLowlight(common),
  HTMLAttributes: {
    class: 'rounded-lg bg-gray-900 text-gray-100 p-4 my-2',
  },
})
```

#### 7. **Mention Extension**
For @mentioning team members:
```javascript
Mention.configure({
  HTMLAttributes: {
    class: 'mention px-1 py-0.5 rounded bg-blue-100 text-blue-800',
  },
})
```

#### 8. **Placeholder Extension**
```javascript
Placeholder.configure({
  placeholder: 'Start typing or use "/" for commands...',
})
```

### Keyboard Shortcuts

- **Shift+Enter**: Hard break (new line without paragraph)
- **Enter**: New paragraph
- **Ctrl/Cmd+B**: Bold
- **Ctrl/Cmd+I**: Italic
- **Ctrl/Cmd+U**: Underline
- **Ctrl/Cmd+Z**: Undo
- **Ctrl/Cmd+Shift+Z**: Redo
- **/**: Open slash commands

### Slash Commands

Type `/` to trigger quick commands:

```javascript
// Available commands:
- /h1, /h2, /h3     → Headings
- /bold, /italic    → Text formatting
- /code, /codeblock → Code formatting
- /bullet, /number  → Lists
- /todo             → Task list
- /quote            → Blockquote
- /divider          → Horizontal rule
- /table            → Insert table
- /image            → Insert image
```

## Real-time Collaboration Logic

### Edit Lock System

The application implements a **pessimistic locking** strategy to prevent conflicts.

#### Lock Flow

```
1. User opens page
   └→ Socket emits: join-page { pageId, user }

2. Server checks lock status
   ├→ If unlocked: emit page-locked { isLocked: false }
   └→ If locked: emit page-locked { isLocked: true, lockedBy }

3. User clicks to edit
   └→ Socket emits: request-edit-lock { pageId }

4. Server validates request
   ├→ If available: 
   │   ├→ Store lock: pageEditors.set(pageId, { userId, ... })
   │   ├→ Emit to requester: edit-lock-granted
   │   └→ Broadcast to others: page-locked { isLocked: true, lockedBy }
   └→ If locked:
       ├→ Emit to requester: edit-lock-denied { lockedBy }
       └→ Show alert: "Page locked by {userName}"

5. User edits content
   └→ Content syncs to other viewers in real-time

6. User leaves or disconnects
   ├→ Server removes lock: pageEditors.delete(pageId)
   └→ Broadcast to all: page-locked { isLocked: false }
```

#### Server-Side Lock Implementation

```javascript
// In-memory storage
const pageEditors = new Map(); // pageId -> { userId, userName, socketId, timestamp }

// On edit lock request
socket.on('request-edit-lock', ({ pageId }) => {
  const currentEditor = pageEditors.get(pageId);
  const userId = socket.userId;
  
  if (!currentEditor || currentEditor.userId === userId) {
    // Grant lock
    pageEditors.set(pageId, {
      userId,
      userName: socket.userName,
      socketId: socket.id,
      timestamp: Date.now(),
    });
    
    socket.emit('edit-lock-granted');
    socket.to(`page-${pageId}`).emit('page-locked', {
      isLocked: true,
      lockedBy: { userId, userName: socket.userName }
    });
  } else {
    // Deny lock
    socket.emit('edit-lock-denied', {
      lockedBy: {
        userId: currentEditor.userId,
        userName: currentEditor.userName,
      }
    });
  }
});

// On disconnect
socket.on('disconnect', () => {
  // Release all locks held by this socket
  for (const [pageId, editor] of pageEditors.entries()) {
    if (editor.socketId === socket.id) {
      pageEditors.delete(pageId);
      io.to(`page-${pageId}`).emit('page-locked', { isLocked: false });
    }
  }
});
```

#### Client-Side Lock Handling

```javascript
// Request lock when user clicks to edit
const requestEditLock = () => {
  if (socket && isConnected && pageId) {
    socket.emit('request-edit-lock', { pageId });
  }
};

// Listen for lock events
useEffect(() => {
  if (!socket) return;

  socket.on('edit-lock-granted', () => {
    setHasEditLock(true);
    setIsEditing(true);
    if (editor) editor.setEditable(true);
  });

  socket.on('edit-lock-denied', (data) => {
    setHasEditLock(false);
    alert(`This page is currently being edited by ${data.lockedBy.userName}`);
  });

  socket.on('page-locked', (data) => {
    setIsPageLocked(data.isLocked);
    setLockedBy(data.lockedBy || null);
    
    if (data.isLocked && !hasEditLock) {
      // Someone else has lock, make read-only
      if (editor) editor.setEditable(false);
    }
  });

  return () => {
    socket.off('edit-lock-granted');
    socket.off('edit-lock-denied');
    socket.off('page-locked');
  };
}, [socket, editor]);
```

### Content Synchronization

#### Debounced Auto-save

```javascript
const saveTimeoutRef = useRef(null);

const handleContentChange = useCallback((newContent) => {
  if (!hasEditLock) return; // Only editor can save
  
  // Clear existing timeout
  if (saveTimeoutRef.current) {
    clearTimeout(saveTimeoutRef.current);
  }
  
  // Debounce save for 2 seconds
  saveTimeoutRef.current = setTimeout(() => {
    saveContent(newContent);
  }, 2000);
  
  // Emit real-time update to viewers
  if (socket && pageId) {
    socket.emit('content-change', {
      pageId,
      content: newContent,
      userId: user._id,
    });
  }
}, [hasEditLock, socket, pageId, user]);
```

#### Real-time Content Reception

```javascript
useEffect(() => {
  if (!socket) return;
  
  socket.on('content-update', ({ content, userId }) => {
    if (userId === user._id) return; // Ignore own updates
    
    // Update editor content for viewers
    if (!hasEditLock && editor && content !== lastContentRef.current) {
      lastContentRef.current = content;
      editor.commands.setContent(content, false);
    }
  });
  
  return () => socket.off('content-update');
}, [socket, editor, hasEditLock, user]);
```

### Live Cursor Tracking

#### Cursor Position Events

```javascript
// Send cursor position
const handleCursorMove = useCallback((position) => {
  if (socket && pageId && isEditing) {
    socket.emit('cursor-move', {
      pageId,
      userId: user._id,
      position: {
        from: position.from,
        to: position.to,
      },
    });
  }
}, [socket, pageId, user, isEditing]);

// Receive others' cursors
useEffect(() => {
  if (!socket) return;
  
  socket.on('cursor-update', ({ userId, position }) => {
    setCursors(prev => ({
      ...prev,
      [userId]: position,
    }));
  });
  
  return () => socket.off('cursor-update');
}, [socket]);
```

#### Cursor Rendering

```javascript
// LiveCursor Component
const LiveCursor = ({ cursors, users, editor }) => {
  return Object.entries(cursors).map(([userId, position]) => {
    const user = users.find(u => u.userId === userId);
    if (!user) return null;
    
    // Calculate pixel position from editor position
    const coords = editor.view.coordsAtPos(position.from);
    
    return (
      <div
        key={userId}
        className="absolute pointer-events-none"
        style={{
          left: coords.left,
          top: coords.top,
          borderLeft: `2px solid ${user.userColor}`,
          height: '1.2em',
        }}
      >
        <span 
          className="text-xs px-1 rounded"
          style={{ backgroundColor: user.userColor, color: 'white' }}
        >
          {user.userName}
        </span>
      </div>
    );
  });
};
```

### Presence Awareness

#### User Join/Leave Events

```javascript
useEffect(() => {
  if (!socket) return;
  
  // User joined
  socket.on('user-joined', ({ user: newUser }) => {
    setActiveUsers(prev => {
      if (prev.find(u => u.userId === newUser.userId)) return prev;
      return [...prev, newUser];
    });
  });
  
  // User left
  socket.on('user-left', ({ userId }) => {
    setActiveUsers(prev => prev.filter(u => u.userId !== userId));
    setCursors(prev => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });
  });
  
  return () => {
    socket.off('user-joined');
    socket.off('user-left');
  };
}, [socket]);
```

#### Typing Indicators

```javascript
// Typing status
const [typingUsers, setTypingUsers] = useState(new Set());

const handleTypingStart = () => {
  if (socket && pageId) {
    socket.emit('start-typing', { pageId });
  }
};

const handleTypingStop = () => {
  if (socket && pageId) {
    socket.emit('stop-typing', { pageId });
  }
};

// Listen for typing status
socket.on('typing-status', ({ userId, isTyping }) => {
  setTypingUsers(prev => {
    const updated = new Set(prev);
    if (isTyping) {
      updated.add(userId);
    } else {
      updated.delete(userId);
    }
    return updated;
  });
});
```

## Version History

### Creating Versions

```javascript
// Save version on significant changes
const createVersion = async () => {
  try {
    const content = editor.getHTML();
    await axios.post(`${API_ENDPOINTS.PAGES}/${pageId}/versions`, {
      content,
      description: 'Manual save',
    });
  } catch (error) {
    console.error('Failed to create version:', error);
  }
};
```

### Viewing Version History

```javascript
const [versions, setVersions] = useState([]);

const fetchVersions = async () => {
  try {
    const response = await axios.get(`${API_ENDPOINTS.PAGES}/${pageId}/versions`);
    setVersions(response.data.versions);
  } catch (error) {
    console.error('Failed to fetch versions:', error);
  }
};

// VersionDiffViewer component shows side-by-side comparison
```

## Performance Optimizations

### 1. **Debouncing**
- Auto-save: 2 seconds
- Cursor updates: 100ms
- Search: 300ms

### 2. **Memoization**
```javascript
const memoizedCallback = useCallback(() => {
  // Expensive operation
}, [dependencies]);

const MemoizedComponent = React.memo(Component);
```

### 3. **Lazy Loading**
```javascript
const CommentThread = React.lazy(() => import('./CommentThread'));
const VersionDiffViewer = React.lazy(() => import('./VersionDiffViewer'));
```

### 4. **Virtualization**
For large documents, use virtual scrolling to render only visible content.

### 5. **Content Compression**
Socket events send deltas instead of full content when possible.

## Error Handling

### Network Errors
```javascript
try {
  await savePage();
} catch (error) {
  if (error.response?.status === 409) {
    // Conflict: page modified by another user
    showConflictDialog();
  } else {
    showErrorToast('Failed to save page');
  }
}
```

### Socket Disconnection
```javascript
socket.on('disconnect', () => {
  // Show offline indicator
  setIsConnected(false);
  
  // Release edit lock
  setHasEditLock(false);
  setIsEditing(false);
});

socket.on('reconnect', () => {
  // Re-join page room
  socket.emit('join-page', { pageId, user });
  
  // Refresh page data
  fetchPage();
});
```

### Conflict Resolution
When conflicts occur:
1. Show diff between local and remote versions
2. Allow user to choose which version to keep
3. Create backup of both versions
4. Merge if possible, or prompt for manual resolution

## Best Practices

1. **Always check edit lock** before modifying content
2. **Debounce frequent events** (typing, cursor moves)
3. **Emit deltas, not full content** when possible
4. **Handle disconnections gracefully** with auto-reconnect
5. **Show clear lock status** to users
6. **Auto-release locks** on page leave
7. **Implement lock timeouts** to prevent stale locks
8. **Validate permissions** on both client and server
9. **Store versions** for recovery and history
10. **Test with multiple concurrent users**
