import Post from '../models/Post.js';

// @desc    Get all public posts with pagination
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    // Supported by index: { createdAt: -1 }
    const [totalPosts, posts] = await Promise.all([
      Post.countDocuments(),
      Post.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email')
    ]);

    const totalPages = Math.ceil(totalPosts / limit) || 1;

    res.status(200).json({
      success: true,
      pagination: {
        total: totalPosts,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('userId', 'name email');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and content for the post'
      });
    }

    const post = await Post.create({
      title,
      content,
      userId: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (Owner or Admin)
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const isOwner = post.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to delete this post'
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
