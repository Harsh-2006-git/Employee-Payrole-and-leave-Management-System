import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download,
    CreditCard,
    Clock,
    ArrowUpRight,
    Calendar,
    ShieldCheck,
    Loader2,
    History
} from 'lucide-react';
import api from '../../api/axios';

const MyHistory = () => {
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await api.get('/payroll/my-history');
                setPayrolls(data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const rowVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="leave-history-page"> {/* Using same root class for layout consistency */}
            <div className="page-header-cool">
                <div className="header-content">
                    <div className="badge-pill-purple">Financial History</div>
                    <h1>Remuneration Logs</h1>
                    <p>Historical record of your earnings and tax artifacts</p>
                </div>
            </div>

            <div className="history-grid">
                <AnimatePresence mode='wait'>
                    {loading ? (
                        <div className="flex-center h-60">
                            <div className="loader-text">Synchronizing Ledger...</div>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="leaves-table-wrapper card-glass"
                        >
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>Month/Year</th>
                                        <th>Base Salary</th>
                                        <th>Net Settlement</th>
                                        <th>Audit Date</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payrolls.map((pay, idx) => (
                                        <motion.tr
                                            key={pay._id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <td className="date-cell">
                                                <div className="date-range">
                                                    <strong>{new Date(0, pay.month - 1).toLocaleString('en-US', { month: 'long' })}</strong>
                                                    <span>{pay.year} Cycle</span>
                                                </div>
                                            </td>
                                            <td>₹{(pay.salaryComponents.basic || 0).toLocaleString()}</td>
                                            <td className="days-cell">
                                                <strong>₹{(pay.netSalary || 0).toLocaleString()}</strong>
                                            </td>
                                            <td className="reason-cell">
                                                {pay.paidAt ? (
                                                    <div className="date-range">
                                                        <strong>{new Date(pay.paidAt).toLocaleDateString()}</strong>
                                                        <span style={{ fontSize: '10px' }}>{new Date(pay.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-warning" style={{ fontWeight: 700 }}>Pending</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className={`status-chip ${pay.status.toLowerCase()}`}>
                                                    <span className={`status-dot ${pay.status.toLowerCase()}`}></span>
                                                    {pay.status}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="action-group" style={{ gap: '12px' }}>
                                                    {pay.payslipUrl && pay.status === 'PAID' ? (
                                                        <a href={`${import.meta.env.VITE_BASE_URL}${pay.payslipUrl}`} target="_blank" className="btn-icon-simple" title="Download PDF">
                                                            <Download size={18} />
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted" style={{ fontSize: '11px', fontWeight: 800 }}>N/A</span>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style>{`
                .leave-history-page { padding-bottom: 40px; }
                .flex-center { display: flex; align-items: center; justify-content: center; }
                .h-60 { height: 60vh; color: #94a3b8; font-weight: 700; }
                
                .page-header-cool { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
                .header-content h1 { font-size: 32px; color: #1e293b; margin: 8px 0; font-weight: 800; }
                .header-content p { color: #64748b; font-size: 16px; }
                .badge-pill-purple { display: inline-block; padding: 6px 14px; background: #f5f3ff; color: #7c3aed; border-radius: 100px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }

                .card-glass { background: white; border-radius: 20px; border: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.02); overflow: hidden; }
                .premium-table { width: 100%; border-collapse: collapse; text-align: left; }
                .premium-table th { padding: 20px 24px; background: #f8fafc; font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; }
                .premium-table td { padding: 24px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; color: #475569; }
                
                .date-cell .date-range { display: flex; flex-direction: column; }
                .date-range strong { color: #1e293b; font-size: 14px; font-weight: 800; }
                .date-range span { color: #94a3b8; font-size: 12px; font-weight: 600; }

                .days-cell strong { font-size: 18px; color: #1e293b; line-height: 1; font-weight: 800; }
                
                .status-chip { display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 800; width: fit-content; text-transform: uppercase; }
                .status-chip.paid { background: #ecfdf5; color: #059669; }
                .status-chip.generated { background: #eff6ff; color: #3b82f6; }
                .status-chip.revoked { background: #fef2f2; color: #dc2626; }

                .status-dot { width: 6px; height: 6px; border-radius: 50%; }
                .status-dot.paid { background: #10b981; }
                .status-dot.generated { background: #3b82f6; }
                .status-dot.revoked { background: #ef4444; }

                .btn-icon-simple { color: #64748b; transition: all 0.2s; }
                .btn-icon-simple:hover { color: #0f172a; transform: scale(1.1); }
                .text-muted { color: #cbd5e1; }
                .text-warning { color: #d97706; }
                
                .action-group { display: flex; align-items: center; }
            `}</style>
        </div>
    );
};

export default MyHistory;
