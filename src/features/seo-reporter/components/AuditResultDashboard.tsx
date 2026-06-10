import React from 'react';
import type { AuditResult } from '../types';
import { getGradeColor, getScoreColor } from '../utils/gradeColor';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from './CircularProgress';

interface AuditResultDashboardProps {
  audit: AuditResult;
  onDownloadPDF: (id: string) => void;
}

export const AuditResultDashboard: React.FC<AuditResultDashboardProps> = ({ audit, onDownloadPDF }) => {
  const getEducationalDefinition = (title: string, category?: string): string | null => {
    const t = title.toLowerCase();
    if (t.includes('meta description')) {
      return "Meta descriptions provide a brief summary of a web page. They often appear in search engine results below the title and can significantly impact click-through rates.";
    }
    if (t.includes('title tag length') || t.includes('title length')) {
      return "Title tags specify the title of a web page and are displayed as clickable snippets in search results. Keeping them between 10-60 characters ensures they don't get cut off on Google.";
    }
    if (t.includes('title tag') || t.includes('missing title')) {
      return "Title tags are HTML elements that specify the title of a web page. They are the first thing users see in search results and are crucial for both SEO and usability.";
    }
    if (t.includes('alt attribute') || t.includes('missing alt') || t.includes('image alt')) {
      return "Alt text (alternative text) describes the appearance and function of an image on a page. It is essential for web accessibility and helps search engines understand the image content.";
    }
    if (t.includes('h1') || t.includes('heading')) {
      return "H1 tags are usually the most visually important heading on the page and indicate the main topic to both users and search engines. A page should ideally have exactly one H1 tag.";
    }
    if (t.includes('canonical')) {
      return "Canonical tags tell search engines that a specific URL represents the master copy of a page, preventing issues caused by identical or \"duplicate\" content appearing on multiple URLs.";
    }
    if (t.includes('viewport')) {
      return "The viewport meta tag instructs the browser on how to control the page's dimensions and scaling on different devices, which is critical for mobile responsiveness.";
    }
    if (t.includes('https') || t.includes('ssl')) {
      return "HTTPS encrypts the data sent between a visitor's browser and your website. It is a fundamental security requirement and a confirmed Google ranking signal.";
    }
    if (t.includes('speed') || t.includes('load time') || t.includes('ttfb')) {
      return "Page speed is a direct ranking factor. Faster loading times improve user experience, reduce bounce rates, and increase conversions.";
    }
    
    if (category === 'SEO') {
      return "This is a fundamental Search Engine Optimization (SEO) practice that helps search engines crawl, understand, and index your webpage effectively.";
    }
    if (category === 'Performance') {
      return "Performance metrics directly impact user experience. Faster pages lead to higher engagement, better conversions, and improved search rankings.";
    }
    if (category === 'Security') {
      return "Security configurations protect your website and its visitors from malicious activities, which builds trust and fulfills core search engine requirements.";
    }
    
    return null;
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1200px] mx-auto pb-24">
      {/* Header section with overall grade and actions */}
      <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-card/80 backdrop-blur-md rounded-3xl border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500">
        <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <CircularProgress 
            score={audit.scores.overall} 
            label={audit.overall_grade} 
            color={getGradeColor(audit.overall_grade)} 
            size={140} 
            strokeWidth={12} 
          />
          <div>
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h2 className="text-3xl font-bold text-foreground tracking-tight">{audit.domain}</h2>
              <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-bold tracking-wider text-[10px] uppercase rounded-full px-3 shadow-sm">Audit Verified</Badge>
            </div>
            <a href={audit.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary font-medium hover:underline transition-colors block mb-4">
              {audit.url}
            </a>
            <div className="flex items-center justify-center md:justify-start gap-6">
              <div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">Overall Score</p>
                <p className="text-2xl font-bold" style={{ color: getScoreColor(audit.scores.overall) }}>
                  {audit.scores.overall}<span className="text-muted-foreground/50 text-lg">/100</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 md:mt-0">
          <Button 
            onClick={() => onDownloadPDF(audit.id)} 
            className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-300 shadow-lg shadow-primary/20 active:scale-95 flex items-center gap-3 text-base"
          >
            <Download className="w-5 h-5" />
            Export Full PDF
          </Button>
        </div>
      </div>

      {/* Modern Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl pt-4 pb-4 border-b border-border mb-8">
          <TabsList className="flex flex-wrap justify-start gap-2 h-auto p-1 bg-secondary rounded-2xl w-full sm:w-auto overflow-x-auto no-scrollbar">
            {['overview', 'seo', 'keywords', 'backlinks', 'performance', 'usability', 'security', 'social'].map(tab => (
              <TabsTrigger 
                key={tab} 
                value={tab} 
                className="capitalize px-6 py-2.5 rounded-xl data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300 text-muted-foreground font-medium"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[500px]">
          {/* Overview Tab Content */}
          <TabsContent value="overview" className="m-0 focus-visible:outline-none">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
              {[
                { label: 'SEO', grade: audit.seo_grade, score: audit.scores.seo },
                { label: 'Performance', grade: audit.performance_grade, score: audit.scores.performance },
                { label: 'Usability', grade: audit.usability_grade, score: audit.scores.usability },
                { label: 'Security', grade: audit.security_grade, score: audit.scores.security },
                { label: 'Social', grade: audit.social_grade, score: audit.scores.social },
              ].map((item, idx) => (
                <div key={item.label} className="bg-card rounded-3xl p-6 border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 fill-mode-both" style={{ animationDelay: `${idx * 100}ms` }}>
                  <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</span>
                  <CircularProgress 
                    score={item.score} 
                    label={item.grade} 
                    color={getGradeColor(item.grade)} 
                    size={90} 
                    strokeWidth={6} 
                  />
                </div>
              ))}
            </div>

            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <h3 className="text-2xl font-bold mb-6 text-foreground tracking-tight">Top Priority Actions</h3>
              <div className="space-y-4">
                {audit.details.recommendations?.slice(0, 5).map((rec, i) => (
                  <div key={i} className="group flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-secondary/50 border border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-300">
                    <div className="pt-1 shrink-0">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                        ${rec.priority === 'High' ? 'bg-destructive/10 text-destructive' : 
                          rec.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 
                          'bg-primary/10 text-primary'}`}>
                        {rec.priority}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{rec.title}</h4>
                      <p className="text-muted-foreground mt-2 leading-relaxed">{rec.description}</p>
                      
                      {getEducationalDefinition(rec.title, rec.category) && (
                        <div className="mt-4 p-4 rounded-xl bg-background border border-border">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">What is this?</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {getEducationalDefinition(rec.title, rec.category)}
                          </p>
                        </div>
                      )}

                      <div className="mt-4 inline-block font-medium text-primary bg-card/60 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-primary/20 shadow-sm">
                        <span className="text-primary/70 mr-2 uppercase text-xs tracking-wider font-extrabold">Fix:</span>
                        {rec.fix}
                      </div>
                    </div>
                  </div>
                ))}
                {(!audit.details.recommendations || audit.details.recommendations.length === 0) && (
                  <div className="p-12 text-center flex flex-col items-center justify-center bg-secondary/50 rounded-2xl border border-dashed border-border">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Looking Good!</h3>
                    <p className="text-muted-foreground">No critical recommendations found for this page.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* SEO Tab Content */}
          <TabsContent value="seo" className="m-0 focus-visible:outline-none space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-sm border-border rounded-3xl overflow-hidden bg-card">
                <CardHeader className="bg-secondary/50 border-b border-border p-6">
                  <CardTitle className="text-xl tracking-tight text-foreground">Metadata</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Title Tag</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-md ${audit.details.metadata?.titleLength > 60 ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'}`}>
                        {audit.details.metadata?.titleLength || 0} chars
                      </span>
                    </div>
                    <div className="text-lg text-foreground font-medium">{audit.details.metadata?.title || 'None'}</div>
                  </div>
                  <div className="group">
                    <div className="flex items-center justify-between mb-2 mt-6">
                      <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Meta Description</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-md ${audit.details.metadata?.descriptionLength > 160 ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'}`}>
                        {audit.details.metadata?.descriptionLength || 0} chars
                      </span>
                    </div>
                    <div className="text-muted-foreground leading-relaxed bg-secondary/50 p-4 rounded-2xl border border-border">{audit.details.metadata?.description || 'None'}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2 mt-6">Canonical URL</div>
                    <div className="text-primary bg-primary/5 p-3 rounded-xl border border-primary/20 break-all text-sm font-medium">{audit.details.metadata?.canonical || 'Not configured'}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-border rounded-3xl overflow-hidden bg-card">
                <CardHeader className="bg-secondary/50 border-b border-border p-6">
                  <CardTitle className="text-xl tracking-tight text-foreground">Content & Links</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    <div className="flex justify-between items-center p-6 hover:bg-secondary/50 transition-colors">
                      <span className="text-muted-foreground font-medium">Word Count</span>
                      <span className="font-bold text-xl text-foreground bg-secondary px-3 py-1 rounded-lg">{audit.details.metadata?.wordCount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-6 hover:bg-secondary/50 transition-colors">
                      <span className="text-muted-foreground font-medium">Total Images</span>
                      <div className="flex items-center gap-4">
                        {audit.details.images?.missingAlt > 0 && (
                          <span className="text-xs font-bold bg-destructive/10 text-destructive px-2 py-1 rounded-md">
                            {audit.details.images?.missingAlt} missing alt
                          </span>
                        )}
                        <span className="font-bold text-xl text-foreground bg-secondary px-3 py-1 rounded-lg">{audit.details.images?.total || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-6 hover:bg-secondary/50 transition-colors">
                      <span className="text-muted-foreground font-medium">Internal Links</span>
                      <span className="font-bold text-xl text-foreground bg-secondary px-3 py-1 rounded-lg">{audit.details.links?.internal || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-6 hover:bg-secondary/50 transition-colors">
                      <span className="text-muted-foreground font-medium">External Links</span>
                      <span className="font-bold text-xl text-foreground bg-secondary px-3 py-1 rounded-lg">{audit.details.links?.external || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="keywords" className="m-0 focus-visible:outline-none space-y-8">
            <Card className="shadow-sm border-border rounded-3xl overflow-hidden bg-card">
              <CardHeader className="bg-secondary/50 border-b border-border p-6">
                <CardTitle className="text-xl tracking-tight text-foreground">Top Organic Keywords</CardTitle>
                <CardDescription className="text-muted-foreground">Search terms driving traffic to this domain</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground bg-card border-b border-border uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Keyword</th>
                        <th className="px-6 py-4 font-semibold text-center">Position</th>
                        <th className="px-6 py-4 font-semibold text-right">Searches / mo</th>
                        <th className="px-6 py-4 font-semibold text-right">Est. Traffic</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {audit.details.premium?.organicKeywords?.map((kw, i) => (
                        <tr key={i} className="hover:bg-secondary/50 transition-colors group">
                          <td className="px-6 py-4 font-medium text-foreground">{kw.keyword}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold
                              ${kw.position <= 3 ? 'bg-primary/10 text-primary' : kw.position <= 10 ? 'bg-primary/5 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                              {kw.position}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground text-right font-mono">{kw.searches?.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right font-mono font-medium text-primary">+{kw.traffic?.toLocaleString()}</td>
                        </tr>
                      ))}
                      {(!audit.details.premium?.organicKeywords || audit.details.premium.organicKeywords.length === 0) && (
                        <tr>
                          <td colSpan={4} className="px-6 py-16 text-center text-muted-foreground bg-secondary/30">
                            No premium keyword data available for this URL.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {audit.details.premium?.paidKeywords && audit.details.premium.paidKeywords.length > 0 && (
              <Card className="shadow-sm border-border rounded-3xl overflow-hidden bg-card">
                <CardHeader className="bg-secondary/50 border-b border-border p-6">
                  <CardTitle className="text-xl tracking-tight text-foreground">Paid Keywords</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-muted-foreground bg-card border-b border-border uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Keyword</th>
                          <th className="px-6 py-4 font-semibold text-center">Position</th>
                          <th className="px-6 py-4 font-semibold text-right">Searches / mo</th>
                          <th className="px-6 py-4 font-semibold text-right">Est. Traffic</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {audit.details.premium.paidKeywords.map((kw, i) => (
                          <tr key={i} className="hover:bg-secondary/50 transition-colors group">
                            <td className="px-6 py-4 font-medium text-foreground">{kw.keyword}</td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full font-bold bg-amber-500/10 text-amber-500">{kw.position}</span>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground text-right font-mono">{kw.searches?.toLocaleString()}</td>
                            <td className="px-6 py-4 text-right font-mono font-medium text-primary">+{kw.traffic?.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {audit.details.premium?.aiOverviewCitations && audit.details.premium.aiOverviewCitations.length > 0 && (
              <Card className="shadow-sm border-border rounded-3xl overflow-hidden bg-card">
                <CardHeader className="bg-secondary/50 border-b border-border p-6">
                  <CardTitle className="text-xl tracking-tight text-foreground">AI Overview Citations</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-muted-foreground bg-card border-b border-border uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Citation Keyword</th>
                          <th className="px-6 py-4 font-semibold text-center">Position</th>
                          <th className="px-6 py-4 font-semibold text-right">Searches / mo</th>
                          <th className="px-6 py-4 font-semibold text-right">Est. Traffic</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {audit.details.premium.aiOverviewCitations.map((kw, i) => (
                          <tr key={i} className="hover:bg-secondary/50 transition-colors group">
                            <td className="px-6 py-4 font-medium text-foreground">{kw.keyword}</td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full font-bold bg-primary/10 text-primary">{kw.position}</span>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground text-right font-mono">{kw.searches?.toLocaleString()}</td>
                            <td className="px-6 py-4 text-right font-mono font-medium text-primary">+{kw.traffic?.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {audit.details.premium?.keywordPositions && (
              <Card className="shadow-sm border-border rounded-3xl overflow-hidden bg-card">
                <CardHeader className="bg-secondary/50 border-b border-border p-6">
                  <CardTitle className="text-xl tracking-tight text-foreground">Organic Positions Distribution</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                    {[
                      { label: 'Pos 1', val: audit.details.premium.keywordPositions.pos1 },
                      { label: 'Pos 2-3', val: audit.details.premium.keywordPositions.pos2_3 },
                      { label: 'Pos 4-10', val: audit.details.premium.keywordPositions.pos4_10 },
                      { label: 'Pos 11-20', val: audit.details.premium.keywordPositions.pos11_20 },
                      { label: 'Pos 21-30', val: audit.details.premium.keywordPositions.pos21_30 },
                      { label: 'Pos 31-100', val: audit.details.premium.keywordPositions.pos31_100 },
                    ].map((p, i) => (
                      <div key={i} className="bg-secondary/30 rounded-2xl p-4 border border-border">
                        <div className="text-sm font-semibold text-muted-foreground mb-2">{p.label}</div>
                        <div className="text-2xl font-bold text-foreground">{p.val}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="backlinks" className="m-0 focus-visible:outline-none">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Domain Strength', value: audit.details.premium?.domainStrength, icon: '🛡️' },
                { label: 'Page Strength', value: audit.details.premium?.pageStrength, icon: '📄' },
                { label: 'Total Backlinks', value: audit.details.premium?.backlinkCount?.toLocaleString(), icon: '🔗' },
                { label: 'Ref. Domains', value: audit.details.premium?.referringDomains?.toLocaleString(), icon: '🌍' },
              ].map((item, i) => (
                <div key={i} className="bg-card rounded-3xl p-6 border border-border shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
                  <div className="absolute -right-4 -top-4 text-6xl opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">{item.icon}</div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 relative z-10">{item.label}</h4>
                  <div className="text-3xl font-extrabold text-foreground relative z-10">{item.value || 'N/A'}</div>
                </div>
              ))}
            </div>
            
            <Card className="shadow-sm border-border rounded-3xl overflow-hidden bg-card">
              <CardHeader className="bg-secondary/50 border-b border-border p-6">
                <CardTitle className="text-xl tracking-tight text-foreground">Top Backlinks</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {audit.details.premium?.topBacklinks?.map((link, i) => (
                    <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-card hover:bg-secondary/50 transition-colors">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 font-medium hover:underline truncate max-w-[70%]">
                        {link.url}
                      </a>
                      <div className="flex items-center gap-3 mt-4 md:mt-0">
                        <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-lg border border-border">
                          <span className="text-xs text-muted-foreground font-semibold uppercase">DS</span>
                          <span className="font-bold text-foreground">{link.domainStrength}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-lg border border-border">
                          <span className="text-xs text-muted-foreground font-semibold uppercase">PS</span>
                          <span className="font-bold text-foreground">{link.pageStrength}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!audit.details.premium?.topBacklinks || audit.details.premium.topBacklinks.length === 0) && (
                    <div className="text-center py-16 text-muted-foreground bg-secondary/30">
                      No premium backlink data available.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Card className="shadow-sm border-border rounded-3xl overflow-hidden bg-card col-span-1 md:col-span-2">
                <CardHeader className="bg-secondary/50 border-b border-border p-6">
                  <CardTitle className="text-xl tracking-tight text-foreground">Top Anchor Text</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto max-h-[400px]">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-muted-foreground bg-card border-b border-border uppercase tracking-wider sticky top-0">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Anchor Phrase</th>
                          <th className="px-6 py-4 font-semibold text-right">Links Count</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {audit.details.premium?.topAnchors?.map((item, i) => (
                          <tr key={i} className="hover:bg-secondary/50 transition-colors">
                            <td className="px-6 py-3 font-medium text-foreground">{item.anchor}</td>
                            <td className="px-6 py-3 text-right font-mono">{item.count?.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="shadow-sm border-border rounded-3xl overflow-hidden bg-card">
                  <CardHeader className="bg-secondary/50 border-b border-border p-5">
                    <CardTitle className="text-lg tracking-tight text-foreground">Geographies</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 divide-y divide-border max-h-[190px] overflow-y-auto">
                    {audit.details.premium?.topCountries?.map((c, i) => (
                      <div key={i} className="flex justify-between items-center px-5 py-3 hover:bg-secondary/50">
                        <span className="font-medium text-foreground">{c.country}</span>
                        <span className="text-muted-foreground text-sm">{c.count?.toLocaleString()}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-border rounded-3xl overflow-hidden bg-card">
                  <CardHeader className="bg-secondary/50 border-b border-border p-5">
                    <CardTitle className="text-lg tracking-tight text-foreground">Top TLDs</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 divide-y divide-border max-h-[190px] overflow-y-auto">
                    {audit.details.premium?.topTlds?.map((t, i) => (
                      <div key={i} className="flex justify-between items-center px-5 py-3 hover:bg-secondary/50">
                        <span className="font-medium text-foreground">.{t.tld}</span>
                        <span className="text-muted-foreground text-sm">{t.count?.toLocaleString()}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="m-0 focus-visible:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-sm border-border rounded-3xl overflow-hidden bg-card">
                <CardHeader className="bg-secondary/50 border-b border-border p-6">
                  <CardTitle className="text-xl tracking-tight text-foreground">Core Metrics</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    <div className="flex justify-between items-center p-6 hover:bg-secondary/50 transition-colors">
                      <span className="text-muted-foreground font-medium">Page Load Time</span>
                      <span className={`font-bold text-xl px-3 py-1 rounded-lg ${audit.details.performance?.pageLoadTime < 1500 ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-500'}`}>{audit.details.performance?.pageLoadTime || 0} ms</span>
                    </div>
                    <div className="flex justify-between items-center p-6 hover:bg-secondary/50 transition-colors">
                      <span className="text-muted-foreground font-medium">Time To First Byte (TTFB)</span>
                      <span className={`font-bold text-xl px-3 py-1 rounded-lg ${audit.details.performance?.ttfb < 300 ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-500'}`}>{audit.details.performance?.ttfb || 0} ms</span>
                    </div>
                    <div className="flex justify-between items-center p-6 hover:bg-secondary/50 transition-colors">
                      <span className="text-muted-foreground font-medium">HTML Size</span>
                      <span className="font-bold text-xl text-foreground bg-secondary px-3 py-1 rounded-lg">{audit.details.performance?.htmlSizeKB || 0} KB</span>
                    </div>
                    <div className="flex justify-between items-center p-6 hover:bg-secondary/50 transition-colors">
                      <span className="text-muted-foreground font-medium">Total Assets</span>
                      <div className="text-right">
                        <span className="font-bold text-xl text-foreground bg-secondary px-3 py-1 rounded-lg">{audit.details.performance?.totalAssets || 0}</span>
                        <div className="text-xs text-muted-foreground mt-1 font-medium">{audit.details.performance?.jsCount || 0} JS, {audit.details.performance?.cssCount || 0} CSS</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Usability Tab */}
          <TabsContent value="usability" className="m-0 focus-visible:outline-none">
            <Card className="shadow-sm border-border rounded-3xl overflow-hidden bg-card">
              <CardHeader className="bg-secondary/50 border-b border-border p-6">
                <CardTitle className="text-xl tracking-tight text-foreground">Usability Checks</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { label: 'Viewport Meta Tag Configured', pass: audit.details.usability?.viewportMeta },
                    { label: 'Favicon Present', pass: audit.details.usability?.favicon },
                    { label: 'No Flash Content', pass: !audit.details.usability?.flash },
                    { label: 'Iframe Usage Minimised', pass: !audit.details.usability?.iframe, warning: true },
                  ].map((check, i) => (
                    <div key={i} className="flex items-center justify-between p-5 border border-border rounded-2xl bg-card hover:border-primary/20 hover:shadow-sm transition-all duration-300">
                      <span className="font-semibold text-foreground">{check.label}</span>
                      {check.pass ? (
                         <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5">
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                           Pass
                         </span>
                      ) : check.warning ? (
                         <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-sm font-bold">Warning</span>
                      ) : (
                         <span className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5">
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                           Fail
                         </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="m-0 focus-visible:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-sm border-border rounded-3xl overflow-hidden bg-card">
                <CardHeader className="bg-secondary/50 border-b border-border p-6">
                  <CardTitle className="text-xl tracking-tight text-foreground flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    SSL & Connection
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    <div className="flex justify-between items-center p-6 hover:bg-secondary/50 transition-colors">
                      <span className="text-muted-foreground font-medium">HTTPS Secure</span>
                      {audit.details.security?.isHttps ? (
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">Yes</span>
                      ) : (
                        <span className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-sm font-bold">No</span>
                      )}
                    </div>
                    {audit.details.security?.sslInfo && (
                      <>
                        <div className="flex justify-between items-center p-6 hover:bg-secondary/50 transition-colors">
                          <span className="text-muted-foreground font-medium">SSL Issuer</span>
                          <span className="font-semibold text-foreground text-right">{audit.details.security.sslInfo.issuer}</span>
                        </div>
                        <div className="flex justify-between items-center p-6 hover:bg-secondary/50 transition-colors">
                          <span className="text-muted-foreground font-medium">Days Remaining</span>
                          <span className={`font-bold text-xl px-3 py-1 rounded-lg ${audit.details.security.sslInfo.daysRemaining > 30 ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-500'}`}>
                            {audit.details.security.sslInfo.daysRemaining} days
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm border-border rounded-3xl overflow-hidden bg-card">
                <CardHeader className="bg-secondary/50 border-b border-border p-6">
                  <CardTitle className="text-xl tracking-tight text-foreground flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
                    DNS & Server
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    <div className="flex justify-between items-center p-6 hover:bg-secondary/50 transition-colors">
                      <span className="text-muted-foreground font-medium">IP Address</span>
                      <span className="font-mono font-bold text-sm bg-secondary px-3 py-1 rounded-lg border border-border text-muted-foreground">{audit.details.security?.ipAddress || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between items-center p-6 hover:bg-secondary/50 transition-colors">
                      <span className="text-muted-foreground font-medium">SPF Record</span>
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${audit.details.security?.spfRecord ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-500'}`}>
                        {audit.details.security?.spfRecord ? 'Configured' : 'Missing'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-6 hover:bg-secondary/50 transition-colors">
                      <span className="text-muted-foreground font-medium">DMARC Record</span>
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${audit.details.security?.dmarcRecord ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-500'}`}>
                        {audit.details.security?.dmarcRecord ? 'Configured' : 'Missing'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="m-0 focus-visible:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-sm border-border rounded-3xl overflow-hidden h-full bg-card">
                <CardHeader className="bg-[#1877F2]/5 border-b border-[#1877F2]/10 p-6">
                  <CardTitle className="text-xl tracking-tight text-foreground flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#1877F2] shadow-[0_0_10px_rgba(24,119,242,0.5)]"></div>
                    Open Graph
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">OG Title</p>
                    <p className="text-xl font-bold text-foreground leading-tight">{audit.details.social?.og?.title || 'No OG Title'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">OG Description</p>
                    <p className="text-base text-muted-foreground leading-relaxed bg-secondary/50 p-4 rounded-2xl border border-border">{audit.details.social?.og?.description || 'No OG Description'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-border rounded-3xl overflow-hidden h-full bg-card">
                <CardHeader className="bg-[#1DA1F2]/5 border-b border-[#1DA1F2]/10 p-6">
                  <CardTitle className="text-xl tracking-tight text-foreground flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#1DA1F2] shadow-[0_0_10px_rgba(29,161,242,0.5)]"></div>
                    Twitter Cards
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Twitter Title</p>
                    <p className="text-xl font-bold text-foreground leading-tight">{audit.details.social?.twitter?.title || 'No Twitter Title'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Card Type</p>
                    <div className="inline-flex text-sm font-bold bg-[#1DA1F2]/10 text-[#1DA1F2] px-4 py-2 rounded-xl border border-[#1DA1F2]/20">
                      {audit.details.social?.twitter?.card || 'Not specified'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Tech Stack Footer */}
      {audit.details.technology?.stack && audit.details.technology.stack.length > 0 && (
        <div className="bg-card/80 backdrop-blur-md rounded-3xl border border-border p-8 shadow-sm">
          <h3 className="text-xl font-bold text-foreground mb-2">Detected Technologies</h3>
          <p className="text-muted-foreground text-sm mb-6">Frameworks and server infrastructure identified on this webpage.</p>
          <div className="flex flex-wrap gap-2">
            {audit.details.technology.stack.map((tech, i) => (
              <Badge key={i} variant="secondary" className="px-4 py-2 rounded-xl text-sm font-medium bg-secondary text-foreground hover:bg-secondary/80">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
