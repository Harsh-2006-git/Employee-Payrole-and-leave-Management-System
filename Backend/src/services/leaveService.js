import LeaveRequest from '../models/LeaveRequest.js';
import EmployeeService from './employeeService.js';

class LeaveService {
    async applyLeave(employeeId, leaveData) {
        const { startDate, endDate, leaveType } = leaveData;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        // Check balance - skip for special types
        const skipBalanceCheck = ['UNPAID', 'MATERNITY', 'BEREAVEMENT'].includes(leaveType);
        if (!skipBalanceCheck) {
            const employee = await EmployeeService.getEmployeeById(employeeId);
            if (employee.leaveBalance[leaveType.toLowerCase()] < totalDays) {
                throw new Error(`Insufficient ${leaveType} leave balance. Available: ${employee.leaveBalance[leaveType.toLowerCase()]}`);
            }
        }

        return await LeaveRequest.create({
            employee: employeeId,
            ...leaveData,
            totalDays
        });
    }

    async assignLeave(adminId, employeeId, leaveData) {
        const { startDate, endDate, leaveType } = leaveData;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        const leave = await LeaveRequest.create({
            employee: employeeId,
            ...leaveData,
            totalDays,
            status: 'APPROVED',
            reviewedBy: adminId,
            reviewedAt: new Date(),
            adminComment: 'Assigned by Administrator'
        });

        // Deduct from balance if not special type
        const skipBalanceCheck = ['UNPAID', 'MATERNITY', 'BEREAVEMENT'].includes(leaveType);
        if (!skipBalanceCheck) {
            await EmployeeService.updateLeaveBalance(employeeId, leaveType, totalDays);
        }

        return leave;
    }

    async getEmployeeLeaves(employeeId) {
        return await LeaveRequest.find({ employee: employeeId }).sort('-createdAt');
    }

    async getAllLeaves() {
        return await LeaveRequest.find().populate({
            path: 'employee',
            populate: { path: 'user', select: 'displayName email' }
        }).sort('-appliedAt');
    }

    async reviewLeave(leaveId, adminId, status, adminComment) {
        const leave = await LeaveRequest.findById(leaveId);
        if (!leave) throw new Error('Leave request not found');
        if (leave.status !== 'PENDING' && status !== 'HOLD') throw new Error('Leave already reviewed');

        leave.status = status;
        leave.adminComment = adminComment;
        leave.reviewedBy = adminId;
        leave.reviewedAt = new Date();

        if (status === 'APPROVED') {
            // Deduct from balance - skip for UNPAID/MATERNITY/BEREAVEMENT
            const skipBalanceCheck = ['UNPAID', 'MATERNITY', 'BEREAVEMENT'].includes(leave.leaveType);
            if (!skipBalanceCheck) {
                await EmployeeService.updateLeaveBalance(leave.employee, leave.leaveType, leave.totalDays);
            }
        }

        return await leave.save();
    }
}

export default new LeaveService();
