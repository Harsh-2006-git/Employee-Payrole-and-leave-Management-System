import express from 'express';
import { calculatePayroll, markAsPaid, revokePayroll, resendEmail, getMyPayroll, getAllPayroll, getPayrollStats, updateStatus } from '../controllers/payrollController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Employee routes
router.get('/my-history', getMyPayroll);
router.get('/me', getMyPayroll);

// Admin routes
router.get('/all', authorize('ADMIN'), getAllPayroll);
router.post('/calculate', authorize('ADMIN'), calculatePayroll);
router.put('/pay/:id', authorize('ADMIN'), markAsPaid);
router.put('/revoke/:id', authorize('ADMIN'), revokePayroll);
router.post('/resend/:id', authorize('ADMIN'), resendEmail);
router.patch('/status/:id', authorize('ADMIN'), updateStatus);
router.get('/stats', authorize('ADMIN'), getPayrollStats);

export default router;
