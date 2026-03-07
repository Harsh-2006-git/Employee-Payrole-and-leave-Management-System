import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  CalendarClock,
  Wallet,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  ShieldCheck,
  Activity,
  BarChart3,
  FileText,
  Settings,
  AlertCircle,
  PieChart as PieIcon,
  CreditCard,
  Briefcase,
  Globe,
  Plus,
  Target,
  Zap,
  Layers,
  Percent,
  Cpu,
  LineChart as LineIcon,
  MousePointer2,
  Lock
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const AnalyticsStat = ({ title, value, icon, status, subtext }) => (
  <div className="glass-card stat-item-v2">
    <div className={`stat-icon-v2 ${status}`}>
      {icon}
    </div>
    <div className="stat-content-v2">
      <span className="stat-label-v2">{title}</span>
      <h2 className="stat-value-v2">{value}</h2>
      <p className="stat-subtext-v2">{subtext}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState({
    payroll: [],
    departments: [],
    distribution: [],
    attendance: [],
  });
  const [recentLeaves, setRecentLeaves] = useState([]);

  useEffect(() => {
    const fetchFullIntelligence = async () => {
      try {
        const [empRes, leavesRes, payrollRes, attStatsRes] = await Promise.all([
          api.get('/employees/all'),
          api.get('/leaves/all'),
          api.get('/payroll/stats'),
          api.get('/attendance/stats')
        ]);

        const employees = empRes.data.data || [];
        const allLeaves = leavesRes.data.data || [];
        const payrollHistory = payrollRes.data.data || [];
        const attStats = attStatsRes.data.data || [];

        // Global Stats
        const totalPayrollAmt = payrollHistory.length > 0 ? payrollHistory[0].totalAmount : 0;
        const pendingLeavesCount = allLeaves.filter(l => l.status === 'PENDING').length;

        // Efficiency Calculation (Real workforce stability over last 30 days)
        let efficiency = 100;
        if (attStats.length > 0 && employees.length > 0) {
          const daysTracked = attStats.length;
          const totalExpectedPresence = employees.length * daysTracked;
          const totalActualPresence = attStats.reduce((acc, curr) => acc + curr.present + curr.late, 0);

          efficiency = ((totalActualPresence / totalExpectedPresence) * 100).toFixed(1);
        }

        setStats({
          headcount: employees.length,
          pendingLeaves: pendingLeavesCount,
          totalOutflow: totalPayrollAmt,
          efficiency,
          avgSalary: employees.length > 0 ? (totalPayrollAmt / employees.length) : 0
        });

        // Departments Chart
        const deptMap = {};
        employees.forEach(emp => { deptMap[emp.department] = (deptMap[emp.department] || 0) + 1; });
        const deptData = Object.keys(deptMap).map(name => ({ name, count: deptMap[name] }));

        // Payroll History Chart
        const pHistory = payrollHistory.map(item => ({
          name: `${new Date(0, item._id.month - 1).toLocaleString('default', { month: 'short' })} ${item._id.year}`,
          amount: item.totalAmount
        })).reverse();

        // Attendance Activity Line Chart
        const attendanceData = attStats.map(day => ({
          date: day._id,
          Presence: day.present + day.late,
          Absence: day.absent
        }));

        setCharts({
          payroll: pHistory,
          departments: deptData,
          attendance: attendanceData,
        });

        setRecentLeaves(allLeaves.filter(l => l.status === 'PENDING').slice(0, 5));
      } catch (err) {
        console.error('Data Sync Failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFullIntelligence();
  }, []);

  if (loading) return (
    <div className="admin-loading-container">
      <div className="loader-ring"></div>
      <h3>Loading Administrative Overview...</h3>
      <p>Fetching real-time workforce metrics</p>
    </div>
  );

  return (
    <div className="admin-dashboard-v2">
      <header className="admin-header-v2">
        <div className="header-info-v2">
          <h1>Welcome back, {user?.firstName || 'Admin'}!</h1>
          <div className="live-status-badge">
            <span className="pulsate"></span>
            LIVE SYSTEM DATA
          </div>
        </div>
        <div className="header-actions-v2">
          <button className="btn-primary" onClick={() => window.location.href = '/payroll'}>
            <Zap size={16} /> Process Payroll
          </button>
        </div>
      </header>

      <div className="admin-main-grid-v2">
        {/* Left Column (Main Stats & Charts) */}
        <div className="admin-col-v2 main-col-v2">
          <div className="stats-row-v2">
            <AnalyticsStat
              title="Total Employees"
              value={stats.headcount}
              icon={<Users size={20} />}
              status="primary"
              subtext="Active workforce"
            />
            <AnalyticsStat
              title="Attendance Rate"
              value={`${stats.efficiency}%`}
              icon={<Activity size={20} />}
              status="success"
              subtext="Monthly efficiency"
            />
            <AnalyticsStat
              title="Recent Payroll"
              value={`₹${(stats.totalOutflow / 1000).toFixed(1)}k`}
              icon={<Wallet size={20} />}
              status="info"
              subtext="Latest monthly outflow"
            />
          </div>

          <div className="glass-card chart-card-v2">
            <div className="card-header-v2">
              <h3>Financial Overview</h3>
              <p>Monthly payroll trends</p>
            </div>
            <div className="chart-container-v2">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={charts.payroll}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Total Amount']}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card chart-card-v2">
            <div className="card-header-v2">
              <h3>Attendance Trends</h3>
              <p>Last 30 days activity</p>
            </div>
            <div className="chart-container-v2">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={charts.attendance}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" hide={true} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="Presence" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Absence" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column (Actions & Lists) */}
        <div className="admin-col-v2 side-col-v2">
          <div className="glass-card side-panel-v2">
            <div className="card-header-v2">
              <h3>Pending Approvals</h3>
              <div className="badge-v2 warning">{stats.pendingLeaves}</div>
            </div>
            <div className="leave-list-v2">
              {recentLeaves.map(leave => (
                <div key={leave._id} className="leave-item-v2">
                  <div className="emp-avatar-v2">{leave.employee.firstName.charAt(0)}</div>
                  <div className="leave-details-v2">
                    <span className="emp-name-v2">{leave.employee.firstName} {leave.employee.lastName}</span>
                    <span className="leave-meta-v2">{leave.leaveType} • {leave.totalDays} Days</span>
                  </div>
                  <button className="text-link-v2" onClick={() => window.location.href = '/leaves'}>Review</button>
                </div>
              ))}
              {recentLeaves.length === 0 && (
                <div className="empty-state-v2">
                  <CheckCircle2 size={32} color="#10b981" />
                  <p>All clear! No pending requests.</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card side-panel-v2">
            <div className="card-header-v2">
              <h3>Department Breakdown</h3>
            </div>
            <div className="chart-container-v2 mini-bar-chart">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={charts.departments} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} width={80} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card side-panel-v2 quick-stats-v2">
            <div className="card-header-v2">
              <h3>Quick Insights</h3>
            </div>
            <div className="insight-grid-v2">
              <div className="insight-item-v2">
                <span className="insight-label-v2">Avg. Salary</span>
                <span className="insight-value-v2">₹{Math.round(stats.avgSalary).toLocaleString()}</span>
              </div>
              <div className="insight-item-v2">
                <span className="insight-label-v2">Active Depts</span>
                <span className="insight-value-v2">{charts.departments.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .admin-dashboard-v2 {
          display: flex;
          flex-direction: column;
          gap: 32px;
          padding: 20px 0;
        }

        .admin-header-v2 {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-info-v2 h1 {
          font-size: 32px;
          color: #1e293b;
          margin: 0;
          margin-bottom: 8px;
        }

        .live-status-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #ecfdf5;
          color: #059669;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          border: 1px solid #d1fae5;
          width: fit-content;
        }

        .pulsate {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          display: inline-block;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .admin-main-grid-v2 {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .admin-col-v2 {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .stats-row-v2 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .stat-item-v2 {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon-v2 {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon-v2.primary { background: #eff6ff; color: #3b82f6; }
        .stat-icon-v2.success { background: #ecfdf5; color: #10b981; }
        .stat-icon-v2.info { background: #f0f9ff; color: #0ea5e9; }

        .stat-label-v2 {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
          display: block;
        }

        .stat-value-v2 {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          margin: 2px 0;
        }

        .stat-subtext-v2 {
          font-size: 11px;
          color: #94a3b8;
          margin: 0;
        }

        .chart-card-v2 {
          padding: 24px;
        }

        .card-header-v2 {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .card-header-v2 h3 {
          font-size: 18px;
          margin: 0;
          color: #1e293b;
        }

        .card-header-v2 p {
          font-size: 13px;
          color: #64748b;
          margin: 4px 0 0;
        }

        .side-panel-v2 {
          padding: 24px;
        }

        .badge-v2 {
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
        }

        .badge-v2.warning {
          background: #fffbeb;
          color: #d97706;
        }

        .leave-list-v2 {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .leave-item-v2 {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f1f5f9;
        }

        .leave-item-v2:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .emp-avatar-v2 {
          width: 36px;
          height: 36px;
          background: #6366f1;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
        }

        .leave-details-v2 {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .emp-name-v2 {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }

        .leave-meta-v2 {
          font-size: 12px;
          color: #64748b;
        }

        .text-link-v2 {
          font-size: 12px;
          font-weight: 700;
          color: #6366f1;
          cursor: pointer;
        }

        .empty-state-v2 {
          text-align: center;
          padding: 20px 0;
          color: #94a3b8;
        }

        .empty-state-v2 p {
          font-size: 13px;
          margin-top: 12px;
        }

        .insight-grid-v2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 8px;
        }

        .insight-item-v2 {
          background: #f8fafc;
          padding: 12px;
          border-radius: 12px;
          text-align: center;
        }

        .insight-label-v2 {
          display: block;
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .insight-value-v2 {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
        }

        .admin-loading-container {
          height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #64748b;
        }

        .loader-ring {
          width: 48px;
          height: 48px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 1024px) {
          .admin-main-grid-v2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
