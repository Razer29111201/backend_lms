// src/routes/commentRoutes.js
import express from 'express';
import CommentController from '../controllers/commentController.js';

const router = express.Router();

router.get('/class/:classId', CommentController.getByClass);
router.get('/student/:studentId', CommentController.getByStudent);
router.post('/', CommentController.save);
router.put('/:classId/:studentId', CommentController.update);
router.delete('/:classId/:studentId', CommentController.delete);

export default router;