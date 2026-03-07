import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';
import api from '../../api/axios';
import { motion } from 'framer-motion';
import { ScanLine, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const EmployeeQRScanner = () => {
    const [scanResult, setScanResult] = useState(null);
    const [status, setStatus] = useState('SCANNING'); // SCANNING, SUCCESS, ERROR
    const [message, setMessage] = useState('');
    const [scannedData, setScannedData] = useState(null); // the data marked
    const timeoutRef = useRef(null);

    const handleScan = async (detectedCodes) => {
        if (detectedCodes && detectedCodes.length > 0 && status === 'SCANNING') {
            const qrText = detectedCodes[0].rawValue;

            // Client-side guard: Detect Digital ID scan
            if (!qrText.includes(':') && qrText.length < 25) {
                setStatus('ERROR');
                setMessage(`Identity Error: You scanned your personal Digital ID (${qrText}). Please scan the Admin's Daily Attendance QR code.`);
                toast.error("Invalid QR Code");
                timeoutRef.current = setTimeout(() => setStatus('SCANNING'), 4000);
                return;
            }

            setStatus('PROCESSING');
            try {
                const res = await api.post('/attendance/mark', { qrToken: qrText });

                setStatus('SUCCESS');
                setMessage(res.data.message);
                setScannedData(res.data.data);
                toast.success('Attendance recorded');

                // Reset after 5s
                timeoutRef.current = setTimeout(() => {
                    setStatus('SCANNING');
                    setScanResult(null);
                    setScannedData(null);
                }, 5000);

            } catch (err) {
                setStatus('ERROR');
                setMessage(err.response?.data?.message || 'Verification failed');

                // Reset after 5s
                timeoutRef.current = setTimeout(() => {
                    setStatus('SCANNING');
                    setScanResult(null);
                }, 5000);
            }
        }
    };

    return (
        <div className="scanner-page">
            <div className="scanner-card glass-card">
                <div className="scanner-header">
                    <h2>Terminal Access</h2>
                    <p>Align the daily QR code within the frame to authenticate</p>
                </div>

                <div className="scanner-container">
                    {status === 'SCANNING' || status === 'PROCESSING' ? (
                        <div className="camera-frame">
                            <Scanner
                                onScan={handleScan}
                                formats={['qr_code']}
                                styles={{ container: { width: '100%', height: '100%' } }}
                            />

                            <div className={`scan-overlay ${status === 'PROCESSING' ? 'processing' : ''}`}>
                                <ScanLine size={48} className="scan-icon" />
                                {status === 'PROCESSING' && <div className="proc-text">Decrypting Token...</div>}
                            </div>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`result-box ${status.toLowerCase()}`}
                        >
                            {status === 'SUCCESS' ? (
                                <>
                                    <CheckCircle size={64} color="#10b981" />
                                    <h3>Authentication Verified</h3>
                                    <p>{message}</p>
                                    {scannedData && (
                                        <div className="time-stamp">
                                            <Clock size={16} />
                                            {new Date(scannedData.checkInTime).toLocaleTimeString()}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <XCircle size={64} color="#ef4444" />
                                    <h3>Access Denied</h3>
                                    <p>{message}</p>
                                </>
                            )}
                        </motion.div>
                    )}
                </div>
                <div className="scanner-footer">

                    <div className="warning-hint" style={{ marginBottom: '16px', padding: '12px', background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '12px', color: '#9a3412', fontSize: '12px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <XCircle size={16} />
                        <span>IMPORTANT: Scan the <strong>Daily Attendance QR</strong> displayed on the Admin's office screen or lobby terminal. (Do NOT scan your own ID card).</span>
                    </div>
                    <div className="info-box">
                        <strong>Time Guidelines:</strong>
                        <ul>
                            <li><strong>Before 10:00 AM:</strong> System locked</li>
                            <li><strong>10:00 AM - 10:30 AM:</strong> Marked PRESENT</li>
                            <li><strong>10:31 AM - 12:00 PM:</strong> Marked LATE</li>
                            <li><strong>After 12:00 PM:</strong> System locked (Auto-Absent)</li>
                        </ul>
                    </div>
                </div>
            </div>

            <style>{`
                .scanner-page { display: flex; justify-content: center; align-items: center; min-height: 80vh; }
                .scanner-card { width: 100%; max-width: 500px; padding: 40px; text-align: center; }
                .scanner-header h2 { font-size: 24px; color: #1e293b; margin-bottom: 8px; }
                .scanner-header p { color: #64748b; font-size: 14px; margin-bottom: 32px; }
                
                .scanner-container { height: 350px; position: relative; margin-bottom: 32px; }
                
                .camera-frame { width: 100%; height: 100%; border-radius: 24px; overflow: hidden; position: relative; border: 4px solid #f1f5f9; box-shadow: inset 0 0 20px rgba(0,0,0,0.1); }
                .scan-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; background: rgba(0,0,0,0.2); }
                .scan-icon { color: white; opacity: 0.6; animation: scanPing 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
                
                @keyframes scanPing {
                    0% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.5); opacity: 0; }
                    100% { transform: scale(1); opacity: 0; }
                }

                .scan-overlay.processing { background: rgba(99, 102, 241, 0.8); backdrop-filter: blur(4px); }
                .scan-overlay.processing .scan-icon { animation: rotate 2s linear infinite; opacity: 1; }
                @keyframes rotate { 100% { transform: rotate(360deg); } }
                
                .proc-text { color: white; font-weight: 700; margin-top: 16px; font-size: 14px; letter-spacing: 1px; }

                .result-box { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 24px; padding: 32px; }
                .result-box.success { background: #ecfdf5; border: 2px solid #a7f3d0; }
                .result-box.error { background: #fef2f2; border: 2px solid #fecaca; }
                
                .result-box h3 { margin: 24px 0 8px; font-size: 20px; }
                .result-box p { color: #64748b; font-size: 14px; }
                .time-stamp { display: flex; align-items: center; gap: 8px; margin-top: 16px; background: white; padding: 8px 16px; border-radius: 20px; font-family: 'JetBrains Mono'; font-size: 13px; font-weight: 700; color: #10b981; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.1); }

                .info-box { text-align: left; background: #f8fafc; padding: 20px; border-radius: 16px; border: 1px solid #f1f5f9; }
                .info-box strong { font-size: 13px; color: #1e293b; display: block; margin-bottom: 12px; }
                .info-box ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
                .info-box li { font-size: 12px; color: #64748b; display: flex; justify-content: space-between; }
                .info-box li strong { display: inline; color: #475569; margin: 0; font-size: 12px; }
            `}</style>
        </div >
    );
}

export default EmployeeQRScanner;
