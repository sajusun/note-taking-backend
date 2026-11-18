import Note from '../models/Note.js';

// @desc    Get paginated notes (User gets own notes; Admin can get all notes or filter by user)
// @route   GET /api/notes
// @access  Private (User & Admin)
export const getNotes = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    let filter = {};

    if (req.user.role === 'admin') {
      // Admin can optionally filter by specific userId or view all
      if (req.query.userId) {
        filter.userId = req.query.userId;
      }
    } else {
      // Regular user can strictly access only their own notes
      filter.userId = req.user._id;
    }

    // Supported indexes:
    // - For User: { userId: 1, createdAt: -1 } (Compound index)
    // - For Admin (all notes): { createdAt: -1 }
    const [totalNotes, notes] = await Promise.all([
      Note.countDocuments(filter),
      Note.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email role')
    ]);

    const totalPages = Math.ceil(totalNotes / limit) || 1;

    res.status(200).json({
      success: true,
      pagination: {
        total: totalNotes,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      data: notes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single note by ID
// @route   GET /api/notes/:id
// @access  Private (Owner or Admin)
export const getNoteById = async (req, res, next) => {
  try {
    // Supported by default unique _id index
    const note = await Note.findById(req.params.id).populate('userId', 'name email');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Authorization check: User must be owner or Admin
    const isOwner = note.userId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this note'
      });
    }

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private (User & Admin)
export const createNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and content for the note'
      });
    }

    const note = await Note.create({
      title,
      content,
      userId: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: note
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private (Owner only, or Admin)
export const updateNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Authorization check
    const isOwner = note.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to update this note'
      });
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;

    const updatedNote = await note.save();

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: updatedNote
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private (Owner or Admin)
export const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Authorization check
    const isOwner = note.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to delete this note'
      });
    }

    await note.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
