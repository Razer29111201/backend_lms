// src/routes/sessionRoutes.js
import express from 'express';
import SessionController from '../controllers/sessionController.js';

const router = express.Router();

router.get('/:classId', SessionController.getByClass);
router.put('/:classId', SessionController.update);

export default router;