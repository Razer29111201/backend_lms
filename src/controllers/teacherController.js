// src/controllers/teacherController.js
import TeacherModel from '../models/teacherModel.js';

class TeacherController {
    static async getAll(req, res) {
        try {
            const { active } = req.query;

            let teachers;
            if (active === 'true') {
                teachers = await TeacherModel.findActive();
            } else {
                teachers = await TeacherModel.findAll();
            }

            res.json({ success: true, data: teachers });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async getOne(req, res) {
        try {
            const teacher = await TeacherModel.findById(req.params.id);
            if (!teacher) {
                return res.status(404).json({ success: false, error: 'Teacher not found' });
            }
            res.json({ success: true, data: teacher });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async create(req, res) {
        try {
            const { code, name, email, phone, subject, active } = req.body;

            if (!code || !name) {
                return res.status(400).json({ success: false, error: 'Code and name are required' });
            }

            const codeExists = await TeacherModel.codeExists(code);
            if (codeExists) {
                return res.status(409).json({ success: false, error: 'Teacher code already exists' });
            }

            const id = await TeacherModel.create({ code, name, email, phone, subject, active });

            res.status(201).json({ success: true, data: { id, code, name, email, phone, subject, active } });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { code, name, email, phone, subject, active } = req.body;

            const teacher = await TeacherModel.findById(id);
            if (!teacher) {
                return res.status(404).json({ success: false, error: 'Teacher not found' });
            }

            if (code !== teacher.code) {
                const codeExists = await TeacherModel.codeExists(code, id);
                if (codeExists) {
                    return res.status(409).json({ success: false, error: 'Teacher code already exists' });
                }
            }

            await TeacherModel.update(id, { code, name, email, phone, subject, active });

            res.json({ success: true, data: { id: parseInt(id), code, name, email, phone, subject, active } });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const deleted = await TeacherModel.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ success: false, error: 'Teacher not found' });
            }
            res.json({ success: true, message: 'Teacher deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export default TeacherController;