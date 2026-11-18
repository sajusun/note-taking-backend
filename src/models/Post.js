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

// Indexes: compound index on userId and createdAt for lookup, and createdAt for public feed
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

const Post = mongoose.model('Post', postSchema);

export default Post;
