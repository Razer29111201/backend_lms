// src/controllers/attendanceController.js
import AttendanceModel from '../models/attendanceModel.js';
import { transaction } from '../config/database.js';

class AttendanceController {
    static async getByClassAndDate(req, res) {
        try {
            const { classId, sessionDate } = req.params;
            const records = await AttendanceModel.findByClassAndDate(classId, sessionDate);
            res.json({ success: true, data: records });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async getByClass(req, res) {
        try {
            const { classId } = req.params;
            const records = await AttendanceModel.findByClass(classId);
            res.json({ success: true, data: records });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async getStatsByClass(req, res) {
        try {
            const { classId } = req.params;
            const stats = await AttendanceModel.getStatsByClass(classId);
            res.json({ success: true, data: stats });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async save(req, res) {
        try {
            const { classId, sessionDate, records } = req.body;

            if (!classId || !sessionDate) {
                return res.status(400).json({
                    success: false,
                    error: 'Class ID and session date are required'
                });
            }

            await transaction(async (conn) => {
                await conn.query(
                    'DELETE FROM attendance WHERE class_id = ? AND session_date = ?',
                    [classId, sessionDate]
                );

                if (records && records.length > 0) {
                    for (const record of records) {
                        await conn.query(
                            'INSERT INTO attendance (class_id, session_date, student_id, status, note) VALUES (?, ?, ?, ?, ?)',
                            [classId, sessionDate, record.studentId, record.status, record.note || '']
                        );
                    }
                }
            });

            res.json({ success: true, message: 'Attendance saved successfully' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { classId, sessionDate } = req.params;
            const deleted = await AttendanceModel.deleteByClassAndDate(classId, sessionDate);
            res.json({ success: true, message: `Deleted ${deleted} attendance records` });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export default AttendanceController;