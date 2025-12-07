// src/models/classModel.js
import { query } from '../config/database.js';

class ClassModel {
    static async findAll() {
        const sql = 'SELECT * FROM classes ORDER BY created_at DESC';
        return await query(sql);
    }

    static async findById(id) {
        const sql = 'SELECT * FROM classes WHERE id = ?';
        const results = await query(sql, [id]);
        return results[0];
    }

    static async findByCode(code) {
        const sql = 'SELECT * FROM classes WHERE code = ?';
        const results = await query(sql, [code]);
        return results[0];
    }

    static async create(data) {
        const sql = `
      INSERT INTO classes 
      (code, name, teacher, teacher_id, cm, cm_id, start_date, week_day, time_slot, color)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const params = [
            data.code, data.name, data.teacher, data.teacherId || null,
            data.cm, data.cmId || null, data.startDate, data.weekDay || 1,
            data.timeSlot, data.color || 'green'
        ];

        const result = await query(sql, params);
        return result.insertId;
    }

    static async update(id, data) {
        const sql = `
      UPDATE classes 
      SET code = ?, name = ?, teacher = ?, teacher_id = ?, cm = ?, cm_id = ?,
          start_date = ?, week_day = ?, time_slot = ?, color = ?
      WHERE id = ?
    `;

        const params = [
            data.code, data.name, data.teacher, data.teacherId || null,
            data.cm, data.cmId || null, data.startDate, data.weekDay,
            data.timeSlot, data.color, id
        ];

        const result = await query(sql, params);
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const sql = 'DELETE FROM classes WHERE id = ?';
        const result = await query(sql, [id]);
        return result.affectedRows > 0;
    }

    static async countStudents(classId) {
        const sql = 'SELECT COUNT(*) as count FROM students WHERE class_id = ?';
        const results = await query(sql, [classId]);
        return results[0].count;
    }

    static async codeExists(code, excludeId = null) {
        let sql = 'SELECT COUNT(*) as count FROM classes WHERE code = ?';
        const params = [code];

        if (excludeId) {
            sql += ' AND id != ?';
            params.push(excludeId);
        }

        const results = await query(sql, params);
        return results[0].count > 0;
    }
}

export default ClassModel;