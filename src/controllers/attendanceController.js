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



    static async save(req, res) {
        try {
            const { classId, session, records } = req.body;

            // Validation
            if (!classId) {
                return res.status(400).json({
                    success: false,
                    error: 'Class ID is required'
                });
            }

            if (!session) {
                return res.status(400).json({
                    success: false,
                    error: 'Session number is required'
                });
            }

            if (!Array.isArray(records)) {
                return res.status(400).json({
                    success: false,
                    error: 'Records must be an array'
                });
            }

            console.log('Saving attendance:', { classId, session, recordCount: records.length }); // Debug

            await transaction(async (conn) => {
                // Delete existing attendance
                await conn.query(
                    'DELETE FROM attendance WHERE class_id = ? AND session = ?',
                    [classId, session]
                );

                // Insert new records
                if (records.length > 0) {
                    for (const record of records) {
                        if (!record.studentId) {
                            console.warn('Skipping record without studentId:', record);
                            continue;
                        }

                        await conn.query(
                            'INSERT INTO attendance (class_id, session, student_id, status, note) VALUES (?, ?, ?, ?, ?)',
                            [
                                parseInt(classId),
                                parseInt(session),
                                parseInt(record.studentId),
                                record.status || 'on-time',
                                record.note || ''
                            ]
                        );
                    }
                }
            });

            res.json({
                success: true,
                message: 'Attendance saved successfully',
                data: {
                    classId: parseInt(classId),
                    session: parseInt(session),
                    recordCount: records.length
                }
            });

        } catch (error) {
            console.error('Error saving attendance:', error);
            res.status(500).json({
                success: false,
                error: error.message,
                details: error.stack
            });
        }
    }
    static async getByClass(req, res) {
        try {
            const { classId } = req.params;
            const records = await AttendanceModel.findByClass(classId);

            const formattedRecords = records.map(r => ({
                id: r.id,
                classId: r.class_id,
                session: r.session,
                studentId: r.student_id,
                status: r.status,
                note: r.note || ''
            }));

            res.json({ success: true, data: formattedRecords });
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

    static async delete(req, res) {
        try {
            const { classId, session } = req.params;
            const deleted = await AttendanceModel.deleteByClassAndSession(classId, session);
            res.json({
                success: true,
                message: `Deleted ${deleted} attendance records`
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

}

export default AttendanceController;