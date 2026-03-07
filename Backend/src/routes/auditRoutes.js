import express from 'express';
import AuditLog from '../models/AuditLog.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .populate('user', 'email displayName')
            .sort('-timestamp')
            .limit(100);
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
