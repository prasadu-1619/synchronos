// Central API Configuration
// Change this URL to point to your backend server

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  CHECK_AUTH: `${API_BASE_URL}/auth/check`,
  
  // Projects
  PROJECTS: `${API_BASE_URL}/projects`,
  PROJECT_BY_ID: (id) => `${API_BASE_URL}/projects/${id}`,
  
  // Pages (Documentation)
  PAGES: `${API_BASE_URL}/pages`,
  PAGE_BY_ID: (id) => `${API_BASE_URL}/pages/${id}`,
  PAGE_VERSIONS: (id) => `${API_BASE_URL}/pages/${id}/versions`,
  PAGE_RESTORE: (id, versionId) => `${API_BASE_URL}/pages/${id}/restore/${versionId}`,
  
  // Kanban Boards
  BOARDS: `${API_BASE_URL}/boards`,
  BOARD_BY_ID: (id) => `${API_BASE_URL}/boards/${id}`,
  CARDS: `${API_BASE_URL}/cards`,
  CARD_BY_ID: (id) => `${API_BASE_URL}/cards/${id}`,
  MOVE_CARD: `${API_BASE_URL}/cards/move`,
  
  // Activity Feed
  ACTIVITIES: `${API_BASE_URL}/activities`,
  ACTIVITIES_BY_PROJECT: (projectId) => `${API_BASE_URL}/activities/project/${projectId}`,
  
  // Users & Teams
  USERS: `${API_BASE_URL}/users`,
  TEAM_MEMBERS: (projectId) => `${API_BASE_URL}/projects/${projectId}/members`,
  
  // Real-time collaboration
  WEBSOCKET_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:5000',
  
  // Comments
  COMMENTS: `${API_BASE_URL}/comments`,
  PAGE_COMMENTS: (pageId) => `${API_BASE_URL}/pages/${pageId}/comments`,
  
  // Notifications
  NOTIFICATIONS: `${API_BASE_URL}/notifications`,
  MARK_READ: (id) => `${API_BASE_URL}/notifications/${id}/read`,
  
  // Invitations
  INVITATIONS: `${API_BASE_URL}/invitations`,
  INVITE_SEND: `${API_BASE_URL}/invitations`,
  INVITE_ACCEPT: (token) => `${API_BASE_URL}/invitations/${token}/accept`,
  INVITE_REJECT: (token) => `${API_BASE_URL}/invitations/${token}/reject`,
  INVITE_PROJECT: (projectId) => `${API_BASE_URL}/invitations/project/${projectId}`,
  INVITE_CANCEL: (invitationId) => `${API_BASE_URL}/invitations/${invitationId}`,
  INVITE_LIST: `${API_BASE_URL}/invitations`,
  
  // Boards helpers
  BOARD_PROJECT: (projectId) => `${API_BASE_URL}/boards/project/${projectId}`,
  CARD_DETAIL: (boardId, cardId) => `${API_BASE_URL}/boards/${boardId}/cards/${cardId}`,
  
  // Pages helpers
  PAGE_LIST: `${API_BASE_URL}/pages`,
  
  // Search
  SEARCH: `${API_BASE_URL}/search`,
  
  // Dashboard
  DASHBOARD_STATS: `${API_BASE_URL}/dashboard/stats`,
};

export default API_BASE_URL;
