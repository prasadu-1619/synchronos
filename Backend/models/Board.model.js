import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Board name is required'],
      trim: true,
      maxlength: [100, 'Board name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    columns: [
      {
        id: String,
        name: String,
        order: Number,
      },
    ],
    cards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Card',
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

// Default columns
boardSchema.pre('save', function (next) {
  if (this.isNew && this.columns.length === 0) {
    this.columns = [
      { id: 'todo', name: 'To Do', order: 0 },
      { id: 'inprogress', name: 'In Progress', order: 1 },
      { id: 'done', name: 'Done', order: 2 },
    ];
  }
  next();
});

const Board = mongoose.model('Board', boardSchema);

export default Board;
