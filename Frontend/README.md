# Synchronos - Real-Time Collaborative Project Management

<div align="center">

![Synchronos Logo](https://via.placeholder.com/150x150?text=Synchronos)

**A production-ready, real-time collaborative platform combining powerful project management with seamless documentation.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green.svg)](https://www.mongodb.com/)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Tech Stack](#-tech-stack) • [Documentation](#-documentation)

</div>

---

## 🌟 Overview

Synchronos is a comprehensive project management and collaboration platform that brings together the best of Confluence-style documentation and Jira-style task management. Built with modern technologies, it provides real-time collaboration, powerful rich-text editing, and intuitive Kanban boards—all in one seamless experience.

## 🚀 Features

### ✨ Real-Time Collaboration

#### 1. **Live Rich-Text Editing**
- 🎨 **Tiptap Editor** - Powerful WYSIWYG editor with extensive formatting options
- 👥 **Multi-User Editing** - See who's editing in real-time with live cursors
- 💾 **Auto-Save** - Never lose your work with debounced auto-save (1 second)
- 📝 **Markdown Support** - Use familiar markdown shortcuts
- 🎯 **Smart Formatting** - Headings, lists, code blocks, tables, links, and more
- 🔄 **Version Control** - Automatic versioning with diff viewer
- 📜 **Version History** - Compare and restore previous versions

#### 2. **Advanced Kanban Boards**
- 🎯 **Drag & Drop** - Smooth card movement between columns
- 👤 **Smart Assignments** - @ mention team members with autocomplete
- 📧 **Email Notifications** - Automatic emails for assignments and status changes
- 🏷️ **Labels & Priority** - Organize cards with custom labels and priority levels
- 📅 **Due Dates** - Track deadlines with visual indicators
- 💬 **Comments** - Collaborate with threaded comments
- 🔔 **Status Updates** - Real-time notifications on card changes

#### 3. **Comprehensive Dashboard**
- 📊 **Analytics** - View team member count, active pages, and task statistics
- 📈 **Task Distribution** - Visual breakdown of To Do, In Progress, and Done tasks
- 🔥 **Activity Feed** - Real-time updates on all project activities
- 👥 **Team Overview** - See who's working on what
- 🎯 **Quick Actions** - Access recent pages and boards instantly

#### 4. **Smart Search**
- 🔍 **Global Search** - Find pages, tasks, and team members instantly
- ⚡ **Quick Results** - See results as you type
- 🎯 **Filter by Type** - Search specific content types
- 🔗 **Direct Navigation** - Jump to results with one click

#### 5. **Team Collaboration**
- 👥 **Team Management** - Invite members with email invitations
- 🔐 **Role-Based Access** - Owner, Admin, Member, Viewer roles
- 📧 **Email Integration** - Professional HTML email templates
- 🎨 **User Presence** - See who's online with active user indicators
- 💬 **@Mentions** - Tag team members in cards and comments

#### 6. **Project Organization**
- 📁 **Multi-Project Support** - Manage multiple projects seamlessly
- 🗂️ **Page Hierarchy** - Organize documentation in tree structure
- 📋 **Multiple Boards** - Create unlimited Kanban boards per project
- 🏷️ **Custom Labels** - Color-coded organization
- 🔍 **Project Search** - Search within specific projects

#### 7. **Professional Features**
- 🌓 **Dark/Light Mode** - Beautiful themes for any preference
- 📱 **Responsive Design** - Works perfectly on all devices
- ⚡ **Real-Time Updates** - Socket.IO powered instant synchronization
- 🔒 **Secure Authentication** - JWT-based auth with httpOnly cookies
- 🐛 **Bug Reporting** - Built-in bug tracking system
- 📧 **Email Notifications** - Stay updated on assignments and changes
- 🔔 **In-App Notifications** - Real-time alerts for important events

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI framework with latest features
- **Vite 6** - Lightning-fast build tool and dev server
- **React Router v6** - Declarative routing
- **Tailwind CSS** - Utility-first CSS framework
- **Tiptap 3** - Rich text editor framework (ProseMirror-based)
- **Socket.IO Client** - Real-time bidirectional communication
- **Axios** - Promise-based HTTP client
- **Lucide React** - Beautiful icon library
- **Lottie React** - Smooth animations
- **date-fns** - Modern date utility library

### Backend
- **Node.js & Express** - Fast, scalable server framework
- **MongoDB & Mongoose** - NoSQL database with elegant ODM
- **Socket.IO** - Real-time WebSocket communication
- **Nodemailer** - Email sending service
- **JWT** - Secure authentication tokens
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control
- **VS Code** - Recommended IDE

## 📁 Project Structure

```
Froncort/
├── Frontend/
│   ├── src/
│   │   ├── assets/              # Images, animations, icons
│   │   ├── Components/          # Reusable UI components
│   │   │   ├── Alert/           # Alert notifications
│   │   │   ├── BugReport/       # Bug reporting system
│   │   │   ├── Editor/          # Rich text editor
│   │   │   ├── Collaboration/   # Real-time collab features
│   │   │   ├── Footer/          # Footer components
│   │   │   ├── Header/          # Header/TopBar
│   │   │   ├── Home/            # Homepage components
│   │   │   ├── Invitation/      # Team invitation
│   │   │   ├── JoinRoom/        # Real-time workspace
│   │   │   ├── Plans/           # Pricing plans
│   │   │   ├── Profile/         # User profile
│   │   │   └── Version/         # Version control
│   │   ├── connections/         # API service layer
│   │   ├── contexts/            # React contexts
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── ProjectContext.jsx
│   │   ├── pages/               # Page components
│   │   │   ├── Auth/            # Login, Register, Password Reset
│   │   │   ├── Dashboard/       # Main dashboard
│   │   │   ├── Editor/          # Page editor
│   │   │   ├── Kanban/          # Kanban boards
│   │   │   └── Settings/        # User settings
│   │   ├── layouts/             # Layout wrappers
│   │   ├── config/
│   │   │   └── api.js           # 🔥 API ENDPOINTS CONFIGURATION
│   │   ├── App.jsx              # Root component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── public/                  # Static assets
│   ├── .env                     # Environment variables
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── Backend/
│   ├── models/                  # Mongoose schemas
│   │   ├── User.model.js
│   │   ├── Project.model.js
│   │   ├── Page.model.js
│   │   ├── Board.model.js
│   │   ├── Card.model.js
│   │   ├── Activity.model.js
│   │   └── Invitation.model.js
│   ├── Routes/                  # API routes
│   │   ├── auth.routes.js
│   │   ├── project.routes.js
│   │   ├── page.routes.js
│   │   ├── board.routes.js
│   │   ├── card.routes.js
│   │   ├── dashboard.routes.js
│   │   └── invitation.routes.js
│   ├── services/                # Business logic
│   │   ├── email.service.js
│   │   └── card-notification.service.js
│   ├── middleware/              # Express middleware
│   │   └── auth.middleware.js
│   ├── utils/                   # Utility functions
│   ├── server.js                # Server entry point
│   ├── .env                     # Environment variables
│   └── package.json
│
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- **Node.js 18+** and **npm/yarn**
- **MongoDB** (local or Atlas)
- **Gmail account** (for email notifications)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/prasadu-1619/synchronos.git
   cd synchronos
   ```
2. **Install dependencies for both Frontend and Backend**
   ```bash
   # Install Backend dependencies
   cd Backend
   npm install
   
   # Install Frontend dependencies
   cd ../Frontend
   npm install
   ```

3. **Configure Environment Variables**
   
   **Backend `.env` file:**
   ```bash
   cd Backend
   cp .env.example .env
   ```
   
   Edit `Backend/.env`:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/synchronos
   # Or use MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/synchronos
   
   # JWT Secret
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d
   
   # Email Configuration (Gmail)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-specific-password
   
   # Frontend URL (for email links)
   FRONTEND_URL=http://localhost:5173
   
   # CORS Origin
   CORS_ORIGIN=http://localhost:5173
   ```

   **Frontend `.env` file:**
   ```bash
   cd ../Frontend
   cp .env.example .env
   ```
   
   Edit `Frontend/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_WS_URL=ws://localhost:5000
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud) - no local MongoDB needed
   ```

5. **Start the Backend server**
   ```bash
   cd Backend
   npm run dev
   ```
   Server will run on `http://localhost:5000`

6. **Start the Frontend development server** (in a new terminal)
   ```bash
   cd Frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

7. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

### Build for Production

**Frontend:**
```bash
cd Frontend
npm run build
# Build output will be in Frontend/dist/
```

**Backend:**
```bash
cd Backend
npm start
# Runs production server
```

## 🔧 Configuration

### Central API Configuration

All API endpoints are centrally configured in `Frontend/src/config/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  
  // Projects
  PROJECTS: `${API_BASE_URL}/projects`,
  PROJECT_BY_ID: (id) => `${API_BASE_URL}/projects/${id}`,
  
  // Pages
  PAGES: `${API_BASE_URL}/pages`,
  PAGE_BY_ID: (id) => `${API_BASE_URL}/pages/${id}`,
  
  // Kanban Boards & Cards
  BOARDS: `${API_BASE_URL}/boards`,
  CARDS: `${API_BASE_URL}/cards`,
  
  // Dashboard
  DASHBOARD_STATS: `${API_BASE_URL}/dashboard/stats`,
  
  // Real-time WebSocket
  WEBSOCKET_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:5000',
};
```

**To change the backend URL, simply update the `.env` file - no code changes needed!**

### Email Configuration (Gmail)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password:**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Click "2-Step Verification"
   - Scroll down and click "App passwords"
   - Select "Mail" and "Other (Custom name)"
   - Copy the generated 16-character password
3. **Add to Backend `.env`:**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```

### Required Backend API Endpoints

Your backend should implement these endpoints:

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check` - Check authentication status

#### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

#### Pages (Documentation)
- `GET /api/pages` - List pages
- `POST /api/pages` - Create page
- `GET /api/pages/:id` - Get page details
- `PUT /api/pages/:id` - Update page
- `GET /api/pages/:id/versions` - Get page versions
- `POST /api/pages/:id/restore/:versionId` - Restore version

#### Kanban Boards
- `GET /api/boards` - List boards
- `POST /api/boards` - Create board
- `GET /api/boards/:id` - Get board details
- `GET /api/cards` - List cards
- `POST /api/cards` - Create card
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card

#### Activity Feed
- `GET /api/activities` - Get activity feed
- `GET /api/activities/project/:projectId` - Project activities

#### Real-time (WebSocket)
- WebSocket connection at `VITE_WS_URL`
- Events: `page:edit`, `cursor:move`, `user:join`, `user:leave`

## 🎨 Theme Customization

The app uses your existing Jost font and color scheme. Theme is managed via `ThemeContext` and persists in localStorage.

Toggle theme using the sun/moon icon in the top bar.

## 📱 Responsive Design

- **Desktop**: Full feature set
- **Tablet**: Optimized layout
- **Mobile**: Core features accessible

## 🔐 Authentication Flow

1. User registers/logs in via `/login` or `/register`
2. Backend returns JWT token (stored in httpOnly cookie)
3. All API requests include credentials
4. Protected routes check authentication status
5. Automatic redirect to login if unauthenticated

## 🚀 Deployment

### Production Build

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Environment Variables for Production

Create `.env.production`:

```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_WS_URL=wss://your-backend-domain.com
```

### Deployment Platforms

- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod`
- **AWS S3 + CloudFront**: Upload `dist/` folder
- **Docker**: Use provided Dockerfile

## 📊 Performance Optimizations

- Code splitting with React.lazy
- Image optimization
- Debounced auto-save
- Virtual scrolling for large lists
- Memoized components
- Efficient state management

## 🐛 Troubleshooting

### Issue: Can't connect to backend
- Verify backend is running
- Check `.env` file has correct `VITE_API_BASE_URL`
- Ensure CORS is configured on backend

### Issue: Theme not persisting
- Check browser localStorage is enabled
- Clear cache and reload

### Issue: Build fails
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Check Node.js version (18+)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**Made with ❤️ for seamless team collaboration**

hello
hi
