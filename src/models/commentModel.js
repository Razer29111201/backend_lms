// src/models/commentModel.js
import { query } from '../config/database.js';

class CommentModel {
    static async findByClass(classId) {
        const sql = `
      SELECT c.*, s.name as student_name
      FROM comments c
      LEFT JOIN students s ON c.student_id = s.id
      WHERE c.class_id = ?
      ORDER BY s.name ASC
    `;
        return await query(sql, [classId]);
    }

    static async findByStudent(studentId) {
        const sql = 'SELECT * FROM comments WHERE student_id = ?';
        const results = await query(sql, [studentId]);
        return results[0];
    }

    static async findOne(classId, studentId) {
        const sql = 'SELECT * FROM comments WHERE class_id = ? AND student_id = ?';
        const results = await query(sql, [classId, studentId]);
        return results[0];
    }

    static async upsert(classId, studentId, comment) {
        const sql = `
      INSERT INTO comments (class_id, student_id, comment)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE comment = ?, updated_at = CURRENT_TIMESTAMP
    `;
        const result = await query(sql, [classId, studentId, comment, comment]);
        return result.insertId || result.affectedRows;
    }

    static async delete(classId, studentId) {
        const sql = 'DELETE FROM comments WHERE class_id = ? AND student_id = ?';
        const result = await query(sql, [classId, studentId]);
        return result.affectedRows > 0;
    }

    static async deleteByClass(classId) {
        const sql = 'DELETE FROM comments WHERE class_id = ?';
        const result = await query(sql, [classId]);
        return result.affectedRows;
    }
}

export default CommentModel;