export interface MetadataDetails {
  title: string;
  titleLength: number;
  description: string;
  descriptionLength: number;
  canonical: string | null;
  schema: boolean;
  hreflangs: { lang: string; href: string }[];
  htmlLang: string;
  wordCount: number;
  noindexMeta: boolean;
  noindexHeader: boolean;
  llmsExists: boolean;
  hasIdentitySchema: boolean;
}

export interface HeadingDetails {
  h1: string[];
  h2: string[];
  h3: string[];
  h4: string[];
  h5: string[];
  h6: string[];
}

export interface ImageDetails {
  total: number;
  missingAlt: number;
  hasAltCount: number;
}

export interface LinkDetails {
  total: number;
  internal: number;
  external: number;
  externalFollow: number;
  externalNofollow: number;
  items: { href: string; text: string; isInternal: boolean; nofollow: boolean }[];
}

export interface PerformanceDetails {
  ttfb: number;           // ms
  pageLoadTime: number;   // ms
  htmlSizeKB: number;
  isCompressed: boolean;
  contentEncoding: string;
  totalAssets: number;
  cssCount: number;
  jsCount: number;
  minifiedAssets: number;
  minifyScore: number;    // 0-100
  inlineStylesCount: number;
  deprecatedCount: number;
  http2: boolean;
}

export interface SecurityDetails {
  isHttps: boolean;
  serverHeader: string;
  sslInfo: { issuer: string; subject: string; validTo: string; daysRemaining: number } | null;
  sslError: string | null;
  securityHeaders: { hsts: boolean; csp: boolean; xFrameOptions: boolean; xContentType: boolean };
  ipAddress: string;
  dnsServers: string[];
  spfRecord: string;
  dmarcRecord: string;
}

export interface SocialDetails {
  og: { title: string; image: string; description: string };
  twitter: { card: string; title: string };
  socialProfiles: string[];   // e.g. ["facebook", "linkedin"]
  hasFbPixel: boolean;
}

export interface UsabilityDetails {
  viewportMeta: boolean;
  favicon: boolean;
  flash: boolean;
  iframe: boolean;
}

export interface TechnologyDetails {
  frameworks: string[];
  cms: string | null;
  analytics: string[];
}

export interface KeywordEntry {
  keyword: string;
  count: number;
  density: number;
}

export interface Recommendation {
  category: "SEO" | "Performance" | "Usability" | "Security" | "Social";
  priority: "High" | "Medium" | "Low";
  title: string;
  description: string;
  fix: string;
}

export interface PremiumSEOData {
  organicKeywords: { keyword: string; position: number; searches: number; traffic: number }[];
  paidKeywords:    { keyword: string; position: number; searches: number; traffic: number }[];
  aiOverviewCitations: { keyword: string; position: number; searches: number; traffic: number }[];
  keywordPositions: { pos1: number; pos2_3: number; pos4_10: number; pos11_20: number; pos21_30: number; pos31_100: number };
  domainStrength:   number;
  pageStrength:     number;
  backlinkCount:    number;
  referringDomains: number;
  topBacklinks:     { url: string; domainStrength: number; pageStrength: number }[];
  topAnchors:       { anchor: string; count: number }[];
  topPages:         { url: string; count: number }[];
  topTlds:          { tld: string; count: number }[];
  topCountries:     { country: string; count: number }[];
  coreWebVitals:    { lcp: number; inp: number; cls: number };
  pagespeedMobile:  { score: number; fcp: number; speedIndex: number; lcp: number; tti: number; tbt: number; cls: number };
  pagespeedDesktop: { score: number; fcp: number; speedIndex: number; lcp: number; tti: number; tbt: number; cls: number };
}

export interface AuditResult {
  id: string;
  domain: string;
  url: string;
  canonical_url: string;
  overall_grade:    string;
  seo_grade:        string;
  usability_grade:  string;
  performance_grade: string;
  social_grade:     string;
  security_grade:   string;
  scores: {
    overall:     number;
    seo:         number;
    usability:   number;
    performance: number;
    social:      number;
    security:    number;
  };
  details: {
    metadata:     MetadataDetails;
    headings:     HeadingDetails;
    images:       ImageDetails;
    links:        LinkDetails;
    usability:    UsabilityDetails;
    performance:  PerformanceDetails;
    security:     SecurityDetails;
    social:       SocialDetails;
    technology:   TechnologyDetails;
    topKeywords:  KeywordEntry[];
    recommendations: Recommendation[];
    premium:      PremiumSEOData;
  };
  created_at: string;
}
