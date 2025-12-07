// src/controllers/commentController.js
import CommentModel from '../models/commentModel.js';
import { transaction } from '../config/database.js';

class CommentController {
    static async getByClass(req, res) {
        try {
            const { classId } = req.params;
            const comments = await CommentModel.findByClass(classId);

            const result = {};
            comments.forEach(c => {
                result[c.student_id] = c.comment;
            });

            res.json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async getByStudent(req, res) {
        try {
            const { studentId } = req.params;
            const comment = await CommentModel.findByStudent(studentId);
            res.json({ success: true, data: comment || null });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async save(req, res) {
        try {
            const { classId, comments } = req.body;

            if (!classId) {
                return res.status(400).json({ success: false, error: 'Class ID is required' });
            }

            await transaction(async (conn) => {
                await conn.query('DELETE FROM comments WHERE class_id = ?', [classId]);

                if (comments && typeof comments === 'object') {
                    for (const [studentId, comment] of Object.entries(comments)) {
                        if (comment && comment.trim()) {
                            await conn.query(
                                'INSERT INTO comments (class_id, student_id, comment) VALUES (?, ?, ?)',
                                [classId, studentId, comment.trim()]
                            );
                        }
                    }
                }
            });

            res.json({ success: true, message: 'Comments saved successfully' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { classId, studentId } = req.params;
            const { comment } = req.body;

            if (!comment || !comment.trim()) {
                await CommentModel.delete(classId, studentId);
                return res.json({ success: true, message: 'Comment deleted' });
            }

            await CommentModel.upsert(classId, studentId, comment.trim());
            res.json({ success: true, message: 'Comment updated successfully' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { classId, studentId } = req.params;
            const deleted = await CommentModel.delete(classId, studentId);

            if (!deleted) {
                return res.status(404).json({ success: false, error: 'Comment not found' });
            }

            res.json({ success: true, message: 'Comment deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export default CommentController;