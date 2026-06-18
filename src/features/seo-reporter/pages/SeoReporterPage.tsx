import { useEffect } from 'react';
import { SeoSearchBar } from '../components/SeoSearchBar';
import { AuditResultDashboard } from '../components/AuditResultDashboard';
import { useAudit } from '../hooks/useAudit';
import { getGradeColor } from '../utils/gradeColor';

export default function SeoReporterPage() {
  const { audit, loading, error, history, runAudit, fetchAuditById, fetchMyHistory, downloadPDF, setAudit } = useAudit();

  useEffect(() => {
    fetchMyHistory();
  }, [fetchMyHistory]);

  const handleSearch = (url: string) => {
    runAudit({ url, forceRefresh: false });
  };

  const handleHistoryClick = (id: string) => {
    fetchAuditById(id);
  };

  return (
    <div className="relative flex flex-col items-center py-16 px-4 md:px-8 min-h-full bg-background overflow-x-clip">
      {/* Premium Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-secondary/50 rounded-full blur-[100px] pointer-events-none" />

      {!audit && (
        <div className="w-full max-w-4xl text-center mb-12 relative z-10 animate-in fade-in duration-500">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-card border border-border shadow-sm text-sm font-semibold text-primary tracking-wide uppercase">
            New Feature
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight mb-6 leading-tight">
            Uncover the truth about <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
              your website's performance
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
            Get a comprehensive, premium SEO report in seconds. We analyze performance, backlinks, security, and usability.
          </p>
        </div>
      )}

      <div className="w-full relative z-10 flex flex-col items-center">
        <SeoSearchBar onSearch={handleSearch} loading={loading} />

        {error && (
          <div className="mt-8 p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 w-full max-w-2xl text-center font-medium shadow-sm">
            {error}
          </div>
        )}

        {loading && !audit && (
          <div className="mt-20 flex flex-col items-center gap-6 animate-in fade-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-md bg-primary/30 animate-pulse"></div>
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-muted border-t-primary relative z-10"></div>
            </div>
            <p className="text-muted-foreground font-medium tracking-wide">
              Analyzing technical SEO & compiling data...
            </p>
          </div>
        )}

        {/* Recent Searches History */}
        {history.length > 0 && !audit && !loading && (
          <div className="w-full max-w-4xl mt-16 animate-in fade-in duration-500">
            <h2 className="text-xl font-bold text-foreground mb-6 px-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Recent Searches
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => handleHistoryClick(item.id)}
                  className="bg-card border border-border hover:border-primary/30 p-5 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 flex items-center justify-between group"
                >
                  <div className="flex flex-col overflow-hidden mr-4">
                    <span className="font-bold text-foreground truncate group-hover:text-primary transition-colors">{item.domain}</span>
                    <span className="text-xs text-muted-foreground mt-1">{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-center shrink-0 w-11 h-11 rounded-full font-bold text-sm border-2" style={{ borderColor: getGradeColor(item.overall_grade), color: getGradeColor(item.overall_grade) }}>
                    {item.overall_grade}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {audit && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out mt-8">
            <div className="max-w-[1200px] mx-auto w-full flex justify-start mb-6 px-4">
              <button 
                onClick={() => setAudit(null)} 
                className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 bg-card hover:bg-secondary/50 px-4 py-2.5 rounded-xl border border-border shadow-sm active:scale-95 duration-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Search
              </button>
            </div>
            <AuditResultDashboard audit={audit} onDownloadPDF={downloadPDF} />
          </div>
        )}
      </div>
    </div>
  );
}
