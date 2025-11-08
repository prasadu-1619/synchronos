import express from 'express';
import Project from '../models/Project.model.js';
import Page from '../models/Page.model.js';
import Card from '../models/Card.model.js';
import Board from '../models/Board.model.js';
import Activity from '../models/Activity.model.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics for user
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    // Get user's projects
    const userProjects = await Project.find({
      'members.user': req.user._id,
    }).select('_id');

    const projectIds = userProjects.map((p) => p._id);

    // Get boards for these projects
    const boards = await Board.find({
      project: { $in: projectIds },
    }).select('_id');

    const boardIds = boards.map((b) => b._id);

    // Get statistics
    const [teamMembersCount, activePagesCount, totalTasksCount, taskDistribution, recentActivities] =
      await Promise.all([
        // Count unique team members across all projects
        Project.aggregate([
          { $match: { _id: { $in: projectIds } } },
          { $unwind: '$members' },
          { $group: { _id: '$members.user' } },
          { $count: 'count' },
        ]),

        // Count active pages
        Page.countDocuments({
          project: { $in: projectIds },
        }),

        // Count total tasks
        Card.countDocuments({
          board: { $in: boardIds },
        }),

        // Task distribution by column
        Card.aggregate([
          { $match: { board: { $in: boardIds } } },
          { $group: { _id: '$column', count: { $sum: 1 } } },
        ]),

        // Recent activities
        Activity.find({
          project: { $in: projectIds },
        })
          .populate('user', 'name email avatar')
          .populate('project', 'name')
          .sort({ createdAt: -1 })
          .limit(10),
      ]);

    // Format task distribution
    const taskStats = {
      todo: 0,
      inprogress: 0,
      done: 0,
    };

    taskDistribution.forEach((stat) => {
      if (stat._id === 'todo') taskStats.todo = stat.count;
      if (stat._id === 'inprogress') taskStats.inprogress = stat.count;
      if (stat._id === 'done') taskStats.done = stat.count;
    });

    res.status(200).json({
      success: true,
      stats: {
        teamMembers: teamMembersCount[0]?.count || 0,
        activePages: activePagesCount,
        totalTasks: totalTasksCount,
        taskDistribution: taskStats,
        recentActivities,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message,
    });
  }
});

export default router;
