import express from 'express';
import {
  getUsersByInterests,
  getUserPostsLookup
} from '../controllers/aggregationController.js';

const router = express.Router();

// Scenario 1: Group users by interests (1 aggregate call)
router.get('/users-by-interests', getUsersByInterests);

// Scenario 2: Retrieve user's posts via $lookup
router.get('/user-posts/:userId', getUserPostsLookup);

export default router;
