import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    date: {
        type: String, // Format YYYY-MM-DD
        required: true
    },
    status: {
        type: String,
        enum: ['PRESENT', 'LATE', 'ABSENT', 'LEAVE'],
        required: true
    },
    checkInTime: {
        type: Date
    },
    qrToken: {
        type: String
    }
}, { timestamps: true });

// Ensure one attendance per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
