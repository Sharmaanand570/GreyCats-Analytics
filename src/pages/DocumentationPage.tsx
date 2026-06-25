import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { api } from "../apiConfig";
import {
  Loader2,
  LayoutDashboard,
  BookOpen,
  Plug,
  BarChart2,
  Bell,
  FileText,
  HelpCircle,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import GreycatsBlackLogo from "@/assets/images/greycats-black-logo.png";
import { getAuthToken, StorageKey } from "@/utils/storage";
import type { Components } from "react-markdown";

// ── Sidebar navigation topics ────────────────────────────────────
const NAV_TOPICS = [
  {
    group: "Getting Started & Administration",
    items: [
      { id: "getting-started",         label: "Overview",                  icon: BookOpen },
      { id: "account-and-security",     label: "Account & Security",        icon: HelpCircle },
      { id: "client-management",        label: "Client Management",         icon: FileText },
      { id: "billing-and-subscriptions",label: "Billing & Subscriptions",   icon: FileText },
    ],
  },
  {
    group: "The AI Suite & Automation",
    items: [
      { id: "ai-brand-voice",          label: "AI Brand Voice",            icon: FileText },
      { id: "ai-chat-assistant",       label: "AI Chat Assistant",         icon: FileText },
      { id: "ai-creative-generator",   label: "AI Creative Generator",     icon: FileText },
      { id: "social-media-scheduler",  label: "Social Media Scheduler",    icon: FileText },
      { id: "blog-scheduler",          label: "Blog Scheduler",            icon: FileText },
    ],
  },
  {
    group: "Integrations",
    items: [
      { id: "integrations",            label: "Available Integrations",    icon: Plug },
      { id: "ecommerce-integrations",  label: "E-Commerce Setup",          icon: Plug },
      { id: "social-media-integrations",label: "Social Media Setup",       icon: Plug },
      { id: "google-ecosystem",        label: "The Google Ecosystem",      icon: Plug },
      { id: "meta-ads",                label: "Meta Ads Guide",            icon: Plug },
      { id: "google-ads",              label: "Google Ads Guide",          icon: Plug },
    ],
  },
  {
    group: "Advanced Reporting & Alerts",
    items: [
      { id: "dashboard-customization", label: "Dashboard Customization",   icon: BarChart2 },
      { id: "unified-metrics-engine",  label: "Unified Metrics Engine",    icon: BarChart2 },
      { id: "report-builder",          label: "Report Builder",            icon: BarChart2 },
      { id: "report-blueprints",       label: "Report Blueprints",         icon: BarChart2 },
      { id: "seo-reports",             label: "SEO Reports",               icon: BarChart2 },
      { id: "alerts",                  label: "Smart Alerts",              icon: Bell },
      { id: "broadcasts",              label: "Client Broadcasts",         icon: Bell },
    ],
  },
];

// ── Markdown renderers ──────────────────────────────────────────
const mdComponents: Components = {
  h1: ({ children }) => (
    <h1 style={{
      fontSize: "2rem", fontWeight: 800, color: "#0f0f0f",
      marginBottom: "0.5rem", marginTop: 0, letterSpacing: "-0.03em",
      lineHeight: 1.2,
    }}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 style={{
      fontSize: "1.35rem", fontWeight: 700, color: "#18181b",
      marginTop: "2.5rem", marginBottom: "0.75rem",
      paddingTop: "2rem", borderTop: "1px solid #f0f0f0",
      letterSpacing: "-0.02em",
    }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 style={{
      fontSize: "1.05rem", fontWeight: 600, color: "#27272a",
      marginTop: "1.75rem", marginBottom: "0.5rem",
    }}>
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p style={{
      marginBottom: "1.1rem", lineHeight: "1.8", color: "#52525b", fontSize: "0.975rem",
    }}>
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul style={{
      marginBottom: "1.1rem", paddingLeft: "1.5rem",
      listStyleType: "disc", color: "#52525b", fontSize: "0.975rem",
    }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol style={{
      marginBottom: "1.1rem", paddingLeft: "1.5rem",
      listStyleType: "decimal", color: "#52525b", fontSize: "0.975rem",
    }}>
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li style={{ marginBottom: "0.4rem", lineHeight: "1.75" }}>{children}</li>
  ),
  code: ({ children, className }) => {
    const isBlock = !!className?.startsWith("language-");
    return isBlock ? (
      <code style={{
        display: "block", background: "#18181b", color: "#e4e4e7",
        borderRadius: "0.6rem", padding: "1.1rem 1.25rem",
        fontFamily: "'Fira Code', 'Cascadia Code', monospace",
        fontSize: "0.85rem", overflowX: "auto", marginBottom: "1.25rem",
        letterSpacing: "0.01em",
      }}>
        {children}
      </code>
    ) : (
      <code style={{
        background: "#f3f0ff", color: "#7c3aed",
        borderRadius: "0.3rem", padding: "0.15em 0.45em",
        fontFamily: "'Fira Code', monospace", fontSize: "0.85em",
        border: "1px solid #ede9fe",
      }}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre style={{
      background: "#18181b", borderRadius: "0.6rem",
      padding: "1.1rem 1.25rem", overflowX: "auto",
      marginBottom: "1.25rem", marginTop: "0.5rem",
    }}>
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote style={{
      borderLeft: "3px solid #818cf8", paddingLeft: "1.1rem",
      margin: "1.25rem 0", color: "#6366f1",
      background: "#eef2ff", borderRadius: "0 0.5rem 0.5rem 0",
      padding: "0.75rem 1rem 0.75rem 1.1rem", fontSize: "0.95rem",
    }}>
      {children}
    </blockquote>
  ),
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{
      color: "#4f46e5", textDecoration: "none",
      borderBottom: "1px solid #c7d2fe", fontWeight: 500,
      transition: "border-color 0.15s",
    }}>
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong style={{ fontWeight: 700, color: "#18181b" }}>{children}</strong>
  ),
  hr: () => (
    <hr style={{ border: "none", borderTop: "1px solid #f0f0f0", margin: "2rem 0" }} />
  ),
  table: ({ children }) => (
    <div style={{ overflowX: "auto", marginBottom: "1.25rem" }}>
      <table style={{
        width: "100%", borderCollapse: "collapse",
        fontSize: "0.9rem", color: "#374151",
      }}>
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th style={{
      background: "#f9fafb", padding: "0.65rem 1rem",
      textAlign: "left", fontWeight: 600, color: "#18181b",
      borderBottom: "2px solid #e5e7eb", fontSize: "0.85rem",
    }}>
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td style={{
      padding: "0.65rem 1rem", borderBottom: "1px solid #f3f4f6", color: "#52525b",
    }}>
      {children}
    </td>
  ),
};

// ── Helper hook for spinner animation ─────────────────────────────
const spinStyle: React.CSSProperties = {
  animation: "docs-spin 0.9s linear infinite",
};

// ── Main component ────────────────────────────────────────────────
const DocumentationPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isLoggedIn = !!getAuthToken(StorageKey.ANALYTICS_TOKEN);
  const activeId = topicId || "getting-started";

  // Find current topic label
  const currentTopic = NAV_TOPICS.flatMap(g => g.items).find(i => i.id === activeId);

  useEffect(() => {
    const fetchDoc = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/docs/${activeId}`);
        setContent(response.data.content);
      } catch (err: any) {
        setError(err.message || "Failed to load documentation");
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [activeId]);

  const handleNavClick = (id: string) => {
    navigate(`/docs/${id}`);
    setMobileSidebarOpen(false);
  };

  const SidebarContent = () => (
    <nav style={{ padding: "0.5rem 0" }}>
      {NAV_TOPICS.map((group) => (
        <div key={group.group} style={{ marginBottom: "1.75rem" }}>
          <p style={{
            fontSize: "0.7rem", fontWeight: 700, color: "#a1a1aa",
            letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "0 1rem", marginBottom: "0.35rem",
          }}>
            {group.group}
          </p>
          {group.items.map(({ id, label, icon: Icon }) => {
            const isActive = activeId === id;
            return (
              <button
                key={id}
                onClick={() => handleNavClick(id)}
                style={{
                  display: "flex", alignItems: "center", gap: "0.6rem",
                  width: "100%", padding: "0.5rem 1rem",
                  borderRadius: "0.5rem", border: "none",
                  background: isActive ? "#eef2ff" : "transparent",
                  color: isActive ? "#4338ca" : "#52525b",
                  fontSize: "0.875rem", fontWeight: isActive ? 600 : 400,
                  cursor: "pointer", textAlign: "left",
                  transition: "all 0.12s",
                  marginBottom: "1px",
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = "#f4f4f5";
                    (e.currentTarget as HTMLButtonElement).style.color = "#18181b";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color = "#52525b";
                  }
                }}
              >
                <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
                <span style={{ flex: 1 }}>{label}</span>
                {isActive && <ChevronRight size={13} style={{ opacity: 0.5 }} />}
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Global spin keyframe */}
      <style>{`
        @keyframes docs-spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{
        minHeight: "100dvh", background: "#ffffff",
        display: "flex", flexDirection: "column",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}>

        {/* ── TOP NAVBAR ────────────────────────────────────────── */}
        <header style={{
          position: "sticky", top: 0, zIndex: 100,
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid #f0f0f0",
          height: "60px",
          display: "flex", alignItems: "center",
          padding: "0 1.5rem",
          justifyContent: "space-between",
        }}>
          {/* Left */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              style={{
                display: "none", alignItems: "center", justifyContent: "center",
                width: "36px", height: "36px", borderRadius: "0.5rem",
                border: "1px solid #e4e4e7", background: "transparent",
                cursor: "pointer", color: "#52525b",
              }}
              className="docs-mobile-menu-btn"
            >
              {mobileSidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </button>

            <img
              src={GreycatsBlackLogo}
              alt="Greycats Analytics"
              style={{ height: "26px", width: "auto", objectFit: "contain", cursor: "pointer" }}
              onClick={() => navigate("/")}
            />

            <div style={{ width: "1px", height: "18px", background: "#e4e4e7" }} />

            <span style={{
              fontSize: "0.8rem", fontWeight: 600, color: "#6366f1",
              background: "#eef2ff", padding: "0.2rem 0.6rem",
              borderRadius: "2rem", letterSpacing: "0.02em",
            }}>
              Docs
            </span>
          </div>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {isLoggedIn ? (
              <button
                onClick={() => navigate("/clients")}
                style={{
                  display: "flex", alignItems: "center", gap: "0.45rem",
                  padding: "0.45rem 1rem", borderRadius: "0.5rem",
                  border: "none", background: "#18181b", color: "#fff",
                  fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                  transition: "background 0.15s", letterSpacing: "0.01em",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#3f3f46"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#18181b"; }}
              >
                <LayoutDashboard size={13} />
                Go to Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate("/auth/login")}
                style={{
                  display: "flex", alignItems: "center", gap: "0.45rem",
                  padding: "0.45rem 1rem", borderRadius: "0.5rem",
                  border: "1px solid #e4e4e7", background: "transparent", color: "#18181b",
                  fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#f4f4f5"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* ── BODY: SIDEBAR + CONTENT ───────────────────────────── */}
        <div style={{ flex: 1, display: "flex", maxWidth: "1280px", margin: "0 auto", width: "100%" }}>

          {/* Mobile overlay */}
          {mobileSidebarOpen && (
            <div
              onClick={() => setMobileSidebarOpen(false)}
              style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)",
                zIndex: 40, display: "none",
              }}
              className="docs-mobile-overlay"
            />
          )}

          {/* ── LEFT SIDEBAR ──────────────────────────────────── */}
          <aside style={{
            width: "260px", minWidth: "260px",
            borderRight: "1px solid #f0f0f0",
            padding: "2rem 0.75rem",
            position: "sticky", top: "60px",
            height: "calc(100dvh - 60px)",
            overflowY: "auto",
          }}>
            <SidebarContent />
          </aside>

          {/* ── MAIN CONTENT ──────────────────────────────────── */}
          <main style={{ flex: 1, minWidth: 0, padding: "3rem 3.5rem 5rem", maxWidth: "840px" }}>

            {/* Breadcrumb */}
            <div style={{
              display: "flex", alignItems: "center", gap: "0.4rem",
              fontSize: "0.78rem", color: "#a1a1aa", marginBottom: "1.75rem",
            }}>
              <span>Docs</span>
              <ChevronRight size={12} />
              <span style={{ color: "#18181b", fontWeight: 500 }}>
                {currentTopic?.label || activeId}
              </span>
            </div>

            {/* Content card */}
            <div style={{
              background: "#ffffff",
              borderRadius: "1rem",
              border: "1px solid #f0f0f0",
              padding: "2.5rem",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              minHeight: "400px",
            }}>
              {loading ? (
                <div style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  height: "300px", gap: "1rem",
                }}>
                  <Loader2 size={28} style={{ ...spinStyle, color: "#6366f1" }} />
                  <p style={{ color: "#a1a1aa", fontSize: "0.875rem", margin: 0 }}>
                    Loading documentation...
                  </p>
                </div>
              ) : error ? (
                <div style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  height: "300px", gap: "1rem", textAlign: "center",
                }}>
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "50%",
                    background: "#fef2f2", display: "flex",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <X size={20} style={{ color: "#ef4444" }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: "#18181b", margin: "0 0 0.25rem" }}>
                      Failed to load
                    </p>
                    <p style={{ color: "#71717a", fontSize: "0.875rem", margin: 0 }}>
                      {error}
                    </p>
                  </div>
                </div>
              ) : (
                <ReactMarkdown components={mdComponents}>{content}</ReactMarkdown>
              )}
            </div>

            {/* Bottom nav: Prev / Next */}
            <div style={{
              display: "flex", justifyContent: "space-between",
              marginTop: "2.5rem", gap: "1rem",
            }}>
              {(() => {
                const all = NAV_TOPICS.flatMap(g => g.items);
                const idx = all.findIndex(i => i.id === activeId);
                const prev = all[idx - 1];
                const next = all[idx + 1];
                return (
                  <>
                    {prev ? (
                      <button
                        onClick={() => handleNavClick(prev.id)}
                        style={{
                          flex: 1, padding: "0.9rem 1.25rem", borderRadius: "0.75rem",
                          border: "1px solid #e4e4e7", background: "#fff",
                          cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#818cf8"; (e.currentTarget as HTMLButtonElement).style.background = "#f9fafb"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e4e4e7"; (e.currentTarget as HTMLButtonElement).style.background = "#fff"; }}
                      >
                        <p style={{ margin: "0 0 0.2rem", fontSize: "0.72rem", color: "#a1a1aa", fontWeight: 500, letterSpacing: "0.05em" }}>← PREVIOUS</p>
                        <p style={{ margin: 0, fontSize: "0.9rem", color: "#18181b", fontWeight: 600 }}>{prev.label}</p>
                      </button>
                    ) : <div style={{ flex: 1 }} />}

                    {next ? (
                      <button
                        onClick={() => handleNavClick(next.id)}
                        style={{
                          flex: 1, padding: "0.9rem 1.25rem", borderRadius: "0.75rem",
                          border: "1px solid #e4e4e7", background: "#fff",
                          cursor: "pointer", textAlign: "right", transition: "all 0.15s",
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#818cf8"; (e.currentTarget as HTMLButtonElement).style.background = "#f9fafb"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e4e4e7"; (e.currentTarget as HTMLButtonElement).style.background = "#fff"; }}
                      >
                        <p style={{ margin: "0 0 0.2rem", fontSize: "0.72rem", color: "#a1a1aa", fontWeight: 500, letterSpacing: "0.05em" }}>NEXT →</p>
                        <p style={{ margin: 0, fontSize: "0.9rem", color: "#18181b", fontWeight: 600 }}>{next.label}</p>
                      </button>
                    ) : <div style={{ flex: 1 }} />}
                  </>
                );
              })()}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default DocumentationPage;
