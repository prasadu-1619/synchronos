# Project Management Backend API

Complete backend API for the Project Management & Documentation Tool.

## 🚀 Features

- **Authentication** - JWT-based authentication with httpOnly cookies
- **Projects** - Create, manage, and collaborate on projects
- **Pages** - Rich text documentation with version history
- **Kanban Boards** - Task management with drag-and-drop
- **Cards** - Detailed task cards with comments and attachments
- **Activities** - Real-time activity feed
- **Notifications** - User notifications system
- **WebSocket** - Real-time updates using Socket.IO

## 📋 Prerequisites

- **Node.js** v18 or higher
- **MongoDB** v6 or higher
- **npm** or **yarn**

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file with your settings:**
   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   MONGODB_URI=mongodb://localhost:27017/project-management
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRE=7d
   COOKIE_EXPIRE=7
   ```

4. **Start MongoDB:**
   ```bash
   # On Windows
   net start MongoDB

   # On Mac/Linux
   sudo systemctl start mongod
   ```

5. **Start the server:**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/check` - Check authentication status
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all user projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add member
- `DELETE /api/projects/:id/members/:userId` - Remove member

### Pages
- `GET /api/pages/project/:projectId` - Get all pages
- `GET /api/pages/:id` - Get single page
- `POST /api/pages` - Create page
- `PUT /api/pages/:id` - Update page
- `DELETE /api/pages/:id` - Delete page
- `GET /api/pages/:id/versions` - Get version history

### Boards
- `GET /api/boards/project/:projectId` - Get all boards
- `GET /api/boards/:id` - Get single board
- `POST /api/boards` - Create board
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board

### Cards
- `GET /api/cards/board/:boardId` - Get all cards
- `GET /api/cards/:id` - Get single card
- `POST /api/cards` - Create card
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card
- `POST /api/cards/:id/comments` - Add comment

### Activities
- `GET /api/activities/project/:projectId` - Get project activities
- `GET /api/activities/user` - Get user activities

### Users
- `GET /api/users/search` - Search users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/password` - Change password

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## 🔌 WebSocket Events

### Client → Server
- `join-project` - Join project room
- `leave-project` - Leave project room
- `join-page` - Join page for collaborative editing
- `leave-page` - Leave page

### Server → Client
- `activity-created` - New activity
- `page-created` - New page created
- `page-updated` - Page updated
- `card-created` - New card created
- `card-updated` - Card updated
- `notification-received` - New notification

## 📦 Project Structure

```
Backend/
├── middleware/          # Auth, error handling, project access
├── models/             # Mongoose models
├── routes/             # API routes
├── utils/              # Helper functions
├── server.js           # Express app setup
├── package.json        # Dependencies
└── .env                # Environment variables
```

## 🧪 Testing

Test the API using the health check endpoint:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## 🔒 Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens in httpOnly cookies
- CORS configured for frontend origin
- Input validation on all endpoints
- MongoDB injection protection

## 🚢 Deployment

### MongoDB Atlas Setup
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### Deploy to Railway/Render/Heroku
1. Push code to GitHub
2. Connect repository to platform
3. Set environment variables
4. Deploy!

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend.vercel.app
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-very-secure-secret-key
JWT_EXPIRE=7d
COOKIE_EXPIRE=7
```

## 📝 Notes

- The server runs on port 5000 by default
- MongoDB must be running before starting the server
- JWT tokens expire after 7 days (configurable)
- WebSocket connection is on the same port as HTTP server
- All routes except auth endpoints require authentication

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod --version`
- Check connection string in `.env`
- For Atlas, whitelist your IP address

### Port Already in Use
- Change `PORT` in `.env`
- Kill process using port 5000: `npx kill-port 5000`

### CORS Errors
- Verify `FRONTEND_URL` in `.env` matches your frontend URL
- Check frontend is sending credentials

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.
