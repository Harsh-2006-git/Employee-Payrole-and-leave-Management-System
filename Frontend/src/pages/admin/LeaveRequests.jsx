import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Clock, HelpCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const LeaveRequests = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaves = async () => {
        try {
            const { data } = await api.get('/leaves/all');
            setLeaves(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleReview = async (id, status) => {
        const promise = api.put(`/leaves/review/${id}`, { status });
        toast.promise(promise, {
            loading: `${status === 'APPROVED' ? 'Approving' : 'Rejecting'} request...`,
            success: () => {
                fetchLeaves();
                return `Request ${status.toLowerCase()} successfully`;
            },
            error: 'Failed to process review'
        });
    };

    return (
        <div className="leaves-page">
            <div className="page-header">
                <h1>Leave Management</h1>
                <p>Review and approve employee absence requests</p>
            </div>

            <div className="leaves-grid">
                {leaves.map((leave) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={leave._id}
                        className="glass-card leave-request-card"
                    >
                        <div className="request-header">
                            <div className="user-info">
                                <span className="user-name">{leave.employee.user.displayName}</span>
                                <span className="user-email">{leave.employee.employeeId}</span>
                            </div>
                            <span className={`status-badge ${leave.status.toLowerCase()}`}>
                                {leave.status}
                            </span>
                        </div>

                        <div className="request-details">
                            <div className="detail-row">
                                <Clock size={16} />
                                <span>{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()} ({leave.totalDays} Days)</span>
                            </div>
                            <div className="detail-row">
                                <HelpCircle size={16} />
                                <span>{leave.leaveType} Leave</span>
                            </div>
                            <p className="reason">"{leave.reason}"</p>
                        </div>

                        {leave.status === 'PENDING' && (
                            <div className="request-actions">
                                <button onClick={() => handleReview(leave._id, 'APPROVED')} className="action-btn approve">
                                    <Check size={18} />
                                    <span>Approve</span>
                                </button>
                                <button onClick={() => handleReview(leave._id, 'REJECTED')} className="action-btn reject">
                                    <X size={18} />
                                    <span>Reject</span>
                                </button>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            <style>{`
                .leaves-page { display: flex; flex-direction: column; gap: 24px; }
                .leaves-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px; }
                .leave-request-card { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
                .request-header { display: flex; justify-content: space-between; align-items: flex-start; }
                .user-name { display: block; font-weight: 700; color: #1e293b; }
                .user-email { font-size: 13px; color: #64748b; }
                
                .request-details { display: flex; flex-direction: column; gap: 12px; }
                .detail-row { display: flex; align-items: center; gap: 10px; color: #1e293b; font-size: 14px; font-weight: 500; }
                .reason { background: #f8fafc; padding: 12px; border-radius: 8px; font-size: 13px; font-style: italic; color: #475569; border-left: 3px solid #e2e8f0; }
                
                .request-actions { display: flex; gap: 12px; margin-top: 10px; }
                .action-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; border-radius: 10px; font-weight: 600; font-size: 14px; }
                .action-btn.approve { background: #ecfdf5; color: #059669; }
                .action-btn.reject { background: #fef2f2; color: #dc2626; }
                
                .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
                .status-badge.pending { background: #fffbeb; color: #d97706; }
                .status-badge.approved { background: #ecfdf5; color: #059669; }
                .status-badge.rejected { background: #fef2f2; color: #dc2626; }
            `}</style>
        </div>
    );
};

export default LeaveRequests;
