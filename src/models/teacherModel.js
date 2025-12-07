// src/models/teacherModel.js
import { query } from '../config/database.js';

class TeacherModel {
    static async findAll() {
        const sql = 'SELECT * FROM teachers ORDER BY name ASC';
        return await query(sql);
    }

    static async findById(id) {
        const sql = 'SELECT * FROM teachers WHERE id = ?';
        const results = await query(sql, [id]);
        return results[0];
    }

    static async findByCode(code) {
        const sql = 'SELECT * FROM teachers WHERE code = ?';
        const results = await query(sql, [code]);
        return results[0];
    }

    static async findActive() {
        const sql = 'SELECT * FROM teachers WHERE active = true ORDER BY name ASC';
        return await query(sql);
    }

    static async create(data) {
        const sql = `
      INSERT INTO teachers (code, name, email, phone, subject, active)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
        const params = [
            data.code, data.name, data.email || null, data.phone || null,
            data.subject || null, data.active !== false
        ];
        const result = await query(sql, params);
        return result.insertId;
    }

    static async update(id, data) {
        const sql = `
      UPDATE teachers 
      SET code = ?, name = ?, email = ?, phone = ?, subject = ?, active = ?
      WHERE id = ?
    `;
        const params = [
            data.code, data.name, data.email || null, data.phone || null,
            data.subject || null, data.active !== false, id
        ];
        const result = await query(sql, params);
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const sql = 'DELETE FROM teachers WHERE id = ?';
        const result = await query(sql, [id]);
        return result.affectedRows > 0;
    }

    static async codeExists(code, excludeId = null) {
        let sql = 'SELECT COUNT(*) as count FROM teachers WHERE code = ?';
        const params = [code];

        if (excludeId) {
            sql += ' AND id != ?';
            params.push(excludeId);
        }

        const results = await query(sql, params);
        return results[0].count > 0;
    }
}

export default TeacherModel;