// src/routes/classRoutes.js
import express from 'express';
import ClassController from '../controllers/classController.js';

const router = express.Router();

router.get('/', ClassController.getAll);
router.get('/:id', ClassController.getOne);
router.post('/', ClassController.create);
router.put('/:id', ClassController.update);
router.delete('/:id', ClassController.delete);

export default router;