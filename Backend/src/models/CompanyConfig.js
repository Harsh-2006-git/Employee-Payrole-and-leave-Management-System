import mongoose from 'mongoose';

const companyConfigSchema = new mongoose.Schema({
    companyName: {
        type: String,
        default: 'Macro Management'
    },
    companyLogo: String,
    companyAddress: {
        type: String,
        default: '123 Enterprise Way, Innovation District, Tech Hub, 40001'
    },
    companyEmail: {
        type: String,
        default: 'hr@macromanagement.com'
    },
    companyPhone: {
        type: String,
        default: '+1 (555) 902-1000'
    },
    companyWebsite: {
        type: String,
        default: 'www.macromanagement.com'
    },
    primaryColor: {
        type: String,
        default: '#6366f1'
    },
    payslipHeaderColor: {
        type: String,
        default: '#1e293b'
    },
    footerText: {
        type: String,
        default: 'This is a computer generated document and does not require a signature.'
    },
    emailTemplates: {
        payslip: {
            subject: { type: String, default: 'Your Payslip for {{month}}/{{year}}' },
            body: {
                type: String,
                default: '<h1>Hello {{name}},</h1><p>Please find attached your payslip for the month of {{month}}, {{year}}.</p><p>Best Regards,<br>{{companyName}}</p>'
            }
        },
        leaveUpdate: {
            subject: { type: String, default: 'Leave Request Update' },
            body: {
                type: String,
                default: '<h1>Status Update</h1><p>Your leave request has been {{status}}.</p>'
            }
        }
    },
    dailyQR: {
        token: String,
        date: String
    }
}, { timestamps: true });

// We only ever want one config document
const CompanyConfig = mongoose.model('CompanyConfig', companyConfigSchema);
export default CompanyConfig;
