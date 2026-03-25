import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    ChevronDown,
    ChevronUp,
    Briefcase,
    Users,
    Clock,
    BookOpen,
    Home,
    FileText,
    Search,
    Star
} from 'lucide-react';

const EMPLOYEE_TYPES = [
    {
        id: 'fulltime',
        label: 'Full-time Employee',
        icon: <Briefcase size={20} />,
        color: '#6366f1',
        bg: '#eef2ff',
        leaves: [
            { type: 'Casual Leave (CL)', desc: 'Short-term leave for personal work or emergencies', duration: '6–12 days/year', tag: 'Common' },
            { type: 'Sick Leave (SL)', desc: 'Leave for illness or medical reasons', duration: '6–12 days/year', tag: 'Medical' },
            { type: 'Earned / Privilege Leave (EL/PL)', desc: 'Leave earned based on working days, can be carried forward', duration: '15–30 days/year', tag: 'Accrued' },
            { type: 'Annual Leave / Vacation', desc: 'Planned long leave for rest or travel', duration: '10–30 days/year', tag: 'Planned' },
            { type: 'Maternity Leave', desc: 'Leave for female employees during childbirth', duration: '26 weeks', tag: 'Statutory' },
            { type: 'Paternity Leave', desc: 'Leave for male employees after childbirth', duration: '5–15 days', tag: 'Statutory' },
            { type: 'Bereavement Leave', desc: 'Leave in case of death in family', duration: '3–7 days', tag: 'Emergency' },
            { type: 'Marriage Leave', desc: "Leave for employee's marriage occasions", duration: '3–10 days', tag: 'Personal' },
            { type: 'Study Leave', desc: 'Leave for higher education or exams', duration: 'Varies', tag: 'Education' },
            { type: 'Compensatory Off (Comp Off)', desc: 'Leave against extra working days (e.g., weekends)', duration: '1 day per extra day', tag: 'Earned' },
            { type: 'Unpaid Leave (LOP/LWP)', desc: 'Leave without pay when no other leave is available', duration: 'As needed', tag: 'Unpaid' },
            { type: 'Sabbatical Leave', desc: 'Long-term leave for personal/professional growth', duration: '3–12 months', tag: 'Long-term' },
            { type: 'Work From Home (WFH)', desc: 'Remote work instead of leave', duration: 'Flexible', tag: 'Remote' },
            { type: 'Public Holidays', desc: 'Government-declared holidays', duration: 'As per calendar', tag: 'Official' },
            { type: 'Restricted Holidays', desc: 'Optional holidays (festivals, regional)', duration: '2–3 days/year', tag: 'Optional' },
        ]
    },
    {
        id: 'contract',
        label: 'Contract Employee',
        icon: <FileText size={20} />,
        color: '#f59e0b',
        bg: '#fffbeb',
        leaves: [
            { type: 'Casual Leave (CL)', desc: 'Limited personal leave for contract workers', duration: '3–6 days/year', tag: 'Common' },
            { type: 'Sick Leave (SL)', desc: 'Medical leave for contract employees', duration: '3–6 days/year', tag: 'Medical' },
            { type: 'Unpaid Leave', desc: 'Leave without salary as needed', duration: 'As needed', tag: 'Unpaid' },
            { type: 'Public Holidays', desc: 'Company or official holidays', duration: 'As per policy', tag: 'Official' },
        ]
    },
    {
        id: 'parttime',
        label: 'Part-time Employee',
        icon: <Clock size={20} />,
        color: '#10b981',
        bg: '#ecfdf5',
        leaves: [
            { type: 'Sick Leave', desc: 'Limited medical leave for part-time staff', duration: '2–5 days/year', tag: 'Medical' },
            { type: 'Casual Leave', desc: 'Limited personal leave', duration: '2–5 days/year', tag: 'Common' },
            { type: 'Unpaid Leave', desc: 'Leave without pay as needed', duration: 'As needed', tag: 'Unpaid' },
        ]
    },
    {
        id: 'intern',
        label: 'Intern / Trainee',
        icon: <BookOpen size={20} />,
        color: '#8b5cf6',
        bg: '#f5f3ff',
        leaves: [
            { type: 'Casual Leave', desc: 'Basic leave for personal needs', duration: '2–5 days/month', tag: 'Common' },
            { type: 'Sick Leave', desc: 'Medical leave for interns', duration: 'As needed', tag: 'Medical' },
            { type: 'Unpaid Leave', desc: 'Leave without stipend', duration: 'As needed', tag: 'Unpaid' },
        ]
    },
    {
        id: 'government',
        label: 'Government Employee',
        icon: <Star size={20} />,
        color: '#0ea5e9',
        bg: '#f0f9ff',
        leaves: [
            { type: 'Earned Leave (EL)', desc: 'Accumulated leave per government regulations', duration: '30 days/year', tag: 'Accrued' },
            { type: 'Half Pay Leave (HPL)', desc: 'Medical leave with half salary', duration: '20 days/year', tag: 'Medical' },
            { type: 'Commuted Leave', desc: 'HPL converted to full pay leave', duration: 'Limited', tag: 'Converted' },
            { type: 'Casual Leave', desc: 'Short personal leave', duration: '8–12 days/year', tag: 'Common' },
            { type: 'Maternity Leave', desc: 'Childbirth leave per government norms', duration: '26 weeks', tag: 'Statutory' },
            { type: 'Child Care Leave (CCL)', desc: 'Leave for child care (women employees)', duration: 'Up to 2 years total', tag: 'Special' },
            { type: 'Study Leave', desc: 'For higher studies', duration: 'Up to 2 years', tag: 'Education' },
            { type: 'Extraordinary Leave (EOL)', desc: 'Leave without pay under special circumstances', duration: 'As needed', tag: 'Unpaid' },
            { type: 'Duty Leave', desc: 'Official duty-related absence', duration: 'As required', tag: 'Official' },
        ]
    },
    {
        id: 'remote',
        label: 'Remote / Freelancer',
        icon: <Home size={20} />,
        color: '#ef4444',
        bg: '#fef2f2',
        leaves: [
            { type: 'Flexible Leave', desc: 'No fixed leave, depends on project schedule', duration: 'Flexible', tag: 'Flexible' },
            { type: 'Unpaid Time Off', desc: 'Time off without payment', duration: 'As needed', tag: 'Unpaid' },
            { type: 'Sick Leave', desc: 'Informal, depends on contract terms', duration: 'Flexible', tag: 'Medical' },
        ]
    },
];

const TAG_COLORS = {
    'Common': { bg: '#e0f2fe', text: '#0369a1' },
    'Medical': { bg: '#fdf2f8', text: '#9d174d' },
    'Accrued': { bg: '#ecfdf5', text: '#065f46' },
    'Planned': { bg: '#f5f3ff', text: '#5b21b6' },
    'Statutory': { bg: '#fff7ed', text: '#92400e' },
    'Emergency': { bg: '#fef2f2', text: '#991b1b' },
    'Personal': { bg: '#eff6ff', text: '#1e40af' },
    'Education': { bg: '#f0fdfa', text: '#134e4a' },
    'Earned': { bg: '#fafaf0', text: '#713f12' },
    'Unpaid': { bg: '#f8fafc', text: '#475569' },
    'Long-term': { bg: '#fdf4ff', text: '#6b21a8' },
    'Remote': { bg: '#ecfdf5', text: '#166534' },
    'Official': { bg: '#eff6ff', text: '#1e40af' },
    'Optional': { bg: '#f1f5f9', text: '#64748b' },
    'Special': { bg: '#fff1f2', text: '#be123c' },
    'Converted': { bg: '#f0f9ff', text: '#075985' },
    'Flexible': { bg: '#f5f0ff', text: '#7c3aed' },
};

const LeavePolicy = () => {
    const navigate = useNavigate();
    const [expandedSection, setExpandedSection] = useState('fulltime');
    const [searchTerm, setSearchTerm] = useState('');

    const toggleSection = (id) => {
        setExpandedSection(prev => prev === id ? null : id);
    };

    const filteredTypes = EMPLOYEE_TYPES.map(empType => ({
        ...empType,
        leaves: empType.leaves.filter(
            leave =>
                leave.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                leave.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                leave.tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(empType => !searchTerm || empType.leaves.length > 0);

    const totalLeaveTypes = EMPLOYEE_TYPES.reduce((sum, e) => sum + e.leaves.length, 0);

    return (
        <div className="leave-policy-page">
            <div className="policy-hero">
                <button className="back-pill" onClick={() => navigate(-1)}>
                    <ArrowLeft size={16} /> Back
                </button>
                <div className="hero-content">
                    <div className="hero-badge">📋 Reference Guide</div>
                    <h1>Leave Policy Reference</h1>
                    <p>A comprehensive overview of all leave types across employee categories</p>
                    <div className="hero-stats">
                        <div className="hstat"><span>{EMPLOYEE_TYPES.length}</span><p>Employee Types</p></div>
                        <div className="hstat-divider"></div>
                        <div className="hstat"><span>{totalLeaveTypes}</span><p>Leave Types</p></div>
                    </div>
                </div>
            </div>

            <div className="search-wrapper">
                <Search size={18} className="search-icon-p" />
                <input
                    type="text"
                    placeholder="Search by leave type, description, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="policy-search"
                />
            </div>

            <div className="sections-list">
                {filteredTypes.map((empType) => (
                    <motion.div
                        key={empType.id}
                        className="section-card"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <button
                            className="section-header"
                            onClick={() => toggleSection(empType.id)}
                            style={{ borderLeft: `4px solid ${empType.color}` }}
                        >
                            <div className="section-header-left">
                                <span className="section-icon" style={{ background: empType.bg, color: empType.color }}>
                                    {empType.icon}
                                </span>
                                <div>
                                    <h2>{empType.label}</h2>
                                    <p>{empType.leaves.length} leave type{empType.leaves.length !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                            <span className="chevron-icon" style={{ color: empType.color }}>
                                {expandedSection === empType.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </span>
                        </button>

                        <AnimatePresence>
                            {(expandedSection === empType.id || searchTerm) && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="section-body"
                                >
                                    <div className="leaves-grid">
                                        {empType.leaves.map((leave, idx) => {
                                            const tagStyle = TAG_COLORS[leave.tag] || TAG_COLORS['Common'];
                                            return (
                                                <motion.div
                                                    key={idx}
                                                    className="leave-card"
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.03 }}
                                                    style={{ borderTop: `3px solid ${empType.color}` }}
                                                >
                                                    <div className="leave-card-top">
                                                        <h3>{leave.type}</h3>
                                                        <span
                                                            className="leave-tag"
                                                            style={{ background: tagStyle.bg, color: tagStyle.text }}
                                                        >
                                                            {leave.tag}
                                                        </span>
                                                    </div>
                                                    <p className="leave-desc">{leave.desc}</p>
                                                    <div className="leave-footer">
                                                        <Clock size={12} />
                                                        <span>{leave.duration}</span>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}

                {filteredTypes.length === 0 && (
                    <div className="no-results">
                        <Search size={40} />
                        <p>No leave types match <strong>"{searchTerm}"</strong></p>
                    </div>
                )}
            </div>

            <div className="policy-footer-note">
                <BookOpen size={16} />
                <p>Leave policies may vary based on company agreements, local labor laws, and employment contracts. Always refer to your HR department for official guidelines.</p>
            </div>

            <style>{`
                .leave-policy-page {
                    max-width: 1000px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 28px;
                    padding-bottom: 60px;
                }

                .policy-hero {
                    background: linear-gradient(135deg, #f0f4ff 0%, #e8f5fe 100%);
                    border-radius: 24px;
                    padding: 40px;
                    color: #1e293b;
                    position: relative;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08);
                }

                .back-pill {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(99, 102, 241, 0.1);
                    color: #4338ca;
                    border: 1px solid rgba(99, 102, 241, 0.2);
                    border-radius: 20px;
                    padding: 6px 14px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-bottom: 24px;
                    width: fit-content;
                    transition: all 0.2s;
                }

                .back-pill:hover { background: rgba(99, 102, 241, 0.2); }

                .hero-badge {
                    display: inline-block;
                    background: rgba(99, 102, 241, 0.12);
                    border: 1px solid rgba(99, 102, 241, 0.25);
                    color: #4338ca;
                    padding: 4px 14px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 16px;
                }

                .hero-content h1 {
                    font-size: 36px;
                    font-weight: 800;
                    margin: 0 0 8px;
                    letter-spacing: -0.5px;
                    color: #1e293b;
                }

                .hero-content > p {
                    color: #64748b;
                    font-size: 16px;
                    margin: 0 0 28px;
                }

                .hero-stats {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                }

                .hstat span {
                    font-size: 28px;
                    font-weight: 800;
                    color: #6366f1;
                    display: block;
                }

                .hstat p {
                    font-size: 13px;
                    color: #64748b;
                    margin: 0;
                }

                .hstat-divider {
                    width: 1px;
                    height: 40px;
                    background: #e2e8f0;
                }

                .search-wrapper {
                    position: relative;
                }

                .search-icon-p {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                }

                .policy-search {
                    width: 100%;
                    padding: 14px 14px 14px 46px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 14px;
                    font-size: 15px;
                    color: #1e293b;
                    outline: none;
                    transition: all 0.2s;
                    box-sizing: border-box;
                    background: white;
                }

                .policy-search:focus {
                    border-color: #6366f1;
                    box-shadow: 0 0 0 4px rgba(99,102,241,0.1);
                }

                .sections-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .section-card {
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                }

                .section-header {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    background: white;
                    cursor: pointer;
                    border: none;
                    border-left: 4px solid transparent;
                    transition: background 0.2s;
                }

                .section-header:hover { background: #f8fafc; }

                .section-header-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .section-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .section-header h2 {
                    font-size: 17px;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                }

                .section-header p {
                    font-size: 13px;
                    color: #94a3b8;
                    margin: 2px 0 0;
                }

                .section-body {
                    overflow: hidden;
                    border-top: 1px solid #f1f5f9;
                }

                .leaves-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 16px;
                    padding: 24px;
                }

                .leave-card {
                    background: #f8fafc;
                    border-radius: 14px;
                    padding: 18px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    border: 1px solid #f1f5f9;
                    transition: all 0.2s;
                }

                .leave-card:hover {
                    background: white;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
                    transform: translateY(-2px);
                }

                .leave-card-top {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 8px;
                }

                .leave-card h3 {
                    font-size: 14px;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                    line-height: 1.3;
                }

                .leave-tag {
                    padding: 2px 10px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 700;
                    white-space: nowrap;
                    flex-shrink: 0;
                }

                .leave-desc {
                    font-size: 13px;
                    color: #64748b;
                    margin: 0;
                    line-height: 1.5;
                }

                .leave-footer {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: #94a3b8;
                    font-size: 12px;
                    font-weight: 600;
                }

                .no-results {
                    text-align: center;
                    padding: 60px;
                    color: #94a3b8;
                }

                .no-results p {
                    margin-top: 16px;
                    font-size: 15px;
                }

                .policy-footer-note {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 20px;
                    background: #f8fafc;
                    border-radius: 14px;
                    border: 1px solid #e2e8f0;
                    color: #64748b;
                }

                .policy-footer-note p {
                    margin: 0;
                    font-size: 13px;
                    line-height: 1.5;
                }

                @media (max-width: 768px) {
                    .policy-hero { padding: 28px 20px; }
                    .hero-content h1 { font-size: 26px; }
                    .leaves-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default LeavePolicy;
