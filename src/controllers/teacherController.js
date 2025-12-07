// src/controllers/teacherController.js
import db from '../config/db.js';

const getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM teachers');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getOne = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM teachers WHERE id = ?', [req.params.id]);
        res.json({ success: true, data: rows[0] || null });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const create = async (req, res) => {
    try {
        const { name = null, email = null } = req.body;
        const [result] = await db.query('INSERT INTO teachers (name, email) VALUES (?, ?)', [name, email]);
        const [rows] = await db.query('SELECT * FROM teachers WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const update = async (req, res) => {
    try {
        const { name, email } = req.body;
        await db.query('UPDATE teachers SET name = ?, email = ? WHERE id = ?', [name, email, req.params.id]);
        const [rows] = await db.query('SELECT * FROM teachers WHERE id = ?', [req.params.id]);
        res.json({ success: true, data: rows[0] || null });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteTeacher = async (req, res) => {
    try {
        await db.query('DELETE FROM teachers WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export default {
    getAll,
    getOne,
    create,
    update,
    delete: deleteTeacher
};