// Blog Scheduler — Backend-aligned types

export type BlogPlatform = 'wordpress' | 'linkedin' | 'blogger' | 'reddit';
export type BlogPostStatus = 'PENDING' | 'PROCESSING' | 'PUBLISHED' | 'FAILED';

export interface BlogTargetSettings {
  categoryId?: number;
}

export interface BlogTarget {
  platform: BlogPlatform;
  targetAccountId: string;
  targetAccountName?: string;
  targetSettings?: BlogTargetSettings;
  status?: BlogPostStatus;
  errorMessage?: string | null;
  metrics?: {
    comments?: number;
  };
}

export interface LinkedInTarget {
  id: string;
  name: string;
  type: 'personal' | 'page';
  portAccountId?: number;
}

export interface FetchLinkedInTargetsResponse {
  success: boolean;
  targets: LinkedInTarget[];
}

export interface BlogPost {
  id: number;
  userId: number;
  clientId: number;
  title: string;
  /** HTML content from the rich text editor. */
  content: string;
  mediaUrls: string[];
  targets: BlogTarget[];
  scheduledFor: string; // ISO UTC
  status: BlogPostStatus;
  errorMessage: string | null;
  publishedUrls: string[] | null;
  /** Insights after publishing. */
  insights?: {
    views?: number;
    likes?: number;
    comments?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogPostPayload {
  clientId: number;
  title: string;
  content: string;
  mediaUrls?: string[];
  scheduledFor: string; // ISO UTC
  targets: BlogTarget[];
}

export interface UpdateBlogPostPayload {
  title?: string;
  content?: string;
  mediaUrls?: string[];
  scheduledFor?: string;
  targets?: BlogTarget[];
}

export interface UploadBlogMediaResponse {
  success: boolean;
  urls: string[];
}

export interface BlogPostResponse {
  success: boolean;
  post: BlogPost;
}

export interface BlogPostsListResponse {
  success: boolean;
  total: number;
  posts: BlogPost[];
}

export interface DeleteBlogPostResponse {
  success: boolean;
  message: string;
}

export interface ListBlogPostsParams {
  clientId?: number;
  status?: BlogPostStatus;
}

export interface BlogIntegration {
  id: string;
  platform: BlogPlatform;
  accountId: string;
  accountName: string;
  profileImage?: string;
}

export interface BlogIntegrationsResponse {
  success: boolean;
  integrations: BlogIntegration[];
}

export interface BlogPlatformDetail {
  id: string;
  label: string;
}

export interface BlogFetchDetailsResponse {
  success: boolean;
  details: BlogPlatformDetail[];
}

// ── WordPress ──

export interface ConnectWordPressPayload {
  siteUrl: string;
  username: string;
  applicationPassword: string;
  siteName?: string;
}

export interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
}

export interface WordPressTarget {
  id: string;
  name: string;
  type: 'wordpress';
  url: string;
  siteIconUrl?: string;
  categories?: WordPressCategory[];
}

export interface FetchWordPressTargetsResponse {
  success: boolean;
  targets: WordPressTarget[];
}
