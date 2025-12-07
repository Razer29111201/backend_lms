// src/controllers/classController.js
import ClassModel from '../models/classModel.js';
import SessionModel from '../models/sessionModel.js';
import { generateSessionDates } from '../utils/dateGenerator.js';
import { transaction } from '../config/database.js';

class ClassController {
    static async getAll(req, res) {
        try {
            const classes = await ClassModel.findAll();

            const classesWithDetails = await Promise.all(
                classes.map(async (c) => {
                    const studentCount = await ClassModel.countStudents(c.id);
                    const sessions = await SessionModel.findByClassId(c.id);

                    return {
                        id: c.id,
                        code: c.code,
                        name: c.name,
                        teacher: c.teacher,
                        teacherId: c.teacher_id,
                        cm: c.cm,
                        cmId: c.cm_id,
                        students: studentCount,
                        startDate: c.start_date,
                        weekDay: c.week_day,
                        timeSlot: c.time_slot,
                        color: c.color,
                        sessions: sessions,
                        totalSessions: sessions.length,
                        createdAt: c.created_at
                    };
                })
            );

            res.json({ success: true, data: classesWithDetails });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async getOne(req, res) {
        try {
            const { id } = req.params;
            const classData = await ClassModel.findById(id);

            if (!classData) {
                return res.status(404).json({ success: false, error: 'Class not found' });
            }

            const studentCount = await ClassModel.countStudents(id);
            const sessions = await SessionModel.findByClassId(id);

            res.json({
                success: true,
                data: {
                    id: classData.id,
                    code: classData.code,
                    name: classData.name,
                    teacher: classData.teacher,
                    teacherId: classData.teacher_id,
                    cm: classData.cm,
                    cmId: classData.cm_id,
                    students: studentCount,
                    startDate: classData.start_date,
                    weekDay: classData.week_day,
                    timeSlot: classData.time_slot,
                    color: classData.color,
                    sessions: sessions,
                    totalSessions: sessions.length,
                    createdAt: classData.created_at
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const { code, name, teacher, teacherId, cm, cmId, startDate, weekDay, timeSlot, color } = req.body;

            if (!code || !name || !startDate) {
                return res.status(400).json({
                    success: false,
                    error: 'Code, name, and start date are required'
                });
            }

            const codeExists = await ClassModel.codeExists(code);
            if (codeExists) {
                return res.status(409).json({ success: false, error: 'Class code already exists' });
            }

            const result = await transaction(async (conn) => {
                const [classResult] = await conn.query(
                    `INSERT INTO classes (code, name, teacher, teacher_id, cm, cm_id, start_date, week_day, time_slot, color)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [code, name, teacher, teacherId || null, cm, cmId || null, startDate, weekDay || 1, timeSlot, color || 'green']
                );

                const classId = classResult.insertId;
                const sessions = generateSessionDates(startDate, weekDay || 1);

                for (const session of sessions) {
                    await conn.query(
                        'INSERT INTO sessions (class_id, session_number, date, status, note) VALUES (?, ?, ?, ?, ?)',
                        [classId, session.number, session.date, session.status, session.note]
                    );
                }

                return { classId, sessions };
            });

            res.status(201).json({
                success: true,
                data: {
                    id: result.classId,
                    code, name, teacher, teacherId, cm, cmId,
                    startDate, weekDay: weekDay || 1, timeSlot, color: color || 'green',
                    students: 0,
                    sessions: result.sessions,
                    totalSessions: result.sessions.length
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { code, name, teacher, teacherId, cm, cmId, startDate, weekDay, timeSlot, color } = req.body;

            const existingClass = await ClassModel.findById(id);
            if (!existingClass) {
                return res.status(404).json({ success: false, error: 'Class not found' });
            }

            if (code !== existingClass.code) {
                const codeExists = await ClassModel.codeExists(code, id);
                if (codeExists) {
                    return res.status(409).json({ success: false, error: 'Class code already exists' });
                }
            }

            await transaction(async (conn) => {
                await conn.query(
                    `UPDATE classes SET code = ?, name = ?, teacher = ?, teacher_id = ?, cm = ?, cm_id = ?,
           start_date = ?, week_day = ?, time_slot = ?, color = ? WHERE id = ?`,
                    [code, name, teacher, teacherId || null, cm, cmId || null, startDate, weekDay, timeSlot, color, id]
                );

                if (startDate !== existingClass.start_date || weekDay !== existingClass.week_day) {
                    await conn.query('DELETE FROM sessions WHERE class_id = ?', [id]);

                    const sessions = generateSessionDates(startDate, weekDay);
                    for (const session of sessions) {
                        await conn.query(
                            'INSERT INTO sessions (class_id, session_number, date, status, note) VALUES (?, ?, ?, ?, ?)',
                            [id, session.number, session.date, session.status, session.note]
                        );
                    }
                }
            });

            res.json({
                success: true,
                data: { id: parseInt(id), code, name, teacher, teacherId, cm, cmId, startDate, weekDay, timeSlot, color }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await ClassModel.delete(id);

            if (!deleted) {
                return res.status(404).json({ success: false, error: 'Class not found' });
            }

            res.json({ success: true, message: 'Class deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export default ClassController;