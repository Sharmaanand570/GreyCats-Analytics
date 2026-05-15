import api from '@/apiConfig';
import type { AxiosError } from 'axios';
import type {
  CreateBlogPostPayload,
  UpdateBlogPostPayload,
  ListBlogPostsParams,
  BlogPost,
  BlogPostResponse,
  BlogPostsListResponse,
  UploadBlogMediaResponse,
  DeleteBlogPostResponse,
  BlogIntegrationsResponse,
  BlogIntegration,
  BlogFetchDetailsResponse,
  BlogPlatformDetail,
  FetchLinkedInTargetsResponse,
  LinkedInTarget,
  ConnectWordPressPayload,
  WordPressTarget,
  FetchWordPressTargetsResponse,
  ConnectTelegramPayload,
  TelegramTarget,
  FetchTelegramTargetsResponse,
} from './types';

type ApiError = { message?: string; error?: string };

const extractError = (error: unknown, fallback: string): string => {
  const axiosError = error as AxiosError<ApiError>;
  return (
    axiosError.response?.data?.message ||
    axiosError.response?.data?.error ||
    fallback
  );
};

/**
 * Upload media files for blog posts.
 * POST /api/blog/posts/upload
 */
export const uploadBlogMedia = async (
  files: File[],
  onProgress?: (percent: number) => void
): Promise<string[]> => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  try {
    const response = await api.post<UploadBlogMediaResponse>(
      '/blog-posts/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120_000,
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      }
    );
    return response.data.urls;
  } catch (error) {
    throw new Error(extractError(error, 'Failed to upload media'));
  }
};

/**
 * Create a blog post (draft or scheduled).
 * POST /api/blog-posts/schedule
 */
export const createBlogPost = async (
  payload: CreateBlogPostPayload
): Promise<BlogPost> => {
  try {
    const finalPayload = {
      ...payload,
      client_id: payload.clientId, // Fallback for snake_case backends
    };
    console.log('[Blog API] createBlogPost PAYLOAD:', finalPayload);
    const response = await api.post<BlogPostResponse & { message?: string; error?: string }>('/blog-posts/schedule', finalPayload);
    console.log('[Blog API] createBlogPost RESPONSE:', response.data);
    const data = response.data as any;
    if (data.success === false || data.error || (!data.success && !data.post)) {
      throw new Error(data.message || data.error || 'Failed to create blog post');
    }
    return response.data.post;
  } catch (error) {
    throw new Error(extractError(error, 'Failed to create blog post'));
  }
};

/**
 * List blog posts with optional filters.
 * GET /api/blog-posts/posts
 */
export const listBlogPosts = async (
  params?: ListBlogPostsParams
): Promise<BlogPostsListResponse> => {
  try {
    const finalParams = params ? {
      ...params,
      client_id: params.clientId, // Fallback for snake_case backends
    } : params;
    console.log('[Blog API] listBlogPosts PARAMS:', finalParams);
    const response = await api.get<BlogPostsListResponse & { message?: string; error?: string }>('/blog-posts/posts', { params: finalParams });
    console.log('[Blog API] listBlogPosts RESPONSE:', response.data);
    const data = response.data as any;
    if (data.success === false || data.error || (!data.success && !data.posts)) {
      throw new Error(data.message || data.error || 'Failed to fetch blog posts');
    }
    return response.data;
  } catch (error) {
    throw new Error(extractError(error, 'Failed to fetch blog posts'));
  }
};

/**
 * Get a single blog post.
 * GET /api/blog-posts/posts/:id
 */
export const getBlogPost = async (id: number): Promise<BlogPost> => {
  try {
    console.log('[Blog API] getBlogPost ID:', id);
    const response = await api.get<BlogPostResponse & { message?: string; error?: string }>(`/blog-posts/posts/${id}`);
    console.log('[Blog API] getBlogPost RESPONSE:', response.data);
    const data = response.data as any;
    if (data.success === false || data.error || (!data.success && !data.post)) {
      throw new Error(data.message || data.error || 'Failed to fetch blog post');
    }
    return response.data.post;
  } catch (error) {
    throw new Error(extractError(error, 'Failed to fetch blog post'));
  }
};

/**
 * Update a PENDING blog post.
 * PATCH /api/blog-posts/posts/:id
 */
export const updateBlogPost = async (
  id: number,
  payload: UpdateBlogPostPayload
): Promise<BlogPost> => {
  try {
    const finalPayload = {
      ...payload,
      client_id: (payload as any).clientId, // Fallback for snake_case backends
    };
    console.log('[Blog API] updateBlogPost ID:', id, 'PAYLOAD:', finalPayload);
    const response = await api.patch<BlogPostResponse & { message?: string; error?: string }>(`/blog-posts/posts/${id}`, finalPayload);
    console.log('[Blog API] updateBlogPost RESPONSE:', response.data);
    const data = response.data as any;
    if (data.success === false || data.error || (!data.success && !data.post)) {
      throw new Error(data.message || data.error || 'Failed to update blog post');
    }
    return response.data.post;
  } catch (error) {
    throw new Error(extractError(error, 'Failed to update blog post'));
  }
};

/**
 * Delete / cancel a blog post.
 * DELETE /api/blog-posts/posts/:id
 */
export const deleteBlogPost = async (id: number): Promise<void> => {
  try {
    console.log('[Blog API] deleteBlogPost ID:', id);
    const response = await api.delete<DeleteBlogPostResponse & { message?: string; error?: string }>(`/blog-posts/posts/${id}`);
    console.log('[Blog API] deleteBlogPost RESPONSE:', response.data);
    const data = response.data as any;
    if (data.success === false || data.error) {
      throw new Error(data.message || data.error || 'Failed to delete blog post');
    }
  } catch (error) {
    throw new Error(extractError(error, 'Failed to delete blog post'));
  }
};

/**
 * Fetch LinkedIn target profiles and pages.
 * GET /api/blog-posts/targets/linkedin
 */
export const getLinkedInTargets = async (clientId?: number): Promise<LinkedInTarget[]> => {
  try {
    console.log('[Blog API] getLinkedInTargets', clientId);
    const response = await api.get<FetchLinkedInTargetsResponse & { message?: string; error?: string }>('/blog-posts/targets/linkedin', {
      params: clientId ? { clientId } : undefined,
    });
    console.log('[Blog API] getLinkedInTargets RESPONSE:', response.data);
    const data = response.data as any;
    if (data.success === false || data.error || (!data.success && !data.targets)) {
      throw new Error(data.message || data.error || 'Failed to fetch LinkedIn targets');
    }
    return response.data.targets;
  } catch (error) {
    throw new Error(extractError(error, 'Failed to fetch LinkedIn targets'));
  }
};

/**
 * Get connected blog integrations.
 * GET /api/blog/integrations
 */
export const getBlogIntegrations = async (clientId?: number): Promise<BlogIntegration[]> => {
  try {
    const response = await api.get<BlogIntegrationsResponse>('/blog/integrations', {
      params: clientId ? { clientId } : undefined,
    });
    return response.data.integrations;
  } catch (error) {
    throw new Error(extractError(error, 'Failed to fetch blog integrations'));
  }
};

/**
 * Get platform-specific details (categories, pages, subreddits).
 * GET /api/blog/fetch-details?platform=...&accountId=...
 */
export const fetchPlatformDetails = async (
  platform: string,
  accountId: string
): Promise<BlogPlatformDetail[]> => {
  try {
    const response = await api.get<BlogFetchDetailsResponse>('/blog/fetch-details', {
      params: { platform, accountId },
    });
    return response.data.details;
  } catch (error) {
    throw new Error(extractError(error, 'Failed to fetch platform details'));
  }
};

/**
 * Connect a WordPress site via Application Password.
 * POST /api/blog-posts/integrations/wordpress
 *
 * Backend returns diagnosticCode on 401:
 * - FIREWALL_BLOCKED: Wordfence/security firewall intercepted the request
 * - AUTH_FAILED: Wrong Application Password
 * - REST_API_DISABLED: REST API blocked on site
 */
export const connectWordPress = async (
  payload: ConnectWordPressPayload
): Promise<void> => {
  try {
    const response = await api.post<{ success?: boolean; message?: string; error?: string; diagnosticCode?: string }>(
      '/blog-posts/integrations/wordpress',
      payload
    );
    const data = response.data as any;
    if (data.success === false || data.error) {
      throw new Error(data.message || data.error || 'Failed to connect WordPress');
    }
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string; error?: string; diagnosticCode?: string }>;
    const diagCode = axiosError.response?.data?.diagnosticCode;
    const serverMessage = axiosError.response?.data?.message;

    if (diagCode === 'FIREWALL_BLOCKED') {
      throw new Error(serverMessage || 'Your WordPress site\'s firewall (e.g. Wordfence) blocked the connection. Please whitelist our server IP in your security plugin settings.');
    }
    if (diagCode === 'AUTH_FAILED') {
      throw new Error('Authentication failed. Please verify your WordPress username and Application Password are correct.');
    }
    if (diagCode === 'REST_API_DISABLED') {
      throw new Error('The WordPress REST API is disabled on your site. Please enable it to allow connections.');
    }

    throw new Error(extractError(error, 'Failed to connect WordPress site'));
  }
};

/**
 * Fetch connected WordPress targets (sites).
 * GET /api/blog-posts/targets/wordpress
 */
export const getWordPressTargets = async (clientId?: number): Promise<WordPressTarget[]> => {
  try {
    const response = await api.get<FetchWordPressTargetsResponse>('/blog-posts/targets/wordpress', {
      params: clientId ? { clientId } : undefined,
    });
    const data = response.data as any;
    if (data.success === false || data.error) {
      throw new Error(data.message || data.error || 'Failed to fetch WordPress targets');
    }
    return response.data.targets;
  } catch (error) {
    throw new Error(extractError(error, 'Failed to fetch WordPress targets'));
  }
};

/**
 * Connect a Telegram channel via Bot Token.
 * POST /api/blog-posts/integrations/telegram
 */
export const connectTelegram = async (
  payload: ConnectTelegramPayload
): Promise<void> => {
  try {
    const response = await api.post<{ success?: boolean; message?: string; error?: string }>(
      '/blog-posts/integrations/telegram',
      payload
    );
    const data = response.data as any;
    if (data.success === false || data.error) {
      throw new Error(data.message || data.error || 'Failed to connect Telegram');
    }
  } catch (error) {
    throw new Error(extractError(error, 'Failed to connect Telegram channel'));
  }
};

/**
 * Fetch connected Telegram targets (channels).
 * GET /api/blog-posts/targets/telegram
 */
export const getTelegramTargets = async (clientId?: number): Promise<TelegramTarget[]> => {
  try {
    const response = await api.get<FetchTelegramTargetsResponse>('/blog-posts/targets/telegram', {
      params: clientId ? { clientId } : undefined,
    });
    const data = response.data as any;
    if (data.success === false || data.error) {
      throw new Error(data.message || data.error || 'Failed to fetch Telegram targets');
    }
    return response.data.targets;
  } catch (error) {
    throw new Error(extractError(error, 'Failed to fetch Telegram targets'));
  }
};
