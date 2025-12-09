// src/routes/classRoutes.js
import express from 'express';
import ClassController from '../controllers/classController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, ClassController.getAll);
router.post('/', authenticateToken, ClassController.create);
router.get('/:id', ClassController.getOne);
router.put('/:id', ClassController.update);
router.delete('/:id', ClassController.delete);

export default router;