import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    employeeId: {
        type: String,
        unique: true,
        required: true
    },
    firstName: String,
    lastName: String,
    department: String,
    designation: String,
    dateOfJoining: Date,
    phoneNumber: String,
    address: String,
    bankDetails: {
        accountNumber: String,
        bankName: String,
        ifscCode: String,
        branchName: String
    },
    salaryStructure: {
        basic: { type: Number, default: 0 },
        hra: { type: Number, default: 0 },
        conveyance: { type: Number, default: 0 },
        medical: { type: Number, default: 0 },
        special: { type: Number, default: 0 },
        allowances: { type: Number, default: 0 },
        deductions: {
            pf: { type: Number, default: 0 },
            professionalTax: { type: Number, default: 0 },
            tds: { type: Number, default: 0 },
            tax: { type: Number, default: 0 }
        }
    },
    leaveBalance: {
        casual: { type: Number, default: 12 },
        sick: { type: Number, default: 10 },
        paid: { type: Number, default: 15 },
        unpaid: { type: Number, default: 0 },
        maternity: { type: Number, default: 0 },
        paternity: { type: Number, default: 0 },
        bereavement: { type: Number, default: 0 },
        compensatory: { type: Number, default: 0 }
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE'],
        default: 'ACTIVE'
    }
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
