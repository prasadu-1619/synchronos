import express from 'express';
import Project from '../models/Project.model.js';
import Page from '../models/Page.model.js';
import Board from '../models/Board.model.js';
import Card from '../models/Card.model.js';
import Activity from '../models/Activity.model.js';
import Invitation from '../models/Invitation.model.js';
import { protect } from '../middleware/auth.middleware.js';
import { checkProjectAccess, checkProjectAdmin } from '../middleware/project.middleware.js';
import { createActivity } from '../utils/activity.utils.js';

const router = express.Router();

// @route   GET /api/projects
// @desc    Get all projects for logged-in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find({
      'members.user': req.user._id,
      isArchived: false,
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort('-updatedAt');

    // Add counts for each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const projectObj = project.toObject();

        // Count pages
        const pagesCount = await Page.countDocuments({ project: project._id });

        // Count members (including owner)
        const membersCount = project.members.length;

        // Count tasks (cards) across all boards
        const boards = await Board.find({ project: project._id });
        const boardIds = boards.map(b => b._id);
        const tasksCount = await Card.countDocuments({ board: { $in: boardIds } });

        return {
          ...projectObj,
          pagesCount,
          membersCount,
          tasksCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      projects: projectsWithCounts,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private
router.get('/:id', protect, checkProjectAccess, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .populate('pages')
      .populate('boards');

    // Add counts
    const projectObj = project.toObject();
    
    const pagesCount = await Page.countDocuments({ project: project._id });
    const membersCount = project.members.length;
    
    const boards = await Board.find({ project: project._id });
    const boardIds = boards.map(b => b._id);
    const tasksCount = await Card.countDocuments({ board: { $in: boardIds } });

    res.status(200).json({
      success: true,
      project: {
        ...projectObj,
        pagesCount,
        membersCount,
        tasksCount,
      },
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project',
    });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required',
      });
    }

    const project = await Project.create({
      name,
      description,
      color,
      icon,
      owner: req.user._id,
    });

    // Create activity
    await createActivity({
      type: 'project_created',
      user: req.user._id,
      project: project._id,
      targetType: 'project',
      targetId: project._id,
      metadata: { projectName: name },
    });

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.status(201).json({
      success: true,
      project: populatedProject,
      message: 'Project created successfully',
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating project',
    });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (Admin/Owner only)
router.put('/:id', protect, checkProjectAccess, checkProjectAdmin, async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, color, icon },
      { new: true, runValidators: true }
    )
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    // Create activity
    await createActivity({
      type: 'project_updated',
      user: req.user._id,
      project: project._id,
      targetType: 'project',
      targetId: project._id,
      metadata: { projectName: name },
    });

    res.status(200).json({
      success: true,
      project,
      message: 'Project updated successfully',
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating project',
    });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project (requires confirmation)
// @access  Private (Owner only)
router.delete('/:id', protect, checkProjectAccess, async (req, res) => {
  try {
    const project = req.project;
    const { confirmation } = req.body;

    // Only owner can delete
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner can delete the project',
      });
    }

    // Require confirmation: user must type "delete/projectname"
    const expectedConfirmation = `delete/${project.name}`;
    if (!confirmation || confirmation !== expectedConfirmation) {
      return res.status(400).json({
        success: false,
        message: `To delete this project, please type: delete/${project.name}`,
        requiresConfirmation: true,
      });
    }

    // Delete all related data
    await Page.deleteMany({ project: req.params.id });
    await Board.deleteMany({ project: req.params.id });
    await Card.deleteMany({ board: { $in: project.boards } });
    await Activity.deleteMany({ project: req.params.id });
    await Invitation.deleteMany({ project: req.params.id });

    // Delete the project
    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Project and all related data deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting project',
    });
  }
});

// @route   POST /api/projects/:id/members
// @desc    Add member to project
// @access  Private (Admin/Owner only)
router.post('/:id/members', protect, checkProjectAccess, checkProjectAdmin, async (req, res) => {
  try {
    const { userId, role } = req.body;

    const project = await Project.findById(req.params.id);

    // Check if user is already a member
    const isMember = project.members.some(
      (member) => member.user.toString() === userId
    );

    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member',
      });
    }

    project.members.push({
      user: userId,
      role: role || 'member',
    });

    await project.save();

    // Create activity
    await createActivity({
      type: 'member_added',
      user: req.user._id,
      project: project._id,
      targetType: 'project',
      targetId: project._id,
      metadata: { userId },
    });

    const updatedProject = await Project.findById(req.params.id)
      .populate('members.user', 'name email avatar');

    res.status(200).json({
      success: true,
      project: updatedProject,
      message: 'Member added successfully',
    });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding member',
    });
  }
});

// @route   DELETE /api/projects/:id/members/:userId
// @desc    Remove member from project
// @access  Private (Admin/Owner only)
router.delete('/:id/members/:userId', protect, checkProjectAccess, checkProjectAdmin, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    // Cannot remove owner
    if (project.owner.toString() === req.params.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove project owner',
      });
    }

    project.members = project.members.filter(
      (member) => member.user.toString() !== req.params.userId
    );

    await project.save();

    // Create activity
    await createActivity({
      type: 'member_removed',
      user: req.user._id,
      project: project._id,
      targetType: 'project',
      targetId: project._id,
      metadata: { userId: req.params.userId },
    });

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing member',
    });
  }
});

export default router;
