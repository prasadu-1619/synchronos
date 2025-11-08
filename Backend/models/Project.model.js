import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    color: {
      type: String,
      default: '#3B82F6',
    },
    icon: {
      type: String,
      default: 'Folder',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['owner', 'admin', 'editor', 'member', 'viewer'],
          default: 'editor',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    pages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Page',
      },
    ],
    boards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
      },
    ],
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add owner to members when project is created
projectSchema.pre('save', function (next) {
  if (this.isNew && !this.members.some((m) => m.user.equals(this.owner))) {
    this.members.push({
      user: this.owner,
      role: 'owner',
    });
  }
  next();
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
