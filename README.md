<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Employee Leave & Payroll Management System</title>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --bg-primary: #ffffff;
      --bg-secondary: #f5f5f3;
      --text-primary: #1a1a18;
      --text-secondary: #6b6b67;
      --border: rgba(0,0,0,0.12);
      --border-md: rgba(0,0,0,0.22);
      --radius-md: 8px;
      --radius-lg: 12px;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg-primary: #1c1c1a;
        --bg-secondary: #262624;
        --text-primary: #f0ede8;
        --text-secondary: #9a9894;
        --border: rgba(255,255,255,0.1);
        --border-md: rgba(255,255,255,0.2);
      }
    }

    body {
      background: var(--bg-secondary);
      color: var(--text-primary);
      font-family: 'Syne', sans-serif;
      min-height: 100vh;
    }

    .wrap {
      max-width: 900px;
      margin: 0 auto;
      padding: 2.5rem 1.25rem 4rem;
    }

    /* ── Hero ── */
    .hero {
      border: 0.5px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--bg-primary);
      padding: 2.5rem 2rem 2rem;
      margin-bottom: 1.5rem;
      position: relative;
      overflow: hidden;
    }

    .hero-accent {
      position: absolute;
      top: 0; right: 0;
      width: 280px; height: 280px;
      background: conic-gradient(from 220deg at 80% 20%, #CECBF6 0deg, #9FE1CB 90deg, #B5D4F4 180deg, transparent 280deg);
      opacity: 0.15;
      border-radius: 0 var(--radius-lg) 0 50%;
      pointer-events: none;
    }

    .badge-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 1.25rem; }

    .badge {
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 500;
      padding: 3px 10px;
      border-radius: 100px;
      letter-spacing: 0.02em;
    }

    .badge-purple { background: #EEEDFE; color: #3C3489; }
    .badge-teal   { background: #E1F5EE; color: #0F6E56; }
    .badge-blue   { background: #E6F1FB; color: #185FA5; }
    .badge-coral  { background: #FAECE7; color: #993C1D; }
    .badge-amber  { background: #FAEEDA; color: #854F0B; }

    .hero h1 {
      font-size: clamp(1.8rem, 5vw, 2.6rem);
      font-weight: 800;
      line-height: 1.12;
      letter-spacing: -0.025em;
      margin-bottom: 0.75rem;
    }

    .hero h1 span { color: #534AB7; }

    .hero-desc {
      font-size: 15px;
      color: var(--text-secondary);
      line-height: 1.7;
      max-width: 560px;
      margin-bottom: 1.5rem;
    }

    .cta-row { display: flex; gap: 10px; flex-wrap: wrap; }

    .btn {
      font-family: 'Syne', sans-serif;
      font-size: 13px;
      font-weight: 500;
      padding: 9px 20px;
      border-radius: var(--radius-md);
      border: 0.5px solid var(--border-md);
      background: transparent;
      color: var(--text-primary);
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      transition: background 0.15s;
    }

    .btn:hover { background: var(--bg-secondary); }

    .btn-primary {
      background: #534AB7;
      color: #EEEDFE;
      border-color: #534AB7;
    }

    .btn-primary:hover { background: #3C3489; border-color: #3C3489; }

    /* ── Stats ── */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      background: var(--bg-primary);
      border: 0.5px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1rem;
    }

    .stat-label {
      font-size: 12px;
      color: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace;
      margin-bottom: 4px;
    }

    .stat-val {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .c-purple { color: #534AB7; }
    .c-teal   { color: #0F6E56; }
    .c-blue   { color: #185FA5; }
    .c-coral  { color: #993C1D; }
    .c-amber  { color: #854F0B; }

    /* ── Two-col grid ── */
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    @media (max-width: 580px) { .two-col { grid-template-columns: 1fr; } }

    /* ── Cards ── */
    .card {
      background: var(--bg-primary);
      border: 0.5px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
    }

    .full-card {
      background: var(--bg-primary);
      border: 0.5px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .card-title {
      font-size: 11px;
      font-weight: 500;
      color: var(--text-secondary);
      font-family: 'JetBrains Mono', monospace;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 1rem;
    }

    /* ── Feature list ── */
    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 8px 0;
      border-bottom: 0.5px solid var(--border);
      font-size: 13.5px;
    }

    .feature-item:last-child { border-bottom: none; }

    .feat-icon {
      width: 22px;
      height: 22px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .icon-purple { background: #EEEDFE; color: #534AB7; }
    .icon-teal   { background: #E1F5EE; color: #0F6E56; }
    .icon-blue   { background: #E6F1FB; color: #185FA5; }
    .icon-coral  { background: #FAECE7; color: #993C1D; }
    .icon-amber  { background: #FAEEDA; color: #854F0B; }

    .feat-sub { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }

    /* ── Tech stack ── */
    .stack-section { margin-bottom: 10px; }
    .stack-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; }
    .stack-grid { display: flex; flex-wrap: wrap; gap: 8px; }

    .stack-pill {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 500;
      padding: 5px 12px;
      border-radius: 100px;
      border: 0.5px solid var(--border);
      background: var(--bg-secondary);
      color: var(--text-primary);
    }

    /* ── API endpoints ── */
    .endpoint-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 0;
      border-bottom: 0.5px solid var(--border);
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
    }

    .endpoint-row:last-child { border-bottom: none; }

    .method {
      font-size: 10px;
      font-weight: 500;
      padding: 2px 7px;
      border-radius: 4px;
      min-width: 38px;
      text-align: center;
    }

    .m-get  { background: #E1F5EE; color: #0F6E56; }
    .m-post { background: #E6F1FB; color: #185FA5; }
    .m-put  { background: #FAEEDA; color: #854F0B; }
    .m-del  { background: #FCEBEB; color: #A32D2D; }

    /* ── Setup steps ── */
    .setup-step {
      display: flex;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 0.5px solid var(--border);
      align-items: flex-start;
    }

    .setup-step:last-child { border-bottom: none; }

    .step-num {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #EEEDFE;
      color: #534AB7;
      font-size: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .step-title { font-size: 14px; font-weight: 500; margin-bottom: 6px; }

    .step-code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: var(--text-secondary);
      background: var(--bg-secondary);
      padding: 8px 12px;
      border-radius: var(--radius-md);
      border: 0.5px solid var(--border);
      line-height: 1.8;
      white-space: pre;
      overflow-x: auto;
    }

    /* ── Roadmap ── */
    .future-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 7px 0;
      border-bottom: 0.5px solid var(--border);
      font-size: 13.5px;
    }

    .future-item:last-child { border-bottom: none; }

    .future-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--border-md);
      flex-shrink: 0;
    }

    /* ── Contact ── */
    .contact-card { display: flex; align-items: center; gap: 14px; }

    .avatar {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: #EEEDFE;
      color: #534AB7;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .contact-name { font-size: 15px; font-weight: 500; }
    .contact-meta { font-size: 13px; color: var(--text-secondary); margin-top: 3px; }
    .contact-link { color: #534AB7; text-decoration: none; }
    .contact-link:hover { text-decoration: underline; }

    .right-col { display: flex; flex-direction: column; gap: 1.5rem; }

    /* ── Footer ── */
    .footer {
      text-align: center;
      padding: 1.5rem 0 0;
      font-size: 13px;
      color: var(--text-secondary);
    }
  </style>
</head>
<body>
  <div class="wrap">

    <!-- Hero -->
    <div class="hero">
      <div class="hero-accent"></div>
      <div class="badge-row">
        <span class="badge badge-purple">MERN Stack</span>
        <span class="badge badge-teal">ISC License</span>
        <span class="badge badge-blue">JWT Auth</span>
        <span class="badge badge-coral">Google OAuth 2.0</span>
        <span class="badge badge-amber">v1.0</span>
      </div>
      <h1>Employee Leave &amp;<br><span>Payroll System</span></h1>
      <p class="hero-desc">A full-stack enterprise workforce management platform that eliminates manual HR processes — attendance, leave tracking, and payroll automation in one centralized application.</p>
      <div class="cta-row">
        <a class="btn btn-primary" href="https://github.com/your-username/payroll-system" target="_blank">Clone repository ↗</a>
        <a class="btn" href="#setup">Setup guide</a>
        <a class="btn" href="#api">API reference</a>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-label">Tech layers</div>
        <div class="stat-val c-purple">5</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">API endpoints</div>
        <div class="stat-val c-teal">10+</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">User roles</div>
        <div class="stat-val c-blue">2</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Roadmap items</div>
        <div class="stat-val c-coral">5</div>
      </div>
    </div>

    <!-- Features -->
    <div class="two-col">
      <div class="card">
        <div class="card-title">Admin features</div>
        <div class="feature-item">
          <div class="feat-icon icon-purple">+</div>
          <div>Employee data management<div class="feat-sub">Add, update, delete records</div></div>
        </div>
        <div class="feature-item">
          <div class="feat-icon icon-teal">✓</div>
          <div>Leave approval workflow<div class="feat-sub">Approve or reject requests</div></div>
        </div>
        <div class="feature-item">
          <div class="feat-icon icon-blue">$</div>
          <div>Automated payroll processing<div class="feat-sub">Generate &amp; email PDF payslips</div></div>
        </div>
        <div class="feature-item">
          <div class="feat-icon icon-coral">~</div>
          <div>Analytics dashboard<div class="feat-sub">Insights &amp; reporting</div></div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Employee features</div>
        <div class="feature-item">
          <div class="feat-icon icon-blue">@</div>
          <div>Personal dashboard<div class="feat-sub">Attendance &amp; leave balance</div></div>
        </div>
        <div class="feature-item">
          <div class="feat-icon icon-amber">+</div>
          <div>Leave application<div class="feat-sub">Multiple leave types supported</div></div>
        </div>
        <div class="feature-item">
          <div class="feat-icon icon-teal">↻</div>
          <div>Request status tracking<div class="feat-sub">Real-time updates</div></div>
        </div>
        <div class="feature-item">
          <div class="feat-icon icon-purple">↓</div>
          <div>Payslip access<div class="feat-sub">View &amp; download PDF payslips</div></div>
        </div>
      </div>
    </div>

    <!-- Tech Stack -->
    <div class="full-card">
      <div class="card-title">Tech stack</div>
      <div class="stack-section">
        <div class="stack-label">Frontend</div>
        <div class="stack-grid">
          <span class="stack-pill">React.js (Vite)</span>
          <span class="stack-pill">Framer Motion</span>
          <span class="stack-pill">Recharts</span>
          <span class="stack-pill">CSS</span>
        </div>
      </div>
      <div class="stack-section" style="margin-top:12px;">
        <div class="stack-label">Backend</div>
        <div class="stack-grid">
          <span class="stack-pill">Node.js</span>
          <span class="stack-pill">Express.js</span>
          <span class="stack-pill">Passport.js</span>
          <span class="stack-pill">PDFKit</span>
          <span class="stack-pill">Nodemailer</span>
        </div>
      </div>
      <div class="stack-section" style="margin-top:12px;">
        <div class="stack-label">Data &amp; Auth</div>
        <div class="stack-grid">
          <span class="stack-pill">MongoDB</span>
          <span class="stack-pill">Mongoose</span>
          <span class="stack-pill">JWT</span>
          <span class="stack-pill">Google OAuth 2.0</span>
          <span class="stack-pill">Axios</span>
        </div>
      </div>
    </div>

    <!-- API + Side cards -->
    <div class="two-col">
      <div class="card" id="api">
        <div class="card-title">API endpoints</div>
        <div class="endpoint-row"><span class="method m-post">POST</span><span>/api/auth/google</span></div>
        <div class="endpoint-row"><span class="method m-get">GET</span><span>/api/auth/logout</span></div>
        <div class="endpoint-row"><span class="method m-get">GET</span><span>/api/employees</span></div>
        <div class="endpoint-row"><span class="method m-post">POST</span><span>/api/employees</span></div>
        <div class="endpoint-row"><span class="method m-put">PUT</span><span>/api/employees/:id</span></div>
        <div class="endpoint-row"><span class="method m-del">DEL</span><span>/api/employees/:id</span></div>
        <div class="endpoint-row"><span class="method m-get">GET</span><span>/api/leaves</span></div>
        <div class="endpoint-row"><span class="method m-post">POST</span><span>/api/leaves</span></div>
        <div class="endpoint-row"><span class="method m-put">PUT</span><span>/api/leaves/:id</span></div>
        <div class="endpoint-row"><span class="method m-get">GET</span><span>/api/payroll</span></div>
        <div class="endpoint-row"><span class="method m-post">POST</span><span>/api/payroll/process</span></div>
        <div class="endpoint-row"><span class="method m-get">GET</span><span>/api/payroll/payslip/:id</span></div>
      </div>

      <div class="right-col">
        <div class="card">
          <div class="card-title">Roadmap</div>
          <div class="future-item"><div class="future-dot"></div>Biometric / Face Recognition</div>
          <div class="future-item"><div class="future-dot"></div>Mobile application</div>
          <div class="future-item"><div class="future-dot"></div>Advanced analytics dashboard</div>
          <div class="future-item"><div class="future-dot"></div>Multi-organization support</div>
          <div class="future-item"><div class="future-dot"></div>AI salary prediction</div>
        </div>

        <div class="card">
          <div class="card-title">Contact</div>
          <div class="contact-card">
            <div class="avatar">HM</div>
            <div>
              <div class="contact-name">Harsh Manmode</div>
              <div class="contact-meta"><a class="contact-link" href="mailto:harshmanmode79@gmail.com">harshmanmode79@gmail.com</a></div>
              <div class="contact-meta"><a class="contact-link" href="https://github.com/your-username" target="_blank">GitHub profile ↗</a></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Setup -->
    <div class="full-card" id="setup">
      <div class="card-title">Quick setup</div>
      <div class="setup-step">
        <div class="step-num">1</div>
        <div>
          <div class="step-title">Clone the repository</div>
          <div class="step-code">git clone https://github.com/your-username/payroll-system.git
cd payroll-system</div>
        </div>
      </div>
      <div class="setup-step">
        <div class="step-num">2</div>
        <div>
          <div class="step-title">Backend setup</div>
          <div class="step-code">cd Backend && npm install
cp .env.example .env && npm run dev</div>
        </div>
      </div>
      <div class="setup-step">
        <div class="step-num">3</div>
        <div>
          <div class="step-title">Frontend setup</div>
          <div class="step-code">cd Frontend && npm install
cp .env.example .env && npm run dev</div>
        </div>
      </div>
      <div class="setup-step">
        <div class="step-num">4</div>
        <div>
          <div class="step-title">Configure environment variables</div>
          <div class="step-code">MONGODB_URI, JWT_SECRET, GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET, SMTP_USER, SMTP_PASS</div>
        </div>
      </div>
    </div>

    <div class="footer">Licensed under ISC &nbsp;·&nbsp; Contributions welcome &nbsp;·&nbsp; Fork, branch, PR</div>
  </div>
</body>
</html>
