import express from 'express';
import { getConfig, updateConfig } from '../controllers/configController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getConfig);
router.put('/', protect, authorize('ADMIN'), updateConfig);

export default router;
