// src/controllers/authController.js
import { query } from '../config/database.js';
import bcrypt from 'bcryptjs'; // Cần cài: npm install bcryptjs

class AuthController {
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Email và mật khẩu không được để trống'
                });
            }

            // Tìm user theo email
            const sql = 'SELECT * FROM users WHERE email = ? and password = ?';
            const users = await query(sql, [email, password]);
            console.log(users);


            if (users.length === 0) {
                return res.status(401).json({
                    success: false,
                    error: 'Email không tồn tại'
                });
            }

            const user = users[0];

            // Kiểm tra password (nếu dùng bcrypt)
            // const isMatch = await bcrypt.compare(password, user.password);

            // Tạm thời kiểm tra plaintext (CHỈ DÙNG CHO DEV)
            if (user.password !== password) {
                return res.status(401).json({
                    success: false,
                    error: 'Mật khẩu không đúng'
                });
            }

            // Trả về user data (không bao gồm password)
            const userData = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                teacherId: user.teacher_id,
                cmId: user.cm_id
            };

            res.json({
                success: true,
                data: { user: userData }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                error: 'Có lỗi xảy ra khi đăng nhập'
            });
        }
    }

    static async register(req, res) {
        try {
            const { email, password, name, role, linkId } = req.body;

            // Validation
            if (!email || !password || !name || !role) {
                return res.status(400).json({
                    success: false,
                    error: 'Vui lòng nhập đầy đủ thông tin'
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    error: 'Mật khẩu phải có ít nhất 6 ký tự'
                });
            }

            // Check email exists
            const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
            if (existing.length > 0) {
                return res.status(409).json({
                    success: false,
                    error: 'Email đã được sử dụng'
                });
            }

            // Hash password (nếu dùng bcrypt)
            // const hashedPassword = await bcrypt.hash(password, 10);

            // Insert user
            const sql = `
                INSERT INTO users (email, password, name, role, teacher_id, cm_id)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const teacherId = role === 'teacher' && linkId ? parseInt(linkId) : null;
            const cmId = role === 'cm' && linkId ? parseInt(linkId) : null;

            const result = await query(sql, [
                email,
                password, // Thay bằng hashedPassword khi dùng bcrypt
                name,
                role,
                teacherId,
                cmId
            ]);

            res.status(201).json({
                success: true,
                data: {
                    user: {
                        id: result.insertId,
                        email,
                        name,
                        role,
                        teacherId,
                        cmId
                    }
                }
            });

        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({
                success: false,
                error: 'Có lỗi xảy ra khi đăng ký'
            });
        }
    }

    static async changePassword(req, res) {
        try {
            const { userId, oldPassword, newPassword } = req.body;

            if (!userId || !oldPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'Thiếu thông tin'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    error: 'Mật khẩu mới phải có ít nhất 6 ký tự'
                });
            }

            // Tìm user
            const users = await query('SELECT * FROM users WHERE id = ?', [userId]);
            if (users.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Người dùng không tồn tại'
                });
            }

            const user = users[0];

            // Kiểm tra old password
            if (user.password !== oldPassword) {
                return res.status(401).json({
                    success: false,
                    error: 'Mật khẩu cũ không đúng'
                });
            }

            // Update password
            await query('UPDATE users SET password = ? WHERE id = ?', [newPassword, userId]);

            res.json({
                success: true,
                message: 'Đổi mật khẩu thành công'
            });

        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                error: 'Có lỗi xảy ra'
            });
        }
    }

    static async getCurrentUser(req, res) {
        // TODO: Implement JWT middleware và lấy user từ token
        res.json({
            success: true,
            data: req.user || null
        });
    }
}

export default AuthController;