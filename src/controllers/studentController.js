// src/controllers/studentController.js
import StudentModel from '../models/studentModel.js';

class StudentController {
    // GET /api/students - Lấy tất cả học sinh (có thể filter theo classId)
    static async getAll(req, res) {
        try {
            const { classId } = req.query;

            let students;
            if (classId) {
                students = await StudentModel.findByClassId(classId);
            } else {
                students = await StudentModel.findAll();
            }

            const data = students.map(s => ({
                id: s.id,
                code: s.code,
                name: s.name,
                email: s.email,
                phone: s.phone,
                classId: s.class_id,
                className: s.class_name,
                createdAt: s.created_at
            }));

            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // GET /api/students/:id - Lấy thông tin 1 học sinh
    static async getOne(req, res) {
        try {
            const { id } = req.params;
            const student = await StudentModel.findById(id);

            if (!student) {
                return res.status(404).json({
                    success: false,
                    error: 'Student not found'
                });
            }

            res.json({
                success: true,
                data: {
                    id: student.id,
                    code: student.code,
                    name: student.name,
                    email: student.email,
                    phone: student.phone,
                    classId: student.class_id,
                    className: student.class_name,
                    createdAt: student.created_at
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // POST /api/students - Tạo học sinh mới
    static async create(req, res) {
        try {
            const { code, name, email, phone, classId, className } = req.body;

            // Validate required fields
            if (!code || !name) {
                return res.status(400).json({
                    success: false,
                    error: 'Code and name are required'
                });
            }

            // Check if code already exists
            const codeExists = await StudentModel.codeExists(code);
            if (codeExists) {
                return res.status(409).json({
                    success: false,
                    error: 'Student code already exists'
                });
            }

            // Create student
            const studentId = await StudentModel.create({
                code,
                name,
                email,
                phone,
                classId,
                className
            });

            res.status(201).json({
                success: true,
                data: {
                    id: studentId,
                    code,
                    name,
                    email,
                    phone,
                    classId,
                    className
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // PUT /api/students/:id - Cập nhật học sinh
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { code, name, email, phone, classId, className } = req.body;

            // Check if student exists
            const student = await StudentModel.findById(id);
            if (!student) {
                return res.status(404).json({
                    success: false,
                    error: 'Student not found'
                });
            }

            // Check if code is taken by another student
            if (code !== student.code) {
                const codeExists = await StudentModel.codeExists(code, id);
                if (codeExists) {
                    return res.status(409).json({
                        success: false,
                        error: 'Student code already exists'
                    });
                }
            }

            // Update student
            await StudentModel.update(id, {
                code,
                name,
                email,
                phone,
                classId,
                className
            });

            res.json({
                success: true,
                data: {
                    id: parseInt(id),
                    code,
                    name,
                    email,
                    phone,
                    classId,
                    className
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // DELETE /api/students/:id - Xóa học sinh
    static async delete(req, res) {
        try {
            const { id } = req.params;

            const deleted = await StudentModel.delete(id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: 'Student not found'
                });
            }

            res.json({
                success: true,
                message: 'Student deleted successfully'
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export default StudentController;