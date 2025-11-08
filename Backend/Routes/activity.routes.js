import express from 'express';
import Activity from '../models/Activity.model.js';
import { protect } from '../middleware/auth.middleware.js';
import { checkProjectAccess } from '../middleware/project.middleware.js';

const router = express.Router();

// @route   GET /api/activities/project/:projectId
// @desc    Get all activities for a project
// @access  Private
router.get('/project/:projectId', protect, checkProjectAccess, async (req, res) => {
  try {
    const { type, limit = 50, page = 1 } = req.query;

    const query = { project: req.params.projectId };

    if (type) {
      query.type = type;
    }

    const activities = await Activity.find(query)
      .populate('user', 'name email avatar')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Activity.countDocuments(query);

    res.status(200).json({
      success: true,
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activities',
    });
  }
});

// @route   GET /api/activities/user
// @desc    Get activities for current user (across all projects)
// @access  Private
router.get('/user', protect, async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;

    const activities = await Activity.find({ user: req.user._id })
      .populate('user', 'name email avatar')
      .populate('project', 'name')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Activity.countDocuments({ user: req.user._id });

    res.status(200).json({
      success: true,
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activities',
    });
  }
});

export default router;
