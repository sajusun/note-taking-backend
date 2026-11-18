import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a post title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    content: {
      type: String,
      required: [true, 'Please provide post content']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Post must have an author (userId)']
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
// Directly optimizes Scenario 2 Aggregation ($lookup on posts by foreignField userId)
// and sorting user's posts chronologically.
postSchema.index({ userId: 1, createdAt: -1 });

// 2. Index on { createdAt: -1 }:
// Supports public listing of all posts sorted chronologically with pagination.
postSchema.index({ createdAt: -1 });

const Post = mongoose.model('Post', postSchema);

export default Post;
