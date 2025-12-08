// src/models/attendanceModel.js
import { query } from '../config/database.js';

class AttendanceModel {
  static async findByClassAndSession(classId, sessionNumber) {
    const sql = `
            SELECT a.*, s.name as student_name
            FROM attendance a
            LEFT JOIN students s ON a.student_id = s.id
            WHERE a.class_id = ? AND a.session = ?
            ORDER BY s.name ASC
        `;
    return await query(sql, [classId, sessionNumber]);
  }

  static async findByStudent(studentId) {
    const sql = `
      SELECT * FROM attendance 
      WHERE student_id = ? 
      ORDER BY session_ DESC
    `;
    return await query(sql, [studentId]);
  }

  static async findByClass(classId) {
    const sql = `
            SELECT * FROM attendance 
            WHERE class_id = ? 
            ORDER BY session ASC, student_id ASC
        `;
    return await query(sql, [classId]);
  }

  static async create(data) {
    const sql = `
            INSERT INTO attendance (class_id, session, student_id, status, note)
            VALUES (?, ?, ?, ?, ?)
        `;
    const params = [
      data.classId,
      data.session,  // session NUMBER
      data.studentId,
      data.status,
      data.note || ''
    ];
    const result = await query(sql, params);
    return result.insertId;
  }
  static async deleteByClassAndSession(classId, sessionNumber) {
    const sql = 'DELETE FROM attendance WHERE class_id = ? AND session = ?';
    const result = await query(sql, [classId, sessionNumber]);
    return result.affectedRows;
  }
  static async deleteByClassAndDate(classId, sessionDate) {
    return await this.deleteByClassAndSession(classId, sessionDate);
  }

  static async getStatsByClass(classId) {
    const sql = `
            SELECT status, COUNT(*) as count
            FROM attendance WHERE class_id = ?
            GROUP BY status
        `;
    return await query(sql, [classId]);
  }
  static async findByClassAndDate(classId, sessionDate) {
    return await this.findByClassAndSession(classId, sessionDate);
  }

  static async findByStudent(studentId) {
    const sql = `
            SELECT * FROM attendance 
            WHERE student_id = ? 
            ORDER BY session ASC
        `;
    return await query(sql, [studentId]);
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