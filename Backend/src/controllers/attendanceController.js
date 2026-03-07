import crypto from 'crypto';
import qrcode from 'qrcode';
import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import LeaveRequest from '../models/LeaveRequest.js';
import CompanyConfig from '../models/CompanyConfig.js';

// Helper to encrypt/decrypt QR
const ENCRYPTION_KEY = process.env.QR_ENCRYPTION_KEY || '12345678901234567890123456789012'; // Must be 32 chars
const IV_LENGTH = 16;

function encryptText(text) {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptText(text) {
    try {
        let textParts = text.split(':');
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (err) {
        return null;
    }
}

// Generate daily QR (Admin or Auto)
export const generateDailyQR = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        let config = await CompanyConfig.findOne();
        if (!config) config = new CompanyConfig();

        // If QR for today already exists, return it
        if (config.dailyQR && config.dailyQR.date === today && config.dailyQR.token) {
            const qrImage = await qrcode.toDataURL(config.dailyQR.token);
            return res.status(200).json({
                success: true,
                data: {
                    qrToken: config.dailyQR.token,
                    qrImage,
                    date: today
                }
            });
        }

        // Payload valid only for today
        const payload = JSON.stringify({
            date: today,
            timestamp: Date.now(),
            type: 'attendance'
        });

        const encryptedToken = encryptText(payload);
        const qrImage = await qrcode.toDataURL(encryptedToken);

        // Save to config
        config.dailyQR = {
            token: encryptedToken,
            date: today
        };
        await config.save();

        res.status(200).json({
            success: true,
            data: {
                qrToken: encryptedToken,
                qrImage,
                date: today
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to generate QR code' });
    }
};

// Get today's QR for employees
export const getTodayQR = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        let config = await CompanyConfig.findOne();

        // If no QR today, generate one (auto-generation)
        if (!config || !config.dailyQR || config.dailyQR.date !== today) {
            if (!config) config = new CompanyConfig();

            const payload = JSON.stringify({
                date: today,
                timestamp: Date.now(),
                type: 'attendance'
            });

            const encryptedToken = encryptText(payload);
            config.dailyQR = {
                token: encryptedToken,
                date: today
            };
            await config.save();
        }

        const qrImage = await qrcode.toDataURL(config.dailyQR.token);
        res.status(200).json({
            success: true,
            data: {
                qrImage,
                date: today
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mark Attendance (Employee)
export const markAttendance = async (req, res) => {
    try {
        const { qrToken } = req.body;
        console.log('Incoming QR Token:', qrToken);
        if (!qrToken) return res.status(400).json({ success: false, message: 'QR token required' });

        const decrypted = decryptText(qrToken);
        if (!decrypted) {
            console.log('Decryption failed for token:', qrToken);

            // Helpful hint if it looks like a manual ID or Digital ID
            const isPlainID = !qrToken.includes(':') && qrToken.length < 20;

            return res.status(400).json({
                success: false,
                message: isPlainID
                    ? `You scanned your personal Digital ID (${qrToken}). Please scan the Admin's Daily Attendance QR code instead.`
                    : 'Invalid QR code. Please ensure you are scanning the Admin\'s Daily Attendance QR displayed by the management.'
            });
        }

        const payload = JSON.parse(decrypted);
        const todayStr = new Date().toISOString().split('T')[0];

        // Ensure QR is for today
        if (payload.date !== todayStr || payload.type !== 'attendance') {
            return res.status(400).json({ success: false, message: 'Expired or invalid QR code' });
        }

        const employee = await Employee.findOne({ user: req.user._id });
        if (!employee) return res.status(404).json({ success: false, message: 'Employee profile not found' });

        // Check if already marked for today
        const existingAttendance = await Attendance.findOne({ employee: employee._id, date: todayStr });
        if (existingAttendance) {
            return res.status(400).json({ success: false, message: 'Attendance already marked for today' });
        }

        // Time Validation (Server time)
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const timeInMinutes = hours * 60 + minutes;

        // 10:00 AM = 600 minutes
        // 10:30 AM = 630 minutes
        // 12:00 PM = 720 minutes

        const windowStart = 10 * 60; // 600
        const lateThreshold = 10 * 60 + 30; // 630
        const windowEnd = 12 * 60; // 720

        /* Disable time validation temporarily per request
        if (timeInMinutes < windowStart) {
            return res.status(400).json({ success: false, message: 'Attendance window not started yet (Opens at 10:00 AM)' });
        }

        if (timeInMinutes > windowEnd) {
            return res.status(400).json({ success: false, message: 'Attendance window closed (Closed at 12:00 PM)' });
        }
        */

        // Determine status
        let status = 'PRESENT';
        if (timeInMinutes > lateThreshold) {
            status = 'LATE';
        }

        // Check if they have an active leave today
        const activeLeave = await LeaveRequest.findOne({
            employee: employee._id,
            status: 'APPROVED',
            startDate: { $lte: now },
            endDate: { $gte: now }
        });

        if (activeLeave) {
            status = 'LEAVE'; // If they show up on leave day, we might overwrite as leave or throw error. Based on rules: "If leave exists -> mark Leave"
        }

        const attendance = new Attendance({
            employee: employee._id,
            date: todayStr,
            status,
            checkInTime: now,
            qrToken
        });

        await attendance.save();

        res.status(200).json({
            success: true,
            data: attendance,
            message: `Successfully marked attendance as ${status}`
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to mark attendance' });
    }
};

// Monthly Attendance Summary For Employee
export const getMonthlyAttendance = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { month, year } = req.query; // 1-12, YYYY

        const targetMonth = month ? Number(month) : new Date().getMonth() + 1;
        const targetYear = year ? Number(year) : new Date().getFullYear();

        const startDate = new Date(targetYear, targetMonth - 1, 1).toISOString().split('T')[0];
        const endDate = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0];

        // Resolve EMP ID
        let employee;
        if (employeeId === 'me') {
            employee = await Employee.findOne({ user: req.user._id });
        } else {
            employee = await Employee.findOne({ employeeId });
        }

        if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

        const records = await Attendance.find({
            employee: employee._id,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 1 });

        const summary = {
            PRESENT: 0,
            LATE: 0,
            ABSENT: 0,
            LEAVE: 0,
            PAID_LEAVE: 0,
            totalWorkingDays: new Date(targetYear, targetMonth, 0).getDate()
        };

        const attendanceMap = new Map();
        records.forEach(r => {
            summary[r.status]++;
            attendanceMap.set(r.date, r.status);
        });

        // Calculate actual absent days for past dates in the month
        const todayStr = new Date().toISOString().split('T')[0];
        const joiningDateStr = new Date(employee.dateOfJoining).toISOString().split('T')[0];

        let currentDate = new Date(targetYear, targetMonth - 1, 1);
        const lastDate = new Date(targetYear, targetMonth, 0);

        while (currentDate <= lastDate) {
            const dateStr = currentDate.toISOString().split('T')[0];

            // Only count if it's in the past and after joining date
            if (dateStr < todayStr && dateStr >= joiningDateStr) {
                if (!attendanceMap.has(dateStr)) {
                    summary.ABSENT++;
                }
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Count specifically PAID leaves from the records if they were marked as LEAVE
        // But since we want to be precise, better check LeaveRequest for the count
        const paidLeaves = await LeaveRequest.find({
            employee: employee._id,
            leaveType: 'PAID',
            status: 'APPROVED',
            startDate: { $lte: endDate },
            endDate: { $gte: startDate }
        });

        // Calculate how many paid leave days fall in this month
        let paidLeaveDaysThisMonth = 0;
        paidLeaves.forEach(leave => {
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            const monthStart = new Date(targetYear, targetMonth - 1, 1);
            const monthEnd = new Date(targetYear, targetMonth, 0);

            const actualStart = start < monthStart ? monthStart : start;
            const actualEnd = end > monthEnd ? monthEnd : end;

            if (actualStart <= actualEnd) {
                const diffTime = Math.abs(actualEnd - actualStart);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                paidLeaveDaysThisMonth += diffDays;
            }
        });

        summary.PAID_LEAVE = paidLeaveDaysThisMonth;

        res.status(200).json({
            success: true,
            data: {
                records,
                summary
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Daily Attendance List For Admin
export const getDailyAttendance = async (req, res) => {
    try {
        const date = req.query.date || new Date().toISOString().split('T')[0];
        const records = await Attendance.find({ date }).populate('employee', 'firstName lastName employeeId department user');

        res.status(200).json({
            success: true,
            data: records
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Global Attendance Stats for Dashboard
export const getGlobalAttendanceStats = async (req, res) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

        const stats = await Attendance.aggregate([
            {
                $match: {
                    date: { $gte: thirtyDaysAgo.toISOString().split('T')[0] }
                }
            },
            {
                $group: {
                    _id: "$date",
                    present: { $sum: { $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0] } },
                    late: { $sum: { $cond: [{ $eq: ["$status", "LATE"] }, 1, 0] } },
                    absent: { $sum: { $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0] } },
                    leave: { $sum: { $cond: [{ $eq: ["$status", "LEAVE"] }, 1, 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
