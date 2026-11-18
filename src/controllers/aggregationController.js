import mongoose from 'mongoose';
import User from '../models/User.js';

// Aggregate users grouped by their interests
export const getUsersByInterests = async (req, res, next) => {
  try {
    const results = await User.aggregate([
      {
        $match: {
          interests: { $exists: true, $not: { $size: 0 } }
        }
      },
      {
        $unwind: '$interests'
      },
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
      {
        $project: {
          _id: 0,
          interest: '$_id',
          totalUsers: 1,
          users: 1
        }
      },
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

// Retrieve a user and their posts using a single $lookup pipeline
export const getUserPostsLookup = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const results = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId)
        }
      },
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
