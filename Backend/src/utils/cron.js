import cron from 'node-cron';
import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import LeaveRequest from '../models/LeaveRequest.js';

export const initCronJobs = () => {
    // Schedule a job to run every day at 12:05 PM (Server Time)
    cron.schedule('5 12 * * *', async () => {
        try {
            console.log('Running daily auto-absent job...');

            const todayStr = new Date().toISOString().split('T')[0];
            const now = new Date();

            // Find all active employees
            const activeEmployees = await Employee.find({ status: 'ACTIVE' });

            for (let emp of activeEmployees) {
                // Check if attendance exists for today
                const attendanceRecord = await Attendance.findOne({
                    employee: emp._id,
                    date: todayStr
                });

                if (!attendanceRecord) {
                    // Check if employee has an approved leave for current date
                    const activeLeave = await LeaveRequest.findOne({
                        employee: emp._id,
                        status: 'APPROVED',
                        startDate: { $lte: now },
                        endDate: { $gte: now }
                    });

                    // If no attendance and no leave, mark ABSENT
                    if (activeLeave) {
                        await Attendance.create({
                            employee: emp._id,
                            date: todayStr,
                            status: 'LEAVE',
                            checkInTime: null
                        });
                    } else {
                        await Attendance.create({
                            employee: emp._id,
                            date: todayStr,
                            status: 'ABSENT',
                            checkInTime: null
                        });
                    }
                }
            }
            console.log('Daily auto-absent job completed successfully.');
        } catch (error) {
            console.error('Error running daily auto-absent job:', error);
        }
    });
};
