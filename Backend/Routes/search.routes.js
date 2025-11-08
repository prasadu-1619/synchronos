import express from 'express';
import Page from '../models/Page.model.js';
import Card from '../models/Card.model.js';
import Project from '../models/Project.model.js';
import Board from '../models/Board.model.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   GET /api/search
// @desc    Global search across pages, cards, and projects
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { query, type } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters',
      });
    }

    const searchRegex = new RegExp(query, 'i');
    const results = {};

    // Get user's accessible projects
    const userProjects = await Project.find({
      'members.user': req.user._id,
    }).select('_id');

    const projectIds = userProjects.map((p) => p._id);

    // Search pages if no type specified or type is 'pages'
    if (!type || type === 'pages') {
      results.pages = await Page.find({
        project: { $in: projectIds },
        $or: [
          { title: searchRegex },
          { content: searchRegex },
        ],
      })
        .populate('project', 'name')
        .populate('createdBy', 'name email')
        .select('title content project createdBy updatedAt')
        .sort({ updatedAt: -1 })
        .limit(10);
    }

    // Search cards if no type specified or type is 'cards'
    if (!type || type === 'cards') {
      const boards = await Board.find({
        project: { $in: projectIds },
      }).select('_id');

      const boardIds = boards.map((b) => b._id);

      results.cards = await Card.find({
        board: { $in: boardIds },
        $or: [
          { title: searchRegex },
          { description: searchRegex },
        ],
      })
        .populate('board', 'name project')
        .populate('assignee', 'name email')
        .populate('createdBy', 'name email')
        .select('title description column priority dueDate board assignee createdBy')
        .sort({ updatedAt: -1 })
        .limit(10);
    }

    // Search projects if no type specified or type is 'projects'
    if (!type || type === 'projects') {
      results.projects = await Project.find({
        _id: { $in: projectIds },
        $or: [
          { name: searchRegex },
          { description: searchRegex },
        ],
      })
        .populate('owner', 'name email')
        .populate('members.user', 'name email')
        .select('name description owner members createdAt')
        .sort({ updatedAt: -1 })
        .limit(10);
    }

    res.status(200).json({
      success: true,
      query,
      results,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message,
    });
  }
});

export default router;
