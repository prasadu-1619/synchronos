import Project from '../models/Project.model.js';

// Check if user has access to project
export const checkProjectAccess = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id || req.body.project;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required',
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check if user is member of project
    const isMember = project.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this project',
      });
    }

    // Add project to request
    req.project = project;

    // Get user's role in project
    const memberInfo = project.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );
    req.projectRole = memberInfo ? memberInfo.role : null;

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking project access',
    });
  }
};

// Check if user has admin or owner role in project
export const checkProjectAdmin = (req, res, next) => {
  if (!['owner', 'admin'].includes(req.projectRole)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to perform this action',
    });
  }
  next();
};
