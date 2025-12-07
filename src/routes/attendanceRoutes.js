// src/routes/attendanceRoutes.js
import express from 'express';
import AttendanceController from '../controllers/attendanceController.js';

const router = express.Router();

router.get('/class/:classId', AttendanceController.getByClass);
router.get('/class/:classId/stats', AttendanceController.getStatsByClass);
router.get('/:classId/:sessionDate', AttendanceController.getByClassAndDate);
router.post('/', AttendanceController.save);
router.delete('/:classId/:sessionDate', AttendanceController.delete);

export default router;