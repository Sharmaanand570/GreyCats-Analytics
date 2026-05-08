import api from '@/apiConfig';
import type { AxiosError } from 'axios';
import type {
  CreatePostPayload,
  UpdatePostPayload,
  ListPostsParams,
  ScheduledPost,
  ScheduledPostResponse,
  ScheduledPostsListResponse,
  UploadMediaResponse,
  DeletePostResponse,
  CollaboratorSearchResult,
  LocationSearchResult,
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
 * Upload media files to S3.
 * POST /api/scheduled-posts/upload
 */
export const uploadScheduledMedia = async (
  files: File[],
  onProgress?: (percent: number) => void
): Promise<string[]> => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  try {
    const response = await api.post<UploadMediaResponse>(
      '/scheduled-posts/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120_000, // 2 min for large videos
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
 * Create a scheduled post.
 * POST /api/scheduled-posts
 */
export const createScheduledPost = async (
  payload: CreatePostPayload
): Promise<ScheduledPost> => {
  try {
    const response = await api.post<ScheduledPostResponse>(
      '/scheduled-posts',
      payload
    );
    return response.data.post;
  } catch (error) {
    throw new Error(extractError(error, 'Failed to create scheduled post'));
  }
};

/**
 * List scheduled posts with optional filters.
 * GET /api/scheduled-posts
 */
export const listScheduledPosts = async (
  params?: ListPostsParams
): Promise<ScheduledPostsListResponse> => {
  try {
    const response = await api.get<ScheduledPostsListResponse>(
      '/scheduled-posts',
      { params }
    );
    return response.data;
  } catch (error) {
    throw new Error(extractError(error, 'Failed to fetch scheduled posts'));
  }
};

/**
 * Get a single scheduled post.
 * GET /api/scheduled-posts/:id
 */
export const getScheduledPost = async (
  id: number
): Promise<ScheduledPost> => {
  try {
    const response = await api.get<ScheduledPostResponse>(
      `/scheduled-posts/${id}`
    );
    return response.data.post;
  } catch (error) {
    throw new Error(extractError(error, 'Failed to fetch scheduled post'));
  }
};

/**
 * Update a PENDING scheduled post.
 * PATCH /api/scheduled-posts/:id
 */
export const updateScheduledPost = async (
  id: number,
  payload: UpdatePostPayload
): Promise<ScheduledPost> => {
  try {
    const response = await api.patch<ScheduledPostResponse>(
      `/scheduled-posts/${id}`,
      payload
    );
    return response.data.post;
  } catch (error) {
    throw new Error(extractError(error, 'Failed to update scheduled post'));
  }
};

/**
 * Delete a PENDING scheduled post.
 * DELETE /api/scheduled-posts/:id
 */
export const deleteScheduledPost = async (id: number): Promise<void> => {
  try {
    await api.delete<DeletePostResponse>(`/scheduled-posts/${id}`);
  } catch (error) {
    throw new Error(extractError(error, 'Failed to delete scheduled post'));
  }
};

/**
 * Retry or Reschedule a FAILED scheduled post.
 * POST /api/scheduled-posts/:id/retry
 */
export const retryScheduledPost = async (
  id: number,
  scheduledFor?: string
): Promise<ScheduledPost> => {
  try {
    const response = await api.post<ScheduledPostResponse>(
      `/scheduled-posts/${id}/retry`,
      { scheduledFor }
    );
    return response.data.post;
  } catch (error) {
    throw new Error(extractError(error, 'Failed to retry scheduled post'));
  }
};

interface SearchLocationsResponse {
  success: boolean;
  locations: LocationSearchResult[];
}

/**
 * Search Meta Places (locations) by name.
 * GET /api/scheduled-posts/locations/search?q=&metaAccountId=
 */
export const searchLocations = async (
  q: string,
  metaAccountId: number
): Promise<LocationSearchResult[]> => {
  try {
    const response = await api.get<SearchLocationsResponse>(
      '/scheduled-posts/locations/search',
      { params: { q, metaAccountId } }
    );
    return response.data.locations;
  } catch (error) {
    throw new Error(extractError(error, 'Location search failed'));
  }
};

interface SearchUserResponse {
  success: boolean;
  user: CollaboratorSearchResult;
}

/**
 * Search for an Instagram user by username to get their hidden numeric ID.
 * Used exclusively for the Collaborators flow.
 * GET /api/scheduled-posts/instagram/search-user?username=&metaAccountId=
 */
export const searchInstagramUser = async (
  username: string,
  metaAccountId: number
): Promise<CollaboratorSearchResult> => {
  try {
    const response = await api.get<SearchUserResponse>(
      '/scheduled-posts/instagram/search-user',
      { params: { username, metaAccountId } }
    );
    return response.data.user;
  } catch (error) {
    throw new Error(extractError(error, 'User not found'));
  }
};
