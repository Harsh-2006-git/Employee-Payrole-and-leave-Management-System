import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const ApplyLeave = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        leaveType: 'CASUAL',
        startDate: '',
        endDate: '',
        reason: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [totalDays, setTotalDays] = useState(0);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/employees/me');
                setProfile(data.data);
            } catch (err) {
                console.error('Error fetching profile:', err);
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            setTotalDays(diffDays > 0 ? diffDays : 0);
        } else {
            setTotalDays(0);
        }
    }, [formData.startDate, formData.endDate]);

    const getAvailableBalance = () => {
        if (!profile) return 0;
        const type = formData.leaveType.toLowerCase();
        return profile.leaveBalance[type] || 0;
    };

    const isBalanceInsufficient = () => {
        return totalDays > getAvailableBalance();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isBalanceInsufficient()) {
            toast.error('Insufficient leave balance for this request.');
            return;
        }

        setSubmitting(true);
        const promise = api.post('/leaves/apply', formData);
        toast.promise(promise, {
            loading: 'Transmitting application...',
            success: () => {
                navigate('/leave-history');
                return 'Leave application submitted successfully!';
            },
            error: (err) => err.response?.data?.message || 'Error submitting application'
        });

        try {
            await promise;
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="apply-leave-page">
            <div className="page-header-simple">
                <div className="badge-pill-indigo">Time Off Request</div>
                <h1>Apply for Leave</h1>
                <p>Submit your digital application for review and approval</p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="leave-application-container"
            >
                <form onSubmit={handleSubmit} className="premium-form-card">
                    <div className="form-section-title">Request Specifications</div>

                    <div className="form-group-cool">
                        <label>Leave Category</label>
                        <select
                            required
                            value={formData.leaveType}
                            onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
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
                        {profile && (
                            <div className="balance-indicator">
                                <Info size={14} />
                                Available Balance: <strong>{getAvailableBalance()} days</strong>
                            </div>
                        )}
                    </div>

                    <div className="form-date-grid">
                        <div className="form-group-cool">
                            <label>Commencement Date</label>
                            <input
                                type="date"
                                required
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div className="form-group-cool">
                            <label>Conclusion Date</label>
                            <input
                                type="date"
                                required
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    {totalDays > 0 && (
                        <div className={`duration-banner ${isBalanceInsufficient() ? 'error' : 'success'}`}>
                            {isBalanceInsufficient() ? <AlertTriangle size={18} /> : <Calendar size={18} />}
                            <div className="banner-content">
                                <strong>Requesting {totalDays} {totalDays === 1 ? 'Day' : 'Days'}</strong>
                                {isBalanceInsufficient() && (
                                    <p>Limit exceeded! Available: {getAvailableBalance()} days</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="form-group-cool">
                        <label>Administrative Context (Reason)</label>
                        <textarea
                            rows="4"
                            required
                            placeholder="State the objective for this time off..."
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="form-submit-row">
                        <button type="button" onClick={() => navigate(-1)} className="onboard-btn-secondary">
                            Discard Request
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || isBalanceInsufficient() || totalDays <= 0}
                            className="onboard-btn-primary"
                        >
                            {submitting ? 'Authenticating Request...' : 'Transmit Application'}
                        </button>
                    </div>
                </form>

                <div className="side-guidance">
                    <div className="guidance-card">
                        <h3>Inventory Check</h3>
                        <div className="inventory-list">
                            <div className="inv-item">
                                <span>Casual Balance</span>
                                <strong>{profile?.leaveBalance?.casual || 0}</strong>
                            </div>
                            <div className="inv-item">
                                <span>Sick Balance</span>
                                <strong>{profile?.leaveBalance?.sick || 0}</strong>
                            </div>
                            <div className="inv-item">
                                <span>Paid Balance</span>
                                <strong>{profile?.leaveBalance?.paid || 0}</strong>
                            </div>
                            <div className="inv-item">
                                <span>Maternity</span>
                                <strong>{profile?.leaveBalance?.maternity || 0}</strong>
                            </div>
                            <div className="inv-item">
                                <span>Paternity</span>
                                <strong>{profile?.leaveBalance?.paternity || 0}</strong>
                            </div>
                            <div className="inv-item">
                                <span>Bereavement</span>
                                <strong>{profile?.leaveBalance?.bereavement || 0}</strong>
                            </div>
                            <div className="inv-item">
                                <span>Compensatory</span>
                                <strong>{profile?.leaveBalance?.compensatory || 0}</strong>
                            </div>
                            <div className="inv-item highlighted-inv">
                                <span>Unpaid Balance</span>
                                <strong>{profile?.leaveBalance?.unpaid || 0}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="guidance-memo">
                        <CheckCircle size={18} className="text-success" />
                        <p>Approved leaves are updated in your payroll record automatically.</p>
                    </div>
                </div>
            </motion.div>

            <style>{`
                .apply-leave-page { max-width: 1000px; margin: 0 auto; padding-bottom: 60px; }
                .page-header-simple { margin-bottom: 40px; }
                .page-header-simple h1 { font-size: 32px; color: #1e293b; margin: 12px 0 8px; }
                .page-header-simple p { color: #64748b; font-size: 16px; }
                .badge-pill-indigo { display: inline-block; padding: 6px 14px; background: #e0e7ff; color: #4338ca; border-radius: 100px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }

                .leave-application-container { display: grid; grid-template-columns: 1.5fr 1fr; gap: 32px; align-items: start; }
                .premium-form-card { background: white; border-radius: 24px; padding: 40px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 28px; }
                .form-section-title { font-size: 14px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: -10px; }
                
                .form-group-cool { display: flex; flex-direction: column; gap: 10px; }
                .form-group-cool label { font-size: 13px; font-weight: 800; color: #475569; }
                .form-group-cool input, .form-group-cool select, .form-group-cool textarea { 
                    padding: 14px 18px; border-radius: 14px; border: 1.5px solid #e2e8f0; background: #f8fafc; font-size: 15px; color: #1e293b; outline: none; transition: all 0.2s; font-family: inherit;
                }
                .form-group-cool input:focus, .form-group-cool select:focus, .form-group-cool textarea:focus { border-color: #6366f1; background: white; box-shadow: 0 0 0 4px rgba(99,102,241,0.08); }

                .balance-indicator { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #6366f1; font-weight: 600; margin-top: 4px; padding: 8px 12px; background: #f5f3ff; border-radius: 8px; width: fit-content; }
                .form-date-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

                .duration-banner { display: flex; align-items: center; gap: 16px; padding: 18px 24px; border-radius: 16px; }
                .duration-banner.success { background: #f0fdf4; color: #166534; border: 1px solid #dcfce7; }
                .duration-banner.error { background: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; }
                .banner-content strong { font-size: 15px; display: block; }
                .banner-content p { font-size: 12px; font-weight: 600; margin: 2px 0 0 0; }

                .form-submit-row { display: flex; justify-content: flex-end; gap: 16px; margin-top: 10px; }

                .side-guidance { display: flex; flex-direction: column; gap: 24px; }
                .guidance-card { background: #1e293b; border-radius: 20px; padding: 28px; color: white; }
                .guidance-card h3 { font-size: 16px; margin: 0 0 20px 0; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
                .inventory-list { display: flex; flex-direction: column; gap: 16px; }
                .inv-item { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; }
                .inv-item span { font-size: 14px; opacity: 0.8; }
                .inv-item strong { font-size: 20px; }
                
                .guidance-memo { background: #f8fafc; border-radius: 16px; padding: 20px; border: 1px solid #e2e8f0; display: flex; gap: 12px; }
                .guidance-memo p { margin: 0; font-size: 13px; color: #64748b; line-height: 1.5; font-weight: 500; }
            `}</style>
        </div>
    );
};

export default ApplyLeave;
