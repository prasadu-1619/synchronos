# 🚀 Project Management & Documentation Tool

A complete, production-ready project management and documentation system (Confluence + Jira style) built with React, Node.js, Express, and MongoDB.

## ✨ Features

### 📚 Documentation (Confluence-style)
- **Rich Text Editor** with markdown support
- **Version History** for all pages
- **Hierarchical Pages** with nested structure
- **Real-time Collaborative Editing**
- **Auto-save** functionality

### 📊 Task Management (Jira-style)
- **Kanban Boards** with drag-and-drop
- **Task Cards** with detailed information
- **Labels, Priorities, Due Dates**
- **Comments** and discussions
- **Assignment** to team members

### 👥 Collaboration
- **Multi-project Support**
- **Team Members** with roles (Owner, Admin, Member, Viewer)
- **Activity Feed** for all project actions
- **Real-time Notifications**
- **WebSocket** for live updates

### 🎨 User Experience
- **Light/Dark Theme** with system sync
- **Responsive Design** for all devices
- **Modern UI** with smooth animations
- **Search Functionality**
- **User Profiles** with customization

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **React Router v7** - Navigation
- **Tailwind CSS 3.4** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons
- **Vite** - Build tool

### Backend
- **Node.js & Express** - Server
- **MongoDB & Mongoose** - Database
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
Froncort/
├── Frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts
│   │   ├── layouts/      # Layout components
│   │   ├── config/       # Configuration files
│   │   └── assets/       # Images, fonts, etc.
│   ├── public/           # Static files
│   └── package.json      # Frontend dependencies
│
├── Backend/              # Node.js backend API
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Helper functions
│   ├── server.js        # Express app
│   └── package.json     # Backend dependencies
│
└── STARTUP_GUIDE.md     # Complete setup guide
```

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ 
- MongoDB v6+
- npm or yarn

### Installation & Setup

1. **Start MongoDB:**
   ```bash
   # Windows
   net start MongoDB
   
   # Mac/Linux
   sudo systemctl start mongod
   ```

2. **Setup Backend:**
   ```bash
   cd Backend
   npm install
   npm run dev
   ```
   Server will run on `http://localhost:5000`

3. **Setup Frontend (in a new terminal):**
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```
   App will open at `http://localhost:5173`

4. **Open browser and create an account!**

📖 **For detailed setup instructions, see [STARTUP_GUIDE.md](./STARTUP_GUIDE.md)**

## 📚 Documentation

### Main Documentation
- **[STARTUP_GUIDE.md](./STARTUP_GUIDE.md)** - Complete setup and troubleshooting
- **[Frontend/README.md](./Frontend/README.md)** - Frontend documentation
- **[Frontend/QUICK_START.md](./Frontend/QUICK_START.md)** - Quick start guide
- **[Backend/README.md](./Backend/README.md)** - Backend API documentation

### Additional Docs
- **[Frontend/BACKEND_API_DOCS.md](./Frontend/BACKEND_API_DOCS.md)** - API endpoints
- **[Frontend/DEPLOYMENT_CHECKLIST.md](./Frontend/DEPLOYMENT_CHECKLIST.md)** - Deploy guide
- **[Frontend/PROJECT_SUMMARY.md](./Frontend/PROJECT_SUMMARY.md)** - Project overview
- **[Frontend/DOCUMENTATION_INDEX.md](./Frontend/DOCUMENTATION_INDEX.md)** - Doc navigation

## 🎯 Default Ports

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000
- **MongoDB:** mongodb://localhost:27017
- **WebSocket:** ws://localhost:5000

## 🔑 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/project-management
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
```

## 🧪 API Endpoints

### Authentication
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login user
- POST `/api/auth/logout` - Logout user
- GET `/api/auth/check` - Check auth status

### Projects
- GET `/api/projects` - Get all projects
- POST `/api/projects` - Create project
- PUT `/api/projects/:id` - Update project
- DELETE `/api/projects/:id` - Delete project

### Pages
- GET `/api/pages/project/:projectId` - Get all pages
- POST `/api/pages` - Create page
- PUT `/api/pages/:id` - Update page
- DELETE `/api/pages/:id` - Delete page

### Boards & Cards
- GET `/api/boards/project/:projectId` - Get boards
- POST `/api/boards` - Create board
- POST `/api/cards` - Create card
- PUT `/api/cards/:id` - Update card

📖 **For complete API docs, see [Frontend/BACKEND_API_DOCS.md](./Frontend/BACKEND_API_DOCS.md)**

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error:**
```bash
# Make sure MongoDB is running
net start MongoDB  # Windows
sudo systemctl start mongod  # Linux/Mac
```

**Port Already in Use:**
```bash
# Kill process using the port
npx kill-port 5000  # Backend
npx kill-port 5173  # Frontend
```

**Cannot Login/Register:**
- Check backend is running on port 5000
- Verify .env files are configured correctly
- Check browser console for errors

📖 **For more troubleshooting, see [STARTUP_GUIDE.md](./STARTUP_GUIDE.md)**

## 🚢 Deployment

### Frontend (Vercel/Netlify)
```bash
cd Frontend
npm run build
# Deploy 'dist' folder
```

### Backend (Railway/Render/Heroku)
- Set environment variables
- Connect MongoDB Atlas
- Deploy from GitHub

📖 **For deployment guide, see [Frontend/DEPLOYMENT_CHECKLIST.md](./Frontend/DEPLOYMENT_CHECKLIST.md)**

## 🎓 Usage Examples

### Create a Project
1. Click "New Project" button
2. Enter name and description
3. Choose color and icon
4. Click "Create"

### Create Documentation
1. Open project
2. Click "New Page"
3. Write content with markdown
4. Auto-saves every 2 seconds

### Manage Tasks
1. Open project
2. Go to "Boards" tab
3. Create or select board
4. Add cards
5. Drag & drop to organize

## 📊 Features Overview

| Feature | Status | Description |
|---------|--------|-------------|
| Authentication | ✅ Complete | JWT-based with httpOnly cookies |
| Projects | ✅ Complete | Multi-project support with roles |
| Documentation | ✅ Complete | Rich editor with version history |
| Kanban Boards | ✅ Complete | Drag-and-drop task management |
| Real-time Updates | ✅ Complete | WebSocket for live collaboration |
| Notifications | ✅ Complete | In-app notification system |
| Activity Feed | ✅ Complete | Track all project activities |
| Dark Mode | ✅ Complete | Theme toggle with persistence |
| Responsive | ✅ Complete | Works on all device sizes |
| Search | ✅ Complete | Global search functionality |

## 🔒 Security Features

- **Password Hashing** with bcrypt (12 rounds)
- **JWT Tokens** in httpOnly cookies
- **CORS Protection** configured for frontend
- **Input Validation** on all endpoints
- **MongoDB Injection** protection
- **XSS Prevention** with React's built-in protection

## 🤝 Contributing

This is a complete, ready-to-use application. Feel free to:
- Fork and customize for your needs
- Add new features
- Report issues
- Submit pull requests

## 📝 License

MIT License - Free to use for personal or commercial projects.

## 🙏 Acknowledgments

Built with modern best practices and production-ready code:
- Clean architecture
- Proper error handling
- Comprehensive documentation
- Real-time features
- Scalable structure

## 🆘 Support

For help with setup or usage:
1. Check [STARTUP_GUIDE.md](./STARTUP_GUIDE.md)
2. Review [Frontend/DOCUMENTATION_INDEX.md](./Frontend/DOCUMENTATION_INDEX.md)
3. Check browser console and server logs
4. Ensure all prerequisites are installed

## 🎉 Ready to Use!

This is a **complete, production-ready** application with:
- ✅ Full authentication system
- ✅ Project management
- ✅ Documentation system
- ✅ Task management
- ✅ Real-time collaboration
- ✅ Comprehensive documentation
- ✅ Clean, maintainable code

Start building your projects today! 🚀

---

**Made with ❤️ using React, Node.js, Express, and MongoDB**
