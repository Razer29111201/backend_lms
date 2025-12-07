// src/routes/studentRoutes.js
import express from 'express';
import StudentController from '../controllers/studentController.js';

const router = express.Router();

router.get('/', StudentController.getAll);
router.get('/:id', StudentController.getOne);
router.post('/', StudentController.create);
router.put('/:id', StudentController.update);
router.delete('/:id', StudentController.delete);

export default router;