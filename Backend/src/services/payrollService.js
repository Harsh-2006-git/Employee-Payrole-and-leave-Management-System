import Payroll from '../models/Payroll.js';
import EmployeeService from './employeeService.js';
import LeaveRequest from '../models/LeaveRequest.js';
import PaySlipService from './paySlipService.js';
import EmailService from './emailService.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class PayrollService {
    async calculateMonthlyPayroll(employeeId, month, year) {
        const employee = await EmployeeService.getEmployeeById(employeeId);
        if (!employee) throw new Error('Employee not found');

        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0);

        // Calculate unpaid leaves that overlap with this month
        const allUnpaidLeaves = await LeaveRequest.find({
            employee: employeeId,
            leaveType: 'UNPAID',
            status: 'APPROVED',
            $or: [
                { startDate: { $gte: startOfMonth, $lte: endOfMonth } },
                { endDate: { $gte: startOfMonth, $lte: endOfMonth } },
                { $and: [{ startDate: { $lte: startOfMonth } }, { endDate: { $gte: endOfMonth } }] }
            ]
        });

        let unpaidLeaveDaysInMonth = 0;
        allUnpaidLeaves.forEach(leave => {
            const overlapStart = leave.startDate < startOfMonth ? startOfMonth : leave.startDate;
            const overlapEnd = leave.endDate > endOfMonth ? endOfMonth : leave.endDate;
            const diffTime = Math.abs(overlapEnd - overlapStart);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            unpaidLeaveDaysInMonth += diffDays;
        });

        // Calculate paid leaves overlapping with this month for reporting
        const allPaidLeaves = await LeaveRequest.find({
            employee: employeeId,
            leaveType: { $in: ['CASUAL', 'SICK', 'PAID'] },
            status: 'APPROVED',
            $or: [
                { startDate: { $gte: startOfMonth, $lte: endOfMonth } },
                { endDate: { $gte: startOfMonth, $lte: endOfMonth } },
                { $and: [{ startDate: { $lte: startOfMonth } }, { endDate: { $gte: endOfMonth } }] }
            ]
        });

        let paidLeaveDaysInMonth = 0;
        allPaidLeaves.forEach(leave => {
            const overlapStart = leave.startDate < startOfMonth ? startOfMonth : leave.startDate;
            const overlapEnd = leave.endDate > endOfMonth ? endOfMonth : leave.endDate;
            const diffTime = Math.abs(overlapEnd - overlapStart);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            paidLeaveDaysInMonth += diffDays;
        });

        const Attendance = (await import('../models/Attendance.js')).default;

        // Fetch attendance stats for this month
        const attendanceRecords = await Attendance.find({
            employee: employeeId,
            date: {
                $gte: startOfMonth.toISOString().split('T')[0],
                $lte: endOfMonth.toISOString().split('T')[0]
            }
        });

        let absentCount = 0;
        let lateCount = 0;
        let presentCount = 0;

        attendanceRecords.forEach(record => {
            if (record.status === 'ABSENT') absentCount++;
            else if (record.status === 'LATE') lateCount++;
            else if (record.status === 'PRESENT') presentCount++;
        });

        // Business rule: 3 lates = 1 absent
        const additionalAbsentsFromLates = Math.floor(lateCount / 3);
        absentCount += additionalAbsentsFromLates;

        // Total unpaid days = explicit ABSENT days (from cron or manual) + overlapping UNPAID leave days
        // Note: cron marks UNPAID leave days as 'LEAVE', so they are NOT counted in absentCount.
        const totalUnpaidDays = unpaidLeaveDaysInMonth + absentCount;
        const totalPaidDays = paidLeaveDaysInMonth;

        // Dynamically compute working days based on the month
        const totalDaysInMonth = Math.round((endOfMonth - startOfMonth) / (1000 * 60 * 60 * 24)) + 1;
        const dailyRate = employee.salaryStructure.basic / totalDaysInMonth;

        const unpaidDeduction = totalUnpaidDays * dailyRate;

        const salaryComponents = {
            basic: employee.salaryStructure.basic,
            hra: employee.salaryStructure.hra,
            allowances: employee.salaryStructure.allowances,
            deductions: {
                pf: employee.salaryStructure.deductions.pf || 0,
                tax: employee.salaryStructure.deductions.tax || 0,
                unpaidLeaves: Math.round(unpaidDeduction),
                totalPaidLeaves: totalPaidDays,
                absentDays: absentCount,
                presentDays: presentCount,
                lateDays: lateCount
            }
        };

        const grossSalary = salaryComponents.basic + salaryComponents.hra + salaryComponents.allowances;
        const totalDeductions = salaryComponents.deductions.pf + salaryComponents.deductions.tax + salaryComponents.deductions.unpaidLeaves;
        const netSalary = grossSalary - totalDeductions;

        let payroll = await Payroll.findOne({ employee: employeeId, month, year });
        if (payroll) {
            payroll.salaryComponents = salaryComponents;
            payroll.grossSalary = grossSalary;
            payroll.netSalary = netSalary;
            await payroll.save();
        } else {
            payroll = await Payroll.create({
                employee: employeeId,
                month,
                year,
                salaryComponents,
                grossSalary,
                netSalary,
            });
        }

        // Generate PDF
        const fileName = await PaySlipService.generatePayslip(payroll, employee);
        payroll.payslipUrl = `/payslips/${fileName}`;
        await payroll.save();

        return payroll;
    }

    async markAsPaid(payrollId) {
        const payroll = await Payroll.findById(payrollId).populate({
            path: 'employee',
            populate: { path: 'user' }
        });
        if (!payroll) throw new Error('Payroll record not found');

        payroll.status = 'PAID';
        payroll.paidAt = new Date();
        await payroll.save();

        // Send Email
        const pdfPath = path.join(__dirname, '../../public', payroll.payslipUrl);
        await EmailService.sendPayslipEmail(
            payroll.employee.user.email,
            `${payroll.employee.firstName} ${payroll.employee.lastName}`,
            payroll.month,
            payroll.year,
            pdfPath
        );

        return payroll;
    }

    async resendPayslipEmail(payrollId) {
        const payroll = await Payroll.findById(payrollId).populate({
            path: 'employee',
            populate: { path: 'user' }
        });
        if (!payroll) throw new Error('Payroll record not found');
        if (!payroll.payslipUrl) throw new Error('Payslip document not found for this record');

        const pdfPath = path.join(__dirname, '../../public', payroll.payslipUrl);
        await EmailService.sendPayslipEmail(
            payroll.employee.user.email,
            `${payroll.employee.firstName} ${payroll.employee.lastName}`,
            payroll.month,
            payroll.year,
            pdfPath
        );

        return { success: true, message: 'Email resent successfully' };
    }

    async revokePayroll(payrollId) {
        const payroll = await Payroll.findById(payrollId);
        if (!payroll) throw new Error('Payroll record not found');

        // Delete the physical PDF file if it exists
        if (payroll.payslipUrl) {
            try {
                const pdfPath = path.join(__dirname, '../../public', payroll.payslipUrl);
                if (fs.existsSync(pdfPath)) {
                    fs.unlinkSync(pdfPath);
                }
            } catch (err) {
                console.error('Error deleting payslip file:', err);
            }
        }

        payroll.status = 'REVOKED';
        payroll.payslipUrl = null;
        await payroll.save();

        return payroll;
    }

    async getPayrollHistory(employeeId) {
        return await Payroll.find({ employee: employeeId }).sort('-year -month');
    }

    async getAllPayroll(month, year) {
        const query = {};
        if (month) query.month = month;
        if (year) query.year = year;
        return await Payroll.find(query).populate({
            path: 'employee',
            populate: { path: 'user', select: 'displayName email' }
        });
    }

    async getPayrollStats() {
        return await Payroll.aggregate([
            {
                $group: {
                    _id: { month: "$month", year: "$year" },
                    totalAmount: { $sum: "$netSalary" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } },
            { $limit: 12 }
        ]);
    }
    async updatePayrollStatus(payrollId, status) {
        const payroll = await Payroll.findById(payrollId);
        if (!payroll) throw new Error('Payroll record not found');

        if (!['GENERATED', 'PAID', 'REVOKED'].includes(status)) {
            throw new Error('Invalid status provided');
        }

        payroll.status = status;
        if (status === 'PAID' && !payroll.paidAt) {
            payroll.paidAt = new Date();
        }
        await payroll.save();
        return payroll;
    }
}

export default new PayrollService();
