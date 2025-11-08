import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ['viewer', 'editor'],
      default: 'viewer',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending',
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
invitationSchema.index({ email: 1, project: 1 });
invitationSchema.index({ token: 1 });
invitationSchema.index({ expiresAt: 1 });

// Check if invitation is expired
invitationSchema.methods.isExpired = function () {
  return this.expiresAt < new Date();
};

const Invitation = mongoose.model('Invitation', invitationSchema);

export default Invitation;
