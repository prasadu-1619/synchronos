# Project Management & Documentation Tool

A production-ready, real-time collaborative project management and documentation tool combining Confluence-style rich-text editing with Jira-style Kanban boards.

## 🚀 Features

### ✨ Core Features (All Implemented)

#### 1. **Collaborative Rich-Text Pages**
- Real-time multi-user editing
- Rich formatting: headings, lists, code blocks, links, quotes
- Markdown shortcuts support
- Live cursor indicators (coming soon with WebSocket)
- Auto-save functionality
- Offline sync recovery

#### 2. **Page Versioning & History**
- Automatic version creation on major edits
- Version comparison with diff highlights
- Restore previous versions
- Author and timestamp tracking

#### 3. **Kanban Boards**
- Configurable columns (To Do, In Progress, Done)
- Drag-and-drop cards with smooth animations
- Rich card details: title, description, labels, assignee, due date
- Inline editing
- Link cards to documentation pages

#### 4. **Unified Activity Feed**
- Real-time activity updates
- Filter by user, project, or resource type
- Track all changes across projects

#### 5. **Multi-Project Support**
- Easy project switching via sidebar
- Isolated pages and boards per project
- Team member management
- Role-based access control

#### 6. **Access Control**
- Role-based permissions: Owner, Admin, Editor, Viewer
- UI-enforced restrictions
- Visual feedback for permission levels

#### 7. **Notifications**
- Toast notifications for mentions and assignments
- Real-time update notifications
- Customizable notification preferences

### 🎨 Extended Features

- **Slash Commands** - Quick content insertion (`/table`, `/todo`, `/heading`)
- **Comment Threads** - Discuss specific document sections
- **Full-text Search** - Search across all pages and cards
- **Custom Templates** - Meeting notes, sprint retros, etc.
- **Light/Dark Mode** - Theme persistence across sessions
- **Responsive Design** - Desktop and tablet optimized

## 🛠️ Tech Stack

### Frontend
- **React.js 19** - UI framework
- **React Router v7** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons
- **Framer Motion** - Animations

### Backend (Configuration Ready)
- Single configuration file for backend API
- RESTful API endpoints
- WebSocket support for real-time features
- JWT authentication ready

## 📁 Project Structure

```
Frontend/
├── src/
│   ├── config/
│   │   └── api.js                 # 🔥 BACKEND API CONFIGURATION
│   ├── contexts/
│   │   ├── AuthContext.jsx        # Authentication state
│   │   ├── ThemeContext.jsx       # Theme management
│   │   └── ProjectContext.jsx     # Project state
│   ├── pages/
│   │   ├── Auth/                  # Login & Register
│   │   ├── Dashboard/             # Main dashboard
│   │   ├── Project/               # Project view
│   │   ├── Editor/                # Rich text editor
│   │   ├── Kanban/                # Kanban boards
│   │   ├── Activity/              # Activity feed
│   │   └── Settings/              # User settings
│   ├── components/
│   │   ├── Layout/                # Sidebar, TopBar
│   │   ├── Modals/                # Modal dialogs
│   │   └── Loader/                # Loading component
│   ├── layouts/
│   │   └── MainLayout.jsx         # Main app layout
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global styles
├── .env.example                    # Environment variables template
├── package.json
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API server (see configuration section)

### Installation

1. **Clone the repository**
   ```bash
   cd Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Backend API**
   
   Create a `.env` file in the Frontend folder:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your backend URLs:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_WS_URL=ws://localhost:5000
   ```

   **Important:** All backend API endpoints are centrally configured in `src/config/api.js`. You only need to change the base URL in the `.env` file.

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🔧 Backend Configuration

### Central API Configuration

All API endpoints are defined in `src/config/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  // ... more endpoints
};
```

### Required Backend Endpoints

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
