import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail,
    Layout,
    Palette,
    Save,
    Image as ImageIcon,
    Type,
    Eye,
    Zap,
    Crown,
    Hash,
    AlignLeft,
    Sparkles,
    FileText,
    MapPin,
    Globe,
    PhoneCall,
    User,
    Calendar,
    IndianRupee,
    ShieldCheck,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const TemplateEditor = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('branding');

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const { data } = await api.get('/config');
                setConfig(data.data);
            } catch (err) {
                console.error('Error fetching config:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleChange = (path, value) => {
        const newConfig = { ...config };
        const keys = path.split('.');
        let current = newConfig;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setConfig({ ...newConfig });
    };

    const getContrastColor = (hexcolor) => {
        if (!hexcolor) return 'white';
        const r = parseInt(hexcolor.slice(1, 3), 16);
        const g = parseInt(hexcolor.slice(3, 5), 16);
        const b = parseInt(hexcolor.slice(5, 7), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#1e293b' : 'white';
    };

    const applyElitePreset = () => {
        const eliteHTML = `
<div style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.05); border: 1px solid #eef2f6;">
                    
                    <!-- Visual Header -->
                    <tr>
                        <td align="center" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 60px 40px;">
                            {{#if companyLogo}}
                            <div style="background: #ffffff; width: 80px; height: 80px; border-radius: 20px; padding: 10px; margin-bottom: 24px; box-shadow: 0 10px 20px rgba(0,0,0,0.2);">
                                <img src="{{companyLogo}}" width="80" height="80" style="display: block; object-fit: contain;" alt="Logo" />
                            </div>
                            {{/if}}
                            <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -1px; text-transform: uppercase;">{{companyName}}</h1>
                            <p style="color: #3b82f6; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 3px; margin: 10px 0 0 0;">Certified Remuneration Transmission</p>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 50px 45px;">
                            <h2 style="color: #0f172a; font-size: 30px; font-weight: 900; margin: 0 0 20px 0; letter-spacing: -1.5px;">Hello {{name}},</h2>
                            <p style="color: #475569; font-size: 17px; line-height: 1.7; margin: 0 0 32px 0;">
                                Your official compensation summary for <strong>{{month}} {{year}}</strong> has been successfully audited and approved by the finance department.
                            </p>

                            <!-- Information Matrix -->
                            <div style="background-color: #f8fafc; border: 1.5px solid #eef2f6; border-radius: 20px; padding: 30px; margin-bottom: 35px;">
                                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td width="50%" valign="top">
                                            <p style="margin: 0; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 5px;">Recipient Identity</p>
                                            <p style="margin: 0; font-size: 15px; font-weight: 700; color: #1e293b;">{{name}}</p>
                                        </td>
                                        <td width="50%" valign="top" align="right">
                                            <p style="margin: 0; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 5px;">Payroll Cycle</p>
                                            <p style="margin: 0; font-size: 15px; font-weight: 700; color: #1e293b;">{{month}}, {{year}}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colspan="2" style="padding-top: 25px;">
                                            <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 15px 20px; display: flex; align-items: center;">
                                                <span style="background-color: #eff6ff; color: #2563eb; width: 36px; height: 36px; line-height: 36px; text-align: center; border-radius: 10px; font-weight: 900; font-size: 11px; margin-right: 15px; display: inline-block;">PDF</span>
                                                <span style="color: #1e293b; font-weight: 700; font-size: 14px; flex: 1;">payslip_{{month}}_{{year}}.pdf</span>
                                                <span style="background-color: #dcfce7; color: #15803d; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.5px;">E-Signed</span>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Call to Action -->
                            <div align="center">
                                <a href="{{website}}" style="background-color: #0f172a; color: #ffffff; padding: 20px 45px; border-radius: 16px; text-decoration: none; font-weight: 800; font-size: 15px; display: inline-block; box-shadow: 0 10px 20px rgba(15, 23, 42, 0.15); letter-spacing: 0.5px;">ACCESS SECURE PORTAL</a>
                            </div>
                        </td>
                    </tr>

                    <!-- Global Footer -->
                    <tr>
                        <td align="center" style="background-color: #fafbfd; padding: 45px; border-top: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #1e293b; font-weight: 900; font-size: 15px; letter-spacing: -0.5px;">{{companyName}} HQ</p>
                            <p style="margin: 8px 0 0 0; color: #64748b; font-size: 12px; font-weight: 500; line-height: 1.6;">
                                {{address}}<br />
                                Support: {{phone}} • Web: <a href="{{website}}" style="color: #3b82f6; text-decoration: none; font-weight: 700;">{{website}}</a>
                            </p>
                            <div style="margin-top: 25px; border-top: 1px solid #eef2f6; padding-top: 25px;">
                                <p style="margin: 0; color: #cbd5e1; font-size: 11px; font-weight: 600; letter-spacing: 0.5px;">
                                    © {{year}} {{companyName}} • Secure Automated Transmission
                                </p>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</div>`;
        handleChange('emailTemplates.payslip.body', eliteHTML.trim());
    };

    const handleSave = async () => {
        setSaving(true);
        const promise = api.put('/config', config);
        toast.promise(promise, {
            loading: 'Synchronizing enterprise branding...',
            success: 'Branding deployed successfully',
            error: 'Failed to deploy configuration'
        });

        try {
            await promise;
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex-center h-60">
            <div className="loader-text">Initializing Creative Engine...</div>
        </div>
    );

    const replaceVariables = (text) => {
        if (!text) return '';
        return text
            .replace(/{{name}}/g, 'Alex Sterling')
            .replace(/{{month}}/g, 'February')
            .replace(/{{year}}/g, '2026')
            .replace(/{{companyName}}/g, config.companyName)
            .replace(/{{companyLogo}}/g, config.companyLogo || '')
            .replace(/{{address}}/g, config.companyAddress)
            .replace(/{{website}}/g, config.companyWebsite)
            .replace(/{{phone}}/g, config.companyPhone)
            .replace(/{{#if companyLogo}}([\s\S]*?){{\/if}}/g, config.companyLogo ? '$1' : '');
    };

    const headerTextColor = getContrastColor(config.payslipHeaderColor);

    return (
        <div className="hq-template-editor">
            <div className="editor-top-bar">
                <div className="branding-meta">
                    <div className="badge-luxury"><Crown size={12} /> ENTERPRISE CORE</div>
                    <h1>Identity Architect</h1>
                </div>
                <div className="actions-cluster">
                    <button className="onboard-btn-secondary elite-trigger" onClick={applyElitePreset}>
                        <Sparkles size={16} /> Load Elite Template
                    </button>
                    <button className="onboard-btn-primary luxury-save" onClick={handleSave} disabled={saving}>
                        <Save size={18} /> {saving ? 'Syncing...' : 'Deploy Global Changes'}
                    </button>
                </div>
            </div>

            <div className="editor-main-layout">
                <div className="control-panel scroll-hide">
                    <div className="panel-tabs">
                        <button className={activeSection === 'branding' ? 'active' : ''} onClick={() => setActiveSection('branding')}>
                            <Palette size={18} /> Branding
                        </button>
                        <button className={activeSection === 'payslip' ? 'active' : ''} onClick={() => setActiveSection('payslip')}>
                            <FileText size={18} /> Payslip
                        </button>
                        <button className={activeSection === 'email' ? 'active' : ''} onClick={() => setActiveSection('email')}>
                            <Mail size={18} /> Email
                        </button>
                    </div>

                    <div className="control-fields">
                        <AnimatePresence mode='wait'>
                            {activeSection === 'branding' && (
                                <motion.div key="branding" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="field-set">
                                    <div className="field-group">
                                        <label><Type size={14} /> Organization Identity</label>
                                        <input type="text" value={config.companyName} onChange={(e) => handleChange('companyName', e.target.value)} />
                                    </div>
                                    <div className="field-group">
                                        <label><ImageIcon size={14} /> Logo URL Provider</label>
                                        <input type="text" value={config.companyLogo || ''} placeholder="https://cdn.example.com/logo.png" onChange={(e) => handleChange('companyLogo', e.target.value)} />
                                    </div>
                                    <div className="field-group">
                                        <label><MapPin size={14} /> Corporate Address</label>
                                        <input type="text" value={config.companyAddress} onChange={(e) => handleChange('companyAddress', e.target.value)} />
                                    </div>
                                    <div className="field-group">
                                        <label><Mail size={14} /> Support Email</label>
                                        <input type="email" value={config.companyEmail} onChange={(e) => handleChange('companyEmail', e.target.value)} />
                                    </div>
                                    <div className="field-group">
                                        <label><PhoneCall size={14} /> Business Phone</label>
                                        <input type="text" value={config.companyPhone} onChange={(e) => handleChange('companyPhone', e.target.value)} />
                                    </div>
                                    <div className="field-group">
                                        <label><Globe size={14} /> Official Website</label>
                                        <input type="text" value={config.companyWebsite} onChange={(e) => handleChange('companyWebsite', e.target.value)} />
                                    </div>
                                    <div className="color-section-grid">
                                        <div className="field-group">
                                            <label>System Primary</label>
                                            <div className="luxury-color-picker">
                                                <input type="color" value={config.primaryColor} onChange={(e) => handleChange('primaryColor', e.target.value)} />
                                                <code>{config.primaryColor}</code>
                                            </div>
                                        </div>
                                        <div className="field-group">
                                            <label>Document Header</label>
                                            <div className="luxury-color-picker">
                                                <input type="color" value={config.payslipHeaderColor} onChange={(e) => handleChange('payslipHeaderColor', e.target.value)} />
                                                <code>{config.payslipHeaderColor}</code>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeSection === 'payslip' && (
                                <motion.div key="payslip" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="field-set">
                                    <div className="field-group">
                                        <label><AlignLeft size={14} /> Public Legal Footer</label>
                                        <textarea rows="5" value={config.footerText} onChange={(e) => handleChange('footerText', e.target.value)} />
                                    </div>
                                </motion.div>
                            )}

                            {activeSection === 'email' && (
                                <motion.div key="email" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="field-set">
                                    <div className="field-group">
                                        <label><Hash size={14} /> Transmission Subject</label>
                                        <input type="text" value={config.emailTemplates.payslip.subject} onChange={(e) => handleChange('emailTemplates.payslip.subject', e.target.value)} />
                                    </div>
                                    <div className="field-group">
                                        <label><AlignLeft size={14} /> Elite HTML Template</label>
                                        <textarea rows="15" className="code-font" value={config.emailTemplates.payslip.body} onChange={(e) => handleChange('emailTemplates.payslip.body', e.target.value)} />
                                        <div className="logic-tokens">
                                            <span>{`{{name}}`}</span><span>{`{{month}}`}</span><span>{`{{year}}`}</span><span>{`{{companyName}}`}</span>
                                            <span>{`{{companyLogo}}`}</span><span>{`{{address}}`}</span><span>{`{{website}}`}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="perspective-panel">
                    <div className="perspective-header">
                        <div className="perspective-badge">
                            <Zap size={14} />
                            <span>LIVE {activeSection === 'email' ? 'EMAIL TRANSMISSION' : 'PDF ARTIFACT'} RENDER</span>
                        </div>
                    </div>
                    <div className="perspective-canvas scroll-hide">
                        {activeSection === 'email' ? (
                            <div className="email-master-frame">
                                <div className="email-client-mock">
                                    <div className="client-controls"><span></span><span></span><span></span></div>
                                    <div className="client-subject">
                                        <Mail size={14} />
                                        <span>{replaceVariables(config.emailTemplates.payslip.subject)}</span>
                                    </div>
                                </div>
                                <div className="email-render-surface scroll-hide">
                                    <div className="email-body-render" dangerouslySetInnerHTML={{ __html: replaceVariables(config.emailTemplates.payslip.body) }} />
                                </div>
                            </div>
                        ) : (
                            <div className="payslip-doc card-glass">
                                <div className="p-header" style={{ background: config.payslipHeaderColor, color: headerTextColor }}>
                                    <div className="p-brand">
                                        {config.companyLogo && (
                                            <div className="p-logo-dock">
                                                <img src={config.companyLogo} alt="Logo" />
                                            </div>
                                        )}
                                        <h1 style={{ color: headerTextColor }}>{config.companyName.toUpperCase()}</h1>
                                        <p style={{ fontSize: '8px', opacity: 0.9, marginTop: '4px', color: headerTextColor }}>{config.companyAddress}</p>
                                        <p style={{ fontSize: '8px', opacity: 0.9, color: headerTextColor }}>{config.companyEmail} | {config.companyWebsite}</p>
                                    </div>
                                    <div className="p-badge" style={{ borderColor: headerTextColor, color: headerTextColor }}>OFFICIAL</div>
                                </div>
                                <div className="p-content">
                                    <div className="p-row-meta">
                                        <div className="p-meta-box">
                                            <label><User size={10} /> RECIPIENT</label>
                                            <strong>Alex Sterling</strong>
                                            <span>Senior Solutions Architect | EMP-902</span>
                                        </div>
                                        <div className="p-meta-box text-right">
                                            <label><Calendar size={10} /> PERIOD</label>
                                            <strong>February 2026</strong>
                                            <span>Ref: AUTH-902-X</span>
                                        </div>
                                    </div>
                                    <div className="p-table">
                                        <div className="p-table-head"><span>VALUATION UNIT</span><span>CREDIT</span></div>
                                        <div className="p-table-row"><span>Base Salary</span><strong>₹8,500.00</strong></div>
                                        <div className="p-table-row"><span>Regional Bonus</span><strong>₹1,200.00</strong></div>
                                        <div className="p-table-head mt-4"><span>ADJUSTMENTS</span><span>DEBIT</span></div>
                                        <div className="p-table-row"><span>Statutory Tax</span><strong>₹1,850.00</strong></div>
                                    </div>

                                    <div className="p-signature-box">
                                        <ShieldCheck size={20} className="p-sig-icon" />
                                        <div className="p-sig-label">OFFICIAL BRAND SEAL</div>
                                        <div className="p-sig-verified">SECURELY SIGNED</div>
                                    </div>

                                    <div className="p-total" style={{ borderTop: `3px solid ${config.primaryColor}` }}>
                                        <div className="p-total-label">
                                            <IndianRupee size={16} />
                                            <span>FINAL SETTLEMENT</span>
                                        </div>
                                        <strong style={{ color: config.primaryColor }}>₹7,850.00</strong>
                                    </div>

                                    <div className="p-industrial-footer">
                                        <div className="p-footer-disclaimer">
                                            <strong>SECURELY SIGNED & AUDITED BY {config.companyName.toUpperCase()}</strong>
                                            <p>{config.footerText}</p>
                                        </div>
                                        <div className="p-footer-meta">
                                            Generated on {new Date().toUTCString()} | System V4.0
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .hq-template-editor { padding: 40px; min-height: 94vh; display: flex; flex-direction: column; gap: 40px; font-family: 'Outfit', sans-serif; background: #fdfdfd; }
                .editor-top-bar { display: flex; justify-content: space-between; align-items: flex-end; }
                .branding-meta h1 { font-size: 38px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -2.2px; }
                .badge-luxury { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; background: #1e293b; color: white; border-radius: 100px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
                
                .actions-cluster { display: flex; gap: 16px; }
                .onboard-btn-primary { background: #0f172a; color: white; border: none; padding: 16px 32px; border-radius: 16px; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 12px; box-shadow: 0 15px 30px rgba(15,23,42,0.15); transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .onboard-btn-secondary { padding: 16px 32px; border-radius: 16px; border: 2.5px solid #e2e8f0; background: white; font-weight: 900; color: #475569; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: 0.3s; }
                .onboard-btn-primary:hover { transform: translateY(-3px); box-shadow: 0 20px 40px rgba(15,23,42,0.25); }
                .onboard-btn-secondary:hover { border-color: #0f172a; color: #0f172a; background: #f8fafc; }

                .editor-main-layout { display: grid; grid-template-columns: 460px 1fr; gap: 50px; height: 82vh; }
                .control-panel { background: white; border-radius: 40px; border: 1.5px solid #e2e8f0; display: flex; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,0.02); overflow: hidden; }
                .panel-tabs { display: grid; grid-template-columns: repeat(3, 1fr); padding: 12px; background: #f8fafc; border-bottom: 1.5px solid #e2e8f0; }
                .panel-tabs button { padding: 16px; border: none; background: transparent; color: #94a3b8; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; cursor: pointer; border-radius: 18px; transition: 0.4s; display: flex; align-items: center; justify-content: center; gap: 10px; }
                .panel-tabs button.active { background: white; color: #0f172a; box-shadow: 0 12px 20px rgba(0,0,0,0.06); }

                .control-fields { padding: 40px; overflow-y: auto; }
                .field-set { display: flex; flex-direction: column; gap: 30px; }
                .field-group label { font-size: 11px; font-weight: 950; color: #1e293b; text-transform: uppercase; display: flex; align-items: center; gap: 12px; letter-spacing: 1px; }
                .field-group input, .field-group textarea { padding: 16px 20px; border-radius: 18px; border: 2px solid #f1f5f9; background: #f8fafc; font-size: 14px; font-weight: 600; outline: none; transition: 0.3s; color: #0f172a; }
                .field-group input:focus, .field-group textarea:focus { border-color: #0f172a; background: white; box-shadow: 0 0 0 5px rgba(15,23,42,0.04); }
                
                .perspective-panel { display: flex; flex-direction: column; gap: 24px; position: relative; }
                .perspective-badge { background: #0f172a; color: white; padding: 12px 28px; border-radius: 100px; font-size: 12px; font-weight: 900; display: flex; align-items: center; gap: 12px; box-shadow: 0 15px 30px rgba(0,0,0,0.2); width: fit-content; margin: 0 auto; letter-spacing: 1px; z-index: 10; }
                
                .perspective-canvas { flex: 1; background: #f1f5f9; border-radius: 50px; border: 1.5px solid #e2e8f0; display: flex; justify-content: center; padding: 60px; overflow-y: auto; background-image: radial-gradient(#cbd5e1 1px, transparent 1px); background-size: 28px 28px; }

                /* Elite Email Mockup */
                .email-master-frame { width: 100%; max-width: 680px; display: flex; flex-direction: column; filter: drop-shadow(0 30px 60px rgba(0,0,0,0.12)); }
                .email-client-mock { background: #0f172a; padding: 20px 30px; border-radius: 30px 30px 0 0; display: flex; align-items: center; gap: 30px; border-bottom: 2px solid #1e293b; }
                .client-controls { display: flex; gap: 10px; }
                .client-controls span { width: 12px; height: 12px; border-radius: 50%; display: block; background: #334155; }
                .client-subject { background: #1e293b; flex: 1; border-radius: 12px; padding: 10px 20px; color: #94a3b8; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 12px; }
                .email-render-surface { background: white; border-radius: 0 0 30px 30px; overflow: hidden; border: 1px solid #e2e8f0; border-top: none; }
                .email-body-render { height: 750px; overflow-y: auto; }

                /* Payslip Perspective Styling */
                .payslip-doc { width: 100%; max-width: 580px; background: white; border-radius: 4px; overflow: hidden; height: fit-content; box-shadow: 0 50px 100px rgba(0,0,0,0.1); }
                .p-header { padding: 45px; display: flex; justify-content: space-between; align-items: flex-start; }
                .p-brand h1 { margin: 0; font-size: 28px; font-weight: 950; letter-spacing: -1.8px; }
                .p-brand p { margin: 4px 0 0; font-size: 10px; font-weight: 800; opacity: 0.9; letter-spacing: 0.8px; }
                .p-logo-dock { display: inline-block; background: white; padding: 8px; border-radius: 14px; box-shadow: 0 10px 20px rgba(0,0,0,0.1); margin-bottom: 20px; border: 2px solid rgba(0,0,0,0.03); }
                .p-logo-dock img { width: 60px; height: 60px; object-fit: contain; display: block; }
                .p-badge { border: 2.5px solid; padding: 8px 20px; border-radius: 8px; font-size: 12px; font-weight: 950; text-transform: uppercase; letter-spacing: 2px; }
                .p-content { padding: 60px; }
                .p-row-meta { display: flex; justify-content: space-between; margin-bottom: 50px; }
                .p-meta-box label { display: flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 950; color: #94a3b8; margin-bottom: 10px; letter-spacing: 1.2px; }
                .p-meta-box strong { display: block; font-size: 20px; color: #0f172a; letter-spacing: -0.8px; }
                .p-meta-box span { font-size: 12px; color: #64748b; font-weight: 700; margin-top: 4px; display: block; }
                .p-table-head { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 4px solid #0f172a; font-size: 12px; font-weight: 950; color: #0f172a; text-transform: uppercase; letter-spacing: 1.5px; }
                .p-table-row { display: flex; justify-content: space-between; padding: 18px 0; border-bottom: 2px solid #f1f5f9; font-size: 15px; font-weight: 600; color: #475569; }
                
                .p-signature-box { margin-top: 60px; margin-left: auto; width: 220px; height: 90px; border: 3px dashed #cbd5e1; border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; background: #fafafa; }
                .p-sig-icon { color: #cbd5e1; position: absolute; top: 12px; right: 12px; opacity: 0.6; }
                .p-sig-label { position: absolute; top: 12px; left: 20px; font-size: 8px; font-weight: 950; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; }
                .p-sig-verified { font-size: 15px; font-weight: 950; color: #cbd5e1; opacity: 0.4; letter-spacing: 3px; text-transform: uppercase; }

                .p-total { margin-top: 40px; padding-top: 40px; display: flex; justify-content: space-between; align-items: center; }
                .p-total-label { display: flex; align-items: center; gap: 10px; font-weight: 950; font-size: 14px; color: #0f172a; text-transform: uppercase; letter-spacing: 2px; }
                .p-total strong { font-size: 38px; font-weight: 950; letter-spacing: -2px; }
                
                .p-industrial-footer { margin-top: 80px; border-top: 2.5px solid #f1f5f9; padding-top: 40px; text-align: center; }
                .p-footer-disclaimer strong { display: block; font-size: 11px; color: #0f172a; margin-bottom: 10px; letter-spacing: 1.2px; }
                .p-footer-disclaimer p { font-size: 10px; color: #94a3b8; font-weight: 700; margin: 0; line-height: 1.8; max-width: 440px; margin: 0 auto; }
                .p-footer-meta { margin-top: 25px; font-size: 8px; color: #cbd5e1; font-weight: 900; font-family: 'JetBrains Mono', monospace; letter-spacing: 1.5px; }

                .luxury-color-picker { display: flex; align-items: center; gap: 16px; padding: 14px; background: #f8fafc; border-radius: 18px; border: 2.5px solid #f1f5f9; }
                .luxury-color-picker input { width: 36px; height: 36px; padding: 0; border: none; border-radius: 12px; cursor: pointer; }
                .luxury-color-picker code { font-weight: 900; color: #0f172a; font-size: 14px; letter-spacing: 0.5px; }

                .scroll-hide::-webkit-scrollbar { display: none; }
                .mt-4 { margin-top: 40px; }
                .text-right { text-align: right; }
                .logic-tokens { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px; }
                .logic-tokens span { padding: 8px 16px; background: #f1f5f9; color: #0f172a; border-radius: 12px; font-size: 12px; font-weight: 900; font-family: monospace; border: 2px solid rgba(15, 23, 42, 0.05); }
            `}</style>
        </div>
    );
};

export default TemplateEditor;
