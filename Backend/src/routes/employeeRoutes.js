import express from 'express';
import {
    getEmployees,
    getEmployee,
    updateEmployee,
    deactivateEmployee,
    getEmployeeProfile,
    addEmployee
} from '../controllers/employeeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes protected

// Shared/Employee routes
router.get('/me', getEmployeeProfile);

// Admin only routes
router.get('/all', authorize('ADMIN'), getEmployees);
router.post('/', authorize('ADMIN'), addEmployee);
router.get('/:id', authorize('ADMIN'), getEmployee);
router.put('/:id', authorize('ADMIN'), updateEmployee);
router.delete('/:id', authorize('ADMIN'), deactivateEmployee);

export default router;
