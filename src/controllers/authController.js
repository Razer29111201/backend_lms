// src/controllers/authController.js
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import bcrypt from 'bcryptjs'; // Cần cài: npm install bcryptjs

class AuthController {
    // authController.js - login()

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            console.log('📧 Login attempt:', { email, password: '***' });

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Email và mật khẩu không được để trống'
                });
            }

            // Query user
            const sql = 'SELECT id, email, name, role, teacher_id, cm_id FROM users WHERE email = ?';
            const users = await query(sql, [email]);

            console.log('👤 Users found:', users.length);

            if (users.length === 0) {
                console.log('❌ User not found');
                return res.status(401).json({
                    success: false,
                    error: 'Email hoặc mật khẩu không đúng'
                });
            }

            const user = users[0];
            console.log('✅ User found:', { id: user.id, email: user.email, role: user.role });

            // Query password
            const passwordSql = 'SELECT password FROM users WHERE id = ?';
            const passwordRows = await query(passwordSql, [user.id]);

            console.log('🔐 Password hash from DB:', passwordRows[0].password.substring(0, 20) + '...');
            console.log('🔐 Password length:', passwordRows[0].password.length);

            // Verify password
            const isValidPassword = await bcrypt.compare(password, passwordRows[0].password);
            console.log('🔑 Password valid:', isValidPassword);
            console.log(isValidPassword);

            if (!isValidPassword) {
                console.log('❌ Password verification failed');
                return res.status(401).json({
                    success: false,
                    error: 'Email hoặc mật khẩu không đúng'
                });
            }

            console.log('✅ Password verified successfully');

            // Create JWT token
            const userData = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: parseInt(user.role),
                teacherId: user.teacher_id,
                cmId: user.cm_id
            };

            const token = jwt.sign(
                { id: user.id, email: user.email, role: parseInt(user.role) },
                process.env.JWT_SECRET || 'fallback-secret-key-for-development',
                { expiresIn: '24h' }
            );

            // ✅ CORRECT RESPONSE FORMAT
            const responseData = {
                success: true,
                data: {
                    token: token,
                    user: userData
                }
            };

            return res.json(responseData);

        } catch (error) {
            console.error('❌ Login error:', error);
            res.status(500).json({
                success: false,
                error: 'Có lỗi xảy ra khi đăng nhập'
            });
        }
    }
    // authController.js - register()
    static async register(req, res) {
        try {
            const { email, password, name, role, linkId } = req.body;

            // Validation...

            // ✅ Hash password với bcrypt
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Insert user với hashed password
            const sql = `
            INSERT INTO users (email, password, name, role, teacher_id, cm_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

            // Convert role string to number
            const roleNum = role === 'admin' ? 0 : role === 'teacher' ? 1 : 2;

            const teacherId = role === 'teacher' && linkId ? parseInt(linkId) : null;
            const cmId = role === 'cm' && linkId ? parseInt(linkId) : null;

            const result = await query(sql, [
                email,
                hashedPassword,  // ✅ Dùng hashed password
                name,
                roleNum,         // ✅ Lưu role dạng số
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
                        role: roleNum,  // ✅ Trả về số
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