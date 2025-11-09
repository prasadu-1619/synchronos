# Component Architecture

## Overview

This project is a collaborative project management and documentation tool built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO for real-time collaboration. The application enables teams to manage projects, create rich-text documentation, and organize tasks using Kanban boards.

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │  Pages     │  │  Components  │  │  Contexts/Hooks    │  │
│  │  - Auth    │  │  - Editor    │  │  - AuthContext     │  │
│  │  - Editor  │  │  - Kanban    │  │  - ProjectContext  │  │
│  │  - Kanban  │  │  - Collab    │  │  - ThemeContext    │  │
│  │  - Project │  │  - Layout    │  │  - useSocket       │  │
│  └────────────┘  └──────────────┘  └────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Node.js/Express)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Routes     │  │  Middleware  │  │  Services        │  │
│  │  - Auth      │  │  - Auth      │  │  - Email         │  │
│  │  - Projects  │  │  - Error     │  │  - Notifications │  │
│  │  - Pages     │  │  - Project   │  │  - Card Notify   │  │
│  │  - Boards    │  │              │  └──────────────────┘  │
│  │  - Cards     │  └──────────────┘                         │
│  └──────────────┘                                            │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Socket.IO Server (Real-time)                 │   │
│  │  - Page collaboration & locking                      │   │
│  │  - Live cursors & user presence                      │   │
│  │  - Real-time content sync                            │   │
│  │  - Notifications                                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database (MongoDB)                        │
│  Collections: Users, Projects, Pages, Boards, Cards,        │
│               Activities, Notifications, Invitations         │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Component Hierarchy

```
App (Router + Providers)
├── AuthProvider
│   └── ThemeProvider
│       └── ProjectProvider
│           └── Routes
│               ├── Public Routes (Login, Register)
│               └── Protected Routes
│                   ├── MainLayout (Sidebar + TopBar)
│                   │   ├── Dashboard
│                   │   ├── ProjectView
│                   │   ├── PageEditor
│                   │   ├── KanbanBoard
│                   │   ├── ActivityFeed
│                   │   └── Settings
│                   └── AcceptInvitationPage
```

### Key Components

#### 1. **Pages**
- **Dashboard**: Project overview and quick access
- **PageEditor**: Rich text editor with real-time collaboration
- **KanbanBoard**: Drag-and-drop task management
- **ProjectView**: Project details and navigation
- **ActivityFeed**: Real-time activity tracking
- **Settings**: User preferences and configurations

#### 2. **Editor Components**
- **RichTextEditor**: Tiptap-based WYSIWYG editor
  - Extensions: StarterKit, Link, Image, Table, CodeBlock, TaskList, Mention
  - Syntax highlighting with lowlight
  - Slash commands for quick formatting
- **EditorToolbar**: Formatting controls and actions
- **SlashCommands**: Command palette for quick insertions

#### 3. **Collaboration Components**
- **LiveCursor**: Real-time cursor tracking for other users
- **ActiveUsers**: Display active editors on the page
- **CommentThread**: Inline commenting system
- **VersionDiffViewer**: Compare document versions

#### 4. **Kanban Components**
- **InlineCardEditor**: Quick card editing
- Drag-and-drop using `@dnd-kit` library
- Real-time card position sync

#### 5. **Layout Components**
- **MainLayout**: App shell with sidebar and top bar
- **Sidebar**: Project navigation and quick links
- **TopBar**: Breadcrumbs, search, and user menu
- **Breadcrumbs**: Hierarchical navigation
- **PageNavigationTree**: Nested page structure

#### 6. **Context Providers**
- **AuthContext**: User authentication state and actions
- **ProjectContext**: Current project state and members
- **ThemeContext**: Dark/light theme management

#### 7. **Custom Hooks**
- **useSocket**: WebSocket connection management
  - Auto-reconnection
  - Event handling
  - Connection state tracking

## Backend Architecture

### Route Structure

```
/api
├── /auth             → User authentication
├── /projects         → Project CRUD operations
├── /pages            → Page management with versions
├── /boards           → Kanban board operations
├── /cards            → Card CRUD and management
├── /activities       → Activity tracking
├── /users            → User profile management
├── /notifications    → User notifications
├── /invitations      → Project invitations
├── /search           → Global search
└── /dashboard        → Dashboard statistics
```

### Middleware Pipeline

1. **CORS Middleware**: Handles cross-origin requests
2. **Cookie Parser**: Parses JWT from cookies
3. **Auth Middleware**: Verifies JWT and attaches user
4. **Project Middleware**: Validates project access
5. **Error Middleware**: Centralized error handling

### Database Models

#### User Model
```javascript
- name, email, password (hashed)
- avatar, preferences
- timestamps
```

#### Project Model
```javascript
- name, description
- owner (User ref)
- members: [{ user, role, permissions }]
- settings (privacy, features)
- timestamps
```

#### Page Model
```javascript
- title, content (HTML)
- project (Project ref)
- parent (Page ref) - for nested pages
- versions: [{ content, user, timestamp }]
- editLock: { user, timestamp }
- timestamps
```

#### Board Model
```javascript
- name, description
- project (Project ref)
- columns: [{ id, name, order }]
- timestamps
```

#### Card Model
```javascript
- title, description
- board (Board ref)
- column, position
- assignees: [User refs]
- labels, priority, dueDate
- comments: [{ user, text, timestamp }]
- attachments: [{ name, url, type }]
- timestamps
```

#### Activity Model
```javascript
- user (User ref)
- project (Project ref)
- action, target, details
- timestamp
```

#### Notification Model
```javascript
- recipient (User ref)
- type, title, message
- read, link
- timestamp
```

## Real-time Collaboration Architecture

### Socket.IO Event Flow

#### Page Collaboration Events

```
Client → Server
├── join-page: { pageId, user }
├── request-edit-lock: { pageId }
├── content-change: { pageId, content, delta }
├── cursor-move: { pageId, position, selection }
├── start-typing: { pageId }
├── stop-typing: { pageId }
└── leave-page: { pageId }

Server → Client(s)
├── page-locked: { isLocked, lockedBy }
├── edit-lock-granted
├── edit-lock-denied: { lockedBy }
├── content-update: { content, userId }
├── user-joined: { user }
├── user-left: { userId }
├── cursor-update: { userId, position }
└── typing-status: { userId, isTyping }
```

#### Page Edit Locking System

1. **Request Lock**: User requests edit permission
2. **Lock Check**: Server checks if page is locked
3. **Grant/Deny**: 
   - If free → Grant lock, notify others
   - If locked → Deny, provide lock holder info
4. **Auto-release**: Lock released on disconnect or explicit leave
5. **Lock Timeout**: Stale locks auto-expire after 5 minutes

### Real-time Features

#### 1. **Live Cursors**
- Each user has a unique color
- Cursor position synced on selection change
- Visible to all active editors

#### 2. **Presence Awareness**
- Active users displayed in header
- Real-time join/leave notifications
- User typing indicators

#### 3. **Collaborative Editing**
- Edit locking prevents conflicts
- One active editor at a time
- Others can view in real-time

#### 4. **Auto-save**
- Debounced save (2 seconds)
- Conflict detection
- Last saved timestamp display

## Data Flow

### Authentication Flow
```
1. User enters credentials
2. Frontend → POST /api/auth/login
3. Backend validates & generates JWT
4. JWT stored in httpOnly cookie
5. Frontend redirects to dashboard
6. Subsequent requests include cookie
7. Auth middleware validates JWT
```

### Page Editing Flow
```
1. User opens page
2. Socket connects & joins page room
3. Request edit lock
4. If granted:
   - Editor becomes editable
   - Content changes emit to socket
   - Debounced HTTP save to database
   - Other users see real-time updates
5. On leave:
   - Release edit lock
   - Disconnect from page room
```

### Kanban Card Update Flow
```
1. User drags card to new position
2. Frontend updates local state
3. Emit socket event: card-moved
4. HTTP PUT /api/cards/:id
5. Server broadcasts to project room
6. Other users' boards update
7. Activity log created
```

## Technology Stack

### Frontend
- **React 19**: UI library
- **React Router**: Navigation
- **Tiptap**: Rich text editor
- **Socket.IO Client**: WebSocket client
- **Axios**: HTTP client
- **@dnd-kit**: Drag and drop
- **Lucide React**: Icons
- **Tailwind CSS**: Styling
- **Framer Motion**: Animations
- **Lottie React**: Animated illustrations

### Backend
- **Node.js**: Runtime
- **Express**: Web framework
- **MongoDB + Mongoose**: Database
- **Socket.IO**: WebSocket server
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **Nodemailer**: Email notifications
- **Validator**: Input validation

### Development Tools
- **Vite**: Frontend build tool
- **Nodemon**: Backend auto-reload
- **ESLint**: Code linting
- **PostCSS**: CSS processing

## Security Considerations

1. **Authentication**
   - JWT tokens in httpOnly cookies (XSS protection)
   - Bcrypt password hashing
   - Token expiration (7 days)

2. **Authorization**
   - Role-based access control (owner, admin, member, viewer)
   - Project membership verification
   - Edit lock enforcement

3. **Input Validation**
   - Validator library for emails
   - Mongoose schema validation
   - Sanitization of user inputs

4. **CORS**
   - Whitelist of allowed origins
   - Credentials enabled for cookies

5. **WebSocket Security**
   - Cookie-based authentication
   - Room-based isolation
   - Permission checks on events

## State Management

### Client-Side State
- **React Context**: Global state (auth, theme, project)
- **Local State**: Component-specific state
- **Socket State**: Real-time data via useSocket hook

### Server-Side State
- **Database**: Persistent data
- **Socket.IO Memory**: Active connections and rooms
- **In-Memory Maps**: Page edit locks

## Performance Optimizations

1. **Debouncing**: Auto-save, search, cursor updates
2. **Lazy Loading**: Code splitting for routes
3. **Memoization**: React.memo for expensive components
4. **Pagination**: Large lists (activities, notifications)
5. **Indexing**: MongoDB indexes on frequently queried fields
6. **Connection Pooling**: MongoDB connection pool
7. **Compression**: HTTP response compression

## Scalability Considerations

### Current Architecture
- Single server instance
- In-memory socket state
- MongoDB replica set ready

### Future Improvements
- **Redis**: Shared state for multiple server instances
- **Load Balancer**: Distribute traffic
- **CDN**: Static asset delivery
- **Database Sharding**: Horizontal scaling
- **Microservices**: Split into smaller services
- **Message Queue**: Async task processing
