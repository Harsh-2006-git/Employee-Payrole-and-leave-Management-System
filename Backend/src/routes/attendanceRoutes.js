import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import * as attendanceController from '../controllers/attendanceController.js';

const router = express.Router();

router.use(protect); // Require authentication

// Admin routes
router.post('/generate-qr', authorize('ADMIN'), attendanceController.generateDailyQR);
router.get('/daily', authorize('ADMIN'), attendanceController.getDailyAttendance);
router.get('/stats', authorize('ADMIN'), attendanceController.getGlobalAttendanceStats);

// Employee routes
router.post('/mark', attendanceController.markAttendance);
router.get('/monthly/:employeeId', attendanceController.getMonthlyAttendance);
router.get('/today-qr', attendanceController.getTodayQR); // Public to all employees

export default router;
