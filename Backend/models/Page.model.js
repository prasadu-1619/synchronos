import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Page title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      default: '',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Page',
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    versions: [
      {
        content: String,
        editedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        editedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        position: {
          line: Number,
          character: Number,
        },
        resolved: {
          type: Boolean,
          default: false,
        },
        resolvedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        resolvedAt: Date,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create a new version when content changes
pageSchema.pre('save', function (next) {
  if (this.isModified('content') && !this.isNew) {
    this.versions.push({
      content: this.content,
      editedBy: this.lastEditedBy,
      editedAt: new Date(),
    });
    
    // Keep only last 10 versions
    if (this.versions.length > 10) {
      this.versions = this.versions.slice(-10);
    }
  }
  next();
});

const Page = mongoose.model('Page', pageSchema);

export default Page;
