import Activity from '../models/Activity.model.js';

export const createActivity = async (activityData) => {
  try {
    const activity = await Activity.create(activityData);
    
    // Emit socket event for real-time updates
    const io = global.io;
    if (io && activityData.project) {
      io.to(`project-${activityData.project}`).emit('activity-created', activity);
    }
    
    return activity;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
};

export const getActivityMessage = (activity) => {
  const messages = {
    project_created: 'created the project',
    project_updated: 'updated the project',
    project_deleted: 'deleted the project',
    member_added: 'added a member',
    member_removed: 'removed a member',
    page_created: 'created a page',
    page_updated: 'updated a page',
    page_deleted: 'deleted a page',
    board_created: 'created a board',
    board_updated: 'updated a board',
    card_created: 'created a card',
    card_updated: 'updated a card',
    card_moved: 'moved a card',
    card_deleted: 'deleted a card',
    comment_added: 'added a comment',
  };
  
  return messages[activity.type] || 'performed an action';
};
