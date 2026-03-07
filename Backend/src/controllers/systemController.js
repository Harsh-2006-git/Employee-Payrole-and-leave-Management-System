import User from '../models/User.js';
import Employee from '../models/Employee.js';
import LeaveRequest from '../models/LeaveRequest.js';
import Payroll from '../models/Payroll.js';
import mongoose from 'mongoose';

export const seedSampleData = async (req, res) => {
    try {
        // Clear existing data (optional, but good for "seed")
        // await User.deleteMany({ role: 'EMPLOYEE' });
        // await Employee.deleteMany({});
        // await LeaveRequest.deleteMany({});
        // await Payroll.deleteMany({});

        const admin = req.user;

        // Sample Employees
        const sampleEmployees = [
            {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                designation: 'Senior Developer',
                department: 'Engineering',
                salary: 5000
            },
            {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@example.com',
                designation: 'Product Manager',
                department: 'Product',
                salary: 6000
            },
            {
                firstName: 'Mike',
                lastName: 'Johnson',
                email: 'mike.j@example.com',
                designation: 'UI Designer',
                department: 'Design',
                salary: 4500
            }
        ];

        for (const data of sampleEmployees) {
            let user = await User.findOne({ email: data.email });
            if (!user) {
                user = await User.create({
                    googleId: `sample-${Math.random().toString(36).substr(2, 9)}`,
                    email: data.email,
                    displayName: `${data.firstName} ${data.lastName}`,
                    picture: `https://ui-avatars.com/api/?name=${data.firstName}+${data.lastName}&background=random`,
                    role: 'EMPLOYEE'
                });
            }

            let employee = await Employee.findOne({ user: user._id });
            if (!employee) {
                employee = await Employee.create({
                    user: user._id,
                    employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    department: data.department,
                    designation: data.designation,
                    dateOfJoining: new Date(2023, 0, 15),
                    salaryStructure: {
                        basic: data.salary * 0.5,
                        hra: data.salary * 0.3,
                        allowances: data.salary * 0.2,
                        deductions: {
                            pf: data.salary * 0.1,
                            tax: data.salary * 0.05
                        }
                    }
                });
            }

            // Add sample leave
            await LeaveRequest.create({
                employee: employee._id,
                leaveType: 'CASUAL',
                startDate: new Date(2024, 0, 10),
                endDate: new Date(2024, 0, 12),
                reason: 'Family event',
                status: 'APPROVED',
                totalDays: 3,
                reviewedBy: admin._id,
                reviewedAt: new Date()
            });

            // Add sample payroll history for past 3 months
            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();

            for (let m = 1; m <= 3; m++) {
                let pMonth = currentMonth - m;
                let pYear = currentYear;
                if (pMonth <= 0) {
                    pMonth += 12;
                    pYear -= 1;
                }

                // Import dynamically to avoid circular issues or just use models directly
                const basic = employee.salaryStructure.basic;
                const hra = employee.salaryStructure.hra;
                const allowances = employee.salaryStructure.allowances;
                const pf = employee.salaryStructure.deductions.pf;
                const tax = employee.salaryStructure.deductions.tax;

                const netSalary = (basic + hra + allowances) - (pf + tax);

                await Payroll.findOneAndUpdate(
                    { employee: employee._id, month: pMonth, year: pYear },
                    {
                        salaryComponents: {
                            basic, hra, allowances,
                            deductions: { pf, tax, unpaidLeaves: 0 }
                        },
                        grossSalary: (basic + hra + allowances),
                        netSalary,
                        status: 'PAID',
                        paidAt: new Date(pYear, pMonth - 1, 28),
                        payslipUrl: '/payslips/sample.pdf'
                    },
                    { upsert: true }
                );
            }
        }

        res.status(200).json({ success: true, message: 'Sample data seeded successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const resetData = async (req, res) => {
    try {
        // Clear all collections
        await User.deleteMany({ email: { $ne: 'harshmanmode79@gmail.com' } }); // Keep super admin
        await Employee.deleteMany({});
        await LeaveRequest.deleteMany({});
        await Payroll.deleteMany({});
        // await AuditLog.deleteMany({}); // Optional: keep logs or clear them? User said "remove all data"

        // Re-create admin employee for the super admin user if they exist
        const adminUser = await User.findOne({ email: 'harshmanmode79@gmail.com' });
        if (adminUser) {
            await Employee.findOneAndUpdate(
                { user: adminUser._id },
                {
                    employeeId: 'ADMIN-001',
                    firstName: 'Admin',
                    lastName: '',
                    status: 'ACTIVE'
                },
                { upsert: true }
            );
        }

        res.status(200).json({ success: true, message: 'All data cleared successfully (except super admin).' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
