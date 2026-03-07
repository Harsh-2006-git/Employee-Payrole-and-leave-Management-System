import EmployeeService from '../services/employeeService.js';
import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';

export const getEmployees = async (req, res) => {
    try {
        const employees = await EmployeeService.getAllEmployees();
        res.status(200).json({ success: true, count: employees.length, data: employees });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const addEmployee = async (req, res) => {
    try {
        const { email, firstName, lastName, ...rest } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                email,
                displayName: `${firstName} ${lastName}`,
                role: 'EMPLOYEE',
                googleId: `EXT-${Date.now()}` // Temporary ID until they sign in with Google
            });
        } else {
            // Check if this user already has an employee record
            const existingEmployee = await Employee.findOne({ user: user._id });
            if (existingEmployee) {
                return res.status(400).json({ success: false, message: 'This user already has an employee profile.' });
            }
        }

        const employee = await EmployeeService.createEmployee({
            user: user._id,
            firstName,
            lastName,
            ...rest
        });

        await AuditLog.create({
            user: req.user._id,
            action: 'CREATE_EMPLOYEE',
            module: 'EMPLOYEE',
            details: { employeeId: employee._id },
            ipAddress: req.ip
        });

        res.status(201).json({ success: true, data: employee });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getEmployee = async (req, res) => {
    try {
        const employee = await EmployeeService.getEmployeeById(req.params.id);
        if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
        res.status(200).json({ success: true, data: employee });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateEmployee = async (req, res) => {
    try {
        const employee = await EmployeeService.updateEmployee(req.params.id, req.body);

        await AuditLog.create({
            user: req.user._id,
            action: 'UPDATE_EMPLOYEE',
            module: 'EMPLOYEE',
            details: { employeeId: req.params.id, updates: req.body },
            ipAddress: req.ip
        });

        res.status(200).json({ success: true, data: employee });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deactivateEmployee = async (req, res) => {
    try {
        await EmployeeService.deactivateEmployee(req.params.id);

        await AuditLog.create({
            user: req.user._id,
            action: 'DEACTIVATE_EMPLOYEE',
            module: 'EMPLOYEE',
            details: { employeeId: req.params.id },
            ipAddress: req.ip
        });

        res.status(200).json({ success: true, message: 'Employee deactivated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getEmployeeProfile = async (req, res) => {
    try {
        const employee = await EmployeeService.getEmployeeByUserId(req.user._id);
        if (!employee) return res.status(404).json({ success: false, message: 'Employee profile not found' });
        res.status(200).json({ success: true, data: employee });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
