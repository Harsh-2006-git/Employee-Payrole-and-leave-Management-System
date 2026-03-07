import express from 'express';
import { seedSampleData, resetData } from '../controllers/systemController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/seed', protect, authorize('ADMIN'), seedSampleData);
router.post('/reset', protect, authorize('ADMIN'), resetData);

export default router;
