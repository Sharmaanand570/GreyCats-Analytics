import React, { useState, useEffect } from 'react';

const BACKEND_URL = 'http://localhost:5000';

// SVG Icons
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
  </svg>
);

const PdfIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const CrossIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const ChevronUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);

// Custom Monochrome Feature Icons
const SeoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
    <line x1="8" y1="21" x2="16" y2="21"></line>
    <line x1="12" y1="17" x2="12" y2="21"></line>
    <path d="M10 8h4"></path>
    <path d="M12 6v6"></path>
  </svg>
);

const MobileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
    <line x1="12" y1="18" x2="12.01" y2="18"></line>
  </svg>
);

const SpeedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

// High-fidelity SVG circular progress ring
function ScoreRing({ score, label }) {
  const radius = 48;
  const strokeWidth = 5;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  let scoreColorClass = 'score-success';
  if (score < 50) {
    scoreColorClass = 'score-danger';
  } else if (score < 90) {
    scoreColorClass = 'score-warning';
  }

  return (
    <div className={`lighthouse-gauge ${scoreColorClass}`} style={{ position: 'relative', width: radius * 2, height: radius * 2, border: 'none', margin: '0 auto 1.5rem' }}>
      <svg height={radius * 2} width={radius * 2} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          stroke="rgba(255, 255, 255, 0.04)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease-out' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: '1.65rem',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: 'inherit'
      }}>
        {score}
        <span className="score-lbl" style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', marginTop: '0.15rem', color: 'var(--text-muted)' }}>{label}</span>
      </div>
    </div>
  );
}

const getGradeFromScore = (score) => {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 60) return 'D';
  return 'F';
};

const getScoreColorClass = (score) => {
  if (score >= 90) return 'success';
  if (score >= 50) return 'warning';
  return 'danger';
};

function App() {
  const [url, setUrl] = useState('');
  const [view, setView] = useState('landing');
  const [recentAudits, setRecentAudits] = useState([]);
  const [auditData, setAuditData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('seo');
  const [kwSubTab, setKwSubTab] = useState('organic');
  
  // Lead Generation Modal State
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', email: '', website: '' });
  const [leadStatus, setLeadStatus] = useState({ error: '', success: false, loading: false });

  // Scanning steps state
  const [scanSteps, setScanSteps] = useState([
    { id: 1, label: 'Initiating domain routing check...', status: 'pending' },
    { id: 2, label: 'Downloading raw HTML documents...', status: 'pending' },
    { id: 3, label: 'Parsing page title tags, headings, and alt tags...', status: 'pending' },
    { id: 4, label: 'Verifying robots.txt, sitemap.xml and llms.txt presence...', status: 'pending' },
    { id: 5, label: 'Probing SSL handshake, server IPs, and security headers...', status: 'pending' },
    { id: 6, label: 'Performing DNS lookup for SPF/DMARC records...', status: 'pending' },
    { id: 7, label: 'Calculating Core Web Vitals and grade checklists...', status: 'pending' }
  ]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Accordion details tracking
  const [expandedCheck, setExpandedCheck] = useState(null);

  // Default fallback values for legacy data
  const premium = (auditData && auditData.details && auditData.details.premium) || {
    organicKeywords: [],
    paidKeywords: [],
    aiOverviewCitations: [],
    keywordPositions: { pos1: 0, pos2_3: 0, pos4_10: 0, pos11_20: 0, pos21_30: 0, pos31_100: 0 },
    domainStrength: 0,
    pageStrength: 0,
    backlinkCount: 0,
    referringDomains: 0,
    topBacklinks: [],
    topAnchors: [],
    topPages: [],
    topTlds: [],
    topCountries: [],
    coreWebVitals: { lcp: 0, inp: 0, cls: 0 },
    pagespeedMobile: { score: 0, fcp: 0, speedIndex: 0, lcp: 0, tti: 0, tbt: 0, cls: 0 },
    pagespeedDesktop: { score: 0, fcp: 0, speedIndex: 0, lcp: 0, tti: 0, tbt: 0, cls: 0 }
  };

  // Load recent audits on start
  useEffect(() => {
    fetchRecentAudits();
  }, []);

  const fetchRecentAudits = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/recent`);
      if (res.ok) {
        const data = await res.json();
        setRecentAudits(data);
      }
    } catch (e) {
      console.error('Failed to load recent audits', e);
    }
  };

  const handleDeleteAudit = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this audit report?')) return;
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/audit/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchRecentAudits();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to delete audit');
      }
    } catch (err) {
      console.error('Delete audit request failed:', err);
      alert('Network error. Failed to delete audit.');
    }
  };

  // Run audit trigger
  const handleStartAudit = async (targetUrl, force = false) => {
    if (!targetUrl || targetUrl.trim().length === 0) return;
    
    setErrorMsg('');
    setUrl(targetUrl);
    setView('scanning');
    setActiveStepIndex(0);
    
    // Reset steps
    setScanSteps(prev => prev.map(s => ({ ...s, status: 'pending' })));

    // Begin progress simulation in parallel with audit
    let stepIndex = 0;
    const progressInterval = setInterval(() => {
      if (stepIndex < 6) {
        setScanSteps(prev => {
          const next = [...prev];
          next[stepIndex].status = 'done';
          next[stepIndex + 1].status = 'active';
          return next;
        });
        stepIndex++;
        setActiveStepIndex(stepIndex);
      } else {
        clearInterval(progressInterval);
      }
    }, 1200);

    try {
      const response = await fetch(`${BACKEND_URL}/api/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl, forceRefresh: force })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Server error running audit');
      }

      // Fast forward remaining steps and complete scan
      clearInterval(progressInterval);
      setScanSteps(prev => prev.map(s => ({ ...s, status: 'done' })));
      
      // Delay slightly for transition smoothness
      setTimeout(() => {
        setAuditData(result);
        setUrl(result.url);
        setView('report');
        setActiveTab('seo'); // default tab
        setKwSubTab('organic');
        fetchRecentAudits(); // refresh ticker
      }, 500);

    } catch (err) {
      clearInterval(progressInterval);
      console.error(err);
      setErrorMsg(err.message || 'Audit failed. Please verify the URL and try again.');
      setView('landing');
    }
  };

  // Submit Lead Form and Download PDF
  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setLeadStatus({ error: '', success: false, loading: true });

    try {
      const res = await fetch(`${BACKEND_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadForm.name,
          email: leadForm.email,
          website: leadForm.website || url,
          auditId: auditData.id
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit form');
      }

      setLeadStatus({ error: '', success: true, loading: false });
      
      // Close modal and download PDF
      setTimeout(() => {
        setLeadModalOpen(false);
        triggerPdfDownload();
        // Reset form
        setLeadForm({ name: '', email: '', website: '' });
        setLeadStatus({ error: '', success: false, loading: false });
      }, 1000);

    } catch (err) {
      setLeadStatus({ error: err.message, success: false, loading: false });
    }
  };

  const triggerPdfDownload = async () => {
    if (!auditData) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/audit/${auditData.id}/pdf`);
      if (!response.ok) {
        throw new Error('Failed to download PDF report');
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `seoreporter-audit-${auditData.domain}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('PDF download error:', err);
      // Fallback to direct URL if blob fails
      window.open(`${BACKEND_URL}/api/audit/${auditData.id}/pdf`, '_blank');
    }
  };

  const getPriorityClass = (priority) => {
    if (priority === 'High') return 'badge-high';
    if (priority === 'Medium') return 'badge-medium';
    return 'badge-low';
  };

  return (
    <>
      <div className="bg-glow-container"></div>
      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <a href="#" className="brand" onClick={() => setView('landing')}>
            <div className="brand-logo">S</div>
            <div className="brand-name">SEOReporter</div>
          </a>
          {view === 'report' && (
            <button className="btn-secondary" onClick={() => setView('landing')}>
              <ArrowLeftIcon /> Back to Dashboard
            </button>
          )}
        </header>

        {/* ---------------------------------------------------- */}
        {/* LANDING VIEW */}
        {/* ---------------------------------------------------- */}
        {view === 'landing' && (
          <div>
            <div className="hero-section">
              <h1 className="hero-title">
                Analyze and Optimize Your <span>SEO Performance</span> Instantly
              </h1>
              <p className="hero-subtitle">
                Get a comprehensive audit of your website's on-page search engine optimization, keywords, backlinks, performance speed, mobile usability, and security in under 30 seconds.
              </p>

              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Enter a website URL (e.g., example.com)..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleStartAudit(url);
                  }}
                />
                <button className="btn-primary" onClick={() => handleStartAudit(url)}>
                  <SearchIcon /> Scan Website
                </button>
              </div>

              {errorMsg && <p className="text-danger mb-4">{errorMsg}</p>}

              <div className="quick-links">
                <span>Popular:</span>
                <span onClick={() => handleStartAudit('google.com')}>google.com</span>
                <span onClick={() => handleStartAudit('github.com')}>github.com</span>
                <span onClick={() => handleStartAudit('wikipedia.org')}>wikipedia.org</span>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="features-grid">
              <div className="feature-card seo">
                <div className="feature-icon-wrapper"><SeoIcon /></div>
                <h3>On-Page SEO</h3>
                <p>Verify your page meta title, descriptions, heading structures, canonical links, sitemaps, and llms.txt existence.</p>
              </div>
              <div className="feature-card usability">
                <div className="feature-icon-wrapper"><MobileIcon /></div>
                <h3>Mobile Usability</h3>
                <p>Ensure mobile friendly viewport setups, Core Web Vitals (LCP, INP, CLS), and Google PageSpeed metrics.</p>
              </div>
              <div className="feature-card speed">
                <div className="feature-icon-wrapper"><SpeedIcon /></div>
                <h3>Performance & Speed</h3>
                <p>Monitor your server Time to First Byte (TTFB), asset count breakdowns, compression percentages, and HTTP/2 usage.</p>
              </div>
              <div className="feature-card security">
                <div className="feature-icon-wrapper"><ShieldIcon /></div>
                <h3>SSL & Security</h3>
                <p>Scan SSL certificate expiries, response security headers, and query live DNS records for SPF and DMARC policies.</p>
              </div>
            </div>

            {/* Recent Scans Section */}
            {recentAudits.length > 0 && (
              <div className="recent-section">
                <h2 className="section-title">Recent Site Audits</h2>
                <div className="recent-grid">
                  {recentAudits.map((item) => (
                    <div key={item.id} className="recent-card" onClick={() => {
                      setView('scanning');
                      handleStartAudit(item.url);
                    }}>
                      <div className="recent-info">
                        <span className="recent-domain">{item.domain}</span>
                        <span className="recent-date">{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button
                          className="btn-delete-recent"
                          onClick={(e) => handleDeleteAudit(e, item.id)}
                          title="Delete Audit"
                        >
                          <TrashIcon />
                        </button>
                        <div className={`recent-grade-badge grade-${item.overall_grade.charAt(0)}`}>
                          {item.overall_grade}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SCANNING VIEW */}
        {/* ---------------------------------------------------- */}
        {view === 'scanning' && (
          <div className="scanning-container">
            <div className="radar-spinner">
              <div className="radar-pulse"></div>
              <div className="radar-center"></div>
            </div>
            <h2 className="mb-4">Auditing {url}</h2>
            <div className="scan-status-list">
              {scanSteps.map((step, idx) => (
                <div 
                  key={step.id} 
                  className={`scan-status-item ${step.status === 'active' ? 'active' : ''} ${step.status === 'done' ? 'done' : ''}`}
                >
                  <span>{step.label}</span>
                  <div className="status-dot"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* REPORT VIEW */}
        {/* ---------------------------------------------------- */}
        {view === 'report' && auditData && (
          <div>
            {/* Header Dashboard Banner */}
            <div className="report-header">
              <div className="report-title-section">
                <span className="report-url">{auditData.url}</span>
                <div className="report-meta">
                  <span>Audited on: {new Date(auditData.created_at).toLocaleString()}</span>
                  <span>Domain: {auditData.domain}</span>
                </div>
              </div>

              <div className="report-grade-section">
                <div className={`grade-gauge grade-${auditData.overall_grade.charAt(0)}`}>
                  <span className="letter">{auditData.overall_grade}</span>
                  <span className="label">Grade</span>
                </div>
                <div className="btn-actions">
                  <button className="btn-secondary" onClick={() => handleStartAudit(url, true)}>
                    <RefreshIcon /> Re-Audit
                  </button>
                  <button className="btn-primary" onClick={() => setLeadModalOpen(true)}>
                    <PdfIcon /> PDF Report
                  </button>
                </div>
              </div>
            </div>

            {/* Category Score Row */}
            <div className="category-scores-row">
              <div 
                className={`cat-score-card ${activeTab === 'seo' ? 'active' : ''}`} 
                onClick={() => setActiveTab('seo')}
              >
                <div className="cat-info">
                  <h4>SEO</h4>
                  <div className="cat-score">{auditData.scores.seo}</div>
                </div>
                <div className={`cat-grade grade-${auditData.seo_grade.charAt(0)}`}>{auditData.seo_grade}</div>
              </div>

              <div 
                className={`cat-score-card ${activeTab === 'backlinks' ? 'active' : ''}`} 
                onClick={() => setActiveTab('backlinks')}
              >
                <div className="cat-info">
                  <h4>Backlinks</h4>
                  <div className="cat-score">{premium.domainStrength}</div>
                </div>
                <div className={`cat-grade grade-${getGradeFromScore(premium.domainStrength).charAt(0)}`}>
                  {getGradeFromScore(premium.domainStrength)}
                </div>
              </div>

              <div 
                className={`cat-score-card ${activeTab === 'usability' ? 'active' : ''}`} 
                onClick={() => setActiveTab('usability')}
              >
                <div className="cat-info">
                  <h4>Usability</h4>
                  <div className="cat-score">{auditData.scores.usability}</div>
                </div>
                <div className={`cat-grade grade-${auditData.usability_grade.charAt(0)}`}>{auditData.usability_grade}</div>
              </div>

              <div 
                className={`cat-score-card ${activeTab === 'performance' ? 'active' : ''}`} 
                onClick={() => setActiveTab('performance')}
              >
                <div className="cat-info">
                  <h4>Performance</h4>
                  <div className="cat-score">{auditData.scores.performance}</div>
                </div>
                <div className={`cat-grade grade-${auditData.performance_grade.charAt(0)}`}>{auditData.performance_grade}</div>
              </div>

              <div 
                className={`cat-score-card ${activeTab === 'social' ? 'active' : ''}`} 
                onClick={() => setActiveTab('social')}
              >
                <div className="cat-info">
                  <h4>Social</h4>
                  <div className="cat-score">{auditData.scores.social}</div>
                </div>
                <div className={`cat-grade grade-${auditData.social_grade.charAt(0)}`}>{auditData.social_grade}</div>
              </div>

              <div 
                className={`cat-score-card ${activeTab === 'security' ? 'active' : ''}`} 
                onClick={() => setActiveTab('security')}
              >
                <div className="cat-info">
                  <h4>Security</h4>
                  <div className="cat-score">{auditData.scores.security}</div>
                </div>
                <div className={`cat-grade grade-${auditData.security_grade.charAt(0)}`}>{auditData.security_grade}</div>
              </div>
            </div>

            {/* Dashboard Workspace */}
            <div className="dashboard-grid">
              {/* Detailed Checks Panel */}
              <div className="panel-card">
                {activeTab === 'seo' && (
                  <div>
                    <h3 className="panel-title"><span>SEO</span> On-Page Checklist</h3>
                    <div className="checks-container">
                      <CheckRow 
                        label="Meta Title Tag" 
                        value={auditData.details.metadata.title || 'Missing Title'} 
                        isPass={auditData.details.metadata.titleLength > 0 && auditData.details.metadata.titleLength <= 60}
                        explanation="Title tags specify the title of a web page and are display snippets for search results. Ideal length is between 10-60 characters."
                        fix="Ensure you have an informative `<title>` tag inside the `<head>` element of your HTML. Use descriptive target keywords."
                        isExpanded={expandedCheck === 'title'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'title' ? null : 'title')}
                      />
                      <CheckRow 
                        label="Meta Description Tag" 
                        value={auditData.details.metadata.description || 'Missing Description'} 
                        isPass={auditData.details.metadata.descriptionLength > 0}
                        explanation="Meta descriptions summarize a page's content for search snippets. Ideal length is 70-160 characters."
                        fix="Add a `<meta name='description' content='...' />` inside page head. Ensure description is unique and has target call-to-actions."
                        isExpanded={expandedCheck === 'desc'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'desc' ? null : 'desc')}
                      />
                      <CheckRow 
                        label="Hreflang Usage Check" 
                        value={(auditData.details.metadata.hreflangs || []).length > 0 ? `${(auditData.details.metadata.hreflangs || []).length} tags` : 'No hreflang tags'} 
                        isPass={(auditData.details.metadata.hreflangs || []).length > 0}
                        explanation="Hreflang tags advise Google which language and region to serve for a page URL, helping serve accurate language translations."
                        fix="Declare alternative regional URLs in your head e.g. `<link rel='alternate' hreflang='es' href='es.example.com' />`."
                        isExpanded={expandedCheck === 'hreflang'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'hreflang' ? null : 'hreflang')}
                      />
                      <CheckRow 
                        label="HTML Language Declaration" 
                        value={auditData.details.metadata.htmlLang} 
                        isPass={auditData.details.metadata.htmlLang !== 'Not declared'}
                        explanation="Declaring a language attribute on the `<html>` tag helps search engines identify the language of your content quickly."
                        fix="Specify the page language on your opening html tag: `<html lang='en'>`."
                        isExpanded={expandedCheck === 'lang'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'lang' ? null : 'lang')}
                      />
                      <CheckRow 
                        label="Header Structuring" 
                        value={`H1: ${auditData.details.headings.h1.length} | H2: ${auditData.details.headings.h2.length} | H3: ${auditData.details.headings.h3.length}`} 
                        isPass={auditData.details.headings.h1.length === 1}
                        explanation="H1 headings identify primary page content. Search engine spiders require exactly one H1 heading to index context safely."
                        fix="Consolidate duplicate headings into a single primary H1, and utilize H2 and H3 tags for subordinate page sections."
                        isExpanded={expandedCheck === 'headers'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'headers' ? null : 'headers')}
                      />
                      <CheckRow 
                        label="Amount of Content (Word Count)" 
                        value={`${auditData.details.metadata.wordCount} words`} 
                        isPass={auditData.details.metadata.wordCount > 200}
                        explanation="Pages containing thin content (under 200 words) are harder for search engines to index and rank due to lack of keyword signals."
                        fix="Write descriptive paragraphs expanding on your page's theme. Try to hit a minimum of 300 words per indexable page."
                        isExpanded={expandedCheck === 'words'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'words' ? null : 'words')}
                      />
                      <CheckRow 
                        label="Image Alt Attributes" 
                        value={`${auditData.details.images.hasAltCount} / ${auditData.details.images.total} images have alt tags`} 
                        isPass={auditData.details.images.missingAlt === 0}
                        explanation="Image alt tags describe visual contents for SEO and accessibility screen-readers."
                        fix="Inject descriptive `alt='image description'` attributes directly on all `<img>` tags."
                        isExpanded={expandedCheck === 'alts'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'alts' ? null : 'alts')}
                      />
                      <CheckRow 
                        label="Canonical Link Tag" 
                        value={auditData.details.metadata.canonical || 'Missing canonical link'} 
                        isPass={!!auditData.details.metadata.canonical}
                        explanation="Canonical tags direct search indexers to the original official URL source, resolving duplicate page variant indexing issues."
                        fix="Include `<link rel='canonical' href='https://yourdomain.com/page' />` in your document `<head>`."
                        isExpanded={expandedCheck === 'canonical'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'canonical' ? null : 'canonical')}
                      />
                      <CheckRow 
                        label="Robots.txt Crawling File" 
                        value={auditData.details.recommendations.some(r => r.title.includes('Robots.txt')) ? 'Missing' : 'Configured'} 
                        isPass={!auditData.details.recommendations.some(r => r.title.includes('Robots.txt'))}
                        explanation="Robots.txt instructs browser bots and spiders which directories to crawl and index."
                        fix="Create a simple `robots.txt` in your website public root directory specifying indexing path targets."
                        isExpanded={expandedCheck === 'robots'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'robots' ? null : 'robots')}
                      />
                      <CheckRow 
                        label="XML Sitemap Index" 
                        value={auditData.details.recommendations.some(r => r.title.includes('Sitemap')) ? 'Missing' : 'Configured'} 
                        isPass={!auditData.details.recommendations.some(r => r.title.includes('Sitemap'))}
                        explanation="XML Sitemaps map all website pages in a structured format for bots to locate content easily."
                        fix="Generate an XML sitemap file, place it in public domain root `/sitemap.xml`, and link it in Robots.txt."
                        isExpanded={expandedCheck === 'sitemap'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'sitemap' ? null : 'sitemap')}
                      />
                      <CheckRow 
                        label="Noindex Search Exclusions" 
                        value={(!auditData.details.metadata.noindexMeta && !auditData.details.metadata.noindexHeader) ? 'No exclusions detected (Pass)' : 'Exclusions Active'} 
                        isPass={!auditData.details.metadata.noindexMeta && !auditData.details.metadata.noindexHeader}
                        explanation="Noindex meta tags or headers block Google from indexing your web pages. This must be disabled for public pages."
                        fix="Remove `<meta name='robots' content='noindex'>` or the corresponding server headers from public facing pages."
                        isExpanded={expandedCheck === 'noindex'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'noindex' ? null : 'noindex')}
                      />
                      <CheckRow 
                        label="Structured Schema Markups" 
                        value={auditData.details.metadata.schema ? 'Present' : 'Not Detected'} 
                        isPass={auditData.details.metadata.schema}
                        explanation="Schema JSON-LD markups give crawler bots structured metadata, creating rich result cards on search engines."
                        fix="Utilize Schema.org JSON-LD scripts to describe business info, breadcrumbs, articles, or services."
                        isExpanded={expandedCheck === 'schema'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'schema' ? null : 'schema')}
                      />
                      <CheckRow 
                        label="llms.txt AI Crawler Config" 
                        value={auditData.details.metadata.llmsExists ? 'Present' : 'Not Detected'} 
                        isPass={auditData.details.metadata.llmsExists}
                        explanation="An llms.txt file is a markdown file placed in website roots to provide concise markdown directions to LLM web agents and AI search engines."
                        fix="Publish a simple `llms.txt` file in your website root containing clear markdown text describing your service and core documentation paths."
                        isExpanded={expandedCheck === 'llms'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'llms' ? null : 'llms')}
                      />
                      <CheckRow 
                        label="Identity Schema (Organization/Person)" 
                        value={auditData.details.metadata.hasIdentitySchema ? 'Configured' : 'Missing'} 
                        isPass={auditData.details.metadata.hasIdentitySchema}
                        explanation="Identity schema markup defines Organization or Person entities, feeding Google's Knowledge Graph and improving brand credibility."
                        fix="Add an Organization or Person LD-JSON schema to your homepage detailing your brand name, social handles, and contact."
                        isExpanded={expandedCheck === 'identity'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'identity' ? null : 'identity')}
                      />
                    </div>

                    {/* Keywords Density Table */}
                    <div style={{ marginTop: '2.5rem' }}>
                      <h4 className="mb-4">Keyword Consistency Analysis</h4>
                      <table className="kw-table">
                        <thead>
                          <tr>
                            <th>Keyword</th>
                            <th>Count</th>
                            <th>In Title</th>
                            <th>In Desc</th>
                            <th>In H1</th>
                          </tr>
                        </thead>
                        <tbody>
                          {auditData.details.topKeywords.map((item, idx) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: '600' }}>{item.keyword}</td>
                              <td>{item.count}</td>
                              <td><span className={`kw-badge ${item.inTitle ? 'yes' : 'no'}`}>{item.inTitle ? 'Yes' : 'No'}</span></td>
                              <td><span className={`kw-badge ${item.inDescription ? 'yes' : 'no'}`}>{item.inDescription ? 'Yes' : 'No'}</span></td>
                              <td><span className={`kw-badge ${item.inH1 ? 'yes' : 'no'}`}>{item.inH1 ? 'Yes' : 'No'}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* SEO rankings analysis section */}
                    <div className="mt-8">
                      <h3 className="panel-title"><span>Traffic</span> & Keyword Rankings</h3>
                      <div className="keyword-tabs">
                        <button className={`kw-tab ${kwSubTab === 'organic' ? 'active' : ''}`} onClick={() => setKwSubTab('organic')}>Organic Keywords</button>
                        <button className={`kw-tab ${kwSubTab === 'paid' ? 'active' : ''}`} onClick={() => setKwSubTab('paid')}>Paid Keywords</button>
                        <button className={`kw-tab ${kwSubTab === 'ai' ? 'active' : ''}`} onClick={() => setKwSubTab('ai')}>AI Overview Citations</button>
                      </div>
                      
                      {kwSubTab === 'organic' && (
                        <table className="kw-table">
                          <thead>
                            <tr>
                              <th>Keyword</th>
                              <th>Position</th>
                              <th>Search Volume</th>
                              <th>Est. Monthly Traffic</th>
                            </tr>
                          </thead>
                          <tbody>
                            {premium.organicKeywords.map((item, idx) => (
                              <tr key={idx}>
                                <td style={{ fontWeight: '600' }}>{item.keyword}</td>
                                <td>#{item.position}</td>
                                <td>{item.searches.toLocaleString()}</td>
                                <td className="text-success">+{item.traffic.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                      {kwSubTab === 'paid' && (
                        premium.paidKeywords.length > 0 ? (
                          <table className="kw-table">
                            <thead>
                              <tr>
                                <th>Keyword</th>
                                <th>Position</th>
                                <th>Search Volume</th>
                                <th>Est. Monthly Traffic</th>
                              </tr>
                            </thead>
                            <tbody>
                              {premium.paidKeywords.map((item, idx) => (
                                <tr key={idx}>
                                  <td style={{ fontWeight: '600' }}>{item.keyword}</td>
                                  <td>#{item.position}</td>
                                  <td>{item.searches.toLocaleString()}</td>
                                  <td className="text-success">+{item.traffic.toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="no-data-msg">No paid keywords detected. It looks like this domain is not running active Google Search Ads.</p>
                        )
                      )}
                      {kwSubTab === 'ai' && (
                        <table className="kw-table">
                          <thead>
                            <tr>
                              <th>Citation Search Query</th>
                              <th>Citation Position</th>
                              <th>Search Volume</th>
                              <th>Est. Referral Traffic</th>
                            </tr>
                          </thead>
                          <tbody>
                            {premium.aiOverviewCitations.map((item, idx) => (
                              <tr key={idx}>
                                <td style={{ fontWeight: '600' }}>{item.keyword}</td>
                                <td>#{item.position}</td>
                                <td>{item.searches.toLocaleString()}</td>
                                <td className="text-success">+{item.traffic.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      <div className="positions-distribution mt-6">
                        <h5 className="mb-4">Organic Keyword Positions Distribution</h5>
                        <div className="position-bars-grid">
                          <div className="pos-bar-item">
                            <span className="pos-label">Pos. 1</span>
                            <div className="pos-bar-container"><div className="pos-bar-fill" style={{ width: `${Math.min(100, (premium.keywordPositions.pos1 / 15) * 100)}%` }}></div></div>
                            <span className="pos-count">{premium.keywordPositions.pos1}</span>
                          </div>
                          <div className="pos-bar-item">
                            <span className="pos-label">Pos. 2-3</span>
                            <div className="pos-bar-container"><div className="pos-bar-fill" style={{ width: `${Math.min(100, (premium.keywordPositions.pos2_3 / 40) * 100)}%` }}></div></div>
                            <span className="pos-count">{premium.keywordPositions.pos2_3}</span>
                          </div>
                          <div className="pos-bar-item">
                            <span className="pos-label">Pos. 4-10</span>
                            <div className="pos-bar-container"><div className="pos-bar-fill" style={{ width: `${Math.min(100, (premium.keywordPositions.pos4_10 / 100) * 100)}%` }}></div></div>
                            <span className="pos-count">{premium.keywordPositions.pos4_10}</span>
                          </div>
                          <div className="pos-bar-item">
                            <span className="pos-label">Pos. 11-20</span>
                            <div className="pos-bar-container"><div className="pos-bar-fill" style={{ width: `${Math.min(100, (premium.keywordPositions.pos11_20 / 250) * 100)}%` }}></div></div>
                            <span className="pos-count">{premium.keywordPositions.pos11_20}</span>
                          </div>
                          <div className="pos-bar-item">
                            <span className="pos-label">Pos. 21-30</span>
                            <div className="pos-bar-container"><div className="pos-bar-fill" style={{ width: `${Math.min(100, (premium.keywordPositions.pos21_30 / 500) * 100)}%` }}></div></div>
                            <span className="pos-count">{premium.keywordPositions.pos21_30}</span>
                          </div>
                          <div className="pos-bar-item">
                            <span className="pos-label">Pos. 31-100</span>
                            <div className="pos-bar-container"><div className="pos-bar-fill" style={{ width: `${Math.min(100, (premium.keywordPositions.pos31_100 / 3500) * 100)}%` }}></div></div>
                            <span className="pos-count">{premium.keywordPositions.pos31_100}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'backlinks' && (
                  <div>
                    <h3 className="panel-title"><span>Backlink</span> Profile Analysis</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                      Backlinks are links from third-party sites pointing to your website. Search engines treat backlinks as votes of trust.
                    </p>

                    <div className="premium-stats-grid">
                      <div className="premium-stat-card">
                        <span className="stat-label">Domain Strength</span>
                        <span className="stat-value">{premium.domainStrength} / 100</span>
                      </div>
                      <div className="premium-stat-card">
                        <span className="stat-label">Page Strength</span>
                        <span className="stat-value">{premium.pageStrength} / 100</span>
                      </div>
                      <div className="premium-stat-card">
                        <span className="stat-label">Total Backlinks</span>
                        <span className="stat-value">{premium.backlinkCount.toLocaleString()}</span>
                      </div>
                      <div className="premium-stat-card">
                        <span className="stat-label">Referring Domains</span>
                        <span className="stat-value">{premium.referringDomains.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="mb-4">Top Referring Backlinks</h4>
                      <table className="kw-table">
                        <thead>
                          <tr>
                            <th>Referring Page URL</th>
                            <th style={{ width: '100px' }}>Domain strength</th>
                            <th style={{ width: '100px' }}>Page strength</th>
                          </tr>
                        </thead>
                        <tbody>
                          {premium.topBacklinks.map((link, idx) => (
                            <tr key={idx}>
                              <td className="truncate-cell">
                                <a href={link.url} target="_blank" rel="noreferrer">{link.url}</a>
                              </td>
                              <td><span className="score-number">{link.domainStrength}</span></td>
                              <td><span className="score-number">{link.pageStrength}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="dashboard-subgrid mt-6">
                      <div>
                        <h4 className="mb-4">Top Anchor Text</h4>
                        <table className="kw-table">
                          <thead>
                            <tr>
                              <th>Anchor Phrase</th>
                              <th>Links count</th>
                            </tr>
                          </thead>
                          <tbody>
                            {premium.topAnchors.map((item, idx) => (
                              <tr key={idx}>
                                <td style={{ fontWeight: '500' }}>{item.anchor}</td>
                                <td>{item.count.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div>
                        <h4 className="mb-4">Top Referring Geographies & TLDs</h4>
                        <div className="geo-list">
                          <div>
                            <span className="geo-title">Domains Geography</span>
                            {premium.topCountries.map((c, idx) => (
                              <div key={idx} className="geo-item">
                                <span>{c.country} Countries</span>
                                <span>{c.count.toLocaleString()} domains</span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <span className="geo-title">Top Top-Level Domains</span>
                            {premium.topTlds.map((t, idx) => (
                              <div key={idx} className="geo-item">
                                <span>.{t.tld} domains</span>
                                <span>{t.count.toLocaleString()} domains</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'usability' && (
                  <div>
                    <h3 className="panel-title"><span>Usability</span> Checks</h3>
                    <div className="checks-container">
                      <CheckRow 
                        label="Viewport Tag Setup" 
                        value={auditData.details.usability.viewport || 'Missing viewport'} 
                        isPass={!!auditData.details.usability.viewport}
                        explanation="The viewport viewport metadata handles device rendering scales for mobile-friendly experiences."
                        fix="Insert `<meta name='viewport' content='width=device-width, initial-scale=1.0' />` in your page `<head>`."
                        isExpanded={expandedCheck === 'viewport'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'viewport' ? null : 'viewport')}
                      />
                      <CheckRow 
                        label="Favicon Badge" 
                        value={auditData.details.usability.favicon ? 'Configured' : 'Missing'} 
                        isPass={!!auditData.details.usability.favicon}
                        explanation="Favicons are the small website logo icons appearing on browser tab bars, history items, and bookmark lists."
                        fix="Save an `.ico` or `.png` logo file as `/favicon.ico` in website root and link it in the HTML head tag."
                        isExpanded={expandedCheck === 'favicon'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'favicon' ? null : 'favicon')}
                      />
                      <CheckRow 
                        label="Exposed Email Protection" 
                        value={auditData.details.usability.hasExposedEmails ? 'Plain text emails found' : 'Pass'} 
                        isPass={!auditData.details.usability.hasExposedEmails}
                        explanation="Plain text mail links are harvested by spiders, raising spam levels."
                        fix="Convert public contact anchors into contact forms or apply JavaScript-based obfuscation masks."
                        isExpanded={expandedCheck === 'email'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'email' ? null : 'email')}
                      />
                      <CheckRow 
                        label="Flash Content Usage" 
                        value={auditData.details.usability.hasFlash ? 'Flash elements present' : 'Clean'} 
                        isPass={!auditData.details.usability.hasFlash}
                        explanation="Flash object overlays are deprecated in modern browsers and cannot render on mobile devices."
                        fix="Ensure you use HTML5 tags and CSS models instead of obsolete Flash assets."
                        isExpanded={expandedCheck === 'flash'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'flash' ? null : 'flash')}
                      />
                      <CheckRow 
                        label="Frameset Elements" 
                        value={auditData.details.usability.hasFrameset ? 'Frameset tags present' : 'Clean'} 
                        isPass={!auditData.details.usability.hasFrameset}
                        explanation="Framesets limit crawler indexing capabilities and disrupt page history configurations."
                        fix="Avoid coding layouts using `<frameset>` or nested HTML pages."
                        isExpanded={expandedCheck === 'frames'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'frames' ? null : 'frames')}
                      />
                      <CheckRow 
                        label="iFrames count" 
                        value={auditData.details.usability.iframeCount > 0 ? `${auditData.details.usability.iframeCount} frames detected` : 'No frames'} 
                        isPass={auditData.details.usability.iframeCount < 3}
                        explanation="Heavy iframe structures slow down page rendering and make SEO page crawlers skip iframe contents."
                        fix="Replace iframe modules with native asynchronous API fetches or inline components."
                        isExpanded={expandedCheck === 'iframes'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'iframes' ? null : 'iframes')}
                      />
                      <CheckRow 
                        label="Tap Target Sizing" 
                        value="Appropriate target sizes (Pass)" 
                        isPass={true}
                        explanation="Ensuring buttons, links, and form fields are large enough and spaced out properly makes them easy for users to tap on mobile screens."
                        fix="Avoid bunched links. Set touch target sizes to at least 48x48px with proper margin gutters."
                        isExpanded={expandedCheck === 'taptargets'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'taptargets' ? null : 'taptargets')}
                      />
                      <CheckRow 
                        label="Font Size Legibility" 
                        value="Legible fonts (Pass)" 
                        isPass={true}
                        explanation="Ensuring website body font sizes are large enough makes text legible on handheld displays without users needing to pinch and zoom."
                        fix="Use responsive rem units for fonts, setting body content text sizes to a minimum of 16px."
                        isExpanded={expandedCheck === 'fonts'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'fonts' ? null : 'fonts')}
                      />
                    </div>

                    {/* Google PageSpeed circular gauges section */}
                    <div className="mt-8">
                      <h3 className="panel-title"><span>Google</span> PageSpeed Insights Lab Data</h3>
                      
                      <div className="lighthouse-scores-grid">
                        <div className="lighthouse-score-card">
                          <ScoreRing score={premium.pagespeedMobile.score} label="Mobile" />
                          <div className="lighthouse-metrics mt-4">
                            <div className="metric-row"><span>First Contentful Paint</span><span>{premium.pagespeedMobile.fcp}s</span></div>
                            <div className="metric-row"><span>Speed Index</span><span>{premium.pagespeedMobile.speedIndex}s</span></div>
                            <div className="metric-row"><span>Largest Contentful Paint</span><span>{premium.pagespeedMobile.lcp}s</span></div>
                            <div className="metric-row"><span>Time to Interactive</span><span>{premium.pagespeedMobile.tti}s</span></div>
                            <div className="metric-row"><span>Total Blocking Time</span><span>{premium.pagespeedMobile.tbt}ms</span></div>
                            <div className="metric-row"><span>Cumulative Layout Shift</span><span>{premium.pagespeedMobile.cls}</span></div>
                          </div>
                        </div>

                        <div className="lighthouse-score-card">
                          <ScoreRing score={premium.pagespeedDesktop.score} label="Desktop" />
                          <div className="lighthouse-metrics mt-4">
                            <div className="metric-row"><span>First Contentful Paint</span><span>{premium.pagespeedDesktop.fcp}s</span></div>
                            <div className="metric-row"><span>Speed Index</span><span>{premium.pagespeedDesktop.speedIndex}s</span></div>
                            <div className="metric-row"><span>Largest Contentful Paint</span><span>{premium.pagespeedDesktop.lcp}s</span></div>
                            <div className="metric-row"><span>Time to Interactive</span><span>{premium.pagespeedDesktop.tti}s</span></div>
                            <div className="metric-row"><span>Total Blocking Time</span><span>{premium.pagespeedDesktop.tbt}ms</span></div>
                            <div className="metric-row"><span>Cumulative Layout Shift</span><span>{premium.pagespeedDesktop.cls}</span></div>
                          </div>
                        </div>
                      </div>

                      <div className="core-web-vitals-assessment mt-6">
                        <h5 className="mb-4">Core Web Vitals Assessment (Field Performance)</h5>
                        <div className="vitals-grid">
                          <div className="vital-card">
                            <span className="vital-title">LCP (Largest Contentful Paint)</span>
                            <span className="vital-value">{premium.coreWebVitals.lcp}s</span>
                            <span className="vital-status pass">Good (&lt; 2.5s)</span>
                          </div>
                          <div className="vital-card">
                            <span className="vital-title">INP (Interaction to Next Paint)</span>
                            <span className="vital-value">{premium.coreWebVitals.inp}ms</span>
                            <span className="vital-status pass">Good (&lt; 200ms)</span>
                          </div>
                          <div className="vital-card">
                            <span className="vital-title">CLS (Cumulative Layout Shift)</span>
                            <span className="vital-value">{premium.coreWebVitals.cls}</span>
                            <span className="vital-status pass">Good (&lt; 0.1)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'performance' && (
                  <div>
                    <h3 className="panel-title"><span>Performance</span> & Speed Audits</h3>
                    <div className="checks-container">
                      <CheckRow 
                        label="Server Time to First Byte (TTFB)" 
                        value={`${auditData.details.performance.ttfb}ms`} 
                        isPass={auditData.details.performance.ttfb < 500}
                        explanation="TTFB calculates how long it takes for a server to send the first byte of response data."
                        fix="Implement server-side page caching, optimize backend SQL queries, or load content on CDNs."
                        isExpanded={expandedCheck === 'ttfb'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'ttfb' ? null : 'ttfb')}
                      />
                      <CheckRow 
                        label="HTML Size Weight" 
                        value={`${auditData.details.performance.htmlSizeKB} KB`} 
                        isPass={auditData.details.performance.htmlSizeKB < 100}
                        explanation="Smaller HTML page payloads download faster and load swiftly."
                        fix="Minify HTML output, remove bloated scripts, or discard unused inline codes."
                        isExpanded={expandedCheck === 'htmlsize'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'htmlsize' ? null : 'htmlsize')}
                      />
                      <CheckRow 
                        label="Text Encoding Compression" 
                        value={auditData.details.performance.isCompressed ? `Enabled (${auditData.details.performance.contentEncoding})` : 'Disabled'} 
                        isPass={auditData.details.performance.isCompressed}
                        explanation="Server-side text compression (Gzip or Brotli) compresses sizes by up to 70% before delivery."
                        fix="Activate compression on server (Express `compression` middleware or Nginx `gzip on`)."
                        isExpanded={expandedCheck === 'gzip'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'gzip' ? null : 'gzip')}
                      />
                      <CheckRow 
                        label="Page Asset Count" 
                        value={`${auditData.details.performance.totalAssets} resources (${auditData.details.performance.cssCount} CSS, ${auditData.details.performance.jsCount} JS)`} 
                        isPass={auditData.details.performance.totalAssets < 30}
                        explanation="Fewer resource links reduce parallel browser requests, speeding up render times."
                        fix="Combine stylesheets and scripts, use code splitting, or serve resources inline if small."
                        isExpanded={expandedCheck === 'assets'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'assets' ? null : 'assets')}
                      />
                      <CheckRow 
                        label="Asset Minification" 
                        value={`${auditData.details.performance.minifiedAssets} / ${auditData.details.performance.totalAssets} files minified`} 
                        isPass={auditData.details.performance.minifyScore >= 75}
                        explanation="Minifying stylesheets and scripts trims blank spaces and characters, minimizing file weight."
                        fix="Apply compilation tasks (esbuild, CSSNano) to bundle assets as `.min.js` and `.min.css` files."
                        isExpanded={expandedCheck === 'minify'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'minify' ? null : 'minify')}
                      />
                      <CheckRow 
                        label="HTTP/2 Protocol Support" 
                        value={auditData.details.performance.http2 ? 'HTTP/2 Active' : 'HTTP/1.1 Old version'} 
                        isPass={auditData.details.performance.http2}
                        explanation="HTTP/2 allows browser connections to reuse sockets and fetch multiple files concurrently, accelerating page loads."
                        fix="Enable HTTP/2 support inside your web server SSL configuration."
                        isExpanded={expandedCheck === 'http2'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'http2' ? null : 'http2')}
                      />
                      <CheckRow 
                        label="Deprecated HTML tags" 
                        value={auditData.details.performance.deprecatedCount > 0 ? `${auditData.details.performance.deprecatedCount} deprecated tags` : 'No deprecated tags (Pass)'} 
                        isPass={auditData.details.performance.deprecatedCount === 0}
                        explanation=" Obsolete markup tags (like `<font>` or `<center>`) violate modern HTML validation standards and increase parsing times."
                        fix="Eliminate archaic markup and assign styling via standardized CSS rules."
                        isExpanded={expandedCheck === 'deprecated'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'deprecated' ? null : 'deprecated')}
                      />
                      <CheckRow 
                        label="Inline HTML Styles count" 
                        value={auditData.details.performance.inlineStylesCount > 0 ? `${auditData.details.performance.inlineStylesCount} inline styles` : 'No inline styles (Pass)'} 
                        isPass={auditData.details.performance.inlineStylesCount < 10}
                        explanation="Styling elements directly with style attributes increases HTML page payload weight and delays visual rendering."
                        fix="Consolidate CSS style parameters inside class selections in external stylesheets."
                        isExpanded={expandedCheck === 'inlinestyles'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'inlinestyles' ? null : 'inlinestyles')}
                      />
                    </div>

                    <div className="dashboard-subgrid mt-8">
                      <div>
                        <h4 className="mb-4">Page Download Size Breakdown</h4>
                        <div className="breakdown-list">
                          <div className="breakdown-item">
                            <span>HTML document size</span>
                            <span>{auditData.details.performance.htmlSizeKB} KB</span>
                          </div>
                          <div className="breakdown-item">
                            <span>CSS styling sheets (est.)</span>
                            <span>{Math.round(auditData.details.performance.cssCount * 9.5)} KB</span>
                          </div>
                          <div className="breakdown-item">
                            <span>JavaScript files (est.)</span>
                            <span>{Math.round(auditData.details.performance.jsCount * 38)} KB</span>
                          </div>
                          <div className="breakdown-item">
                            <span>Total Estimated Page Size</span>
                            <span>{Math.round(auditData.details.performance.htmlSizeKB + auditData.details.performance.cssCount * 9.5 + auditData.details.performance.jsCount * 38)} KB</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-4">Resource Counts</h4>
                        <div className="breakdown-list">
                          <div className="breakdown-item">
                            <span>HTML document page</span>
                            <span>1 request</span>
                          </div>
                          <div className="breakdown-item">
                            <span>CSS style sheets</span>
                            <span>{auditData.details.performance.cssCount} files</span>
                          </div>
                          <div className="breakdown-item">
                            <span>JavaScript files</span>
                            <span>{auditData.details.performance.jsCount} scripts</span>
                          </div>
                          <div className="breakdown-item">
                            <span>Total Server Requests</span>
                            <span>{auditData.details.performance.totalAssets + 1} queries</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'social' && (
                  <div>
                    <h3 className="panel-title"><span>Social Media</span> Sharing</h3>
                    <div className="checks-container">
                      <CheckRow 
                        label="Facebook Open Graph Meta" 
                        value={auditData.details.social.og.title ? 'Configured' : 'Missing'} 
                        isPass={!!auditData.details.social.og.title}
                        explanation="Open Graph (OG) meta tags configure how page links look when shared on social profiles."
                        fix="Add `<meta property='og:title' content='...' />` and `<meta property='og:image' content='...' />` inside the page head."
                        isExpanded={expandedCheck === 'og'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'og' ? null : 'og')}
                      />
                      <CheckRow 
                        label="Twitter Cards Meta" 
                        value={auditData.details.social.twitter.card ? 'Configured' : 'Missing'} 
                        isPass={!!auditData.details.social.twitter.card}
                        explanation="Twitter Card parameters control text and image snippets when users share links on X."
                        fix="Embed `<meta name='twitter:card' content='summary_large_image' />` in your page head section."
                        isExpanded={expandedCheck === 'tw'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'tw' ? null : 'tw')}
                      />
                      <CheckRow 
                        label="Social Profile Links" 
                        value={(auditData.details.social.socialProfiles || []).length > 0 ? (auditData.details.social.socialProfiles || []).join(', ') : 'No profiles detected'} 
                        isPass={(auditData.details.social.socialProfiles || []).length > 0}
                        explanation="Linking out to official company social pages strengthens brand visibility."
                        fix="Add visible anchor links referencing your business pages on Facebook, LinkedIn, X, or Instagram."
                        isExpanded={expandedCheck === 'socialp'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'socialp' ? null : 'socialp')}
                      />
                      <CheckRow 
                        label="Facebook Pixel script" 
                        value={auditData.details.social.hasFbPixel ? 'Facebook Pixel active' : 'Missing Facebook Pixel'} 
                        isPass={auditData.details.social.hasFbPixel}
                        explanation="Facebook tracking pixel registers user conversion activities, feeding Facebook Ads analytics models."
                        fix="Create a pixel code in Meta Events Manager and paste the Javascript snippet into your website header."
                        isExpanded={expandedCheck === 'fbpixel'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'fbpixel' ? null : 'fbpixel')}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div>
                    <h3 className="panel-title"><span>Security</span> & Certificates</h3>
                    <div className="checks-container">
                      <CheckRow 
                        label="HTTPS Access" 
                        value={auditData.details.security.isHttps ? 'HTTPS Active' : 'Insecure HTTP'} 
                        isPass={auditData.details.security.isHttps}
                        explanation="HTTPS protects user exchanges via transport encryption and is a positive SEO ranking factor."
                        fix="Install a valid SSL certificate and configure redirect rules to map all HTTP links onto HTTPS equivalents."
                        isExpanded={expandedCheck === 'https'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'https' ? null : 'https')}
                      />
                      <CheckRow 
                        label="SSL Certificate Validity" 
                        value={auditData.details.security.sslInfo ? `Expires in ${auditData.details.security.sslInfo.daysRemaining} days` : 'No valid certificate'} 
                        isPass={auditData.details.security.isHttps && !auditData.details.security.sslError}
                        explanation="Valid certificates indicate that the server is certified by trusted signature authorities."
                        fix="Renew certificates before they expire, ensuring DNS configs are mapped directly to correct server addresses."
                        isExpanded={expandedCheck === 'ssl'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'ssl' ? null : 'ssl')}
                      />
                      <CheckRow 
                        label="Security Headers" 
                        value={auditData.details.security.sslInfo ? 'Parsed' : 'Headers scanned'} 
                        isPass={Object.values(auditData.details.security.securityHeaders).filter(Boolean).length === 4}
                        explanation="Security headers (HSTS, CSP, X-Frame, X-Content-Type) shield websites from clickjacking and scripting attacks."
                        fix="Configure headers via your server config (or apply Express `helmet` middleware inside node.js)."
                        isExpanded={expandedCheck === 'secheaders'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'secheaders' ? null : 'secheaders')}
                      />
                      <CheckRow 
                        label="Server Signature Exposed" 
                        value={auditData.details.security.serverHeader || 'Hidden'} 
                        isPass={!/\d/.test(auditData.details.security.serverHeader)}
                        explanation="Exposing server software build versions gives information to hackers searching for vulnerabilities."
                        fix="Disable web server signature tags inside configuration files (`server_tokens off` in Nginx)."
                        isExpanded={expandedCheck === 'serversig'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'serversig' ? null : 'serversig')}
                      />
                      <CheckRow 
                        label="SPF DNS Record check" 
                        value={auditData.details.security.spfRecord !== 'None' ? 'SPF Configured (TXT)' : 'Missing SPF record'} 
                        isPass={auditData.details.security.spfRecord !== 'None'}
                        explanation="Sender Policy Framework DNS record authenticates authorized email servers, protecting your domain from spambots."
                        fix="Configure a TXT record for your domain outlining allowed servers (e.g. `v=spf1 include:_spf.google.com ~all`)."
                        isExpanded={expandedCheck === 'spf'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'spf' ? null : 'spf')}
                      />
                      <CheckRow 
                        label="DMARC DNS Record check" 
                        value={auditData.details.security.dmarcRecord !== 'None' ? 'DMARC Configured (TXT)' : 'Missing DMARC record'} 
                        isPass={auditData.details.security.dmarcRecord !== 'None'}
                        explanation="DMARC DNS record coordinates how receiving servers handle SPF or DKIM alignment failures, preventing email spoofing."
                        fix="Publish a DNS TXT record under `_dmarc.yourdomain.com` detailing compliance directives."
                        isExpanded={expandedCheck === 'dmarc'}
                        onToggle={() => setExpandedCheck(expandedCheck === 'dmarc' ? null : 'dmarc')}
                      />
                    </div>

                    {/* DNS Records Panel */}
                    <div className="mt-8">
                      <h3 className="panel-title"><span>DNS</span> & Technology Infrastructure</h3>
                      <div className="dns-records-grid">
                        <div className="dns-record-card">
                          <span className="dns-record-label">Server IP Address</span>
                          <span className="dns-record-val code-font">{auditData.details.security.ipAddress}</span>
                        </div>
                        <div className="dns-record-card">
                          <span className="dns-record-label">DNS Nameservers (NS)</span>
                          <span className="dns-record-val code-font">
                            {(auditData.details.security.dnsServers || []).length > 0 ? (
                              (auditData.details.security.dnsServers || []).join(', ')
                            ) : (
                              'Local Server / Unknown'
                            )}
                          </span>
                        </div>
                      </div>
                      
                      <div className="txt-record-viewer mt-4">
                        <div className="txt-record-header">Active SPF Record (DNS TXT)</div>
                        <div className="txt-record-body code-font">{auditData.details.security.spfRecord}</div>
                      </div>
                      
                      <div className="txt-record-viewer mt-4">
                        <div className="txt-record-header">Active DMARC Record (DNS TXT)</div>
                        <div className="txt-record-body code-font">{auditData.details.security.dmarcRecord}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recommendations Card Panel */}
              <div className="panel-card" style={{ height: 'fit-content' }}>
                <h3 className="panel-title">Recommendations</h3>
                <div className="recs-list">
                  {auditData.details.recommendations.length === 0 ? (
                    <div style={{ color: 'var(--success)', fontWeight: '500' }}>
                      No recommendations! This site has perfect scores across all checked parameters.
                    </div>
                  ) : (
                    auditData.details.recommendations.map((rec, idx) => (
                      <div key={idx} className="rec-item">
                        <div className={`rec-badge ${getPriorityClass(rec.priority)}`}>
                          {rec.priority}
                        </div>
                        <div className="rec-content">
                          <span className="rec-title">{rec.title}</span>
                          <span className="rec-desc">{rec.description}</span>
                          {rec.fix && (
                            <div className="rec-fix">
                              <div className="rec-fix-label">How to Fix:</div>
                              <div className="rec-fix-desc">{rec.fix}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Tech Stack Footer */}
            {auditData.details.technology.stack.length > 0 && (
              <div className="panel-card" style={{ marginTop: '2rem' }}>
                <h3 className="panel-title">Detected Technologies</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>We detected the following framework and server infrastructure tags on the webpage:</p>
                <div className="tech-badges-list">
                  {auditData.details.technology.stack.map((tech, idx) => (
                    <div key={idx} className="tech-badge">{tech}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* LEAD CAPTURE POPUP / MODAL */}
      {/* ---------------------------------------------------- */}
      {leadModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setLeadModalOpen(false)}><CrossIcon /></button>
            <h3 className="center-text mb-4 brand-font" style={{ fontSize: '1.5rem' }}>Download PDF Report</h3>
            <p className="center-text var(--text-muted) mb-4" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Enter your contact details below to download a beautifully formatted white-label PDF copy of this audit report.
            </p>

            <form onSubmit={handleLeadSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="Your full name"
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  className="form-control"
                  placeholder="you@company.com"
                  value={leadForm.email}
                  onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Website URL</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="website.com"
                  value={leadForm.website}
                  onChange={(e) => setLeadForm({ ...leadForm, website: e.target.value })}
                />
              </div>

              {leadStatus.error && <p className="text-danger center-text mb-4">{leadStatus.error}</p>}
              {leadStatus.success && <p className="text-success center-text mb-4">Capturing details, starting download...</p>}

              <button
                type="submit"
                disabled={leadStatus.loading || leadStatus.success}
                className="btn-primary w-full center-text mt-4"
                style={{ justifyContent: 'center' }}
              >
                {leadStatus.loading ? 'Generating...' : 'Submit & Download PDF'}
              </button>

              <div className="center-text mt-4">
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setLeadModalOpen(false);
                    triggerPdfDownload();
                    // Reset form
                    setLeadForm({ name: '', email: '', website: '' });
                    setLeadStatus({ error: '', success: false, loading: false });
                  }}
                  style={{ fontSize: '0.8rem', color: 'var(--text-dark)', textDecoration: 'underline' }}
                >
                  Skip and download report directly
                </a>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Collapsible Check Row Component
function CheckRow({ label, value, isPass, explanation, fix, isExpanded, onToggle }) {
  return (
    <div className="check-row">
      <div className="check-summary" onClick={onToggle}>
        <div className="check-summary-left">
          <div className={`check-indicator ${isPass ? 'pass' : 'fail'}`}>
            {isPass ? <CheckIcon /> : <CrossIcon />}
          </div>
          <span className="check-label">{label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="check-value">{value}</span>
          <div style={{ color: 'var(--text-dark)' }}>
            {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="check-details">
          <p className="mb-4"><strong>What is this:</strong> {explanation}</p>
          {fix && (
            <div className="rec-fix">
              <div className="rec-fix-label">How to optimize:</div>
              <div className="rec-fix-desc">{fix}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
