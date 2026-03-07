import PayrollService from '../services/payrollService.js';
import EmployeeService from '../services/employeeService.js';
import AuditLog from '../models/AuditLog.js';

export const calculatePayroll = async (req, res) => {
    try {
        const { employeeId, month, year } = req.body;
        const payroll = await PayrollService.calculateMonthlyPayroll(employeeId, month, year);

        await AuditLog.create({
            user: req.user._id,
            action: 'CALCULATE_PAYROLL',
            module: 'PAYROLL',
            details: { employeeId, month, year },
            ipAddress: req.ip
        });

        res.status(200).json({ success: true, data: payroll });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const markAsPaid = async (req, res) => {
    try {
        const payroll = await PayrollService.markAsPaid(req.params.id);

        await AuditLog.create({
            user: req.user._id,
            action: 'MARK_PAID',
            module: 'PAYROLL',
            details: { payrollId: req.params.id },
            ipAddress: req.ip
        });

        res.status(200).json({ success: true, data: payroll });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const revokePayroll = async (req, res) => {
    try {
        const payroll = await PayrollService.revokePayroll(req.params.id);

        await AuditLog.create({
            user: req.user._id,
            action: 'REVOKE_PAYROLL',
            module: 'PAYROLL',
            details: { payrollId: req.params.id },
            ipAddress: req.ip
        });

        res.status(200).json({ success: true, data: payroll });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const resendEmail = async (req, res) => {
    try {
        const result = await PayrollService.resendPayslipEmail(req.params.id);

        await AuditLog.create({
            user: req.user._id,
            action: 'RESEND_PAYSLIP_EMAIL',
            module: 'PAYROLL',
            details: { payrollId: req.params.id },
            ipAddress: req.ip
        });

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getMyPayroll = async (req, res) => {
    try {
        const employee = await EmployeeService.getEmployeeByUserId(req.user._id);
        const history = await PayrollService.getPayrollHistory(employee._id);
        res.status(200).json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllPayroll = async (req, res) => {
    try {
        const { month, year } = req.query;
        const payrolls = await PayrollService.getAllPayroll(month, year);
        res.status(200).json({ success: true, data: payrolls });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getPayrollStats = async (req, res) => {
    try {
        const stats = await PayrollService.getPayrollStats();
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const payroll = await PayrollService.updatePayrollStatus(req.params.id, status);

        await AuditLog.create({
            user: req.user._id,
            action: 'UPDATE_PAYROLL_STATUS',
            module: 'PAYROLL',
            details: { payrollId: req.params.id, status },
            ipAddress: req.ip
        });

        res.status(200).json({ success: true, data: payroll });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
