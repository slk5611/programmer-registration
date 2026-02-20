import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Simple admin login (No database user table needed as per original requirement for single static admin)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || 'shivadmin@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Shiv@admin'

    if (email === adminEmail && password === adminPassword) {
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token, email });
    }

    res.status(401).json({ message: 'Invalid credentials' });
});

export default router;
