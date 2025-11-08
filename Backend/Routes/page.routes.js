import express from 'express';
import Page from '../models/Page.model.js';
import Project from '../models/Project.model.js';
import { protect } from '../middleware/auth.middleware.js';
import { checkProjectAccess } from '../middleware/project.middleware.js';
import { createActivity } from '../utils/activity.utils.js';

const router = express.Router();

// @route   GET /api/pages
// @desc    Get all pages for a project (with query param)
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

    const pages = await Page.find({ project: projectId })
      .populate('author', 'name email avatar')
      .populate('lastEditedBy', 'name email avatar')
      .sort('order');

    res.status(200).json({
      success: true,
      pages,
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pages',
    });
  }
});

// @route   GET /api/pages/project/:projectId
// @desc    Get all pages for a project
// @access  Private
router.get('/project/:projectId', protect, checkProjectAccess, async (req, res) => {
  try {
    const pages = await Page.find({ project: req.params.projectId })
      .populate('author', 'name email avatar')
      .populate('lastEditedBy', 'name email avatar')
      .sort('order');

    res.status(200).json({
      success: true,
      pages,
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pages',
    });
  }
});

// @route   GET /api/pages/:id
// @desc    Get single page
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const page = await Page.findById(req.params.id)
      .populate('author', 'name email avatar')
      .populate('lastEditedBy', 'name email avatar')
      .populate('project', 'name');

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found',
      });
    }

    // Check if user has access to project
    const project = await Project.findById(page.project._id);
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
      page,
    });
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching page',
    });
  }
});

// @route   POST /api/pages
// @desc    Create a new page
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, project, parent } = req.body;

    if (!title || !project) {
      return res.status(400).json({
        success: false,
        message: 'Title and project are required',
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

    const page = await Page.create({
      title,
      content: content || '',
      project,
      author: req.user._id,
      lastEditedBy: req.user._id,
      parent: parent || null,
    });

    // Add page to project
    projectDoc.pages.push(page._id);
    await projectDoc.save();

    // Create activity
    await createActivity({
      type: 'page_created',
      user: req.user._id,
      project: project,
      targetType: 'page',
      targetId: page._id,
      metadata: { pageTitle: title },
    });

    const populatedPage = await Page.findById(page._id)
      .populate('author', 'name email avatar')
      .populate('lastEditedBy', 'name email avatar');

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`project-${project}`).emit('page-created', populatedPage);
    }

    res.status(201).json({
      success: true,
      page: populatedPage,
      message: 'Page created successfully',
    });
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating page',
    });
  }
});

// @route   PUT /api/pages/:id
// @desc    Update page
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, content } = req.body;

    const page = await Page.findById(req.params.id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found',
      });
    }

    // Check project access
    const project = await Project.findById(page.project);
    const hasAccess = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    page.title = title || page.title;
    page.content = content !== undefined ? content : page.content;
    page.lastEditedBy = req.user._id;

    await page.save();

    // Create activity
    await createActivity({
      type: 'page_updated',
      user: req.user._id,
      project: page.project,
      targetType: 'page',
      targetId: page._id,
      metadata: { pageTitle: page.title },
    });

    const updatedPage = await Page.findById(page._id)
      .populate('author', 'name email avatar')
      .populate('lastEditedBy', 'name email avatar');

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`page-${page._id}`).emit('page-updated', updatedPage);
    }

    res.status(200).json({
      success: true,
      page: updatedPage,
      message: 'Page updated successfully',
    });
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating page',
    });
  }
});

// @route   DELETE /api/pages/:id
// @desc    Delete page
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found',
      });
    }

    // Check project access
    const project = await Project.findById(page.project);
    const hasAccess = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Remove page from project
    project.pages = project.pages.filter(
      (p) => p.toString() !== page._id.toString()
    );
    await project.save();

    await Page.findByIdAndDelete(req.params.id);

    // Create activity
    await createActivity({
      type: 'page_deleted',
      user: req.user._id,
      project: page.project,
      targetType: 'page',
      targetId: page._id,
      metadata: { pageTitle: page.title },
    });

    res.status(200).json({
      success: true,
      message: 'Page deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting page',
    });
  }
});

// @route   GET /api/pages/:id/versions
// @desc    Get page version history
// @access  Private
router.get('/:id/versions', protect, async (req, res) => {
  try {
    const page = await Page.findById(req.params.id)
      .populate('versions.editedBy', 'name email avatar');

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found',
      });
    }

    res.status(200).json({
      success: true,
      versions: page.versions,
    });
  } catch (error) {
    console.error('Error fetching versions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching versions',
    });
  }
});

// @route   POST /api/pages/:id/comments
// @desc    Add comment to page
// @access  Private
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { text, position } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required',
      });
    }

    const page = await Page.findById(req.params.id);
    
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found',
      });
    }

    // Check project access
    const project = await Project.findById(page.project);
    const hasAccess = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const comment = {
      user: req.user._id,
      text,
      position: position || {},
      createdAt: new Date(),
    };

    page.comments.push(comment);
    await page.save();

    await page.populate('comments.user', 'name email avatar');

    // Create activity
    await createActivity({
      type: 'comment_added',
      user: req.user._id,
      project: page.project,
      targetType: 'page',
      targetId: page._id,
      metadata: { pageName: page.title },
    });

    res.status(201).json({
      success: true,
      comment: page.comments[page.comments.length - 1],
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

// @route   PUT /api/pages/:id/comments/:commentId/resolve
// @desc    Resolve/unresolve comment
// @access  Private
router.put('/:id/comments/:commentId/resolve', protect, async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found',
      });
    }

    const comment = page.comments.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check project access
    const project = await Project.findById(page.project);
    const hasAccess = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    comment.resolved = !comment.resolved;
    comment.resolvedBy = comment.resolved ? req.user._id : null;
    comment.resolvedAt = comment.resolved ? new Date() : null;

    await page.save();
    await page.populate('comments.user', 'name email avatar');
    await page.populate('comments.resolvedBy', 'name email');

    res.status(200).json({
      success: true,
      comment,
      message: comment.resolved ? 'Comment resolved' : 'Comment reopened',
    });
  } catch (error) {
    console.error('Error resolving comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error resolving comment',
    });
  }
});

// @route   DELETE /api/pages/:id/comments/:commentId
// @desc    Delete comment
// @access  Private
router.delete('/:id/comments/:commentId', protect, async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found',
      });
    }

    const comment = page.comments.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Only comment author can delete
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments',
      });
    }

    comment.deleteOne();
    await page.save();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting comment',
    });
  }
});

export default router;

