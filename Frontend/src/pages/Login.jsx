import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, Users, Zap, Briefcase, FileText, BarChart3, Clock, AlertCircle } from 'lucide-react';

const Login = () => {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BASE_URL}/api/auth/google`;
  };

  const getErrorMessage = (code) => {
    switch (code) {
      case 'auth_failed': return 'Authentication failed. Please try again.';
      case 'unauthorized': return 'This email is not registered in our system. Please contact your Administrator.';
      default: return 'An error occurred during login.';
    }
  };

  const projectFeatures = [
    { icon: <Zap size={18} />, title: "Real-time Dashboards", desc: "Live employee & admin oversight" },
    { icon: <Briefcase size={18} />, title: "Precision Payroll", desc: "Automated salary & tax calculations" },
    { icon: <Clock size={18} />, title: "Leave Management", desc: "One-click approval workflow" },
    { icon: <FileText size={18} />, title: "Digital Payslips", desc: "Instant PDF generation & delivery" },
    { icon: <ShieldCheck size={18} />, title: "Enterprise Security", desc: "Role-based access control (RBAC)" },
    { icon: <BarChart3 size={18} />, title: "Audit Reporting", desc: "Complete system activity transparency" },
  ];

  return (
    <div className="login-page">
      <div className="login-split-container">

        {/* ── Left Side ── */}
        <div className="login-left">
          <div className="left-decorative-bg" />
          <div className="left-orb" />

          <div className="left-content-content">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="brand-section"
            >
              <h1>
                <span className="word-payroll">Payroll</span>
                {" & "}
                <span className="word-leave">Leave</span>
              </h1>
              <p className="subtitle">Employee Payroll &amp; Leave Management System</p>
            </motion.div>

            {/* Floating Image */}
            <motion.div
              className="floating-image-container"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="image-frame">
                <img
                  src="https://img.freepik.com/premium-photo/men-women-smile-office_319497-84.jpg"
                  alt="Team at work"
                />
                <div className="frame-overlay" />
              </div>
              <div className="stat-card-floating card-1">
                <div className="pulse-dot" />
                <span>99.9% Payout Accuracy</span>
              </div>
              <div className="stat-card-floating card-2">
                <Users size={14} />
                <span>+24 Active Today</span>
              </div>
            </motion.div>

            {/* Features */}
            <div className="features-grid">
              {projectFeatures.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  whileHover={{ scale: 1.04 }}
                  className="feature-card-new"
                >
                  <div className="f-icon">{f.icon}</div>
                  <div className="f-info">
                    <span className="f-title">{f.title}</span>
                    <span className="f-desc">{f.desc}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Side ── */}
        <div className="login-right">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="login-auth-card"
          >
            {/* Header */}
            <div className="auth-header">
              <div className="auth-gif-wrap">
                <img src="/giphy.gif" alt="logo" className="auth-gif" />
              </div>
              <h2>Welcome Back</h2>
              <p>Sign in to access your workspace</p>
            </div>

            {/* Body */}
            <div className="auth-body">

              {/* Role Boxes */}
              <div className="role-boxes">
                <div className="role-box admin-box">
                  <div className="role-box-icon admin-icon"><ShieldCheck size={20} /></div>
                  <div className="role-box-info">
                    <span className="role-box-title">Admin</span>
                    <span className="role-box-desc">Full system control</span>
                  </div>
                </div>
                <div className="role-box emp-box">
                  <div className="role-box-icon emp-icon"><Users size={20} /></div>
                  <div className="role-box-info">
                    <span className="role-box-title">Employee</span>
                    <span className="role-box-desc">Payroll & leave access</span>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="error-alert">
                  <AlertCircle size={18} />
                  <span>{getErrorMessage(error)}</span>
                </div>
              )}

              {/* Google Sign-in Button */}
              <button onClick={handleGoogleLogin} className="google-btn">
                <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign in with Google
              </button>

              {/* Security footer */}
              <div className="security-footer">
                <ShieldCheck size={14} />
                <span>Role assigned automatically by your registered email</span>
              </div>
            </div>

            <div className="auth-footer">
              <p>© 2026 Employee Payroll &amp; Leave Management System</p>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        .login-page {
          height: 100vh;
          width: 100vw;
          background: #0f172a;
          color: white;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }

        .login-split-container {
          display: flex;
          height: 100%;
        }

        /* ────────── LEFT ────────── */
        .login-left {
          flex: 1.4;
          position: relative;
          background: radial-gradient(circle at 10% 20%, #1e3a5f 0%, #0f172a 70%);
          display: flex;
          align-items: center;
          padding: 60px 80px;
          overflow: hidden;
        }

        .left-decorative-bg {
          position: absolute;
          width: 500px;
          height: 500px;
          background: #3b82f6;
          filter: blur(140px);
          opacity: 0.12;
          top: -150px;
          left: -150px;
          animation: float-bg 18s infinite alternate;
        }

        .left-orb {
          position: absolute;
          width: 300px;
          height: 300px;
          background: #6366f1;
          filter: blur(120px);
          opacity: 0.08;
          bottom: -100px;
          right: 50px;
        }

        @keyframes float-bg {
          from { transform: translate(0, 0); }
          to   { transform: translate(80px, 80px); }
        }

        .left-content-content {
          position: relative;
          z-index: 10;
          width: 100%;
        }

        /* Title */
        .brand-section h1 {
          font-size: 52px;
          font-weight: 900;
          margin: 0;
          letter-spacing: -2px;
          line-height: 1.05;
          color: #ffffff;
        }

        .word-payroll {
          color: #ffffff;
        }

        .word-leave {
          background: linear-gradient(135deg, #3b82f6, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          color: #94a3b8;
          font-size: 16px;
          margin-top: 10px;
          margin-bottom: 36px;
          font-weight: 400;
        }

        /* Floating Image */
        .floating-image-container {
          position: relative;
          width: 100%;
          max-width: 480px;
          height: 260px;
          margin-bottom: 48px;
        }

        .image-frame {
          width: 100%;
          height: 100%;
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6);
        }

        .image-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }

        .image-frame:hover img { transform: scale(1.04); }

        .frame-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(15,23,42,0.4), transparent);
        }

        .stat-card-floating {
          position: absolute;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(10px);
          padding: 10px 16px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #0f172a;
          font-size: 12px;
          font-weight: 700;
          box-shadow: 0 8px 20px rgba(0,0,0,0.25);
        }

        .card-1 { top: -16px; right: -16px; border-bottom: 3px solid #10b981; }
        .card-2 { bottom: -12px; left: -16px; border-bottom: 3px solid #3b82f6; }

        .pulse-dot {
          width: 8px; height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse-anim 1.5s infinite;
        }

        @keyframes pulse-anim {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(1.3); }
        }

        /* Features Grid */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          max-width: 780px;
        }

        .feature-card-new {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 14px;
          border-radius: 16px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          transition: all 0.25s;
          cursor: default;
        }

        .feature-card-new:hover {
          background: rgba(59,130,246,0.08);
          border-color: rgba(59,130,246,0.2);
        }

        .f-icon {
          background: rgba(59,130,246,0.15);
          color: #60a5fa;
          padding: 9px;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .f-info { display: flex; flex-direction: column; }
        .f-title { font-size: 13px; font-weight: 700; color: #e2e8f0; }
        .f-desc  { font-size: 11px; color: #94a3b8; margin-top: 3px; line-height: 1.4; }

        /* ────────── RIGHT ────────── */
        .login-right {
          flex: 1;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        .login-auth-card {
          width: 100%;
          max-width: 400px;
        }

        .auth-gif-wrap {
          margin-bottom: 20px;
          display: flex;
          justify-content: center;
        }

        .auth-gif {
          width: 100px;
          height: 100px;
          object-fit: contain;
          border-radius: 20px;
        }

        .auth-header {
          text-align: center;
        }

        .auth-header h2 {
          font-size: 30px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 8px;
          letter-spacing: -0.5px;
        }
        .auth-header p {
          color: #64748b;
          font-size: 14px;
          margin: 0 0 32px;
        }

        /* Role Boxes */
        .role-boxes {
          display: flex;
          gap: 12px;
          margin-bottom: 28px;
        }

        .role-box {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 14px;
          border: 1.5px solid transparent;
          transition: all 0.2s;
          cursor: default;
          overflow: hidden;
        }

        .admin-box {
          background: linear-gradient(135deg, #eef2ff, #e0e7ff);
          border-color: #c7d2fe;
        }

        .emp-box {
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          border-color: #bbf7d0;
        }

        .role-box-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .admin-icon {
          background: #e0e7ff;
          color: #4338ca;
          border: 1px solid #c7d2fe;
        }

        .emp-icon {
          background: #dcfce7;
          color: #16a34a;
          border: 1px solid #bbf7d0;
        }

        .role-box-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
          overflow: hidden;
        }

        .role-box-title {
          font-size: 12px;
          font-weight: 700;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .admin-box .role-box-title { color: #3730a3; }
        .emp-box   .role-box-title { color: #15803d; }

        .role-box-desc {
          font-size: 10.5px;
          font-weight: 500;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .admin-box .role-box-desc { color: #6366f1; }
        .emp-box   .role-box-desc { color: #22c55e; }

        /* Error alert */
        .error-alert {
          margin-bottom: 20px;
          padding: 12px 14px;
          background: #fef2f2;
          border: 1px solid #fee2e2;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #dc2626;
          font-size: 13px;
          font-weight: 600;
        }

        /* Google Button */
        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: #ffffff;
          color: #1f2937;
          padding: 15px 20px;
          border-radius: 14px;
          font-weight: 600;
          font-size: 15px;
          border: 2px solid #e5e7eb;
          cursor: pointer;
          transition: all 0.22s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          letter-spacing: 0.1px;
        }

        .google-btn:hover {
          border-color: #d1d5db;
          background: #f9fafb;
          box-shadow: 0 6px 20px rgba(0,0,0,0.1);
          transform: translateY(-1px);
        }

        .google-btn:active {
          transform: translateY(0);
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }

        .google-icon {
          width: 22px;
          height: 22px;
          flex-shrink: 0;
        }

        /* Security footer */
        .security-footer {
          margin-top: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 500;
          color: #6b7280;
        }

        .security-footer svg { color: #10b981; }

        /* Auth footer */
        .auth-footer {
          margin-top: 48px;
          text-align: center;
          border-top: 1px solid #f1f5f9;
          padding-top: 24px;
        }

        .auth-footer p { color: #94a3b8; font-size: 11.5px; }

        /* ── Responsive ── */
        @media (max-width: 1280px) {
          .login-left { padding: 40px 48px; }
          .features-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 1024px) {
          .login-left { display: none; }
          .login-right {
            background: #0f172a;
            padding: 24px 20px;
          }
          .login-auth-card {
            background: #ffffff;
            border-radius: 24px;
            padding: 32px 24px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.4);
          }
        }

        @media (max-width: 480px) {
          .login-right { padding: 16px; }
          .login-auth-card { padding: 28px 18px; border-radius: 20px; }
          .auth-gif { width: 80px; height: 80px; }
          .auth-header h2 { font-size: 24px; }
          .role-boxes { gap: 8px; }
          .role-box { padding: 10px 10px; gap: 8px; }
          .role-box-icon { width: 34px; height: 34px; border-radius: 8px; }
          .google-btn { font-size: 14px; padding: 13px 16px; }
          .auth-footer { margin-top: 32px; }
        }
      `}</style>
    </div>
  );
};

export default Login;
