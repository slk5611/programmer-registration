import express from 'express';
import Programmer from '../models/Programmer.js';

const router = express.Router();

// Get all programmers with optional date filtering
router.get('/', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let filter = {};

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                const s = new Date(startDate);
                s.setHours(0, 0, 0, 0);
                filter.createdAt.$gte = s;
            }
            if (endDate) {
                const e = new Date(endDate);
                e.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = e;
            }
        }

        const programmers = await Programmer.find(filter).sort({ createdAt: -1 });
        res.json(programmers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new programmer registration
router.post('/', async (req, res) => {
    try {
        const newProgrammer = new Programmer(req.body);
        const savedProgrammer = await newProgrammer.save();
        res.status(201).json(savedProgrammer);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'A programmer with this email, mobile, or Emp ID already exists.' });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

// Check for duplicates before navigating
router.get('/check-duplicate', async (req, res) => {
    try {
        const { email, mobile, empId } = req.query;
        let duplicate = null;

        if (email) {
            duplicate = await Programmer.findOne({ email: email.trim().toLowerCase() });
            if (duplicate) return res.json({ field: 'email', exists: true, value: email });
        }
        if (mobile) {
            duplicate = await Programmer.findOne({ mobile: mobile.trim() });
            if (duplicate) return res.json({ field: 'mobile', exists: true, value: mobile });
        }
        if (empId) {
            duplicate = await Programmer.findOne({ empId: empId.trim() });
            if (duplicate) return res.json({ field: 'Company Emp ID', exists: true, value: empId });
        }

        res.json({ exists: false });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a single programmer
router.delete('/:id', async (req, res) => {
    try {
        await Programmer.findByIdAndDelete(req.params.id);
        res.json({ message: 'Programmer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Bulk delete programmers
router.post('/bulk-delete', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ message: 'Invalid IDs provided' });
        }
        await Programmer.deleteMany({ _id: { $in: ids } });
        res.json({ message: 'Programmers deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
