import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a note title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    content: {
      type: String,
      required: [true, 'Please provide note content']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Note must belong to a user']
    }
  },
  {
    timestamps: true
  }
);

// ==========================================
// Explicit Database Indexes (Review Requirement)
// ==========================================

// 1. Compound index on { userId: 1, createdAt: -1 }:
// Perfectly optimizes a user fetching their own notes with pagination & sorting:
// Note.find({ userId }).sort({ createdAt: -1 }).skip(s).limit(l)
// Follows the ESR (Equality, Sort, Range) rule to avoid in-memory sorting.
noteSchema.index({ userId: 1, createdAt: -1 });

// 2. Index on { createdAt: -1 }:
// Supports Admin viewing everyone's notes sorted chronologically without userId filter:
// Note.find().sort({ createdAt: -1 }).skip(s).limit(l)
noteSchema.index({ createdAt: -1 });

const Note = mongoose.model('Note', noteSchema);

export default Note;
