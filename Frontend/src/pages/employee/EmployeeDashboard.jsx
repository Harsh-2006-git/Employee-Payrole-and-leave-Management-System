import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
    Clock,
    Wallet,
    TrendingUp,
    Download,
    ChevronRight,
    Search,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [attendanceSummary, setAttendanceSummary] = useState(null);
    const [leaves, setLeaves] = useState([]);
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [empRes, attRes, leaveRes, payRes] = await Promise.all([
                    api.get('/employees/me'),
                    api.get(`/attendance/monthly/me?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`),
                    api.get('/leaves/me'),
                    api.get('/payroll/me')
                ]);

                setProfile(empRes.data.data);
                setAttendanceSummary(attRes.data.data.summary);
                setLeaves(leaveRes.data.data);
                setPayrolls(payRes.data.data);
            } catch (err) {
                console.error('Dashboard error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const calculateMonthDeduction = () => {
        if (!profile || !attendanceSummary) return 0;
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

        const paidLeaveDays = attendanceSummary?.PAID_LEAVE || 0;
        const absentDays = attendanceSummary?.ABSENT || 0;
        const lateDays = attendanceSummary?.LATE || 0;
        const additionalAbsentsFromLates = Math.floor(lateDays / 3);

        const totalUnpaidDays = paidLeaveDays + absentDays + additionalAbsentsFromLates;
        const dailyRate = profile.salaryStructure.basic / daysInMonth;
        return Math.round(totalUnpaidDays * dailyRate);
    };

    if (loading || !profile) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#64748b' }}>
            <div className="loader-text">Syncing Enterprise Identity...</div>
        </div>
    );

    const leaveDeduction = calculateMonthDeduction();
    const earnings = profile.salaryStructure.basic +
        profile.salaryStructure.hra +
        (profile.salaryStructure.conveyance || 0) +
        (profile.salaryStructure.medical || 0) +
        (profile.salaryStructure.special || 0) +
        (profile.salaryStructure.allowances || 0);

    const deductions = profile.salaryStructure.deductions.pf +
        (profile.salaryStructure.deductions.professionalTax || 0) +
        (profile.salaryStructure.deductions.tds || 0) +
        profile.salaryStructure.deductions.tax +
        leaveDeduction;

    const netTakeHome = earnings - deductions;
    const totalLeaves = profile.leaveBalance.casual +
        profile.leaveBalance.sick +
        profile.leaveBalance.paid +
        (profile.leaveBalance.maternity || 0) +
        (profile.leaveBalance.paternity || 0) +
        (profile.leaveBalance.bereavement || 0) +
        (profile.leaveBalance.compensatory || 0);

    return (
        <div className="employee-dashboard">
            <div className="dashboard-header">
                <div className="header-with-badge">
                    <h1>Welcome back, {profile.firstName}!</h1>
                    <div className="live-status-badge">
                        <span className="pulsate"></span>
                        LIVE DASHBOARD
                    </div>
                </div>
                <p>Here's what's happening with your profile today.</p>
            </div>

            <div className="employee-main-grid">
                {/* Left Column */}
                <div className="dash-col main-col">
                    <div className="stats-row">
                        <div className="glass-card stat-item">
                            <div className="stat-icon casual"><Calendar size={20} /></div>
                            <div>
                                <span className="stat-label">Available Leaves</span>
                                <div className="stat-val">{totalLeaves}</div>
                                <span className="stat-sub">Across all types</span>
                            </div>
                        </div>
                        <div className="glass-card stat-item">
                            <div className="stat-icon paid"><Wallet size={20} /></div>
                            <div>
                                <span className="stat-label">Projected Net</span>
                                <div className="stat-val">₹{netTakeHome.toLocaleString()}</div>
                                <span className="stat-sub">Current Month</span>
                            </div>
                        </div>
                        <div className="glass-card stat-item">
                            <div className="stat-icon sick"><Clock size={20} /></div>
                            <div>
                                <span className="stat-label">Next Payment</span>
                                <div className="stat-val">Mar 31</div>
                                <span className="stat-sub">Scheduled</span>
                            </div>
                        </div>
                    </div>

                    {attendanceSummary && (
                        <div className="glass-card attendance-summary-card">
                            <div className="card-header-row">
                                <h3>Monthly Attendance</h3>
                                <Link to="/attendance" className="view-link">View Full Calendar</Link>
                            </div>
                            <div className="attendance-grid">
                                <div className="att-item present">
                                    <div className="att-count">{attendanceSummary.PRESENT}</div>
                                    <label>Present</label>
                                </div>
                                <div className="att-item late">
                                    <div className="att-count">{attendanceSummary.LATE}</div>
                                    <label>Lates</label>
                                </div>
                                <div className="att-item leave">
                                    <div className="att-count">{attendanceSummary.LEAVE}</div>
                                    <label>Leave</label>
                                </div>
                                <div className="att-item absent">
                                    <div className="att-count">{attendanceSummary.ABSENT}</div>
                                    <label>Absent</label>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="glass-card salary-details-card">
                        <div className="card-header-row">
                            <h3>Salary Breakdown</h3>
                            <span className="live-tag">REAL-TIME</span>
                        </div>
                        <div className="salary-breakdown-grid">
                            <div className="salary-item">
                                <label>Basic Salary</label>
                                <div className="amount">₹{profile.salaryStructure.basic.toLocaleString()}</div>
                            </div>
                            <div className="salary-item">
                                <label>HRA</label>
                                <div className="amount">₹{profile.salaryStructure.hra.toLocaleString()}</div>
                            </div>
                            {(profile.salaryStructure.conveyance > 0) && (
                                <div className="salary-item">
                                    <label>Conveyance</label>
                                    <div className="amount">₹{profile.salaryStructure.conveyance.toLocaleString()}</div>
                                </div>
                            )}
                            {(profile.salaryStructure.medical > 0) && (
                                <div className="salary-item">
                                    <label>Medical</label>
                                    <div className="amount">₹{profile.salaryStructure.medical.toLocaleString()}</div>
                                </div>
                            )}
                            <div className="salary-item deduction">
                                <label>PF Deduction</label>
                                <div className="amount">-₹{profile.salaryStructure.deductions.pf.toLocaleString()}</div>
                            </div>
                            {(profile.salaryStructure.deductions.professionalTax > 0) && (
                                <div className="salary-item deduction">
                                    <label>Prof. Tax</label>
                                    <div className="amount">-₹{profile.salaryStructure.deductions.professionalTax.toLocaleString()}</div>
                                </div>
                            )}
                            <div className="salary-item deduction highlighted">
                                <label>Leave/Absent Deduction</label>
                                <div className="amount">-₹{leaveDeduction.toLocaleString()}</div>
                            </div>
                            <div className="salary-item total">
                                <label>Current Net Take Home</label>
                                <div className="amount">₹{netTakeHome.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card recent-activity">
                        <h3>Recent Payslips</h3>
                        <div className="payslip-list">
                            {payrolls.map(pay => (
                                <div key={pay._id} className="payslip-item">
                                    <div className="pay-info">
                                        <Wallet size={18} />
                                        <div>
                                            <div className="pay-month">{new Date(0, pay.month - 1).toLocaleString('en-US', { month: 'long' })} {pay.year}</div>
                                            <div className="pay-status">{pay.status}</div>
                                        </div>
                                    </div>
                                    <div className="pay-amount">₹{pay.netSalary}</div>
                                    <div className="pay-date">{pay.paidAt ? new Date(pay.paidAt).toLocaleDateString() : 'Pending'}</div>
                                    <a href={`${api.defaults.baseURL.replace('/api', '')}${pay.payslipUrl}`} target="_blank" rel="noreferrer" className="download-btn">
                                        <Download size={16} />
                                    </a>
                                </div>
                            ))}
                            {payrolls.length === 0 && <p className="empty">No payslips available yet.</p>}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="dash-col side-col">
                    <div className="glass-card profile-summary">
                        <div className="summary-header">
                            <div className="img-wrapper">
                                <img src={profile.user?.picture || "/default-avatar.png"} alt="Profile" className="summary-img" />
                                <div className={`status-indicator ${profile.status.toLowerCase()}`} />
                            </div>
                            <h3>{profile.firstName} {profile.lastName}</h3>
                            <p>{profile.designation}</p>
                        </div>
                        <div className="summary-details">
                            <div className="s-row"><span>Employee ID:</span> <strong>{profile.employeeId}</strong></div>
                            <div className="s-row"><span>Department:</span> <strong>{profile.department}</strong></div>
                            <div className="s-row"><span>Joined:</span> <strong>{new Date(profile.dateOfJoining).toLocaleDateString()}</strong></div>
                        </div>
                    </div>

                    <div className="glass-card leave-balance-detailed">
                        <h3>Leave Balances</h3>
                        <div className="leave-stats-mini-grid">
                            <div className="l-mini-item">
                                <div className="l-circle" style={{ borderColor: '#6366f1' }}>{profile.leaveBalance.casual}</div>
                                <span>Casual</span>
                            </div>
                            <div className="l-mini-item">
                                <div className="l-circle" style={{ borderColor: '#f43f5e' }}>{profile.leaveBalance.sick}</div>
                                <span>Sick</span>
                            </div>
                            <div className="l-mini-item">
                                <div className="l-circle" style={{ borderColor: '#10b981' }}>{profile.leaveBalance.paid}</div>
                                <span>Paid</span>
                            </div>
                            <div className="l-mini-item">
                                <div className="l-circle" style={{ borderColor: '#ec4899' }}>{profile.leaveBalance.maternity || 0}</div>
                                <span>Mat.</span>
                            </div>
                            <div className="l-mini-item">
                                <div className="l-circle" style={{ borderColor: '#3b82f6' }}>{profile.leaveBalance.paternity || 0}</div>
                                <span>Pat.</span>
                            </div>
                            <div className="l-mini-item">
                                <div className="l-circle" style={{ borderColor: '#94a3b8' }}>{profile.leaveBalance.bereavement || 0}</div>
                                <span>Berev.</span>
                            </div>
                        </div>
                        <button className="btn-full-width" onClick={() => window.location.href = '/attendance'}>Go to Attendance</button>
                    </div>

                    <div className="glass-card leave-history-mini">
                        <div className="card-header-row">
                            <h3>Recent Requests</h3>
                            <button className="text-btn" onClick={() => window.location.href = '/leave-history'}>View All</button>
                        </div>
                        <div className="mini-leave-list">
                            {leaves.slice(0, 3).map(leave => (
                                <div key={leave._id} className="mini-leave">
                                    <div className={`mini-status ${leave.status.toLowerCase()}`} />
                                    <div className="mini-info">
                                        <div className="mini-type">{leave.leaveType}</div>
                                        <div className="mini-date">{new Date(leave.startDate).toLocaleDateString()}</div>
                                    </div>
                                    <span className={`tiny-status ${leave.status.toLowerCase()}`}>{leave.status}</span>
                                </div>
                            ))}
                            {leaves.length === 0 && <p className="empty">No leave requests yet.</p>}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .employee-dashboard { display: flex; flex-direction: column; gap: 32px; }
                .header-with-badge { display: flex; align-items: center; gap: 16px; margin-bottom: 4px; }
                .live-status-badge { display: flex; align-items: center; gap: 8px; background: #ecfdf5; color: #059669; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; border: 1px solid #d1fae5; }
                .pulsate { width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block; animation: pulse 2s infinite; }
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
                .employee-main-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
                .dash-col { display: flex; flex-direction: column; gap: 24px; }
                .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
                .stat-item { padding: 24px; display: flex; align-items: center; gap: 16px; }
                .stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                .stat-icon.casual { background: #eff6ff; color: #3b82f6; }
                .stat-icon.paid { background: #ecfdf5; color: #10b981; }
                .stat-icon.sick { background: #fff7ed; color: #f59e0b; }
                .stat-label { font-size: 13px; color: #64748b; font-weight: 500; display: block; }
                .stat-val { font-size: 24px; font-weight: 700; color: #1e293b; }
                .stat-sub { font-size: 11px; color: #94a3b8; }
                
                .salary-details-card { padding: 24px; }
                .card-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .salary-breakdown-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
                .salary-item label { font-size: 12px; color: #64748b; display: block; margin-bottom: 4px; }
                .salary-item .amount { font-weight: 700; color: #1e293b; font-size: 16px; }
                .salary-item.deduction .amount { color: #ef4444; }
                .salary-item.total { grid-column: span 2; background: #f8fafc; padding: 16px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
                .salary-item.total .amount { color: #6366f1; font-size: 20px; }

                .attendance-summary-card { padding: 24px; }
                .attendance-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 16px; }
                .att-item { padding: 12px; border-radius: 10px; text-align: center; border: 1px solid #f1f5f9; }
                .att-count { font-size: 18px; font-weight: 800; }
                .att-item label { font-size: 10px; font-weight: 600; text-transform: uppercase; color: #64748b; }
                .att-item.present { background: #f0fdf4; color: #166534; }
                .att-item.late { background: #fffbeb; color: #92400e; }
                .att-item.leave { background: #eff6ff; color: #1e40af; }
                .att-item.absent { background: #fef2f2; color: #991b1b; }

                .profile-summary { padding: 24px; text-align: center; }
                .img-wrapper { position: relative; width: 80px; height: 80px; margin: 0 auto 12px; }
                .summary-img { width: 100%; height: 100%; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                .status-indicator { position: absolute; bottom: 4px; right: 4px; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; }
                .status-indicator.active { background: #10b981; }
                .summary-details { border-top: 1px solid #f1f5f9; padding-top: 16px; display: flex; flex-direction: column; gap: 8px; }
                .s-row { display: flex; justify-content: space-between; font-size: 12px; color: #64748b; }

                .leave-balance-detailed { padding: 24px; }
                .leave-stats-mini-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0; }
                .l-mini-item { text-align: center; }
                .l-circle { width: 44px; height: 44px; border-radius: 50%; border: 2.5px solid #e2e8f0; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; margin: 0 auto 6px; }
                .l-mini-item span { font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; }
                .btn-full-width { width: 100%; background: #6366f1; color: white; padding: 12px; border-radius: 10px; font-weight: 700; border: none; cursor: pointer; transition: all 0.2s; }
                .btn-full-width:hover { background: #4f46e5; transform: translateY(-1px); }

                .recent-activity { padding: 24px; }
                .payslip-list { display: flex; flex-direction: column; gap: 8px; }
                .payslip-item { display: flex; align-items: center; justify-content: space-between; padding: 12px; background: #f8fafc; border-radius: 10px; border: 1px solid #f1f5f9; }
                .pay-info { display: flex; align-items: center; gap: 12px; flex: 1; }
                .pay-month { font-size: 13px; font-weight: 600; color: #1e293b; }
                .pay-status { font-size: 10px; font-weight: 700; color: #10b981; }
                .pay-amount { font-size: 13px; font-weight: 700; }
                .download-btn { color: #64748b; padding-left: 12px; }

                .leave-history-mini { padding: 24px; }
                .mini-leave-list { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
                .mini-leave { display: flex; align-items: center; gap: 12px; }
                .mini-status { width: 8px; height: 8px; border-radius: 50%; }
                .mini-status.approved { background: #10b981; }
                .mini-status.pending { background: #f59e0b; }
                .mini-info { flex: 1; }
                .mini-type { font-size: 13px; font-weight: 600; }
                .mini-date { font-size: 11px; color: #64748b; }
                .tiny-status { font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; }
                .tiny-status.approved { background: #ecfdf5; color: #059669; }
                .tiny-status.pending { background: #fffbeb; color: #d97706; }
            `}</style>
        </div>
    );
};

export default EmployeeDashboard;
