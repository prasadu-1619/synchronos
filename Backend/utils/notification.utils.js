import Notification from '../models/Notification.model.js';

export const createNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    
    // Emit socket event for real-time notifications
    const io = global.io;
    if (io && notificationData.recipient) {
      io.to(`user-${notificationData.recipient}`).emit('notification-received', notification);
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const notifyProjectMembers = async (project, notification) => {
  try {
    const notifications = [];
    
    for (const member of project.members) {
      if (member.user.toString() !== notification.sender?.toString()) {
        notifications.push({
          ...notification,
          recipient: member.user,
        });
      }
    }
    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
    
    return notifications;
  } catch (error) {
    console.error('Error notifying project members:', error);
    throw error;
  }
};
