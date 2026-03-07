import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { motion } from 'framer-motion';
import { QrCode, RefreshCcw, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminQRGenerator = () => {
    const [qrData, setQrData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [todayAttendance, setTodayAttendance] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);

    const generateQR = async () => {
        setLoading(true);
        try {
            const { data } = await api.post('/attendance/generate-qr');
            setQrData(data.data);
            toast.success('New daily QR code generated');
        } catch (error) {
            toast.error('Failed to generate QR code');
        }
        setLoading(false);
    };

    const fetchInitialData = async () => {
        try {
            const { data: empData } = await api.get('/employees/all');
            setAllEmployees(empData.data);
            const { data: attData } = await api.get('/attendance/daily');
            setTodayAttendance(attData.data);
        } catch (error) {
            console.error('Failed to fetch initial data', error);
        }
    };

    const fetchTodayAttendance = async () => {
        try {
            const { data } = await api.get('/attendance/daily');
            setTodayAttendance(data.data);
        } catch (error) {
            console.error('Failed to fetch attendance', error);
        }
    };

    useEffect(() => {
        fetchInitialData();
        const interval = setInterval(fetchTodayAttendance, 60000); // 1 min poll
        return () => clearInterval(interval);
    }, []);

    const getMergedAttendance = () => {
        return allEmployees.map(emp => {
            const record = todayAttendance.find(r => r.employee?._id === emp._id);
            if (record) return record;

            // If no record, check if it's past threshold or still pending
            const now = new Date();
            const threshold = 12 * 60; // 12:00 PM
            const currentMinutes = now.getHours() * 60 + now.getMinutes();

            return {
                _id: `temp-${emp._id}`,
                employee: emp,
                status: currentMinutes > threshold ? 'ABSENT' : 'PENDING',
                checkInTime: null
            };
        });
    };

    const mergedLogs = getMergedAttendance();
    const stats = {
        total: allEmployees.length,
        present: todayAttendance.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length,
        absent: mergedLogs.filter(r => r.status === 'ABSENT').length
    };

    const handleDownload = () => {
        if (!qrData?.qrImage) return;
        const link = document.createElement('a');
        link.href = qrData.qrImage;
        link.download = `attendance-qr-${qrData.date}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="admin-qr-container">
            <div className="header-info">
                <h1>Daily Attendance Gateway</h1>
                <p>Generate and manage the secure QR entry code for today's attendance marking.</p>
            </div>

            <div className="grid-layout">
                <div className="glass-card qr-section">
                    <div className="card-header">
                        <h3>Secure Entry Token</h3>
                        <div className="status-badge LIVE">LIVE</div>
                    </div>

                    <div className="qr-display">
                        {qrData ? (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="qr-box"
                            >
                                <img src={qrData.qrImage} alt="Daily Attendance QR" />
                                <div className="qr-date">{qrData.date}</div>
                            </motion.div>
                        ) : (
                            <div className="qr-placeholder">
                                <QrCode size={64} opacity={0.2} />
                                <p>No active token for today.</p>
                            </div>
                        )}
                    </div>

                    <div className="action-row">
                        <button
                            className="btn-primary flex-center"
                            onClick={generateQR}
                            disabled={loading}
                        >
                            {loading ? <RefreshCcw className="spin" size={18} /> : <RefreshCcw size={18} />}
                            {qrData ? 'Regenerate Token' : 'Generate Token'}
                        </button>

                        {qrData && (
                            <button className="btn-secondary flex-center" onClick={handleDownload}>
                                <Download size={18} /> Download Code
                            </button>
                        )}
                    </div>
                    <div className="rules-text">
                        <strong>Protocol:</strong> The window for Present marking is strictly 10:00 AM to 10:30 AM. Between 10:30 AM and 12:00 PM will mark Late. After 12:00 PM, the system automatically marks non-attendants as Absent.
                    </div>
                </div>

                <div className="glass-card logger-section">
                    <div className="card-header">
                        <h3>Today's Flow Log</h3>
                        <span className="count-badge">{stats.present} / {stats.total} Present</span>
                    </div>

                    <div className="log-list">
                        {mergedLogs.length === 0 ? (
                            <div className="empty-state">No workforce data found.</div>
                        ) : (
                            mergedLogs.map((log) => (
                                <div key={log._id} className="log-item">
                                    <img src={log.employee?.user?.picture || '/default-avatar.png'} alt="" className="log-avatar" />
                                    <div className="log-details">
                                        <span className="log-name">{log.employee?.firstName} {log.employee?.lastName}</span>
                                        <span className="log-dept">{log.employee?.department}</span>
                                    </div>
                                    <div className="log-meta">
                                        <span className={`status-pill ${log.status.toLowerCase()}`}>{log.status}</span>
                                        {log.checkInTime && (
                                            <span className="log-time">{new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .admin-qr-container { display: flex; flex-direction: column; gap: 32px; }
                .grid-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
                
                .qr-section, .logger-section { padding: 32px; display: flex; flex-direction: column; gap: 24px; }
                .card-header { display: flex; justify-content: space-between; align-items: center; }
                .card-header h3 { margin: 0; font-size: 18px; color: #1e293b; }
                
                .status-badge.LIVE { background: #fee2e2; color: #ef4444; padding: 4px 12px; border-radius: 20px; font-weight: 800; font-size: 11px; animation: pulseRed 2s infinite;}
                @keyframes pulseRed { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }

                .qr-display { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 20px; min-height: 350px; display: flex; align-items: center; justify-content: center; padding: 32px; }
                .qr-box { background: white; padding: 20px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center; }
                .qr-box img { width: 250px; height: 250px; display: block; margin-bottom: 12px; }
                .qr-date { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #64748b; font-size: 14px; }
                
                .qr-placeholder { text-align: center; color: #94a3b8; }
                .qr-placeholder p { margin-top: 16px; font-weight: 500; }
                
                .action-row { display: flex; gap: 16px; }
                .flex-center { display: flex; align-items: center; justify-content: center; gap: 8px; flex: 1; padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; }
                .btn-primary { background: #6366f1; color: white; }
                .btn-primary:hover:not(:disabled) { background: #4f46e5; transform: translateY(-2px); }
                .btn-secondary { background: white; color: #475569; border: 1px solid #e2e8f0; }
                .btn-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }
                
                .spin { animation: loadSpin 1s linear infinite; }
                @keyframes loadSpin { 100% { transform: rotate(360deg); } }
                
                .rules-text { font-size: 12px; color: #64748b; line-height: 1.6; background: #e0e7ff; padding: 16px; border-radius: 12px; border: 1px solid #c7d2fe; }

                .count-badge { background: #f1f5f9; color: #475569; padding: 6px 12px; border-radius: 12px; font-weight: 800; font-size: 12px; }
                .log-list { display: flex; flex-direction: column; gap: 12px; overflow-y: auto; max-height: 500px; padding-right: 8px; }
                .log-item { display: flex; align-items: center; gap: 16px; padding: 16px; background: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9; }
                .log-avatar { width: 40px; height: 40px; border-radius: 10px; object-fit: cover; }
                .log-details { flex: 1; display: flex; flex-direction: column; }
                .log-name { font-weight: 700; color: #1e293b; font-size: 14px; }
                .log-dept { font-size: 12px; color: #64748b; }
                .log-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
                .log-time { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #94a3b8; font-weight: 600; }
                
                .status-pill { padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
                .status-pill.present { background: #dcfce7; color: #15803d; }
                .status-pill.late { background: #fef08a; color: #a16207; }
                .status-pill.absent { background: #fee2e2; color: #b91c1c; }
                .status-pill.leave { background: #e0e7ff; color: #4338ca; }
                .status-pill.pending { background: #f1f5f9; color: #64748b; }

                .empty-state { text-align: center; color: #94a3b8; padding: 40px 0; font-size: 14px; }
            `}</style>
        </div>
    );
};

export default AdminQRGenerator;
