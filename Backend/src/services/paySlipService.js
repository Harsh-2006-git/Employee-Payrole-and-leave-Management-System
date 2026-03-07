import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import CompanyConfig from '../models/CompanyConfig.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class PaySlipService {
    getContrastColor(hexcolor) {
        if (!hexcolor) return 'white';
        const r = parseInt(hexcolor.slice(1, 3), 16);
        const g = parseInt(hexcolor.slice(3, 5), 16);
        const b = parseInt(hexcolor.slice(5, 7), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? 'black' : 'white';
    }

    async generatePayslip(payroll, employee) {
        let config = await CompanyConfig.findOne();
        if (!config) {
            config = {
                companyName: 'Macro Management',
                companyAddress: '123 Enterprise Way, Tech Hub',
                companyEmail: 'hr@macromanagement.com',
                companyWebsite: 'www.macromanagement.com',
                payslipHeaderColor: '#1e293b',
                primaryColor: '#6366f1',
                footerText: 'This is a computer generated document and does not require a signature.'
            };
        }

        return new Promise((resolve, reject) => {
            try {
                // Force a single page by setting a large bottom margin if needed, 
                // but better to just layout within the A4 height (841.89 points)
                const doc = new PDFDocument({ margin: 40, size: 'A4' });
                const fileName = `payslip_${employee.employeeId}_${payroll.month}_${payroll.year}.pdf`;
                const dir = path.join(__dirname, '../../public/payslips');

                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }

                const filePath = path.join(dir, fileName);
                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                const headerColor = config.payslipHeaderColor || '#1e293b';
                const textColor = this.getContrastColor(headerColor);

                // --- HEADER ---
                doc.rect(0, 0, 612, 130).fill(headerColor);

                doc.fillColor(textColor).fontSize(22).font('Helvetica-Bold')
                    .text(config.companyName.toUpperCase(), 50, 40);

                doc.fontSize(8).font('Helvetica').opacity(0.8)
                    .text(`${config.companyAddress}`, 50, 70);
                doc.text(`Email: ${config.companyEmail} | Web: ${config.companyWebsite}`, 50, 82);

                doc.fontSize(14).font('Helvetica-Bold').opacity(1)
                    .text('OFFICIAL PAYSLIP', 400, 45, { align: 'right' });
                doc.fontSize(9).font('Helvetica').opacity(0.8)
                    .text(`${payroll.month}/${payroll.year}`, 400, 65, { align: 'right' });
                doc.text(`Ref: ${payroll._id.toString().slice(-8).toUpperCase()}`, 400, 78, { align: 'right' });

                // --- EMPLOYEE SECTION ---
                doc.fillColor('black').opacity(1);
                const startY = 150;
                doc.font('Helvetica-Bold').fontSize(10).fillColor('#64748b').text('EMPLOYEE DETAILS', 50, startY);
                doc.moveTo(50, startY + 12).lineTo(550, startY + 12).strokeColor('#e2e8f0').stroke();

                doc.fillColor('#1e293b').fontSize(12).font('Helvetica-Bold').text(`${employee.firstName} ${employee.lastName}`, 50, startY + 25);
                doc.font('Helvetica').fontSize(9).fillColor('#64748b').text(`${employee.designation} | ID: ${employee.employeeId}`, 50, startY + 40);

                doc.fillColor('#1e293b').fontSize(9).font('Helvetica-Bold').text('PAYROLL PERIOD', 400, startY + 25, { align: 'right' });
                doc.font('Helvetica').text(`${payroll.month}, ${payroll.year}`, 400, startY + 38, { align: 'right' });

                // --- TABLES ---
                const tableY = 220;
                doc.rect(50, tableY, 240, 20).fill('#f8fafc');
                doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(8).text('EARNINGS', 60, tableY + 6);
                doc.text('AMOUNT', 240, tableY + 6);

                doc.rect(310, tableY, 240, 20).fill('#f8fafc');
                doc.text('DEDUCTIONS', 320, tableY + 6);
                doc.text('AMOUNT', 500, tableY + 6);

                let currentY = tableY + 30;
                const earnings = [
                    { label: 'Basic Salary', val: payroll.salaryComponents.basic },
                    { label: 'House Rent Allowance', val: payroll.salaryComponents.hra },
                    { label: 'Allowances', val: payroll.salaryComponents.allowances }
                ];
                const deductions = [
                    { label: 'Provident Fund (PF)', val: payroll.salaryComponents.deductions.pf },
                    { label: 'Professional Tax (PT)', val: payroll.salaryComponents.deductions.tax },
                    { label: 'Unpaid Leave Deductions', val: payroll.salaryComponents.deductions.unpaidLeaves }
                ];

                doc.font('Helvetica').fontSize(9);
                for (let i = 0; i < 3; i++) {
                    doc.fillColor('#1e293b').text(earnings[i].label, 60, currentY);
                    doc.text(`₹${earnings[i].val.toLocaleString()}`, 230, currentY, { align: 'right', width: 50 });

                    doc.text(deductions[i].label, 320, currentY);
                    doc.text(`₹${deductions[i].val.toLocaleString()}`, 490, currentY, { align: 'right', width: 50 });
                    currentY += 22;
                }

                const netY = 320;
                doc.rect(50, netY, 500, 50).fill(payroll.netSalary > 0 ? '#1e293b' : '#ef4444');
                doc.fillColor('white');
                doc.font('Helvetica').fontSize(10).text('NET SALARY PAYABLE', 70, netY + 18);
                doc.font('Helvetica-Bold').fontSize(20).text(`₹${payroll.netSalary.toLocaleString()}`, 70, netY + 15, { align: 'right', width: 460 });

                const attY = 400;
                doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(9).text('ATTENDANCE SUMMARY', 50, attY);
                doc.moveTo(50, attY + 12).lineTo(550, attY + 12).stroke();
                doc.fillColor('#1e293b').font('Helvetica').fontSize(9);

                const stats = payroll.salaryComponents.deductions;
                doc.text(`Present: ${stats.presentDays || 0}`, 60, attY + 25);
                doc.text(`Lates: ${stats.lateDays || 0}`, 140, attY + 25);
                doc.text(`Paid Leaves: ${stats.totalPaidLeaves || 0}`, 220, attY + 25);
                doc.text(`Absent/Unpaid: ${stats.absentDays || 0}`, 320, attY + 25);
                doc.text(`Total Deduction Days: ${(stats.absentDays || 0) + (Math.round(stats.unpaidLeaves / (employee.salaryStructure.basic / 30)) || 0)}`, 420, attY + 25);
                // Note: The logic above for total deduction days is a bit complex due to how we store it, 
                // but let's just show the raw counts for clarity if possible.
                // Actually, let's keep it simple.


                // --- FOOTER ---
                const footerY = 550;
                doc.rect(380, footerY, 170, 60).dash(4, { space: 2 }).strokeColor('#cbd5e1').stroke();
                doc.fillColor('#94a3b8').fontSize(6).font('Helvetica-Bold').text('OFFICIAL SEAL / STAMP', 380, footerY + 5, { align: 'center', width: 170 });
                doc.fillColor('#cbd5e1').fontSize(12).font('Helvetica-Bold').text('DIGITALLY SIGNED', 380, footerY + 25, { align: 'center', width: 170, opacity: 0.1 });
                doc.undash();

                const disclaimerY = 650;
                doc.moveTo(50, disclaimerY).lineTo(550, disclaimerY).strokeColor('#e2e8f0').stroke();
                doc.fillColor('#64748b').fontSize(8).font('Helvetica-Bold').text(`VERIFIED BY ${config.companyName.toUpperCase()}`, 50, disclaimerY + 10, { align: 'center', width: 500 });
                doc.fillColor('#94a3b8').fontSize(7).font('Helvetica').text(config.footerText, 50, disclaimerY + 22, { align: 'center', width: 500 });
                doc.fontSize(6).text(`Voucher: ${payroll._id.toString()} | ${new Date().toUTCString()}`, 50, disclaimerY + 34, { align: 'center', width: 500 });

                doc.end();
                stream.on('finish', () => resolve(fileName));
                stream.on('error', reject);
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default new PaySlipService();

