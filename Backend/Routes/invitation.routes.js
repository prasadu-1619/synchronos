import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Invitation from '../models/Invitation.model.js';
import Project from '../models/Project.model.js';
import User from '../models/User.model.js';
import { protect } from '../middleware/auth.middleware.js';
import { createNotification } from '../utils/notification.utils.js';
import { createActivity } from '../utils/activity.utils.js';
import { sendInvitationEmail } from '../services/email.service.js';
import Activity from '../models/Activity.model.js';

const router = express.Router();

// @route   POST /api/invitations
// @desc    Send invitation to join project
// @access  Private (Owner/Admin only)
router.post('/', protect, async (req, res) => {
  try {
    const { projectId, email, role } = req.body;

    if (!projectId || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Project ID, email, and role are required',
      });
    }

    // Validate role
    if (!['viewer', 'editor'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either "viewer" or "editor"',
      });
    }

    // Check if project exists and user has permission to invite
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check if user is owner or admin
    const userMembership = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!userMembership || !['owner', 'admin'].includes(userMembership.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only owners and admins can send invitations',
      });
    }

    // Check if user is already a member
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const isMember = project.members.some(
        (m) => m.user.toString() === existingUser._id.toString()
      );

      if (isMember) {
        return res.status(400).json({
          success: false,
          message: 'User is already a member of this project',
        });
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await Invitation.findOne({
      project: projectId,
      email: email.toLowerCase(),
      status: 'pending',
    });

    if (existingInvitation && !existingInvitation.isExpired()) {
      return res.status(400).json({
        success: false,
        message: 'An invitation has already been sent to this email',
      });
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');

    // Create invitation
    const invitation = await Invitation.create({
      project: projectId,
      invitedBy: req.user._id,
      email: email.toLowerCase(),
      role,
      token,
    });

    await invitation.populate('invitedBy', 'name email');
    await invitation.populate('project', 'name description');

    // Create notification if user exists
    if (existingUser) {
      await createNotification({
        user: existingUser._id,
        type: 'invitation',
        message: `${req.user.name} invited you to join "${project.name}"`,
        link: `/invitations/${invitation._id}`,
      });
    }

    // Create activity
    await createActivity({
      type: 'member_invited',
      user: req.user._id,
      project: projectId,
      metadata: { email, role },
    });

    // Send email notification
    const isNewUser = !existingUser;
    const emailResult = await sendInvitationEmail({
      to: email,
      inviterName: req.user.name,
      projectName: project.name,
      token,
      role,
      isNewUser,
    });

    if (!emailResult.success) {
      console.warn('⚠️ Failed to send invitation email:', emailResult.error);
    }

    res.status(201).json({
      success: true,
      invitation,
      message: `Invitation sent to ${email}`,
      invitationLink: `${process.env.FRONTEND_URL}/accept-invitation/${token}`,
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error sending invitation',
    });
  }
});

// @route   GET /api/invitations
// @desc    Get all invitations for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const invitations = await Invitation.find({
      email: req.user.email.toLowerCase(),
      status: 'pending',
    })
      .populate('project', 'name description color icon')
      .populate('invitedBy', 'name email')
      .sort('-createdAt');

    // Filter out expired invitations
    const validInvitations = invitations.filter((inv) => !inv.isExpired());

    res.status(200).json({
      success: true,
      invitations: validInvitations,
    });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invitations',
    });
  }
});

// @route   GET /api/invitations/project/:projectId
// @desc    Get all invitations for a project
// @access  Private (Owner/Admin only)
router.get('/project/:projectId', protect, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check if project exists and user has permission
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const userMembership = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!userMembership || !['owner', 'admin'].includes(userMembership.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const invitations = await Invitation.find({
      project: projectId,
      status: { $in: ['pending', 'accepted', 'rejected'] },
    })
      .populate('invitedBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      invitations,
    });
  } catch (error) {
    console.error('Error fetching project invitations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invitations',
    });
  }
});

// @route   POST /api/invitations/:token/accept
// @desc    Accept invitation (for logged-in users) or get invitation details (for new users)
// @access  Public for new users, Private for existing users
router.post('/:token/accept', async (req, res) => {
  try {
    const { token } = req.params;
    const { name, email, password } = req.body; // For new user registration

    const invitation = await Invitation.findOne({ token })
      .populate('project')
      .populate('invitedBy', 'name email');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found',
      });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Invitation has already been processed',
      });
    }

    if (invitation.isExpired()) {
      invitation.status = 'expired';
      await invitation.save();
      return res.status(400).json({
        success: false,
        message: 'Invitation has expired',
      });
    }

    // Check if this is a new user registration
    let user;
    const existingUser = await User.findOne({ email: invitation.email });

    if (!existingUser && name && password) {
      // New user registration flow
      // Validate password
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters',
        });
      }

      // Create new user
      user = await User.create({
        name,
        email: invitation.email,
        password, // Will be hashed by the User model pre-save hook
      });

      console.log(`✅ New user registered via invitation: ${user.email}`);
    } else if (existingUser) {
      // Existing user - check if they're logged in (req.user exists from protect middleware)
      // For now, we'll just use the existing user
      user = existingUser;
    } else {
      // New user but missing registration details
      return res.status(400).json({
        success: false,
        message: 'Please provide name and password to create your account',
        requiresRegistration: true,
        invitationDetails: {
          email: invitation.email,
          projectName: invitation.project.name,
          role: invitation.role,
        },
      });
    }

    const project = invitation.project;

    // Check if user is already a member
    const isMember = project.members.some(
      (m) => m.user.toString() === user._id.toString()
    );

    if (isMember) {
      invitation.status = 'accepted';
      await invitation.save();
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this project',
      });
    }

    // Add user to project
    project.members.push({
      user: user._id,
      role: invitation.role,
      joinedAt: new Date(),
    });

    await project.save();

    // Update invitation status
    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    await invitation.save();

    // Create activity log
    await Activity.create({
      user: user._id,
      action: 'accepted',
      targetType: 'invitation',
      targetId: invitation._id,
      project: project._id,
      description: `${user.name} joined the project via invitation`,
    });

    // Generate JWT token for new users
    let authToken = null;
    if (!existingUser && name && password) {
      authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
      });
    }

    res.status(200).json({
      success: true,
      message: !existingUser 
        ? 'Account created and invitation accepted successfully' 
        : `Successfully joined "${project.name}"`,
      project: {
        _id: project._id,
        name: project.name,
        description: project.description,
        role: invitation.role,
      },
      token: authToken, // Only present for new users
      user: !existingUser ? {
        _id: user._id,
        name: user.name,
        email: user.email,
      } : undefined,
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error accepting invitation',
    });
  }
});

// @route   POST /api/invitations/:token/reject
// @desc    Reject invitation
// @access  Private
router.post('/:token/reject', protect, async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await Invitation.findOne({ token }).populate(
      'invitedBy',
      'name email'
    );

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found',
      });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Invitation has already been processed',
      });
    }

    // Check if invitation email matches user email
    if (invitation.email !== req.user.email.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'This invitation was sent to a different email address',
      });
    }

    invitation.status = 'rejected';
    await invitation.save();

    res.status(200).json({
      success: true,
      message: 'Invitation rejected',
    });
  } catch (error) {
    console.error('Error rejecting invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting invitation',
    });
  }
});

// @route   DELETE /api/invitations/:invitationId
// @desc    Cancel/delete invitation
// @access  Private (Owner/Admin only)
router.delete('/:invitationId', protect, async (req, res) => {
  try {
    const { invitationId } = req.params;

    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found',
      });
    }

    // Check if user has permission
    const project = await Project.findById(invitation.project);
    const userMembership = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!userMembership || !['owner', 'admin'].includes(userMembership.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    await invitation.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Invitation cancelled',
    });
  } catch (error) {
    console.error('Error deleting invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting invitation',
    });
  }
});

export default router;
