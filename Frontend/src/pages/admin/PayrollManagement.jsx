import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download,
    CheckCircle2,
    Calculator,
    PlusCircle,
    XCircle,
    Mail,
    Search,
    User,
    Loader2
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const PayrollManagement = () => {
    const [payrolls, setPayrolls] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [payrollRes, employeeRes] = await Promise.all([
                api.get(`/payroll/all?month=${month}&year=${year}`),
                api.get('/employees/all')
            ]);
            setPayrolls(payrollRes.data.data);
            setEmployees(employeeRes.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [month, year]);

    const confirmAction = (message, onConfirm) => {
        toast((t) => (
            <div className="toast-confirm">
                <p>{message}</p>
                <div className="toast-actions">
                    <button
                        onClick={() => {
                            onConfirm();
                            toast.dismiss(t.id);
                        }}
                        className="btn-confirm"
                    >
                        Confirm
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="btn-cancel"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    const handleCalculate = async (employeeId) => {
        const promise = api.post('/payroll/calculate', { employeeId, month, year });
        toast.promise(promise, {
            loading: 'Calculating payroll...',
            success: () => {
                fetchData();
                return 'Payroll calculated successfully';
            },
            error: (err) => `Calculation failed: ${err.response?.data?.message || err.message}`
        });
    };

    const handleBatchGenerate = () => {
        confirmAction('Generate payroll for all active employees this month?', async () => {
            const promise = (async () => {
                for (const emp of employees) {
                    const existing = payrolls.find(p => p.employee._id === emp._id);
                    if (!existing || existing.status === 'REVOKED') {
                        await api.post('/payroll/calculate', { employeeId: emp._id, month, year });
                    }
                }
                fetchData();
            })();

            toast.promise(promise, {
                loading: 'Processing batch cycle...',
                success: 'Batch generation complete',
                error: 'Batch processing failed'
            });
        });
    };

    const handlePay = (payrollId) => {
        confirmAction('Mark this record as paid and certify payment?', async () => {
            const promise = api.put(`/payroll/pay/${payrollId}`);
            toast.promise(promise, {
                loading: 'Processing payment...',
                success: () => {
                    fetchData();
                    return 'Payment certified successfully';
                },
                error: 'Payment processing failed'
            });
        });
    };

    const handleResend = async (payrollId) => {
        const promise = api.post(`/payroll/resend/${payrollId}`);
        toast.promise(promise, {
            loading: 'Dispatching payslip email...',
            success: 'Email sent successfully!',
            error: 'Failed to resend email'
        });
    };

    const handleRevoke = (payrollId) => {
        confirmAction('Are you sure you want to revoke this record? This will delete the PDF.', async () => {
            const promise = api.put(`/payroll/revoke/${payrollId}`);
            toast.promise(promise, {
                loading: 'Revoking record...',
                success: () => {
                    fetchData();
                    return 'Record revoked successfully';
                },
                error: 'Revocation failed'
            });
        });
    };

    const handleStatusUpdate = async (payrollId, newStatus) => {
        const promise = api.patch(`/payroll/status/${payrollId}`, { status: newStatus });
        toast.promise(promise, {
            loading: 'Updating status...',
            success: () => {
                fetchData();
                return 'Status updated successfully';
            },
            error: 'Failed to update status'
        });
    };

    const filteredEmployees = employees.filter(emp => {
        const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
            emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
        const pay = payrolls.find(p => p.employee._id === emp._id);
        const status = pay ? pay.status : 'PENDING';
        const matchesFilter = filterStatus === 'ALL' || status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="payroll-page">
            <header className="page-header-standard">
                <div className="header-info">
                    <h1>Payroll Management</h1>
                    <p>View and manage employee payroll records</p>
                </div>

                <div className="header-controls">
                    <div className="selectors">
                        <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                            {months.map((m, i) => (
                                <option key={i + 1} value={i + 1}>{m}</option>
                            ))}
                        </select>
                        <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <button onClick={handleBatchGenerate} className="btn-batch">
                        <PlusCircle size={18} />
                        <span>Batch Process</span>
                    </button>
                </div>
            </header>

            <div className="toolbar-matrix">
                <div className="search-bar">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search employee or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-tabs">
                    {['ALL', 'PAID', 'GENERATED', 'REVOKED'].map(status => (
                        <button
                            key={status}
                            className={filterStatus === status ? 'active' : ''}
                            onClick={() => setFilterStatus(status)}
                        >
                            {status === 'GENERATED' ? 'Unpaid' : status.charAt(0) + status.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="payroll-ledger-card">
                <div className="table-container">
                    <table className="standard-table">
                        <thead>
                            <tr>
                                <th>Recipient</th>
                                <th>Base Salary</th>
                                <th>Net Settlement</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode='popLayout'>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5">
                                            <div className="table-loading-state">
                                                <Loader2 size={24} className="spin" />
                                                <span>Loading records...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredEmployees.map((emp) => {
                                    const pay = payrolls.find(p => p.employee._id === emp._id);
                                    const status = pay ? pay.status : 'PENDING';

                                    return (
                                        <motion.tr
                                            key={emp._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <td>
                                                <div className="user-info-cell">
                                                    <div className="avatar-box">
                                                        {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                                                    </div>
                                                    <div className="user-text">
                                                        <div className="name">{emp.firstName} {emp.lastName}</div>
                                                        <div className="meta">{emp.employeeId} • {emp.designation}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>₹{(emp.salaryStructure?.basic || 0).toLocaleString()}</td>
                                            <td>
                                                {pay ? (
                                                    <div className="net-amount">₹{pay.netSalary.toLocaleString()}</div>
                                                ) : (
                                                    <span className="not-calc">N/A</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className={`status-pill-container ${status.toLowerCase()}`}>
                                                    <span className="dot"></span>
                                                    {pay ? (
                                                        <select
                                                            value={status}
                                                            onChange={(e) => handleStatusUpdate(pay._id, e.target.value)}
                                                            className="status-selector"
                                                        >
                                                            <option value="GENERATED">Generated</option>
                                                            <option value="PAID">Paid</option>
                                                            <option value="REVOKED">Revoked</option>
                                                        </select>
                                                    ) : (
                                                        <span className="status-text-only">{status}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="action-row">
                                                    {(!pay || status === 'REVOKED') ? (
                                                        <button onClick={() => handleCalculate(emp._id)} className="btn-action-primary">
                                                            <Calculator size={14} />
                                                            <span>Process</span>
                                                        </button>
                                                    ) : (
                                                        <div className="btn-group">
                                                            <button onClick={() => handleResend(pay._id)} className="icon-btn mail" title="Resend Email">
                                                                <Mail size={16} />
                                                            </button>
                                                            {status === 'GENERATED' && (
                                                                <button onClick={() => handlePay(pay._id)} className="icon-btn success" title="Mark as Paid">
                                                                    <CheckCircle2 size={16} />
                                                                </button>
                                                            )}
                                                            <a href={`${import.meta.env.VITE_BASE_URL}${pay.payslipUrl}`} target="_blank" className="icon-btn info" title="Download">
                                                                <Download size={16} />
                                                            </a>
                                                            <button onClick={() => handleRevoke(pay._id)} className="icon-btn danger" title="Revoke">
                                                                <XCircle size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .payroll-page { padding: 30px; background: #fafbfc; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; flex-direction: column; gap: 24px; }
                
                .page-header-standard { display: flex; justify-content: space-between; align-items: flex-end; }
                .header-info h1 { font-size: 28px; font-weight: 700; color: #1e293b; margin: 0; }
                .header-info p { color: #64748b; font-size: 14px; margin-top: 5px; }
                
                .header-controls { display: flex; gap: 12px; align-items: center; }
                .selectors { display: flex; gap: 8px; background: white; border: 1px solid #e2e8f0; padding: 4px; border-radius: 10px; }
                .selectors select { border: none; padding: 8px 12px; font-size: 13px; font-weight: 600; color: #475569; background: transparent; cursor: pointer; }
                
                .btn-batch { background: #0f172a; color: white; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; }
                .btn-batch:hover { background: #1e293b; transform: translateY(-1px); }

                .toolbar-matrix { display: flex; justify-content: space-between; align-items: center; background: white; padding: 10px; border-radius: 15px; border: 1px solid #e2e8f0; }
                .search-bar { display: flex; align-items: center; gap: 10px; padding: 0 15px; flex: 1; max-width: 350px; }
                .search-bar input { border: none; outline: none; font-size: 14px; width: 100%; color: #1e293b; }
                .search-bar svg { color: #94a3b8; }
                
                .filter-tabs { display: flex; gap: 4px; }
                .filter-tabs button { border: none; background: transparent; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; color: #64748b; cursor: pointer; }
                .filter-tabs button.active { background: #f1f5f9; color: #0f172a; }

                .payroll-ledger-card { background: white; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .standard-table { width: 100%; border-collapse: collapse; text-align: left; }
                .standard-table th { padding: 18px 25px; background: #f8fafc; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
                .standard-table td { padding: 18px 25px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
                .standard-table tr:hover { background: #fcfdfe; }

                .user-info-cell { display: flex; align-items: center; gap: 12px; }
                .avatar-box { width: 40px; height: 40px; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; color: #475569; }
                .user-text .name { font-weight: 600; color: #1e293b; }
                .user-text .meta { font-size: 11px; color: #94a3b8; margin-top: 2px; }

                .net-amount { font-weight: 700; color: #0f172a; font-size: 15px; }
                .not-calc { color: #cbd5e1; font-style: italic; font-size: 11px; }

                .status-label, .status-pill-container { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: capitalize; }
                .status-pill-container.paid { background: #ecfdf5; color: #059669; }
                .status-pill-container.generated { background: #eff6ff; color: #2563eb; }
                .status-pill-container.pending { background: #fffbeb; color: #d97706; }
                .status-pill-container.revoked { background: #fef2f2; color: #dc2626; }
                .status-pill-container .dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
                
                .status-selector { background: transparent; border: none; font-size: 11px; font-weight: 700; color: inherit; cursor: pointer; outline: none; padding: 0; appearance: none; -webkit-appearance: none; }
                .status-selector:hover { text-decoration: underline; }
                .status-text-only { cursor: default; }

                .action-row { display: flex; justify-content: flex-end; }
                .btn-action-primary { background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 8px; cursor: pointer; }
                .btn-action-primary:hover { border-color: #0f172a; color: #0f172a; }

                .btn-group { display: flex; gap: 8px; }
                .icon-btn { width: 34px; height: 34px; border-radius: 8px; border: 1px solid #f1f5f9; background: white; color: #64748b; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
                .icon-btn:hover { border-color: #0f172a; color: #0f172a; transform: translateY(-1px); }
                .icon-btn.success { color: #059669; }
                .icon-btn.info { color: #2563eb; }
                .icon-btn.danger { color: #dc2626; }

                .table-loading-state { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 40px; color: #94a3b8; }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                .toast-confirm { padding: 5px; }
                .toast-confirm p { margin: 0 0 12px; font-size: 14px; color: #f8fafc; }
                .toast-actions { display: flex; gap: 8px; }
                .btn-confirm { background: #2563eb; color: white; border: none; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
                .btn-cancel { background: rgba(255,255,255,0.1); color: white; border: none; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
                
                .text-right { text-align: right; }
            `}</style>
        </div>
    );
};

export default PayrollManagement;
