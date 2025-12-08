// src/controllers/cmController.js
import { query } from '../config/database.js';

class CMController {
    static async getAll(req, res) {
        try {
            const sql = 'SELECT * FROM cms ORDER BY name ASC';
            const cms = await query(sql);

            // Đếm số lớp cho mỗi CM
            const classCountSql = `
                SELECT cm_id, COUNT(*) as count 
                FROM classes 
                WHERE cm_id IS NOT NULL 
                GROUP BY cm_id
            `;
            const classCountsResults = await query(classCountSql);
            const classCounts = {};
            classCountsResults.forEach(r => {
                classCounts[r.cm_id] = r.count;
            });

            const data = cms.map(cm => ({
                id: cm.id,
                code: cm.code,
                name: cm.name,
                email: cm.email,
                phone: cm.phone,
                active: cm.active === 1 || cm.active === true,
                classCount: classCounts[cm.id] || 0,
                createdAt: cm.created_at
            }));

            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async getOne(req, res) {
        try {
            const { id } = req.params;
            const sql = 'SELECT * FROM cms WHERE id = ?';
            const results = await query(sql, [id]);

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'CM not found'
                });
            }

            const cm = results[0];
            res.json({
                success: true,
                data: {
                    id: cm.id,
                    code: cm.code,
                    name: cm.name,
                    email: cm.email,
                    phone: cm.phone,
                    active: cm.active === 1 || cm.active === true,
                    createdAt: cm.created_at
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const { code, name, email, phone, active } = req.body;

            if (!name) {
                return res.status(400).json({
                    success: false,
                    error: 'Name is required'
                });
            }

            const sql = `
                INSERT INTO cms (code, name, email, phone, active)
                VALUES (?, ?, ?, ?, ?)
            `;
            const result = await query(sql, [
                code || '',
                name,
                email || '',
                phone || '',
                active !== false ? 1 : 0
            ]);

            res.status(201).json({
                success: true,
                data: {
                    id: result.insertId,
                    code, name, email, phone,
                    active: active !== false,
                    classCount: 0
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { code, name, email, phone, active } = req.body;

            // Check exists
            const existing = await query('SELECT id FROM cms WHERE id = ?', [id]);
            if (existing.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'CM not found'
                });
            }

            const sql = `
                UPDATE cms 
                SET code = ?, name = ?, email = ?, phone = ?, active = ?
                WHERE id = ?
            `;
            await query(sql, [
                code || '',
                name,
                email || '',
                phone || '',
                active !== false ? 1 : 0,
                id
            ]);

            res.json({
                success: true,
                data: { id: parseInt(id), code, name, email, phone, active }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;

            // Check if CM manages any classes
            const classes = await query('SELECT id FROM classes WHERE cm_id = ?', [id]);
            if (classes.length > 0) {
                // Remove CM from classes
                await query('UPDATE classes SET cm = NULL, cm_id = NULL WHERE cm_id = ?', [id]);
            }

            const result = await query('DELETE FROM cms WHERE id = ?', [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'CM not found'
                });
            }

            res.json({ success: true, message: 'CM deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async getActive(req, res) {
        try {
            const sql = 'SELECT * FROM cms WHERE active = 1 ORDER BY name ASC';
            const cms = await query(sql);

            const data = cms.map(cm => ({
                id: cm.id,
                code: cm.code,
                name: cm.name,
                email: cm.email,
                phone: cm.phone
            }));

            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async search(req, res) {
        try {
            const { q } = req.query;
            if (!q) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query required'
                });
            }

            const sql = `
                SELECT * FROM cms 
                WHERE code LIKE ? OR name LIKE ? OR email LIKE ? OR phone LIKE ?
                ORDER BY name ASC
            `;
            const searchTerm = `%${q}%`;
            const cms = await query(sql, [searchTerm, searchTerm, searchTerm, searchTerm]);

            const data = cms.map(cm => ({
                id: cm.id,
                code: cm.code,
                name: cm.name,
                email: cm.email,
                phone: cm.phone,
                active: cm.active === 1
            }));

            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async getDetails(req, res) {
        try {
            const { id } = req.params;

            // Get CM info
            const cmResults = await query('SELECT * FROM cms WHERE id = ?', [id]);
            if (cmResults.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'CM not found'
                });
            }

            const cm = cmResults[0];

            // Get classes managed by CM
            const classes = await query('SELECT * FROM classes WHERE cm_id = ?', [id]);

            res.json({
                success: true,
                data: {
                    id: cm.id,
                    code: cm.code,
                    name: cm.name,
                    email: cm.email,
                    phone: cm.phone,
                    active: cm.active === 1,
                    classes: classes
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async getStatistics(req, res) {
        try {
            const { id } = req.params;

            // Get CM
            const cmResults = await query('SELECT * FROM cms WHERE id = ?', [id]);
            if (cmResults.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'CM not found'
                });
            }

            // Get classes
            const classes = await query('SELECT * FROM classes WHERE cm_id = ?', [id]);

            let totalStudents = 0;
            let totalSessions = 0;

            for (const cls of classes) {
                // Count students
                const studentCount = await query(
                    'SELECT COUNT(*) as count FROM students WHERE class_id = ?',
                    [cls.id]
                );
                totalStudents += studentCount[0].count;

                // Count sessions
                const sessionCount = await query(
                    'SELECT COUNT(*) as count FROM sessions WHERE class_id = ?',
                    [cls.id]
                );
                totalSessions += sessionCount[0].count;
            }

            res.json({
                success: true,
                data: {
                    classCount: classes.length,
                    studentCount: totalStudents,
                    sessionCount: totalSessions,
                    classes: classes.map(c => ({
                        id: c.id,
                        code: c.code,
                        name: c.name
                    }))
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export default CMController;