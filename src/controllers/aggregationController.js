import mongoose from 'mongoose';
import User from '../models/User.js';

// ==============================================================================
// AGGREGATION SCENARIO 1: Group by Interests
// Context: User profiles contain a list of interests (e.g., ['chess', 'reading']).
// Task: Specific view to see users grouped by interests.
// Constraint: You must use exactly one collection.aggregate() call.
// Supported by Index: userSchema.index({ interests: 1 })
// ==============================================================================
export const getUsersByInterests = async (req, res, next) => {
  try {
    const results = await User.aggregate([
      // 1. Only consider users who have non-empty interests array
      {
        $match: {
          interests: { $exists: true, $not: { $size: 0 } }
        }
      },
      // 2. Deconstruct the interests array so each interest is an individual stream
      {
        $unwind: '$interests'
      },
      // 3. Group by each interest and accumulate matching users
      {
        $group: {
          _id: '$interests',
          totalUsers: { $sum: 1 },
          users: {
            $push: {
              _id: '$_id',
              name: '$name',
              email: '$email',
              role: '$role'
            }
          }
        }
      },
      // 4. Project clean output schema
      {
        $project: {
          _id: 0,
          interest: '$_id',
          totalUsers: 1,
          users: 1
        }
      },
      // 5. Sort alphabetically by interest name
      {
        $sort: { interest: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// ==============================================================================
// AGGREGATION SCENARIO 2: User Posts ($lookup)
// Context: Users can write posts which are stored in a separate Posts collection.
// Task: Retrieve all posts belonging to a particular user.
// Constraint: Use a single aggregation pipeline with a $lookup stage.
// Supported by Index: postSchema.index({ userId: 1, createdAt: -1 })
// ==============================================================================
export const getUserPostsLookup = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Execute single aggregation pipeline starting from User and joining Posts via $lookup
    const results = await User.aggregate([
      // 1. Match the targeted user
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId)
        }
      },
      // 2. Perform $lookup stage to join 'posts' collection where post.userId == user._id
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'userId',
          pipeline: [
            { $sort: { createdAt: -1 } }
          ],
          as: 'posts'
        }
      },
      // 3. Project output excluding sensitive fields
      {
        $project: {
          password: 0,
          __v: 0
        }
      }
    ]);

    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = results[0];

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          interests: userData.interests
        },
        totalPosts: userData.posts.length,
        posts: userData.posts
      }
    });
  } catch (error) {
    next(error);
  }
};
