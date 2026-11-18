import express from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  deletePost
} from '../controllers/postController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getPosts)
  .post(protect, createPost);

router.route('/:id')
  .get(getPostById)
  .delete(protect, deletePost);

export default router;
