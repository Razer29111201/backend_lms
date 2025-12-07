// src/controllers/sessionController.js
import SessionModel from '../models/sessionModel.js';
import { transaction } from '../config/database.js';

class SessionController {
    static async getByClass(req, res) {
        try {
            const { classId } = req.params;
            const sessions = await SessionModel.findByClassId(classId);
            res.json({ success: true, data: sessions });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { classId } = req.params;
            const { sessions } = req.body;

            if (!sessions || !Array.isArray(sessions)) {
                return res.status(400).json({ success: false, error: 'Sessions array is required' });
            }

            await transaction(async (conn) => {
                await conn.query('DELETE FROM sessions WHERE class_id = ?', [classId]);

                for (const session of sessions) {
                    await conn.query(
                        'INSERT INTO sessions (class_id, session_number, date, status, note) VALUES (?, ?, ?, ?, ?)',
                        [classId, session.number, session.date, session.status || 'scheduled', session.note || '']
                    );
                }
            });

            res.json({ success: true, message: 'Sessions updated successfully' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export default SessionController;