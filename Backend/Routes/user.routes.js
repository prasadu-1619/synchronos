import express from 'express';
import User from '../models/User.model.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   GET /api/users/search
// @desc    Search users by name or email
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters',
      });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    })
      .select('name email avatar')
      .limit(10);

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching users',
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user by ID
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, bio, avatar, preferences } = req.body;

    // Check if user is updating their own profile
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile',
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.name = name || user.name;
    user.bio = bio !== undefined ? bio : user.bio;
    user.avatar = avatar !== undefined ? avatar : user.avatar;
    
    if (preferences) {
      user.preferences = {
        ...user.preferences,
        ...preferences,
      };
    }

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      user: userResponse,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating user',
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, bio, avatar, preferences } = req.body;

    const user = await User.findById(req.user._id);

    user.name = name || user.name;
    user.bio = bio !== undefined ? bio : user.bio;
    user.avatar = avatar !== undefined ? avatar : user.avatar;
    
    if (preferences) {
      user.preferences = {
        ...user.preferences,
        ...preferences,
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      user,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile',
    });
  }
});

// @route   PUT /api/users/change-password
// @desc    Update user password
// @access  Private
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isPasswordMatch = await user.comparePassword(currentPassword);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating password',
    });
  }
});

// @route   PUT /api/users/password
// @desc    Update user password (legacy endpoint)
// @access  Private
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isPasswordMatch = await user.comparePassword(currentPassword);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating password',
    });
  }
});

export default router;
