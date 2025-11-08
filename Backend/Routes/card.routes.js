import express from 'express';
import Card from '../models/Card.model.js';
import Board from '../models/Board.model.js';
import Project from '../models/Project.model.js';
import User from '../models/User.model.js';
import { protect } from '../middleware/auth.middleware.js';
import { createActivity } from '../utils/activity.utils.js';
import { sendCardAssignedEmail, sendCardStatusChangeEmail, sendCardCommentEmail } from '../services/card-notification.service.js';

const router = express.Router();

// @route   GET /api/cards/board/:boardId
// @desc    Get all cards for a board
// @access  Private
router.get('/board/:boardId', protect, async (req, res) => {
  try {
    const cards = await Card.find({ board: req.params.boardId })
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('comments.user', 'name email avatar')
      .sort('order');

    res.status(200).json({
      success: true,
      cards,
    });
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cards',
    });
  }
});

// @route   GET /api/cards/:id
// @desc    Get single card
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('comments.user', 'name email avatar');

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found',
      });
    }

    res.status(200).json({
      success: true,
      card,
    });
  } catch (error) {
    console.error('Error fetching card:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching card',
    });
  }
});

// @route   POST /api/cards
// @desc    Create a new card
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, board, column, assignee, labels, dueDate, priority } = req.body;

    if (!title || !board || !column) {
      return res.status(400).json({
        success: false,
        message: 'Title, board, and column are required',
      });
    }

    // Check board access
    const boardDoc = await Board.findById(board).populate('project');
    const project = await Project.findById(boardDoc.project._id);
    const hasAccess = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const card = await Card.create({
      title,
      description: description || '',
      board,
      column,
      assignee: assignee || null,
      labels: labels || [],
      dueDate: dueDate || null,
      priority: priority || 'medium',
      createdBy: req.user._id,
    });

    // Add card to board
    boardDoc.cards.push(card._id);
    await boardDoc.save();

    // Create activity
    await createActivity({
      type: 'card_created',
      user: req.user._id,
      project: boardDoc.project._id,
      targetType: 'card',
      targetId: card._id,
      metadata: { cardTitle: title, boardName: boardDoc.name },
    });

    const populatedCard = await Card.findById(card._id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    // Send email to assignee if assigned
    if (assignee) {
      try {
        const assigneeUser = await User.findById(assignee);
        if (assigneeUser && assigneeUser._id.toString() !== req.user._id.toString()) {
          await sendCardAssignedEmail(
            assigneeUser.email,
            assigneeUser.name,
            {
              title,
              description,
              column,
              priority,
              dueDate,
              labels,
              board,
              projectId: boardDoc.project._id,
            },
            { name: req.user.name },
            project.name,
            boardDoc.name
          );
        }
      } catch (emailError) {
        console.error('Failed to send assignment email:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`project-${boardDoc.project._id}`).emit('card-created', populatedCard);
    }

    res.status(201).json({
      success: true,
      card: populatedCard,
      message: 'Card created successfully',
    });
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating card',
    });
  }
});

// @route   PUT /api/cards/:id
// @desc    Update card
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, description, column, assignee, labels, dueDate, priority } = req.body;

    const card = await Card.findById(req.params.id)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found',
      });
    }

    // Check board access
    const board = await Board.findById(card.board).populate('project');
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

    const oldColumn = card.column;
    const oldAssignee = card.assignee;

    card.title = title || card.title;
    card.description = description !== undefined ? description : card.description;
    card.column = column || card.column;
    card.assignee = assignee !== undefined ? assignee : card.assignee;
    card.labels = labels || card.labels;
    card.dueDate = dueDate !== undefined ? dueDate : card.dueDate;
    card.priority = priority || card.priority;

    await card.save();

    // Send email if status changed
    if (oldColumn !== card.column) {
      try {
        // Notify card creator
        const creator = await User.findById(card.createdBy);
        if (creator && creator._id.toString() !== req.user._id.toString()) {
          await sendCardStatusChangeEmail(
            creator.email,
            creator.name,
            {
              title: card.title,
              description: card.description,
              board: card.board,
              projectId: board.project._id,
              dueDate: card.dueDate,
            },
            { name: req.user.name },
            oldColumn,
            card.column,
            project.name,
            board.name
          );
        }
      } catch (emailError) {
        console.error('Failed to send status change email:', emailError);
      }
    }

    // Send email if assignee changed
    if (assignee && (!oldAssignee || oldAssignee._id.toString() !== assignee.toString())) {
      try {
        const newAssignee = await User.findById(assignee);
        if (newAssignee && newAssignee._id.toString() !== req.user._id.toString()) {
          await sendCardAssignedEmail(
            newAssignee.email,
            newAssignee.name,
            {
              title: card.title,
              description: card.description,
              column: card.column,
              priority: card.priority,
              dueDate: card.dueDate,
              labels: card.labels,
              board: card.board,
              projectId: board.project._id,
            },
            { name: req.user.name },
            project.name,
            board.name
          );
        }
      } catch (emailError) {
        console.error('Failed to send assignment email:', emailError);
      }
    }

    // Create activity
    const activityType = oldColumn !== card.column ? 'card_moved' : 'card_updated';
    await createActivity({
      type: activityType,
      user: req.user._id,
      project: board.project._id,
      targetType: 'card',
      targetId: card._id,
      metadata: {
        cardTitle: card.title,
        boardName: board.name,
        oldColumn,
        newColumn: card.column,
      },
    });

    const updatedCard = await Card.findById(card._id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`project-${board.project._id}`).emit('card-updated', updatedCard);
    }

    res.status(200).json({
      success: true,
      card: updatedCard,
      message: 'Card updated successfully',
    });
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating card',
    });
  }
});

// @route   DELETE /api/cards/:id
// @desc    Delete card
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found',
      });
    }

    // Check board access
    const board = await Board.findById(card.board).populate('project');
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

    // Remove card from board
    board.cards = board.cards.filter(
      (c) => c.toString() !== card._id.toString()
    );
    await board.save();

    await Card.findByIdAndDelete(req.params.id);

    // Create activity
    await createActivity({
      type: 'card_deleted',
      user: req.user._id,
      project: board.project._id,
      targetType: 'card',
      targetId: card._id,
      metadata: { cardTitle: card.title, boardName: board.name },
    });

    res.status(200).json({
      success: true,
      message: 'Card deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting card',
    });
  }
});

// @route   POST /api/cards/:id/comments
// @desc    Add comment to card
// @access  Private
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required',
      });
    }

    const card = await Card.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignee', 'name email');

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found',
      });
    }

    card.comments.push({
      user: req.user._id,
      text,
    });

    await card.save();

    // Get board and project
    const board = await Board.findById(card.board).populate('project');
    const project = await Project.findById(board.project._id);

    // Send email to card creator and assignee
    try {
      const recipientsToNotify = new Set();
      
      if (card.createdBy && card.createdBy._id.toString() !== req.user._id.toString()) {
        recipientsToNotify.add(JSON.stringify({ 
          email: card.createdBy.email, 
          name: card.createdBy.name 
        }));
      }
      
      if (card.assignee && card.assignee._id.toString() !== req.user._id.toString()) {
        recipientsToNotify.add(JSON.stringify({ 
          email: card.assignee.email, 
          name: card.assignee.name 
        }));
      }

      for (const recipientStr of recipientsToNotify) {
        const recipient = JSON.parse(recipientStr);
        await sendCardCommentEmail(
          recipient.email,
          recipient.name,
          {
            title: card.title,
            board: card.board,
            projectId: board.project._id,
          },
          { name: req.user.name },
          text,
          project.name,
          board.name
        );
      }
    } catch (emailError) {
      console.error('Failed to send comment email:', emailError);
    }

    // Create activity
    await createActivity({
      type: 'comment_added',
      user: req.user._id,
      project: board.project._id,
      targetType: 'card',
      targetId: card._id,
      metadata: { cardTitle: card.title },
    });

    const updatedCard = await Card.findById(card._id)
      .populate('comments.user', 'name email avatar');

    res.status(200).json({
      success: true,
      card: updatedCard,
      message: 'Comment added successfully',
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
    });
  }
});

export default router;
