// src/models/attendanceModel.js
import { query } from '../config/database.js';

class AttendanceModel {
  static async findByClassAndDate(classId, sessionDate) {
    const sql = `
      SELECT a.*, s.name as student_name
      FROM attendance a
      LEFT JOIN students s ON a.student_id = s.id
      WHERE a.class_id = ? AND a.session_date = ?
      ORDER BY s.name ASC
    `;
    return await query(sql, [classId, sessionDate]);
  }

  static async findByStudent(studentId) {
    const sql = `
      SELECT * FROM attendance 
      WHERE student_id = ? 
      ORDER BY session_date DESC
    `;
    return await query(sql, [studentId]);
  }

  static async findByClass(classId) {
    const sql = `
      SELECT * FROM attendance 
      WHERE class_id = ? 
      ORDER BY session_date DESC, student_id ASC
    `;
    return await query(sql, [classId]);
  }

  static async create(data) {
    const sql = `
      INSERT INTO attendance (class_id, session_date, student_id, status, note)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      data.classId, data.sessionDate, data.studentId,
      data.status, data.note || ''
    ];
    const result = await query(sql, params);
    return result.insertId;
  }

  static async deleteByClassAndDate(classId, sessionDate) {
    const sql = 'DELETE FROM attendance WHERE class_id = ? AND session_date = ?';
    const result = await query(sql, [classId, sessionDate]);
    return result.affectedRows;
  }

  static async getStatsByClass(classId) {
    const sql = `
      SELECT status, COUNT(*) as count
      FROM attendance WHERE class_id = ?
      GROUP BY status
    `;
    return await query(sql, [classId]);
  }

  static async getStatsByStudent(studentId) {
    const sql = `
      SELECT status, COUNT(*) as count
      FROM attendance WHERE student_id = ?
      GROUP BY status
    `;
    return await query(sql, [studentId]);
  }
}

export default AttendanceModel;