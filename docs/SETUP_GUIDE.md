# Setup Guide - Local Development

This guide will help you set up and run the Project Management & Documentation Tool (Synchronos) on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/downloads)

### Verify Prerequisites

```bash
# Check Node.js version
node --version
# Should output: v18.x.x or higher

# Check npm version
npm --version
# Should output: 9.x.x or higher

# Check MongoDB version
mongod --version
# Should output: db version v6.x.x or higher

# Check Git version
git --version
# Should output: git version 2.x.x or higher
```

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/prasadu-1619/synchronos.git
cd synchronos
```

### 2. Backend Setup

#### Navigate to Backend Directory
```bash
cd Backend
```

#### Install Dependencies
```bash
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `Backend` directory:

```bash
# On Windows (PowerShell)
Copy-Item .env.example .env

# On Mac/Linux
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/synchronos

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
COOKIE_EXPIRE=7

# Email Configuration (for invitations)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@synchronos.com

# Socket.IO Configuration (optional)
SOCKET_CORS_ORIGIN=http://localhost:5173
```

**Important Notes:**
- Change `JWT_SECRET` to a strong, random string
- For Gmail, use [App Passwords](https://support.google.com/accounts/answer/185833) instead of your regular password
- Keep `.env` file private and never commit it to version control

#### Start MongoDB

**Windows:**
```powershell
# Start MongoDB as a service
net start MongoDB

# Or run mongod directly
mongod --dbpath C:\data\db
```

**Mac:**
```bash
# Using Homebrew
brew services start mongodb-community

# Or run mongod directly
mongod --config /usr/local/etc/mongod.conf
```

**Linux:**
```bash
# Using systemd
sudo systemctl start mongod

# Or run mongod directly
sudo mongod
```

#### Verify MongoDB Connection
```bash
# Connect to MongoDB
mongosh

# Should show: Connected to MongoDB
# Exit with: exit
```

#### Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

You should see:
```
Server running on port 5000
MongoDB connected successfully
Socket.IO server initialized
```

### 3. Frontend Setup

#### Open New Terminal and Navigate to Frontend Directory
```bash
# From project root
cd Frontend
```

#### Install Dependencies
```bash
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `Frontend` directory:

```bash
# On Windows (PowerShell)
Copy-Item .env.example .env

# On Mac/Linux
cp .env.example .env
```

Edit the `.env` file:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api

# Socket.IO URL
VITE_SOCKET_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=Synchronos
VITE_APP_VERSION=1.0.0
```

#### Start Frontend Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## First Time Setup

### 1. Create Admin Account

1. Click "Register" on the login page
2. Fill in your details:
   - Name: Your Name
   - Email: your-email@example.com
   - Password: (min 6 characters)
3. Click "Create Account"

### 2. Create Your First Project

1. After login, you'll see the Dashboard
2. Click "Create New Project" button
3. Fill in project details:
   - Project Name
   - Description
   - Choose privacy settings
4. Click "Create Project"

### 3. Explore Features

- **Pages**: Create rich-text documents
- **Kanban Boards**: Manage tasks with drag-and-drop
- **Invite Members**: Collaborate with team members
- **Activity Feed**: Track project activities

## Common Issues and Solutions

### Issue 1: MongoDB Connection Failed

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solution:**
```bash
# Ensure MongoDB is running
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod

# Check MongoDB status
mongosh
```

### Issue 2: Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find and kill process using port 5000
# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process

# Mac/Linux
lsof -ti:5000 | xargs kill -9

# Or change PORT in Backend/.env
PORT=5001
```

### Issue 3: CORS Errors

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
- Verify `FRONTEND_URL` in `Backend/.env` matches your frontend URL
- Ensure both servers are running
- Clear browser cache and reload

### Issue 4: JWT Errors

**Error:** `JsonWebTokenError: invalid token`

**Solution:**
- Clear browser cookies
- Logout and login again
- Ensure `JWT_SECRET` is set in `Backend/.env`

### Issue 5: Socket.IO Connection Issues

**Error:** `WebSocket connection failed`

**Solution:**
- Verify `VITE_SOCKET_URL` in `Frontend/.env`
- Check browser console for errors
- Ensure backend server is running
- Try disabling browser extensions

### Issue 6: Node Modules Issues

**Error:** Various module not found errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or with yarn
rm -rf node_modules yarn.lock
yarn install
```

## Development Workflow

### Backend Development

```bash
cd Backend

# Run with auto-reload
npm run dev

# Run database migration scripts
node scripts/migrate-invitation-roles.js

# Check logs
# Server logs appear in terminal
```

### Frontend Development

```bash
cd Frontend

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Database Management

```bash
# Connect to MongoDB
mongosh

# Switch to app database
use synchronos

# View collections
show collections

# Query users
db.users.find().pretty()

# Query projects
db.projects.find().pretty()

# Drop database (careful!)
db.dropDatabase()
```

## Testing the Application

### Manual Testing Checklist

#### Authentication
- [ ] Register new user
- [ ] Login with credentials
- [ ] Logout
- [ ] Invalid credentials handling

#### Projects
- [ ] Create project
- [ ] View project details
- [ ] Edit project
- [ ] Delete project
- [ ] Invite member

#### Pages
- [ ] Create page
- [ ] Edit page with rich text
- [ ] Real-time collaboration
- [ ] Edit locking
- [ ] Save and auto-save
- [ ] View version history

#### Kanban Boards
- [ ] Create board
- [ ] Add cards
- [ ] Drag and drop cards
- [ ] Edit card details
- [ ] Add comments
- [ ] Assign members

#### Real-time Features
- [ ] Multiple users in same page
- [ ] Live cursor tracking
- [ ] Edit lock notification
- [ ] Real-time content sync
- [ ] Presence indicators

### Testing with Multiple Users

1. Open application in two different browsers (e.g., Chrome and Firefox)
2. Login with different accounts
3. Join the same project
4. Open the same page
5. Test real-time features:
   - User presence
   - Edit locking
   - Content synchronization
   - Cursor tracking

## Production Build

### Backend Production Setup

```bash
cd Backend

# Set environment to production
# In .env file:
NODE_ENV=production

# Use a production MongoDB instance
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/synchronos

# Start with PM2 (recommended)
npm install -g pm2
pm2 start server.js --name "synchronos-backend"
pm2 save
pm2 startup
```

### Frontend Production Build

```bash
cd Frontend

# Build for production
npm run build

# Output will be in 'dist' folder
# Deploy 'dist' folder to:
# - Vercel (recommended)
# - Netlify
# - AWS S3 + CloudFront
# - Any static hosting
```

## Environment Variables Reference

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 5000 | No |
| `NODE_ENV` | Environment mode | development | No |
| `FRONTEND_URL` | Frontend URL for CORS | - | Yes |
| `MONGODB_URI` | MongoDB connection string | - | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `JWT_EXPIRE` | JWT expiration time | 7d | No |
| `COOKIE_EXPIRE` | Cookie expiration (days) | 7 | No |
| `EMAIL_HOST` | SMTP host | - | No* |
| `EMAIL_PORT` | SMTP port | 587 | No* |
| `EMAIL_USER` | SMTP username | - | No* |
| `EMAIL_PASSWORD` | SMTP password | - | No* |
| `EMAIL_FROM` | From email address | - | No* |

*Required for email invitations

### Frontend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | - | Yes |
| `VITE_SOCKET_URL` | Socket.IO server URL | - | Yes |
| `VITE_APP_NAME` | Application name | Synchronos | No |
| `VITE_APP_VERSION` | App version | 1.0.0 | No |

## Development Tools

### Recommended VS Code Extensions

- ESLint
- Prettier
- MongoDB for VS Code
- Thunder Client (API testing)
- GitLens
- Tailwind CSS IntelliSense

### Useful Commands

```bash
# Backend
cd Backend
npm run dev          # Start with nodemon
npm start            # Start without auto-reload

# Frontend
cd Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Database
mongosh              # Connect to MongoDB
mongodump            # Backup database
mongorestore         # Restore database
```

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [React Documentation](https://react.dev/)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [Tiptap Documentation](https://tiptap.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Getting Help

If you encounter issues:

1. Check this setup guide
2. Review error messages carefully
3. Check the browser console for frontend errors
4. Check terminal/server logs for backend errors
5. Search for similar issues in the project repository
6. Create an issue on GitHub with:
   - Error message
   - Steps to reproduce
   - Environment details (OS, Node version, etc.)

## Next Steps

After successful setup:

1. Explore the [Architecture Documentation](./ARCHITECTURE.md)
2. Learn about [Editor and Collaboration](./EDITOR_COLLABORATION.md)
3. Review [Known Limitations](./LIMITATIONS.md)
4. Start building your projects!

---

**Happy Coding! 🚀**
