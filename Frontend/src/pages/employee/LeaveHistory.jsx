import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Filter,
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    CalendarDays
} from 'lucide-react';
import api from '../../api/axios';

const LeaveHistory = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const { data } = await api.get('/leaves/my-leaves');
            setLeaves(data.data);
        } catch (err) {
            console.error('Error fetching leaves:', err);
        } finally {
            setLoading(false);
        }
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const filteredLeaves = leaves.filter(leave => {
        const leaveDate = new Date(leave.startDate);
        const matchesMonth = leaveDate.getMonth() === currentMonth && leaveDate.getFullYear() === currentYear;
        const matchesStatus = filterStatus === 'ALL' || leave.status === filterStatus;
        return matchesMonth && matchesStatus;
    });

    const changeMonth = (delta) => {
        let newMonth = currentMonth + delta;
        let newYear = currentYear;
        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        } else if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle size={16} className="text-success" />;
            case 'REJECTED': return <XCircle size={16} className="text-danger" />;
            case 'PENDING': return <Clock size={16} className="text-warning" />;
            default: return <AlertCircle size={16} className="text-info" />;
        }
    };

    if (loading) return (
        <div className="flex-center h-60">
            <div className="loader-text">Decrypting Leave Archives...</div>
        </div>
    );

    return (
        <div className="leave-history-page">
            <div className="page-header-cool">
                <div className="header-content">
                    <div className="badge-pill-purple">Time Off Logs</div>
                    <h1>Attendance Archive</h1>
                    <p>Historical record of your leave requests and utilization</p>
                </div>

                <div className="month-shifter">
                    <button className="shift-btn" onClick={() => changeMonth(-1)}><ChevronLeft size={20} /></button>
                    <div className="current-view">
                        <CalendarDays size={18} />
                        <span>{months[currentMonth]} {currentYear}</span>
                    </div>
                    <button className="shift-btn" onClick={() => changeMonth(1)}><ChevronRight size={20} /></button>
                </div>
            </div>

            <div className="filter-shelf">
                <div className="filter-group">
                    <Filter size={16} />
                    <button className={filterStatus === 'ALL' ? 'active' : ''} onClick={() => setFilterStatus('ALL')}>All Logs</button>
                    <button className={filterStatus === 'APPROVED' ? 'active' : ''} onClick={() => setFilterStatus('APPROVED')}>Approved</button>
                    <button className={filterStatus === 'PENDING' ? 'active' : ''} onClick={() => setFilterStatus('PENDING')}>Pending</button>
                    <button className={filterStatus === 'REJECTED' ? 'active' : ''} onClick={() => setFilterStatus('REJECTED')}>Rejected</button>
                </div>
            </div>

            <div className="history-grid">
                <AnimatePresence mode='wait'>
                    {filteredLeaves.length > 0 ? (
                        <motion.div
                            key={`${currentMonth}-${currentYear}-${filterStatus}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="leaves-table-wrapper card-glass"
                        >
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>Period</th>
                                        <th>Leave Category</th>
                                        <th>Duration</th>
                                        <th>Context / Reason</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLeaves.map((leave, idx) => (
                                        <motion.tr
                                            key={leave._id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <td className="date-cell">
                                                <div className="date-range">
                                                    <strong>{new Date(leave.startDate).toLocaleDateString()}</strong>
                                                    <span>to {new Date(leave.endDate).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`type-pill ${leave.leaveType.toLowerCase()}`}>
                                                    {leave.leaveType}
                                                </span>
                                            </td>
                                            <td className="days-cell">
                                                <strong>{leave.totalDays}</strong>
                                                <span>{leave.totalDays === 1 ? 'Day' : 'Days'}</span>
                                            </td>
                                            <td className="reason-cell">
                                                <p title={leave.reason}>{leave.reason}</p>
                                            </td>
                                            <td>
                                                <div className={`status-chip ${leave.status.toLowerCase()}`}>
                                                    {getStatusIcon(leave.status)}
                                                    {leave.status}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="empty-state-card card-glass"
                        >
                            <div className="empty-icon-sphere">
                                <Calendar size={40} />
                            </div>
                            <h3>No Records Found</h3>
                            <p>No leave requests were synchronized for {months[currentMonth]} {currentYear}.</p>
                            <button className="btn-secondary-cool" onClick={() => window.location.href = '/apply-leave'}>
                                Apply Now
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style>{`
                .leave-history-page { padding-bottom: 40px; }
                .flex-center { display: flex; align-items: center; justify-content: center; }
                .h-60 { height: 60vh; }
                
                .page-header-cool { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
                .header-content h1 { font-size: 32px; color: #1e293b; margin: 8px 0; }
                .header-content p { color: #64748b; font-size: 16px; }
                .badge-pill-purple { display: inline-block; padding: 6px 14px; background: #f5f3ff; color: #7c3aed; border-radius: 100px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }

                .month-shifter { display: flex; align-items: center; background: white; padding: 8px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .current-view { display: flex; align-items: center; gap: 10px; padding: 0 20px; font-weight: 700; color: #1e293b; min-width: 180px; justify-content: center; }
                .shift-btn { width: 36px; height: 36px; border-radius: 10px; border: none; background: #f8fafc; color: #64748b; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
                .shift-btn:hover { background: #f1f5f9; color: #1e293b; }

                .filter-shelf { margin-bottom: 24px; }
                .filter-group { display: flex; align-items: center; gap: 8px; background: #f8fafc; padding: 6px; border-radius: 12px; width: fit-content; border: 1px solid #e2e8f0; color: #64748b; }
                .filter-group button { border: none; background: none; padding: 6px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.2s; }
                .filter-group button.active { background: white; color: #1e293b; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

                .card-glass { background: white; border-radius: 20px; border: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.02); overflow: hidden; }
                .premium-table { width: 100%; border-collapse: collapse; text-align: left; }
                .premium-table th { padding: 20px 24px; background: #f8fafc; font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; }
                .premium-table td { padding: 24px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
                
                .date-cell .date-range { display: flex; flex-direction: column; }
                .date-range strong { color: #1e293b; font-size: 14px; }
                .date-range span { color: #94a3b8; font-size: 12px; }

                .type-pill { padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
                .type-pill.casual { background: #eff6ff; color: #2563eb; }
                .type-pill.sick { background: #fff7ed; color: #d97706; }
                .type-pill.paid { background: #ecfdf5; color: #059669; }
                .type-pill.unpaid { background: #fef2f2; color: #dc2626; }

                .days-cell { display: flex; flex-direction: column; align-items: flex-start; }
                .days-cell strong { font-size: 18px; color: #1e293b; line-height: 1; }
                .days-cell span { font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; }

                .reason-cell p { margin: 0; color: #64748b; font-size: 14px; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

                .status-chip { display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 700; width: fit-content; text-transform: capitalize; }
                .status-chip.approved { background: #ecfdf5; color: #059669; }
                .status-chip.pending { background: #fffbeb; color: #d97706; }
                .status-chip.rejected { background: #fef2f2; color: #dc2626; }

                .empty-state-card { padding: 80px 40px; text-align: center; }
                .empty-icon-sphere { width: 80px; height: 80px; background: #f8fafc; color: #cbd5e1; border-radius: 30px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
                .empty-state-card h3 { font-size: 20px; color: #1e293b; margin-bottom: 8px; }
                .empty-state-card p { color: #94a3b8; margin-bottom: 32px; }
                
                .btn-secondary-cool { padding: 12px 24px; background: #f1f5f9; color: #475569; border: none; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s; }
                .btn-secondary-cool:hover { background: #e2e8f0; color: #1e293b; }
            `}</style>
        </div>
    );
};

export default LeaveHistory;
