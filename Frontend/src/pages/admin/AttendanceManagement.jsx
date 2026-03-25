import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Calendar,
    Filter,
    Edit2,
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
    User,
    ArrowRight,
    Download,
    Eye
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const AttendanceManagement = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        status: '',
        checkInTime: ''
    });

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/attendance/all?startDate=${filterDate}&endDate=${filterDate}`);
            setRecords(data.data);
        } catch (err) {
            toast.error('Failed to fetch attendance records');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [filterDate]);

    const handleEditClick = (record) => {
        setSelectedRecord(record);
        setEditForm({
            status: record.status,
            checkInTime: record.checkInTime ? new Date(record.checkInTime).toISOString().slice(0, 16) : ''
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateAttendance = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/attendance/${selectedRecord._id}`, editForm);
            toast.success('Attendance record updated');
            setIsEditModalOpen(false);
            fetchAttendance();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update attendance');
        }
    };

    const filteredRecords = records.filter(record => {
        const matchesSearch =
            `${record.employee.firstName} ${record.employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' || record.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const stats = {
        present: records.filter(r => r.status === 'PRESENT').length,
        late: records.filter(r => r.status === 'LATE').length,
        absent: records.filter(r => r.status === 'ABSENT').length, // This only counts if record exists
        leave: records.filter(r => r.status === 'LEAVE').length
    };

    return (
        <div className="attendance-mgmt-container">
            <header className="page-header-v2">
                <div className="header-info">
                    <h1>Employee Attendance</h1>
                    <p>Monitor and manage daily workforce presence</p>
                </div>
                <div className="header-actions">
                    <div className="date-selector-wrapper glass-card">
                        <Calendar size={18} className="icon" />
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                </div>
            </header>

            <div className="stats-strip">
                <div className="stat-pill present">
                    <span className="value">{stats.present}</span>
                    <span className="label">Present</span>
                </div>
                <div className="stat-pill late">
                    <span className="value">{stats.late}</span>
                    <span className="label">Late</span>
                </div>
                <div className="stat-pill leave">
                    <span className="value">{stats.leave}</span>
                    <span className="label">On Leave</span>
                </div>
                <div className="stat-pill absent">
                    <span className="value">{stats.absent}</span>
                    <span className="label">Absent Recorded</span>
                </div>
            </div>

            <main className="main-content-area">
                <div className="glass-card table-section">
                    <div className="table-controls">
                        <div className="search-bar">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search employee name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="filter-group">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="status-select"
                            >
                                <option value="ALL">All Status</option>
                                <option value="PRESENT">Present</option>
                                <option value="LATE">Late</option>
                                <option value="LEAVE">Leave</option>
                                <option value="ABSENT">Absent</option>
                            </select>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="attendance-table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Designation</th>
                                    <th>Status</th>
                                    <th>Check-in Time</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="loading-cell">
                                            <div className="shimmer-loader"></div>
                                        </td>
                                    </tr>
                                ) : filteredRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="empty-cell">
                                            <div className="empty-state">
                                                <AlertCircle size={40} />
                                                <p>No attendance records found for this date.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecords.map((record, idx) => (
                                        <motion.tr
                                            key={record._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                        >
                                            <td>
                                                <div className="employee-info">
                                                    <div className="avatar-small">
                                                        {record.employee.firstName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="name">{record.employee.firstName} {record.employee.lastName}</div>
                                                        <div className="id">{record.employee.employeeId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="dept-tag">{record.employee.department}</span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${record.status.toLowerCase()}`}>
                                                    {record.status === 'PRESENT' && <CheckCircle2 size={12} />}
                                                    {record.status === 'LATE' && <Clock size={12} />}
                                                    {record.status === 'ABSENT' && <XCircle size={12} />}
                                                    {record.status === 'LEAVE' && <AlertCircle size={12} />}
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="time-info">
                                                    {record.checkInTime ? format(new Date(record.checkInTime), 'hh:mm a') : '--:--'}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="action-btns">
                                                    <button
                                                        className="edit-btn"
                                                        onClick={() => handleEditClick(record)}
                                                        title="Edit Attendance"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        className="view-btn"
                                                        onClick={() => window.location.href = `/attendance/${record.employee.employeeId}`}
                                                        title="View History"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="modal-overlay">
                        <motion.div
                            className="modal-content glass-card"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <div className="modal-header">
                                <h3>Edit Attendance Record</h3>
                                <button className="close-x" onClick={() => setIsEditModalOpen(false)}>&times;</button>
                            </div>
                            <form onSubmit={handleUpdateAttendance} className="edit-form">
                                <div className="employee-details">
                                    <User size={32} />
                                    <div>
                                        <strong>{selectedRecord.employee.firstName} {selectedRecord.employee.lastName}</strong>
                                        <p>{selectedRecord.date}</p>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        value={editForm.status}
                                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                        required
                                    >
                                        <option value="PRESENT">PRESENT</option>
                                        <option value="LATE">LATE</option>
                                        <option value="ABSENT">ABSENT</option>
                                        <option value="LEAVE">LEAVE</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Check-in Time</label>
                                    <input
                                        type="datetime-local"
                                        value={editForm.checkInTime}
                                        onChange={(e) => setEditForm({ ...editForm, checkInTime: e.target.value })}
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">Save Changes</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .attendance-mgmt-container {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .page-header-v2 {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .header-info h1 {
                    font-size: 28px;
                    color: #1e293b;
                    margin: 0;
                }

                .header-info p {
                    color: #64748b;
                    margin: 4px 0 0;
                }

                .date-selector-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 8px 16px;
                    background: white;
                    border: 1px solid #e2e8f0;
                }

                .date-selector-wrapper input {
                    border: none;
                    outline: none;
                    color: #1e293b;
                    font-weight: 600;
                    background: transparent;
                }

                .stats-strip {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 16px;
                }

                .stat-pill {
                    padding: 16px;
                    background: white;
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                }

                .stat-pill .value {
                    font-size: 24px;
                    font-weight: 800;
                }

                .stat-pill .label {
                    font-size: 12px;
                    font-weight: 600;
                    color: #94a3b8;
                    text-transform: uppercase;
                }

                .stat-pill.present { border-bottom: 4px solid #10b981; color: #10b981; }
                .stat-pill.late { border-bottom: 4px solid #f59e0b; color: #f59e0b; }
                .stat-pill.leave { border-bottom: 4px solid #3b82f6; color: #3b82f6; }
                .stat-pill.absent { border-bottom: 4px solid #ef4444; color: #ef4444; }

                .table-section {
                    padding: 0px;
                    overflow: hidden;
                }

                .table-controls {
                    padding: 20px;
                    display: flex;
                    justify-content: space-between;
                    gap: 16px;
                    background: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                }

                .search-bar {
                    flex: 1;
                    position: relative;
                }

                .search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                }

                .search-bar input {
                    width: 100%;
                    padding: 10px 10px 10px 40px;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    outline: none;
                }

                .status-select {
                    padding: 10px 16px;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    outline: none;
                    background: white;
                }

                .attendance-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .attendance-table th {
                    text-align: left;
                    padding: 16px 24px;
                    background: #f8fafc;
                    color: #64748b;
                    font-size: 13px;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .attendance-table td {
                    padding: 16px 24px;
                    border-bottom: 1px solid #f1f5f9;
                }

                .employee-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .avatar-small {
                    width: 32px;
                    height: 32px;
                    background: #6366f1;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 14px;
                }

                .employee-info .name {
                    font-weight: 600;
                    color: #1e293b;
                }

                .employee-info .id {
                    font-size: 12px;
                    color: #94a3b8;
                }

                .dept-tag {
                    padding: 4px 10px;
                    background: #f1f5f9;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #475569;
                }

                .status-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                    width: fit-content;
                }

                .status-badge.present { background: #ecfdf5; color: #059669; }
                .status-badge.late { background: #fffbeb; color: #d97706; }
                .status-badge.absent { background: #fef2f2; color: #dc2626; }
                .status-badge.leave { background: #eff6ff; color: #2563eb; }

                .action-btns {
                    display: flex;
                    gap: 8px;
                }

                .edit-btn, .view-btn {
                    width: 34px;
                    height: 34px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 1px solid #e2e8f0;
                    background: white;
                }

                .edit-btn:hover { background: #f1f5f9; color: #6366f1; border-color: #6366f1; }
                .view-btn:hover { background: #f1f5f9; color: #000; border-color: #000; }

                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    backdrop-filter: blur(8px);
                    background: rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .modal-content {
                    width: 100%;
                    max-width: 450px;
                    background: white !important;
                    padding: 24px !important;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }

                .close-x {
                    border: none;
                    background: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #94a3b8;
                }

                .employee-details {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 12px;
                    margin-bottom: 20px;
                }

                .form-group {
                    margin-bottom: 16px;
                }

                .form-group label {
                    display: block;
                    font-size: 14px;
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: #475569;
                }

                .form-group input, .form-group select {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 10px;
                    outline: none;
                }

                .modal-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 24px;
                }

                .btn-primary {
                    flex: 1;
                    padding: 12px;
                    background: #1e293b;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 700;
                    cursor: pointer;
                }

                .btn-secondary {
                    flex: 1;
                    padding: 12px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    font-weight: 700;
                    cursor: pointer;
                }

                .loading-cell {
                    padding: 40px;
                    text-align: center;
                }

                .shimmer-loader {
                    height: 20px;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                    border-radius: 4px;
                }

                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                @media (max-width: 768px) {
                    .page-header-v2 { flex-direction: column; align-items: flex-start; gap: 16px; }
                    .table-controls { flex-direction: column; }
                    .attendance-table th:nth-child(2), .attendance-table td:nth-child(2) { display: none; }
                }
            `}</style>
        </div>
    );
};

export default AttendanceManagement;
