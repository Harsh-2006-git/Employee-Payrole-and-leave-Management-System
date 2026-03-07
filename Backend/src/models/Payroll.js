import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    month: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    salaryComponents: {
        basic: Number,
        hra: Number,
        allowances: Number,
        deductions: {
            pf: Number,
            tax: Number,
            unpaidLeaves: Number,
            totalPaidLeaves: Number
        }
    },
    grossSalary: Number,
    netSalary: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['GENERATED', 'PAID', 'REVOKED'],
        default: 'GENERATED'
    },
    paidAt: Date,
    payslipUrl: String, // Path to generated PDF
    transactionId: String
}, { timestamps: true });

// Ensure unique payroll per employee per month/year
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

const Payroll = mongoose.model('Payroll', payrollSchema);
export default Payroll;
