// src/routes/index.js
import express from 'express';
import classRoutes from './classRoutes.js';
import studentRoutes from './studentRoutes.js';
import teacherRoutes from './teacherRoutes.js';
import sessionRoutes from './sessionRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import commentRoutes from './commentRoutes.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Class Management API is running',
        version: '1.0.0',
        endpoints: {
            classes: '/api/classes',
            students: '/api/students',
            teachers: '/api/teachers',
            sessions: '/api/sessions',
            attendance: '/api/attendance',
            comments: '/api/comments'
        }
    });
});

router.use('/classes', classRoutes);
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/sessions', sessionRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/comments', commentRoutes);

export default router;