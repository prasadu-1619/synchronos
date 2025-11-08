# Synchronos Documentation

Welcome to the Synchronos documentation! This comprehensive guide will help you understand, set up, and contribute to the project.

## 📖 About Synchronos

Synchronos is a real-time collaborative workspace platform that combines rich text editing, kanban boards, and team collaboration features. Built with modern web technologies, it enables teams to work together seamlessly on documents and projects.

### Key Features

- **📝 Rich Text Editor**: Powered by TipTap with extensive formatting options
- **🔄 Real-time Collaboration**: Multiple users can work simultaneously with live cursor tracking
- **📋 Kanban Boards**: Visual project management with drag-and-drop cards
- **👥 Team Collaboration**: User presence, comments, and activity tracking
- **🔐 Secure Authentication**: JWT-based auth with role-based access control
- **🌓 Dark Mode**: Beautiful dark theme for comfortable nighttime work
- **📱 Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **⏱️ Version History**: Track changes and restore previous versions
- **💬 Comments**: Discuss pages with team members
- **🔍 Search**: Find pages and projects quickly

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite 6** - Build tool and dev server
- **TipTap 3.10** - Rich text editor
- **Socket.IO Client 4.7** - Real-time communication
- **Tailwind CSS 3** - Utility-first styling
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **date-fns** - Date formatting
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.IO 4.7** - WebSocket server
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Deployment
- **Vercel** - Frontend hosting (CDN)
- **Google Cloud Run** - Backend containerized deployment
- **MongoDB Atlas** - Managed database (cloud)

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/prasadu-1619/synchronos.git
cd synchronos

# Backend setup
cd Backend
npm install
# Create .env file (see setup-guide.md)
npm run dev

# Frontend setup (new terminal)
cd Frontend
npm install
# Create .env file (see setup-guide.md)
npm run dev
```

Visit `http://localhost:5173` to see the application running.

For detailed setup instructions, see **[Setup Guide](./setup-guide.md)**.

## 📚 Documentation Index

This folder contains comprehensive documentation for the Synchronos project:

1. **[Architecture](./architecture.md)** ✅ - System design, component hierarchy, database schemas, and technical architecture
2. **[Editor & Collaboration](./editor-collaboration.md)** ✅ - Detailed explanation of the TipTap editor, real-time collaboration, and Socket.IO implementation
3. **[Setup Guide](./setup-guide.md)** ✅ - Step-by-step instructions for local development setup
4. **[Limitations & Future](./limitations-future.md)** ✅ - Known limitations, planned improvements, roadmap, and technical debt

### Quick Navigation

- **New to the project?** Start with [Setup Guide](./setup-guide.md)
- **Want to understand the architecture?** Read [Architecture](./architecture.md)
- **Curious about real-time features?** Check [Editor & Collaboration](./editor-collaboration.md)
- **Planning contributions?** See [Limitations & Future](./limitations-future.md)

## 🎯 Project Structure

```
Synchronos/
├── Backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth, error handling
│   ├── utils/           # Helper functions
│   └── server.js        # Main server file
├── Frontend/
│   ├── src/
│   │   ├── Components/  # Reusable UI components
│   │   ├── pages/       # Page components (routes)
│   │   ├── contexts/    # React contexts
│   │   ├── hooks/       # Custom React hooks
│   │   ├── config/      # Configuration files
│   │   └── assets/      # Images, animations
│   ├── public/          # Static files
│   └── index.html       # Entry HTML
└── docs/                # Documentation (you are here!)
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Report Bugs**: Open an issue on GitHub
2. **Suggest Features**: Use GitHub Discussions
3. **Submit Code**: Fork, create a branch, and submit a PR
4. **Improve Docs**: Help us make these docs better

See **[Limitations & Future](./limitations-future.md)** for planned features and areas that need work.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **GitHub Issues**: Report bugs or request features
- **GitHub Discussions**: Ask questions and share ideas
- **Email**: support@synchronos.app (if configured)

## 🙏 Acknowledgments

Built with amazing open-source technologies:
- TipTap team for the incredible editor
- Socket.IO for real-time communication
- React team for the UI library
- MongoDB team for the database
- Vercel and Google Cloud for hosting

---

**Last Updated**: November 9, 2025  
**Version**: 1.0.0  
**Status**: Active Development

Happy coding! 🚀
