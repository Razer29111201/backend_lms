// src/models/sessionModel.js
import { query } from '../config/database.js';

class SessionModel {
    static async findByClassId(classId) {
        const sql = `
      SELECT * FROM sessions 
      WHERE class_id = ? 
      ORDER BY session_number ASC
    `;
        return await query(sql, [classId]);
    }

    static async findOne(classId, sessionNumber) {
        const sql = `
      SELECT * FROM sessions 
      WHERE class_id = ? AND session_number = ?
    `;
        const results = await query(sql, [classId, sessionNumber]);
        return results[0];
    }

    static async create(sessionData) {
        const sql = `
      INSERT INTO sessions (class_id, session_number, date, status, note)
      VALUES (?, ?, ?, ?, ?)
    `;
        const params = [
            sessionData.classId, sessionData.number, sessionData.date,
            sessionData.status || 'scheduled', sessionData.note || ''
        ];
        const result = await query(sql, params);
        return result.insertId;
    }

    static async update(classId, sessionNumber, data) {
        const sql = `
      UPDATE sessions 
      SET date = ?, status = ?, note = ?
      WHERE class_id = ? AND session_number = ?
    `;
        const params = [
            data.date, data.status, data.note || '', classId, sessionNumber
        ];
        const result = await query(sql, params);
        return result.affectedRows > 0;
    }

    static async deleteByClassId(classId) {
        const sql = 'DELETE FROM sessions WHERE class_id = ?';
        const result = await query(sql, [classId]);
        return result.affectedRows;
    }

    static async countByStatus(classId) {
        const sql = `
      SELECT status, COUNT(*) as count 
      FROM sessions 
      WHERE class_id = ? 
      GROUP BY status
    `;
        return await query(sql, [classId]);
    }
}

export default SessionModel;