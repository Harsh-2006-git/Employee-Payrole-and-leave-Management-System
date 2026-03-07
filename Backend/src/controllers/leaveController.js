import LeaveService from '../services/leaveService.js';
import EmployeeService from '../services/employeeService.js';
import AuditLog from '../models/AuditLog.js';

export const applyLeave = async (req, res) => {
    try {
        const employee = await EmployeeService.getEmployeeByUserId(req.user._id);
        if (!employee) return res.status(404).json({ success: false, message: 'Employee profile not found' });

        const leave = await LeaveService.applyLeave(employee._id, req.body);

        await AuditLog.create({
            user: req.user._id,
            action: 'APPLY_LEAVE',
            module: 'LEAVE',
            details: { leaveId: leave._id },
            ipAddress: req.ip
        });

        res.status(201).json({ success: true, data: leave });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getMyLeaves = async (req, res) => {
    try {
        const employee = await EmployeeService.getEmployeeByUserId(req.user._id);
        const leaves = await LeaveService.getEmployeeLeaves(employee._id);
        res.status(200).json({ success: true, data: leaves });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllLeaves = async (req, res) => {
    try {
        const leaves = await LeaveService.getAllLeaves();
        res.status(200).json({ success: true, data: leaves });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const reviewLeave = async (req, res) => {
    try {
        const { status, adminComment } = req.body;
        const leave = await LeaveService.reviewLeave(req.params.id, req.user._id, status, adminComment);

        await AuditLog.create({
            user: req.user._id,
            action: 'REVIEW_LEAVE',
            module: 'LEAVE',
            details: { leaveId: leave._id, status },
            ipAddress: req.ip
        });

        res.status(200).json({ success: true, data: leave });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
export const assignLeave = async (req, res) => {
    try {
        const { employeeId, ...leaveData } = req.body;
        const leave = await LeaveService.assignLeave(req.user._id, employeeId, leaveData);

        await AuditLog.create({
            user: req.user._id,
            action: 'ASSIGN_LEAVE',
            module: 'LEAVE',
            details: { leaveId: leave._id, employeeId },
            ipAddress: req.ip
        });

        res.status(201).json({ success: true, data: leave });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
