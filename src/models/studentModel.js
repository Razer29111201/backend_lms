// src/models/studentModel.js
import { query } from '../config/database.js';

class StudentModel {
    static async findAll() {
        const sql = 'SELECT * FROM students ORDER BY created_at DESC';
        return await query(sql);
    }

    static async findById(id) {
        const sql = 'SELECT * FROM students WHERE id = ?';
        const results = await query(sql, [id]);
        return results[0];
    }

    static async findByClassId(classId) {
        const sql = 'SELECT * FROM students WHERE class_id = ? ORDER BY name ASC';
        return await query(sql, [classId]);
    }

    static async findByCode(code) {
        const sql = 'SELECT * FROM students WHERE code = ?';
        const results = await query(sql, [code]);
        return results[0];
    }

    static async create(data) {
        const sql = `
      INSERT INTO students (code, name, email, phone, class_id, class_name)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
        const params = [
            data.code, data.name, data.email || null, data.phone || null,
            data.classId || null, data.className || null
        ];
        const result = await query(sql, params);
        return result.insertId;
    }

    static async update(id, data) {
        const sql = `
      UPDATE students 
      SET code = ?, name = ?, email = ?, phone = ?, class_id = ?, class_name = ?
      WHERE id = ?
    `;
        const params = [
            data.code, data.name, data.email || null, data.phone || null,
            data.classId || null, data.className || null, id
        ];
        const result = await query(sql, params);
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const sql = 'DELETE FROM students WHERE id = ?';
        const result = await query(sql, [id]);
        return result.affectedRows > 0;
    }

    static async codeExists(code, excludeId = null) {
        let sql = 'SELECT COUNT(*) as count FROM students WHERE code = ?';
        const params = [code];

        if (excludeId) {
            sql += ' AND id != ?';
            params.push(excludeId);
        }

        const results = await query(sql, params);
        return results[0].count > 0;
    }

    static async countInClass(classId) {
        const sql = 'SELECT COUNT(*) as count FROM students WHERE class_id = ?';
        const results = await query(sql, [classId]);
        return results[0].count;
    }
}

export default StudentModel;