import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        'project_created',
        'project_updated',
        'project_deleted',
        'member_added',
        'member_removed',
        'member_invited',
        'page_created',
        'page_updated',
        'page_deleted',
        'board_created',
        'board_updated',
        'card_created',
        'card_updated',
        'card_moved',
        'card_deleted',
        'comment_added',
      ],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['project', 'page', 'board', 'card'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
activitySchema.index({ project: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
