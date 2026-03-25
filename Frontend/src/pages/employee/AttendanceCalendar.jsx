import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle
} from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

import { useParams } from 'react-router-dom';

const AttendanceCalendar = () => {
    const { user } = useAuth();
    const { employeeId: paramEmployeeId } = useParams();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [attendanceData, setAttendanceData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [holidays, setHolidays] = useState([]);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                if (paramEmployeeId) {
                    const empRes = await api.get(`/employees/all`);
                    const targetEmp = empRes.data.data.find(e => e.employeeId === paramEmployeeId);
                    if (targetEmp) {
                        setProfile(targetEmp);
                        fetchAttendance(targetEmp.employeeId, currentDate.getMonth() + 1, currentDate.getFullYear());
                    } else {
                        toast.error("Employee not found");
                        setLoading(false);
                    }
                } else if (user.role === 'EMPLOYEE') {
                    const empRes = await api.get('/employees/me');
                    setProfile(empRes.data.data);
                    fetchAttendance(empRes.data.data.employeeId, currentDate.getMonth() + 1, currentDate.getFullYear());
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [paramEmployeeId]);

    useEffect(() => {
        fetchHolidays();
    }, []);

    const fetchHolidays = async () => {
        try {
            const res = await api.get(`/attendance/holidays`);
            if (res.data.success) {
                // Only keep public holidays, store as MM-DD for year-agnostic matching
                const publicHolidays = (res.data.holidays || []).filter(h => h.public);
                setHolidays(publicHolidays);
            }
        } catch (err) {
            console.error("Failed to fetch holidays:", err);
        }
    };

    const fetchAttendance = async (empId, month, year) => {
        setLoading(true);
        try {
            const res = await api.get(`/attendance/monthly/${empId}?month=${month}&year=${year}`);
            setAttendanceData(res.data.data.records);
            setSummary(res.data.data.summary);
        } catch (err) {
            toast.error("Failed to load attendance records");
        } finally {
            setLoading(false);
        }
    };

    const nextMonth = () => {
        const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        setCurrentDate(next);
        if (profile) fetchAttendance(profile.employeeId, next.getMonth() + 1, next.getFullYear());
    };

    const prevMonth = () => {
        const prev = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        setCurrentDate(prev);
        if (profile) fetchAttendance(profile.employeeId, prev.getMonth() + 1, prev.getFullYear());
    };

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [leaveForm, setLeaveForm] = useState({
        leaveType: 'CASUAL',
        startDate: '',
        endDate: '',
        reason: ''
    });

    const handleAssignLeave = async (e) => {
        e.preventDefault();
        if (!profile) return;
        setAssigning(true);

        try {
            await api.post('/leaves/assign', {
                employeeId: profile._id,
                ...leaveForm
            });
            toast.success("Leave assigned successfully");
            setShowLeaveModal(false);
            // Refresh data
            fetchAttendance(profile.employeeId, currentDate.getMonth() + 1, currentDate.getFullYear());
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to assign leave");
        } finally {
            setAssigning(false);
        }
    };

    const renderCalendar = () => {
        const days = [];
        const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
        const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const joiningDateStr = profile?.dateOfJoining ? new Date(profile.dateOfJoining).toISOString().split('T')[0] : '';

        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const record = attendanceData.find(r => r.date === dateStr);
            const isToday = todayStr === dateStr;
            const isPast = date < today && !isToday;
            const isAfterJoining = joiningDateStr ? dateStr >= joiningDateStr : true;

            let status = record ? record.status : '';
            const isSunday = date.getDay() === 0;
            // Match holidays by month-day only (MM-DD), so 2025 API data works for any year
            const monthDay = dateStr.substring(5); // "MM-DD"
            const holiday = holidays.find(h => h.date && h.date.substring(5) === monthDay);

            if (!status) {
                if (holiday || isSunday) {
                    status = 'HOLIDAY';
                } else if (isPast && isAfterJoining) {
                    status = 'ABSENT';
                }
            }

            days.push(
                <motion.div
                    key={d}
                    className={`calendar-day ${status.toLowerCase()} ${isToday ? 'today' : ''}`}
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: d * 0.005 }}
                >
                    <span className="day-number">{d}</span>
                    {status && (
                        <div className="status-indicator">
                            {status === 'PRESENT' && <CheckCircle2 className="status-icon" />}
                            {status === 'LATE' && <Clock className="status-icon" />}
                            {status === 'ABSENT' && <XCircle className="status-icon" />}
                            {status === 'LEAVE' && <AlertCircle className="status-icon" />}
                            {status === 'HOLIDAY' && <CalendarIcon className="status-icon" />}
                            <span className="status-label">{status}</span>
                            {holiday && status === 'HOLIDAY' && (
                                <span className="holiday-name" title={holiday.name}>{holiday.name}</span>
                            )}
                            {isSunday && status === 'HOLIDAY' && !holiday && (
                                <span className="holiday-name">Sunday</span>
                            )}
                        </div>
                    )}
                </motion.div>
            );
        }

        return days;
    };

    if (!profile && (!user || user.role === 'ADMIN')) {
        return (
            <div className="admin-attendance-view">
                <div className="glass-card selection-prompt">
                    <AlertCircle size={48} className="prompt-icon" />
                    <h2>Team Attendance</h2>
                    <p>Select an employee to view their attendance history.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="attendance-page">
            <header className="compact-header">
                <div className="title-group">
                    <h1>Attendance Log</h1>
                    <p className="subtitle">Real-time tracking & summary</p>
                </div>
                {summary && (
                    <div className="summary-grid">
                        <div className="stat-card present">
                            <span className="stat-value">{summary.PRESENT}</span>
                            <span className="stat-label">Present</span>
                        </div>
                        <div className="stat-card late">
                            <span className="stat-value">{summary.LATE}</span>
                            <span className="stat-label">Lates</span>
                        </div>
                        <div className="stat-card absent">
                            <span className="stat-value">{summary.ABSENT}</span>
                            <span className="stat-label">Absent</span>
                        </div>
                        <div className="stat-card leave">
                            <span className="stat-value">{summary.LEAVE}</span>
                            <span className="stat-label">Leave</span>
                        </div>
                        <div className="stat-card holiday">
                            <span className="stat-value">{summary.HOLIDAY || 0}</span>
                            <span className="stat-label">Holiday</span>
                        </div>
                    </div>
                )}
            </header>

            <main className="calendar-card glass-card">
                <div className="calendar-toolbar">
                    <div className="current-month">
                        <CalendarIcon className="toolbar-icon" />
                        <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                    </div>
                    <div className="toolbar-actions">
                        {user.role === 'ADMIN' && (
                            <button className="btn-assign-leave" onClick={() => setShowLeaveModal(true)}>
                                <AlertCircle size={16} /> Assign Leave
                            </button>
                        )}
                        <button onClick={prevMonth} className="btn-icon"><ChevronLeft size={18} /></button>
                        <button onClick={() => setCurrentDate(new Date())} className="btn-today">Today</button>
                        <button onClick={nextMonth} className="btn-icon"><ChevronRight size={18} /></button>
                    </div>
                </div>

                <div className="calendar-body">
                    <div className="calendar-grid-header">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="weekday-label">{day}</div>
                        ))}
                    </div>
                    <div className="calendar-grid">
                        {renderCalendar()}
                    </div>
                </div>

                <footer className="calendar-footer">
                    <div className="legend">
                        <div className="legend-item"><span className="dot present"></span> Present</div>
                        <div className="legend-item"><span className="dot late"></span> Late</div>
                        <div className="legend-item"><span className="dot leave"></span> Leave</div>
                        <div className="legend-item"><span className="dot absent"></span> Absent</div>
                        <div className="legend-item"><span className="dot holiday"></span> Holiday</div>
                    </div>
                </footer>
            </main>

            <AnimatePresence>
                {showLeaveModal && (
                    <div className="modal-overlay">
                        <motion.div
                            className="modal-content glass-card"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        >
                            <div className="modal-header">
                                <h3>Assign Leave</h3>
                                <button className="close-btn" onClick={() => setShowLeaveModal(false)}><XCircle size={20} /></button>
                            </div>
                            <form onSubmit={handleAssignLeave} className="leave-assign-form">
                                <div className="form-group">
                                    <label>Leave Type</label>
                                    <select
                                        value={leaveForm.leaveType}
                                        onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                                        required
                                    >
                                        <option value="CASUAL">Casual Leave</option>
                                        <option value="SICK">Sick Leave</option>
                                        <option value="PAID">Paid Leave</option>
                                        <option value="UNPAID">Unpaid Leave</option>
                                        <option value="MATERNITY">Maternity Leave</option>
                                        <option value="PATERNITY">Paternity Leave</option>
                                        <option value="BEREAVEMENT">Bereavement Leave</option>
                                        <option value="COMPENSATORY">Compensatory Off</option>
                                    </select>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Start Date</label>
                                        <input
                                            type="date"
                                            value={leaveForm.startDate}
                                            onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>End Date</label>
                                        <input
                                            type="date"
                                            value={leaveForm.endDate}
                                            onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Reason / Remarks</label>
                                    <textarea
                                        value={leaveForm.reason}
                                        onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                                        placeholder="Enter reason for assignment..."
                                        required
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn-cancel" onClick={() => setShowLeaveModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-submit" disabled={assigning}>
                                        {assigning ? 'Assigning...' : 'Confirm Assignment'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .attendance-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    padding: 10px;
                }

                .compact-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .title-group h1 {
                    font-size: 24px;
                    font-weight: 800;
                    margin: 0;
                    color: #1e293b;
                    letter-spacing: -0.5px;
                }

                .subtitle {
                    color: #64748b;
                    font-size: 14px;
                    margin-top: 2px;
                }

                .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 10px;
                }

                .stat-card {
                    padding: 8px 16px;
                    background: white;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    min-width: 80px;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }

                .stat-value {
                    font-size: 18px;
                    font-weight: 800;
                }

                .stat-label {
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    color: #94a3b8;
                }

                .stat-card.present { border-left: 4px solid #22c55e; }
                .stat-card.present .stat-value { color: #166534; }
                .stat-card.late { border-left: 4px solid #f59e0b; }
                .stat-card.late .stat-value { color: #92400e; }
                .stat-card.absent { border-left: 4px solid #ef4444; }
                .stat-card.absent .stat-value { color: #991b1b; }
                .stat-card.leave { border-left: 4px solid #3b82f6; }
                .stat-card.leave .stat-value { color: #1e40af; }
                .stat-card.holiday { border-left: 4px solid #a855f7; }
                .stat-card.holiday .stat-value { color: #6b21a8; }

                .calendar-card {
                    background: rgba(255, 255, 255, 0.8) !important;
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.3) !important;
                    border-radius: 20px !important;
                    padding: 24px !important;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02) !important;
                }

                .calendar-toolbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }

                .current-month {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .toolbar-icon {
                    color: #6366f1;
                    width: 24px;
                    height: 24px;
                }

                .current-month h2 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 700;
                    color: #1e293b;
                }

                .toolbar-actions {
                    display: flex;
                    gap: 8px;
                }

                .btn-icon, .btn-today {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }

                .btn-icon {
                    width: 40px;
                    height: 40px;
                    color: #64748b;
                }

                .btn-today {
                    padding: 0 20px;
                    font-size: 13px;
                    font-weight: 700;
                    color: #4f46e5;
                    letter-spacing: 0.02em;
                }

                .btn-icon:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                    color: #1e293b;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                }

                .btn-today:hover {
                    background: #f5f7ff;
                    border-color: #c7d2fe;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                }

                .btn-icon:active, .btn-today:active {
                    transform: translateY(0);
                    box-shadow: none;
                }

                .calendar-grid-header {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    margin-bottom: 16px;
                }

                .weekday-label {
                    text-align: center;
                    font-size: 11px;
                    font-weight: 800;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }

                .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 10px;
                }

                .calendar-day {
                    aspect-ratio: 1.1;
                    background: #ffffff;
                    border-radius: 14px;
                    padding: 10px;
                    border: 1px solid #f1f5f9;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    transition: all 0.3s ease;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
                }

                .calendar-day:hover:not(.empty) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
                    z-index: 10;
                }

                .calendar-day.empty {
                    background: transparent;
                    border: none;
                    box-shadow: none;
                }

                .calendar-day.today {
                    border: 2px solid #6366f1;
                    background: linear-gradient(135deg, #ffffff, #f5f7ff);
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
                }

                .day-number {
                    font-weight: 800;
                    font-size: 14px;
                    color: #334155;
                }

                .status-indicator {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 3px;
                }

                .status-icon {
                    width: 16px;
                    height: 16px;
                }

                .status-label {
                    font-size: 8px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .calendar-day.present { background: #f0fdf4; border-color: #bbf7d0; color: #166534; }
                .calendar-day.late { background: #fffbeb; border-color: #fde68a; color: #92400e; }
                .calendar-day.absent { background: #fef2f2; border-color: #fecaca; color: #991b1b; }
                .calendar-day.leave { background: #eff6ff; border-color: #bfdbfe; color: #1e40af; }
                .calendar-day.holiday { background: #faf5ff; border-color: #e9d5ff; color: #6b21a8; }

                .holiday-name {
                    font-size: 7px;
                    font-weight: 700;
                    text-align: center;
                    margin-top: 2px;
                    line-height: 1;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .calendar-footer {
                    margin-top: 32px;
                    padding-top: 24px;
                    border-top: 2px solid #f8fafc;
                }

                .legend {
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 24px;
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    font-weight: 700;
                    color: #64748b;
                }

                .dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }

                .dot.present { background: #22c55e; }
                .dot.late { background: #f59e0b; }
                .dot.absent { background: #ef4444; }
                .dot.leave { background: #3b82f6; }
                .dot.holiday { background: #a855f7; }

                .selection-prompt {
                    text-align: center;
                    padding: 60px 40px !important;
                }

                .prompt-icon {
                    color: #6366f1;
                    margin-bottom: 16px;
                }

                .btn-assign-leave {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 0 16px;
                    background: #6366f1;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);
                }

                .btn-assign-leave:hover {
                    background: #4f46e5;
                    transform: translateY(-1px);
                    box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }

                .modal-content {
                    width: 100%;
                    max-width: 500px;
                    background: white !important;
                    padding: 0 !important;
                    overflow: hidden;
                    border-radius: 24px !important;
                }

                .modal-header {
                    padding: 24px;
                    background: #f8fafc;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #e2e8f0;
                }

                .modal-header h3 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 800;
                    color: #1e293b;
                }

                .close-btn {
                    background: none;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    transition: color 0.2s;
                }

                .close-btn:hover { color: #ef4444; }

                .leave-assign-form {
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-group label {
                    font-size: 13px;
                    font-weight: 700;
                    color: #475569;
                }

                .form-group input, .form-group select, .form-group textarea {
                    padding: 12px;
                    border-radius: 12px;
                    border: 1.5px solid #e2e8f0;
                    font-size: 14px;
                    color: #1e293b;
                    outline: none;
                    transition: all 0.2s;
                    background: #f8fafc;
                }

                .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
                    border-color: #6366f1;
                    background: white;
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                }

                .form-group textarea {
                    min-height: 100px;
                    resize: vertical;
                }

                .modal-footer {
                    display: flex;
                    gap: 12px;
                    margin-top: 8px;
                }

                .btn-cancel {
                    flex: 1;
                    padding: 12px;
                    border-radius: 12px;
                    border: 1.5px solid #e2e8f0;
                    background: white;
                    font-weight: 700;
                    color: #64748b;
                    cursor: pointer;
                }

                .btn-submit {
                    flex: 2;
                    padding: 12px;
                    border-radius: 12px;
                    background: #1e293b;
                    color: white;
                    border: none;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-submit:hover:not(:disabled) {
                    background: #000;
                    transform: translateY(-1px);
                }

                .btn-submit:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .form-row { grid-template-columns: 1fr; }
                    .modal-content { max-width: 100%; }
                }

                @media (max-width: 768px) {
                    .compact-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .summary-grid {
                        width: 100%;
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .calendar-grid {
                        gap: 4px;
                    }
                    .calendar-day {
                        padding: 4px;
                        border-radius: 8px;
                    }
                    .status-label {
                        display: none;
                    }
                    .day-number {
                        font-size: 11px;
                    }
                    .calendar-toolbar h2 {
                        font-size: 16px;
                    }
                }

                @media (max-width: 480px) {
                    .calendar-grid-header {
                        font-size: 10px;
                    }
                    .legend {
                        gap: 10px;
                    }
                    .legend-item {
                        font-size: 10px;
                    }
                }
            `}</style>
        </div>
    );
};

export default AttendanceCalendar;
