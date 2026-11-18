import express from 'express';
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote
} from '../controllers/noteController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All note routes require authentication
router.use(protect);

router.route('/')
  .get(getNotes)
  .post(createNote);

router.route('/:id')
  .get(getNoteById)
  .put(updateNote)
  .delete(deleteNote);

export default router;
