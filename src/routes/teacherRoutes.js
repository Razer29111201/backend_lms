// src/routes/teacherRoutes.js
import express from 'express';
import TeacherController from '../controllers/teacherController.js';

const router = express.Router();

router.get('/', TeacherController.getAll);
router.get('/:id', TeacherController.getOne);
router.post('/', TeacherController.create);
router.put('/:id', TeacherController.update);
router.delete('/:id', TeacherController.delete);

export default router;