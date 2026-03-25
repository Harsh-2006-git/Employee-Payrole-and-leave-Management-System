import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import * as attendanceController from '../controllers/attendanceController.js';

const router = express.Router();

router.use(protect); // Require authentication

// Admin routes
router.post('/generate-qr', authorize('ADMIN'), attendanceController.generateDailyQR);
router.get('/daily', authorize('ADMIN'), attendanceController.getDailyAttendance);
router.get('/all', authorize('ADMIN'), attendanceController.getAllAttendanceRecords);
router.put('/:id', authorize('ADMIN'), attendanceController.updateAttendance);
router.get('/stats', authorize('ADMIN'), attendanceController.getGlobalAttendanceStats);

// Employee routes
router.post('/mark', attendanceController.markAttendance);
router.get('/monthly/:employeeId', attendanceController.getMonthlyAttendance);
router.get('/holidays', attendanceController.getHolidays);
router.get('/today-qr', attendanceController.getTodayQR); // Public to all employees

export default router;
