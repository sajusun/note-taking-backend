import User from '../models/User.js';
import Note from '../models/Note.js';
import Post from '../models/Post.js';

// @desc    Admin: List all users with pagination
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    // Supported by index: { createdAt: -1 }
    const [totalUsers, users] = await Promise.all([
      User.countDocuments(),
      User.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password')
    ]);

    const totalPages = Math.ceil(totalUsers / limit) || 1;

    res.status(200).json({
      success: true,
      pagination: {
        total: totalUsers,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get single user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res, next) => {
  try {
    // Supported by default unique _id index
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Create a new user
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, interests } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists'
      });
    }

    let cleanedInterests = [];
    if (Array.isArray(interests)) {
      cleanedInterests = interests.map((i) => String(i).trim().toLowerCase()).filter(Boolean);
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role === 'admin' ? 'admin' : 'user',
      interests: cleanedInterests
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        interests: user.interests,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update user details
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, interests } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if new email conflicts with another user
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email address already in use by another account'
        });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (role && ['user', 'admin'].includes(role)) user.role = role;
    if (Array.isArray(interests)) {
      user.interests = interests.map((i) => String(i).trim().toLowerCase()).filter(Boolean);
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        interests: updatedUser.interests,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete user (cascades notes and posts)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Cascade delete user's notes and posts
    await Promise.all([
      Note.deleteMany({ userId: user._id }),
      Post.deleteMany({ userId: user._id }),
      user.deleteOne()
    ]);

    res.status(200).json({
      success: true,
      message: 'User and all associated notes and posts deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
