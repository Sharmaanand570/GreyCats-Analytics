// Scheduled Posts — Backend-aligned types

export type PostPlatform = 'facebook' | 'instagram' | 'both' | 'linkedin';
export type PostStatus = 'PENDING' | 'PROCESSING' | 'PUBLISHED' | 'FAILED';
export type MediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL';
export type PostType = 'FEED' | 'STORY';

/** A photo-tag: username + click position as 0.0–1.0 floats. */
export interface UserTag {
  username: string;
  x: number; // 0.0 (left) → 1.0 (right)
  y: number; // 0.0 (top)  → 1.0 (bottom)
}

/** Result from GET /api/scheduled-posts/instagram/search-user */
export interface CollaboratorSearchResult {
  id: string;
  username: string;
  profile_picture_url: string;
}

export interface ScheduledPost {
  id: number;
  userId: number;
  platform: PostPlatform;
  metaAccountId?: number | null;
  twitterAccountId?: number | null;
  linkedinPortAccountId?: number | null;
  postType?: PostType;
  message: string | null;
  firstComment: string | null;
  mediaUrls: string[];
  mediaType: MediaType | null;
  scheduledFor: string; // ISO UTC
  status: PostStatus;
  errorMessage: string | null;
  publishedPostIds: string[] | null;
  /** Meta Pages Search location ID (place). */
  locationId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Result from GET /api/scheduled-posts/locations/search */
export interface LocationSearchResult {
  id: string;
  name: string;
  location?: {
    city?: string;
    country?: string;
    street?: string;
    zip?: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface CreatePostPayload {
  metaAccountId?: number;
  twitterAccountId?: number;
  linkedinPortAccountId?: number;
  clientId?: number;
  platform: PostPlatform;
  postType?: PostType;
  message?: string;
  firstComment?: string;
  mediaUrls?: string[];
  mediaType?: MediaType;
  scheduledFor: string; // ISO UTC
  /** Instagram photo tags (image posts only). */
  userTags?: UserTag[];
  /** Instagram collaborator usernames (fetched via search-user proxy). */
  collaboratorIds?: string[];
  /** Meta location/place ID for geo-tagging. */
  locationId?: string;
}

export interface UpdatePostPayload {
  message?: string;
  firstComment?: string;
  mediaUrls?: string[];
  mediaType?: MediaType;
  scheduledFor?: string;
  platform?: PostPlatform;
  metaAccountId?: number;
  twitterAccountId?: number;
  linkedinPortAccountId?: number;
  postType?: PostType;
  userTags?: UserTag[];
  collaboratorIds?: string[];
  /** Meta location/place ID for geo-tagging. */
  locationId?: string;
}

export interface UploadMediaResponse {
  success: boolean;
  urls: string[];
}

export interface ScheduledPostResponse {
  success: boolean;
  post: ScheduledPost;
}

export interface ScheduledPostsListResponse {
  success: boolean;
  total: number;
  posts: ScheduledPost[];
}

export interface DeletePostResponse {
  success: boolean;
  message: string;
}

export interface ListPostsParams {
  clientId?: number;
  status?: PostStatus;
}
