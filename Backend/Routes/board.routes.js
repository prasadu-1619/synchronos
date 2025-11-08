import express from 'express';
import Board from '../models/Board.model.js';
import Card from '../models/Card.model.js';
import Project from '../models/Project.model.js';
import { protect } from '../middleware/auth.middleware.js';
import { checkProjectAccess } from '../middleware/project.middleware.js';
import { createActivity } from '../utils/activity.utils.js';

const router = express.Router();

// @route   GET /api/boards
// @desc    Get all boards for a project (with query param)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required',
      });
    }

    // Check project access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const hasAccess = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const boards = await Board.find({
      project: projectId,
      isArchived: false,
    }).populate('cards');

    res.status(200).json({
      success: true,
      boards,
    });
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching boards',
    });
  }
});

// @route   GET /api/boards/project/:projectId
// @desc    Get all boards for a project
// @access  Private
router.get('/project/:projectId', protect, checkProjectAccess, async (req, res) => {
  try {
    const boards = await Board.find({
      project: req.params.projectId,
      isArchived: false,
    }).populate('cards');

    res.status(200).json({
      success: true,
      boards,
    });
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching boards',
    });
  }
});

// @route   GET /api/boards/:id
// @desc    Get single board with all cards
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate({
        path: 'cards',
        populate: {
          path: 'assignee createdBy',
          select: 'name email avatar',
        },
      })
      .populate('project', 'name');

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    // Check project access
    const project = await Project.findById(board.project._id);
    const hasAccess = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.status(200).json({
      success: true,
      board,
    });
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching board',
    });
  }
});

// @route   POST /api/boards
// @desc    Create a new board
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, project } = req.body;

    if (!name || !project) {
      return res.status(400).json({
        success: false,
        message: 'Name and project are required',
      });
    }

    // Check project access
    const projectDoc = await Project.findById(project);
    
    if (!projectDoc) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const hasAccess = projectDoc.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const board = await Board.create({
      name,
      description,
      project,
    });

    // Add board to project
    projectDoc.boards.push(board._id);
    await projectDoc.save();

    // Create activity
    await createActivity({
      type: 'board_created',
      user: req.user._id,
      project: project,
      targetType: 'board',
      targetId: board._id,
      metadata: { boardName: name },
    });

    res.status(201).json({
      success: true,
      board,
      message: 'Board created successfully',
    });
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating board',
    });
  }
});

// @route   PUT /api/boards/:id
// @desc    Update board
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, description, columns } = req.body;

    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    // Check project access
    const project = await Project.findById(board.project);
    const hasAccess = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    board.name = name || board.name;
    board.description = description !== undefined ? description : board.description;
    board.columns = columns || board.columns;

    await board.save();

    // Create activity
    await createActivity({
      type: 'board_updated',
      user: req.user._id,
      project: board.project,
      targetType: 'board',
      targetId: board._id,
      metadata: { boardName: board.name },
    });

    res.status(200).json({
      success: true,
      board,
      message: 'Board updated successfully',
    });
  } catch (error) {
    console.error('Error updating board:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating board',
    });
  }
});

// @route   DELETE /api/boards/:id
// @desc    Delete board (requires confirmation - owner only)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    const { confirmation } = req.body;

    if (!board) {
      return res.status(404).json({
        success: false,
        message: 'Board not found',
      });
    }

    // Check project access
    const project = await Project.findById(board.project);
    
    // Only project owner can delete boards
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only project owner can delete boards',
      });
    }

    // Require confirmation: user must type "delete/boardname"
    const expectedConfirmation = `delete/${board.name}`;
    if (!confirmation || confirmation !== expectedConfirmation) {
      return res.status(400).json({
        success: false,
        message: `To delete this board, please type: delete/${board.name}`,
        requiresConfirmation: true,
      });
    }

    // Delete all cards in the board
    await Card.deleteMany({ board: board._id });

    // Remove board from project
    project.boards = project.boards.filter(
      (b) => b.toString() !== board._id.toString()
    );
    await project.save();

    // Create activity before deletion
    await createActivity({
      type: 'board_deleted',
      user: req.user._id,
      project: project._id,
      metadata: { boardName: board.name },
    });

    await Board.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Board and all its cards deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting board:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting board',
    });
  }
});

export default router;
