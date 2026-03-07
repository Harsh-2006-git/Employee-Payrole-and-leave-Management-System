import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import CompanyConfig from '../models/CompanyConfig.js';

dotenv.config();

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendEmail(to, subject, text, html, attachments = []) {
        try {
            const info = await this.transporter.sendMail({
                from: `"${process.env.EMAIL_FROM_NAME || 'Payroll System'}" <${process.env.EMAIL_FROM}>`,
                to,
                subject,
                text,
                html,
                attachments
            });
            return info;
        } catch (error) {
            console.error('Email send error:', error);
            if (process.env.NODE_ENV === 'production') throw error;
        }
    }

    async sendPayslipEmail(email, employeeName, month, year, pdfPath) {
        let config = await CompanyConfig.findOne();
        if (!config) config = {
            companyName: 'Macro Management',
            companyAddress: '123 Enterprise Way',
            companyWebsite: 'www.macromanagement.com',
            companyPhone: '+1 (555) 123-4567',
            emailTemplates: {
                payslip: {
                    subject: 'Your Payslip for {{month}}/{{year}}',
                    body: '<h1>Hello {{name}},</h1><p>Please find attached your payslip for the month of {{month}}, {{year}}.</p>'
                }
            }
        };

        const template = config.emailTemplates.payslip;

        let subject = template.subject
            .replace(/{{month}}/g, month)
            .replace(/{{year}}/g, year);

        let html = template.body
            .replace(/{{name}}/g, employeeName)
            .replace(/{{month}}/g, month)
            .replace(/{{year}}/g, year)
            .replace(/{{companyName}}/g, config.companyName)
            .replace(/{{address}}/g, config.companyAddress)
            .replace(/{{website}}/g, config.companyWebsite)
            .replace(/{{phone}}/g, config.companyPhone);

        return await this.sendEmail(email, subject, 'Your payslip is attached.', html, [
            {
                filename: `payslip_${month}_${year}.pdf`,
                path: pdfPath
            }
        ]);
    }
}

export default new EmailService();
