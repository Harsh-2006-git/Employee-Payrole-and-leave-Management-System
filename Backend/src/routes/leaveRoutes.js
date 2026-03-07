import express from 'express';
import { applyLeave, getMyLeaves, getAllLeaves, reviewLeave, assignLeave } from '../controllers/leaveController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Employee routes
router.post('/apply', applyLeave);
router.get('/my-leaves', getMyLeaves);
router.get('/me', getMyLeaves);

// Admin routes
router.get('/all', authorize('ADMIN'), getAllLeaves);
router.put('/review/:id', authorize('ADMIN'), reviewLeave);
router.post('/assign', authorize('ADMIN'), assignLeave);

export default router;
9