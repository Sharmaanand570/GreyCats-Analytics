import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Sparkles, Image as ImageIcon, CheckCircle2, Plus, ChevronLeft, ChevronRight, Upload, Globe, Info, Tag, Users2, X as XIcon, Search, UserPlus, AlertCircle, Calendar, FileText, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { FaInstagram, FaFacebook } from 'react-icons/fa6';
import { useSocialMediaStore } from '@/store/useSocialMediaStore';

import { useClientContext } from '@/context/ClientContext';
import { useCreatePost } from '../hooks/useCreatePost';
import { useUpdatePost } from '../hooks/useUpdatePost';
import { useSearchCollaborator } from '../hooks/useSearchCollaborator';
import { useSearchLocation } from '../hooks/useSearchLocation';
import type { ScheduledPost, PostPlatform, PostType, UserTag, CollaboratorSearchResult, LocationSearchResult } from '../api/types';
import { Loader2 } from 'lucide-react';

interface SocialMediaPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: number;
  editingPost?: ScheduledPost | null;
}

const PLATFORMS: { id: PostPlatform; icon: React.ReactNode; label: string }[] = [
  { id: 'instagram', icon: <FaInstagram className="w-5 h-5" />, label: 'Instagram' },
  { id: 'facebook', icon: <FaFacebook className="w-5 h-5" />, label: 'Facebook' },
  {
    id: 'both',
    icon: (
      <div className="flex -space-x-1">
        <FaFacebook className="w-4 h-4 text-blue-600" />
        <FaInstagram className="w-4 h-4 text-pink-600" />
      </div>
    ),
    label: 'Both',
  },
];

const ASPECT_RATIOS: Record<string, { label: string; value: string; css: string }[]> = {
  instagram: [
    { label: 'Square (1:1)', value: '1:1', css: '1/1' },
    { label: 'Portrait (4:5)', value: '4:5', css: '4/5' },
    { label: 'Vertical (9:16)', value: '9:16', css: '9/16' },
    { label: 'Landscape (1.91:1)', value: '1.91:1', css: '1.91/1' },
  ],
  facebook: [
    { label: 'Square (1:1)', value: '1:1', css: '1/1' },
    { label: 'Portrait (4:5)', value: '4:5', css: '4/5' },
    { label: 'Vertical (9:16)', value: '9:16', css: '9/16' },
    { label: 'Landscape (1.91:1)', value: '1.91:1', css: '1.91/1' },
  ],
  both: [
    { label: 'Square (1:1)', value: '1:1', css: '1/1' },
    { label: 'Portrait (4:5)', value: '4:5', css: '4/5' },
    { label: 'Vertical (9:16)', value: '9:16', css: '9/16' },
    { label: 'Landscape (1.91:1)', value: '1.91:1', css: '1.91/1' },
  ],
};

const CAPTION_LIMITS: Record<string, number> = {
  instagram: 2200,
  facebook: 63206,
  both: 2200,
};

const FIRST_COMMENT_LIMIT = 2200;

const COMMON_TIMEZONES = [
  { label: 'IST (UTC+5:30)', value: 'Asia/Kolkata' },
  { label: 'EST (UTC-5)', value: 'America/New_York' },
  { label: 'CST (UTC-6)', value: 'America/Chicago' },
  { label: 'MST (UTC-7)', value: 'America/Denver' },
  { label: 'PST (UTC-8)', value: 'America/Los_Angeles' },
  { label: 'GMT (UTC+0)', value: 'Europe/London' },
  { label: 'CET (UTC+1)', value: 'Europe/Paris' },
  { label: 'EET (UTC+2)', value: 'Europe/Helsinki' },
  { label: 'GST (UTC+4)', value: 'Asia/Dubai' },
  { label: 'SGT (UTC+8)', value: 'Asia/Singapore' },
  { label: 'JST (UTC+9)', value: 'Asia/Tokyo' },
  { label: 'AEST (UTC+10)', value: 'Australia/Sydney' },
  { label: 'NZST (UTC+12)', value: 'Pacific/Auckland' },
];

const getBrowserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'Asia/Kolkata';
  }
};

const VIDEO_SPECS = {
  formats: 'MP4 or MOV',
  maxSize: '1 GB',
  resolution: '1080 × 1920 px',
  aspectRatio: '9:16 (Vertical)',
  igDuration: '3s – 15 min',
  fbDuration: '3s – 240 min',
};

export function SocialMediaPostModal({ isOpen, onClose, clientId, editingPost }: SocialMediaPostModalProps) {
  const { currentClient } = useClientContext();
  const { draftPost, updateDraft, resetDraft } = useSocialMediaStore();
  const { platform, postType, aspectRatio, message: caption, mediaFiles = [], time, firstComment } = draftPost;
  const isStory = postType === 'STORY';

  const createMutation = useCreatePost();
  const updateMutation = useUpdatePost();

  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [timezone, setTimezone] = useState<string>(getBrowserTimezone);

  // Photo tagging
  const [userTags, setUserTags] = useState<UserTag[]>([]);
  const [isTaggingMode, setIsTaggingMode] = useState(false);
  const [pendingTag, setPendingTag] = useState<{ x: number; y: number } | null>(null);

  // Collaborators
  const [collaborators, setCollaborators] = useState<CollaboratorSearchResult[]>([]);

  // Location tagging
  const [selectedLocation, setSelectedLocation] = useState<LocationSearchResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainVideoRef = useRef<HTMLVideoElement>(null);

  // Meta account ID for collaborator search proxy
  const metaAccountIdForSearch: number | null =
    (currentClient?.integrations?.find((i) => i.integrationType === 'meta-business')?.accountId) ?? null;

  const {
    query: tagQuery,
    setQuery: setTagQuery,
    result: tagResult,
    isSearching: tagIsSearching,
    clearResult: clearTagSearch,
  } = useSearchCollaborator(metaAccountIdForSearch, 300);

  const {
    query: collabQuery,
    setQuery: setCollabQuery,
    result: collabResult,
    isSearching: collabIsSearching,
    error: collabError,
    clearResult: clearCollabSearch,
  } = useSearchCollaborator(metaAccountIdForSearch);

  const {
    query: locationQuery,
    setQuery: setLocationQuery,
    results: locationResults,
    isSearching: locationIsSearching,
    error: locationError,
    clear: clearLocationSearch,
  } = useSearchLocation(metaAccountIdForSearch);

  const isEditing = !!editingPost;

  // Prefill draft when editing + reset tagging/collaborators
  useEffect(() => {
    if (isOpen && editingPost) {
      const scheduledDate = new Date(editingPost.scheduledFor);
      updateDraft({
        date: scheduledDate,
        time: format(scheduledDate, 'HH:mm'),
        platform: editingPost.platform,
        postType: editingPost.postType || 'FEED',
        message: editingPost.message || '',
        firstComment: editingPost.firstComment || '',
        mediaFiles: [],
      });
    }
    // Always reset on open
    setUserTags([]);
    setCollaborators([]);
    setIsTaggingMode(false);
    setPendingTag(null);
    clearTagSearch();
    clearCollabSearch();
  }, [isOpen, editingPost]);

  // Auto-select first platform
  useEffect(() => {
    if (isOpen && !platform) {
      updateDraft({ platform: 'instagram', aspectRatio: '1:1' });
    }
  }, [isOpen, platform]);

  useEffect(() => {
    // Determine preview URLs: prioritizes new mediaFiles, falls back to editingPost.mediaUrls
    if (mediaFiles.length > 0) {
      const urls = mediaFiles.map((file) => URL.createObjectURL(file));
      setMediaUrls(urls);
      return () => urls.forEach((url) => URL.revokeObjectURL(url));
    } else if (isEditing && editingPost?.mediaUrls) {
      setMediaUrls(editingPost.mediaUrls);
    } else {
      setMediaUrls([]);
    }
  }, [mediaFiles, editingPost, isEditing]);

  useEffect(() => {
    if (mainVideoRef.current && mediaUrls[currentPreviewIndex]) {
      // Small delay to ensure the src is set
      const timer = setTimeout(() => {
        if (mainVideoRef.current) mainVideoRef.current.play().catch(() => {});
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentPreviewIndex, mediaUrls]);

  const validateFiles = (files: File[]): string | null => {
    if (isStory && files.length > 1) return 'Stories allow only 1 media file.';
    if (files.length > 10) return 'Maximum 10 files allowed.';

    for (const f of files) {
      const isVideo = f.type.startsWith('video/');
      const isImage = f.type.startsWith('image/');

      if (!isVideo && !isImage) return `Unsupported file type: ${f.name}`;

      if (isImage) {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowed.includes(f.type)) return `Unsupported image format: ${f.name}. Use JPG, PNG, GIF, or WEBP.`;
        if (f.size > 4 * 1024 * 1024) return `Image "${f.name}" exceeds 4 MB limit.`;
      }

      if (isVideo) {
        const allowed = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
        if (!allowed.includes(f.type)) return `Unsupported video format: ${f.name}. Use MP4, MOV, or AVI.`;
        if (f.size > 1024 * 1024 * 1024) return `Video "${f.name}" exceeds 1 GB limit.`;
      }
    }
    return null;
  };

  useEffect(() => {
    if (mediaFiles.length > 0) {
      setUploadError(validateFiles(mediaFiles));
    } else {
      setUploadError(null);
    }
  }, [platform, mediaFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const combined = [...mediaFiles, ...newFiles];
      const error = validateFiles(combined);
      if (error) {
        setUploadError(error);
      } else {
        setUploadError(null);
        updateDraft({ mediaFiles: combined });
      }
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    const updated = mediaFiles.filter((_, i) => i !== index);
    updateDraft({ mediaFiles: updated });
    if (currentPreviewIndex >= updated.length) {
      setCurrentPreviewIndex(Math.max(0, updated.length - 1));
    }
  };

  const nextPreview = () => {
    if (currentPreviewIndex < mediaFiles.length - 1) setCurrentPreviewIndex((p) => p + 1);
  };
  const prevPreview = () => {
    if (currentPreviewIndex > 0) setCurrentPreviewIndex((p) => p - 1);
  };

  const buildScheduledFor = (): string => {
    let d = draftPost.date;
    if (!d || typeof (d as any).getFullYear !== 'function') {
      d = d ? new Date(d) : new Date();
      if (isNaN(d.getTime())) d = new Date();
    }
    const [hours, minutes] = (time || '10:00').split(':').map(Number);
    // Build a date string in the user's selected timezone, then convert to UTC
    // Format: "YYYY-MM-DDTHH:mm:00" interpreted in the selected timezone
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
    // Use Intl to find the UTC offset for the selected timezone at this date/time
    const localDate = new Date(dateStr);
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    });
    // Get what the "wall clock" would show in the target timezone for a known UTC instant
    // Instead, we compute the offset by comparing the target timezone's representation
    const targetParts = formatter.formatToParts(localDate);
    const get = (type: string) => targetParts.find(p => p.type === type)?.value || '0';
    const tzNow = new Date(
      Number(get('year')), Number(get('month')) - 1, Number(get('day')),
      Number(get('hour')), Number(get('minute')), Number(get('second'))
    );
    // Offset in ms: how far ahead the timezone is from UTC
    const offsetMs = tzNow.getTime() - localDate.getTime();
    // The user picked hours:minutes meaning "in their timezone", so subtract the offset to get UTC
    const userLocalDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes);
    const utcDate = new Date(userLocalDate.getTime() - offsetMs);
    return utcDate.toISOString();
  };

  const captionLimit = CAPTION_LIMITS[platform || 'instagram'] || 2200;
  const captionLength = caption?.length || 0;
  const firstCommentLength = firstComment?.length || 0;
  const isCaptionOverLimit = captionLength > captionLimit;
  const isFirstCommentOverLimit = firstCommentLength > FIRST_COMMENT_LIMIT;

  // Accordion — only one section open at a time
  const [expandedSection, setExpandedSection] = useState<string | null>('schedule');

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const scheduledForStr = buildScheduledFor();
  const scheduledForPastError = new Date(scheduledForStr) <= new Date() && !isEditing;
  const scheduleWarning = !platform ? 'Platform required' : scheduledForPastError ? 'Date must be future' : null;

  const hasNewMedia = mediaFiles.length > 0;
  const hasExistingMedia = isEditing && (editingPost?.mediaUrls?.length || 0) > 0;
  const mediaWarning = (isStory || platform === 'instagram' || platform === 'both') && !hasNewMedia && !hasExistingMedia
    ? (isStory ? 'Media required for Stories' : 'Media required for Instagram') : null;

  const captionWarning = isCaptionOverLimit ? 'Caption limit exceeded' : isFirstCommentOverLimit ? 'Comment limit exceeded' : null;

  const renderSectionHeader = (
    id: string, 
    title: string, 
    icon: React.ReactNode, 
    warning?: string | null
  ) => {
    const isExpanded = expandedSection === id;
    return (
      <button
        type="button"
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-4 bg-zinc-50 hover:bg-zinc-100 transition-colors focus:outline-none rounded-xl"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold text-zinc-800">{title}</span>
          {warning && (
            <div className="flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md ml-2 shadow-sm">
              <AlertCircle className="w-3 h-3" />
              {warning}
            </div>
          )}
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
      </button>
    );
  };




  const handleSave = async () => {
    if (!platform) return;
    if (isCaptionOverLimit || isFirstCommentOverLimit) return;
    if (scheduledForPastError) {
      setUploadError('Scheduled date/time must be in the future.');
      return;
    }

    setUploadError(null);

    try {
      // 1. Find metaAccountId from integrations
      const integration = currentClient?.integrations?.find(
        (i) => i.integrationType === 'meta-business'
      );
      if (!integration) {
        throw new Error('No Meta account linked to this workspace. Please connect one first.');
      }
      const metaAccountId = integration.accountId;

      // 2. Create or Update using hooks
      if (isEditing && editingPost) {
        updateMutation.mutate({
          id: editingPost.id,
          files: mediaFiles,
          payload: {
            postType: postType || 'FEED',
            scheduledFor: scheduledForStr,
            platform: platform as PostPlatform,
            // Keep existing URLs if no new files are being uploaded
            mediaUrls: mediaFiles.length === 0 ? mediaUrls : undefined,
            ...(isStory ? {} : {
              message: caption || undefined,
              firstComment: firstComment || undefined,
              userTags: platform === 'instagram' && userTags.length > 0 ? userTags : undefined,
              collaboratorIds:
                platform === 'instagram' && collaborators.length > 0
                  ? collaborators.map((c) => c.username)
                  : undefined,
              locationId: selectedLocation?.id || undefined,
            }),
          },
        }, {
          onSuccess: () => {
            resetDraft();
            onClose();
          }
        });
      } else {
        createMutation.mutate({
          files: mediaFiles,
          payload: {
            metaAccountId,
            clientId,
            postType: postType || 'FEED',
            scheduledFor: scheduledForStr,
            platform: platform as PostPlatform,
            ...(isStory ? {} : {
              message: caption || undefined,
              firstComment: firstComment || undefined,
              userTags: platform === 'instagram' && userTags.length > 0 ? userTags : undefined,
              collaboratorIds:
                platform === 'instagram' && collaborators.length > 0
                  ? collaborators.map((c) => c.username)
                  : undefined,
              locationId: selectedLocation?.id || undefined,
            }),
          },
        }, {
          onSuccess: () => {
            resetDraft();
            onClose();
          }
        });
      }
    } catch (error: any) {
      setUploadError(error.message);
    }
  };

  const previewAspectRatioCss = isStory
    ? '9/16'
    : (platform && ASPECT_RATIOS[platform]?.find((r) => r.value === aspectRatio)?.css) || '1/1';

  const canSave =
    !!platform &&
    !uploadError &&
    (!isCaptionOverLimit || isStory) &&
    (!isFirstCommentOverLimit || isStory) &&
    (isStory
      ? (hasNewMedia || hasExistingMedia) // Stories always require media
      : (platform !== 'instagram' || hasNewMedia || hasExistingMedia)) &&
    !createMutation.isPending &&
    !updateMutation.isPending &&
    !scheduledForPastError;

  const renderMediaSection = () => (
    <div>
      <div className="flex justify-between items-end mb-2">
        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">
          Media {isEditing && hasExistingMedia && !hasNewMedia && <span className="normal-case text-zinc-400">(current)</span>}
        </label>
        <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded uppercase tracking-widest">
          {mediaFiles.length}/{isStory ? 1 : 10}
        </span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple={!isStory}
        accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.avi"
      />

      {isEditing && hasExistingMedia && !hasNewMedia && (
        <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50 flex flex-col gap-3">
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
            {editingPost!.mediaUrls.map((url, i) => (
              <div key={i} className="aspect-square relative rounded-lg border border-zinc-300 overflow-hidden bg-white shadow-sm">
                <img src={url} className="w-full h-full object-cover pointer-events-none" />
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="w-full text-xs font-semibold gap-1.5 border-dashed border-zinc-300 hover:bg-zinc-100"
          >
            <Upload className="w-3.5 h-3.5" />
            Replace Media
          </Button>
        </div>
      )}

      {(!isEditing || hasNewMedia || !hasExistingMedia) && (
        <>
          {mediaFiles.length === 0 ? (
            <>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-200 rounded-xl p-8 flex flex-col items-center justify-center bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-zinc-100">
                  <ImageIcon className="w-5 h-5 text-zinc-400" />
                </div>
                <p className="text-sm font-bold text-zinc-700 tracking-tight">Click to upload media</p>
                <p className="text-xs text-zinc-500 mt-1 font-medium text-center">
                  Images: JPG, PNG, GIF, WEBP (max 4 MB)
                  <br />
                  Videos: MP4, MOV, AVI (max 1 GB)
                </p>
              </div>
              {/* Video/Reels Specs */}
              <div className="mt-2 border border-blue-100 bg-blue-50/50 rounded-lg p-3 flex gap-2">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-[11px] text-blue-700 font-medium space-y-1">
                  <p className="font-bold text-blue-800">Meta Reels / Video Specs</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-blue-600">
                    <span>Resolution: {VIDEO_SPECS.resolution}</span>
                    <span>Ratio: {VIDEO_SPECS.aspectRatio}</span>
                    <span>Format: {VIDEO_SPECS.formats}</span>
                    <span>Max Size: {VIDEO_SPECS.maxSize}</span>
                    <span>IG Reels: {VIDEO_SPECS.igDuration}</span>
                    <span>FB Video: {VIDEO_SPECS.fbDuration}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50 flex flex-col gap-3">
              {uploadError && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-[11px] px-3 py-2 rounded-lg font-bold shadow-sm">
                  {uploadError}
                </div>
              )}
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {mediaUrls.map((url, i) => (
                  <div
                    key={i}
                    className="aspect-square relative rounded-lg border border-zinc-300 overflow-hidden bg-white shadow-sm group"
                  >
                    {mediaFiles[i]?.type.startsWith('video/') ? (
                      <video src={url} className="w-full h-full object-cover pointer-events-none" autoPlay muted loop playsInline />
                    ) : (
                      <img src={url} className="w-full h-full object-cover pointer-events-none" />
                    )}
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                    >
                      x
                    </button>
                  </div>
                ))}
                {mediaFiles.length < (isStory ? 1 : 10) && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-zinc-300 bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 transition-colors shadow-sm"
                  >
                    <Plus className="w-5 h-5 text-zinc-400" />
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Add</span>
                  </div>
                )}
              </div>
              {isEditing && hasExistingMedia && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateDraft({ mediaFiles: [] })}
                  className="text-xs text-zinc-500 hover:text-zinc-700"
                >
                  Revert to original media
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );

  /** Click handler on the preview image/wrapper — captures x,y as 0–1 floats. */
  const handleImageTagClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isTaggingMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    setPendingTag({ x, y });
    setIsTaggingMode(false);
  };

  const renderPhotoTaggingSection = () => {
    const hasImages = mediaFiles.some((f) => f.type.startsWith('image/'));
    const isVideoOnly = mediaFiles.length > 0 && !hasImages;
    if (isVideoOnly) return null;

    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            Tag People <span className="text-zinc-400 normal-case font-normal">(optional)</span>
          </label>
          {isTaggingMode ? (
            <button
              type="button"
              onClick={() => { setIsTaggingMode(false); setPendingTag(null); }}
              className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-md transition-colors"
            >
              <XIcon className="w-3.5 h-3.5" />
              Cancel
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { setIsTaggingMode(true); setPendingTag(null); }}
              className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add Tag
            </button>
          )}
        </div>

        {isTaggingMode && (
          <div className="text-[11px] text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-2 font-medium flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 shrink-0" />
            Click anywhere on the preview image to place a tag pin →
          </div>
        )}

        {pendingTag && (
          <div className="border border-blue-200 rounded-lg p-3 bg-blue-50/40 mb-2 relative">
            <p className="text-[11px] text-zinc-500 mb-1.5 font-medium">
              Tag at ({(pendingTag.x * 100).toFixed(0)}%, {(pendingTag.y * 100).toFixed(0)}%) — search username:
            </p>
            <div className="flex gap-2 relative">
              <div className="relative flex-1">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search business/creator..."
                  value={tagQuery}
                  onChange={(e) => setTagQuery(e.target.value.replace(/^@/, ''))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && tagResult) {
                      setUserTags((prev) => [...prev, { username: tagResult.username, x: pendingTag.x, y: pendingTag.y }]);
                      setPendingTag(null);
                      clearTagSearch();
                    } else if (e.key === 'Enter' && tagQuery.trim()) {
                      setUserTags((prev) => [...prev, { username: tagQuery.trim(), x: pendingTag.x, y: pendingTag.y }]);
                      setPendingTag(null);
                      clearTagSearch();
                    }
                    if (e.key === 'Escape') { setPendingTag(null); clearTagSearch(); }
                  }}
                  className="w-full px-3 py-1.5 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                {tagIsSearching && (
                  <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-400 animate-spin" />
                )}
              </div>
              <button
                type="button"
                disabled={!tagQuery.trim()}
                onClick={() => {
                  if (tagQuery.trim()) {
                    setUserTags((prev) => [...prev, { username: tagResult ? tagResult.username : tagQuery.trim(), x: pendingTag.x, y: pendingTag.y }]);
                    setPendingTag(null);
                    clearTagSearch();
                  }
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-zinc-900 text-white rounded-md disabled:opacity-40 hover:bg-zinc-700 transition-colors shrink-0"
              >
                Add
              </button>
            </div>
            
            {tagResult && (
              <div 
                className="mt-2 flex items-center gap-2 border border-blue-200 rounded-md p-2 bg-white cursor-pointer hover:bg-blue-50/50 transition-colors"
                onClick={() => {
                  setUserTags((prev) => [...prev, { username: tagResult.username, x: pendingTag.x, y: pendingTag.y }]);
                  setPendingTag(null);
                  clearTagSearch();
                }}
              >
                <img
                  src={tagResult.profile_picture_url}
                  alt={tagResult.username}
                  className="w-6 h-6 rounded-full object-cover border border-zinc-200 shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${tagResult.username}&background=e4e4e7&color=52525b&format=svg`;
                  }}
                />
                <span className="text-xs font-semibold text-zinc-800">@{tagResult.username}</span>
                <span className="text-[10px] text-zinc-400 ml-auto mr-1">Click to add</span>
              </div>
            )}
          </div>
        )}

        {userTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {userTags.map((tag, i) => (
              <span
                key={i}
                className="flex items-center gap-1 text-[11px] font-semibold bg-zinc-100 text-zinc-700 px-2 py-1 rounded-full border border-zinc-200"
              >
                <Tag className="w-3 h-3 text-zinc-400" />
                @{tag.username}
                <span className="text-zinc-400 font-normal ml-0.5">
                  ({(tag.x * 100).toFixed(0)}%, {(tag.y * 100).toFixed(0)}%)
                </span>
                <button
                  type="button"
                  onClick={() => setUserTags((prev) => prev.filter((_, idx) => idx !== i))}
                  className="ml-1 hover:text-red-500 transition-colors"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCollaboratorsSection = () => (
    <div>
      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Users2 className="w-3.5 h-3.5" />
        Collaborators <span className="text-zinc-400 normal-case font-normal">(optional)</span>
      </label>

      <div className="relative mb-2">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search Instagram username…"
          value={collabQuery}
          onChange={(e) => setCollabQuery(e.target.value)}
          className="w-full pl-8 pr-8 py-2 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
        />
        {collabIsSearching && (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 animate-spin" />
        )}
      </div>

      {collabError && (
        <p className="text-[11px] text-red-500 font-medium mb-2">{collabError}</p>
      )}

      {collabResult && !collaborators.find((c) => c.id === collabResult.id) && (
        <div className="flex items-center gap-3 border border-zinc-200 rounded-lg p-3 bg-white mb-2 shadow-sm">
          <img
            src={collabResult.profile_picture_url}
            alt={collabResult.username}
            className="w-9 h-9 rounded-full object-cover border border-zinc-200 shrink-0"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${collabResult.username}&background=e4e4e7&color=52525b&format=svg`;
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zinc-800 truncate">@{collabResult.username}</p>
            <p className="text-[10px] text-zinc-400 font-mono truncate">ID: {collabResult.id}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setCollaborators((prev) => [...prev, collabResult]);
              clearCollabSearch();
            }}
            className="flex items-center gap-1.5 text-[11px] font-semibold bg-zinc-900 text-white px-3 py-1.5 rounded-md hover:bg-zinc-700 transition-colors shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Invite
          </button>
        </div>
      )}

      {collaborators.length > 0 && (
        <div className="flex flex-col gap-2 mt-1">
          {collaborators.map((c) => (
            <div key={c.id} className="flex items-center gap-2.5 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2">
              <img
                src={c.profile_picture_url}
                alt={c.username}
                className="w-7 h-7 rounded-full object-cover border border-zinc-200 shrink-0"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${c.username}&background=e4e4e7&color=52525b&format=svg`;
                }}
              />
              <span className="text-sm font-medium text-zinc-700 flex-1 truncate">@{c.username}</span>
              <button
                type="button"
                onClick={() => setCollaborators((prev) => prev.filter((x) => x.id !== c.id))}
                className="text-zinc-400 hover:text-red-500 transition-colors"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {metaAccountIdForSearch === null && (
        <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-md px-2.5 py-1.5 font-medium mt-2">
          Connect a Meta account first to search collaborators.
        </p>
      )}
    </div>
  );

  const renderLocationSection = () => (
    <div>
      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5" />
        Location <span className="text-zinc-400 normal-case font-normal">(optional)</span>
      </label>

      {selectedLocation ? (
        <div className="flex items-center gap-2.5 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2">
          <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zinc-800 truncate">{selectedLocation.name}</p>
            {selectedLocation.location && (
              <p className="text-[10px] text-zinc-400 truncate">
                {[selectedLocation.location.street, selectedLocation.location.city, selectedLocation.location.country]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedLocation(null);
              clearLocationSearch();
            }}
            className="text-zinc-400 hover:text-red-500 transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search for a location…"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
            />
            {locationIsSearching && (
              <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 animate-spin" />
            )}
          </div>

          {locationError && (
            <p className="text-[11px] text-red-500 font-medium mb-2">{locationError}</p>
          )}

          {locationResults.length > 0 && (
            <div className="border border-zinc-200 rounded-lg overflow-hidden max-h-[200px] overflow-y-auto">
              {locationResults.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => {
                    setSelectedLocation(loc);
                    clearLocationSearch();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-zinc-50 transition-colors text-left border-b border-zinc-100 last:border-b-0"
                >
                  <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800 truncate">{loc.name}</p>
                    {loc.location && (
                      <p className="text-[10px] text-zinc-400 truncate">
                        {[loc.location.street, loc.location.city, loc.location.country]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {metaAccountIdForSearch === null && (
            <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-md px-2.5 py-1.5 font-medium mt-2">
              Connect a Meta account first to search locations.
            </p>
          )}
        </>
      )}
    </div>
  );

  const renderPreview = () => (
    <div className="w-full md:w-[55%] lg:flex-1 bg-zinc-50 border-t md:border-t-0 md:border-l border-zinc-200 p-4 md:p-6 flex flex-col items-center justify-center overflow-y-auto min-h-[40vh] md:min-h-[600px]">
      <div className="w-full max-w-[320px] bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden flex flex-col my-auto">
        {isStory ? (
          <div className="flex items-center p-3 border-b border-zinc-100 gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 shrink-0 ring-2 ring-white"></div>
            <div className="flex flex-col gap-0.5 flex-1">
              <div className="w-20 h-2 bg-zinc-200 rounded"></div>
              <div className="text-[9px] text-zinc-400 font-medium uppercase tracking-wider">Story</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center p-3 border-b border-zinc-100 gap-2">
            <div className="w-8 h-8 rounded-full bg-zinc-200 animate-pulse shrink-0"></div>
            <div className="flex flex-col gap-1 flex-1">
              <div className="w-24 h-2 bg-zinc-200 rounded"></div>
              <div className="w-16 h-2 bg-zinc-100 rounded"></div>
            </div>
            {(platform === 'instagram' || platform === 'both') && (
              <div className="w-1 h-3 flex flex-col justify-between">
                <div className="w-1 h-1 bg-zinc-300 rounded-full" />
                <div className="w-1 h-1 bg-zinc-300 rounded-full" />
                <div className="w-1 h-1 bg-zinc-300 rounded-full" />
              </div>
            )}
          </div>
        )}

        <div
          className="w-full bg-zinc-100 flex items-center justify-center relative overflow-hidden group/preview transition-all duration-300 mx-auto"
          style={{ aspectRatio: previewAspectRatioCss, maxHeight: '500px', cursor: isTaggingMode ? 'crosshair' : undefined }}
          onClick={handleImageTagClick}
        >
          {mediaUrls.length > 0 ? (
            // Check if current URL is a video (either from new File or existing string ending in common video extensions)
            (mediaFiles[currentPreviewIndex]?.type.startsWith('video/') ||
             (typeof mediaUrls[currentPreviewIndex] === 'string' &&
              /\.(mp4|mov|avi|webm)$/i.test(mediaUrls[currentPreviewIndex]))) ? (
              <video
                ref={mainVideoRef}
                src={mediaUrls[currentPreviewIndex]}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                key={mediaUrls[currentPreviewIndex]}
              />
            ) : (
              <img
                src={mediaUrls[currentPreviewIndex]}
                alt="Preview"
                className="w-full h-full object-cover"
                key={mediaUrls[currentPreviewIndex]}
              />
            )
          ) : (
            <div className="flex flex-col items-center gap-2 opacity-20">
              <ImageIcon className="w-16 h-16 text-zinc-400" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">No Media Selected</p>
            </div>
          )}

          {/* Photo-tag pins */}
          {platform === 'instagram' && userTags.map((tag, i) => (
            <div
              key={i}
              className="absolute z-20 flex flex-col items-center pointer-events-none select-none"
              style={{ left: `${tag.x * 100}%`, top: `${tag.y * 100}%`, transform: 'translate(-50%, -100%)' }}
            >
              <div className="bg-white/95 backdrop-blur-sm text-zinc-800 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-md border border-zinc-200 whitespace-nowrap">
                @{tag.username}
              </div>
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white/95" />
            </div>
          ))}

          {mediaUrls.length > 1 && (
            <>
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-sm pointer-events-none">
                {currentPreviewIndex + 1}/{mediaUrls.length}
              </div>
              {currentPreviewIndex > 0 && (
                <button
                  onClick={prevPreview}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-zinc-800 shadow-md flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-all z-10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {currentPreviewIndex < mediaUrls.length - 1 && (
                <button
                  onClick={nextPreview}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-zinc-800 shadow-md flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-all z-10"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                {mediaUrls.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentPreviewIndex ? 'bg-blue-500 scale-125' : 'bg-white/70 shadow-sm'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {!isStory && (
        <div className="p-3 flex flex-col gap-2">
          {(platform === 'instagram' || platform === 'both') && (
            <div className="flex gap-3 mb-1">
              <div className="w-5 h-5 rounded-full border border-zinc-300"></div>
              <div className="w-5 h-5 rounded-full border border-zinc-300"></div>
              <div className="w-5 h-5 rounded-full border border-zinc-300"></div>
            </div>
          )}
          <div className="text-sm text-zinc-800 break-words whitespace-pre-wrap">
            <span className="font-semibold mr-2">brand_name</span>
            {caption || <span className="text-zinc-400">Your caption will appear here...</span>}
          </div>
          {firstComment && (platform === 'instagram' || platform === 'both') && (
            <div className="text-sm text-zinc-500 break-words whitespace-pre-wrap mt-1">
              <span className="font-semibold mr-2 text-zinc-700">brand_name</span>
              {firstComment}
            </div>
          )}
        </div>
        )}
      </div>
      <p className="text-xs text-zinc-400 mt-4 uppercase tracking-widest font-medium text-center">
        {platform ? PLATFORMS.find((p) => p.id === platform)?.label : ''} {isStory ? 'Story' : ''} Preview
      </p>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[1024px] max-w-5xl p-0 overflow-hidden bg-white gap-0 rounded-2xl flex flex-col md:flex-row max-h-[90vh]">
        {/* Left Side: Inputs */}
        <div className="w-full md:w-[45%] lg:w-[480px] shrink-0 flex flex-col bg-white min-h-[50vh] md:min-h-[600px]">
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-0">
          <DialogHeader className="mb-4 md:mb-6">
            <DialogTitle className="text-xl font-semibold text-zinc-900">
              {isEditing ? 'Edit Post' : 'Schedule Post'}
            </DialogTitle>
          </DialogHeader>

          {/* Mode Switcher */}
          <div className="flex p-1 bg-zinc-100 rounded-lg mb-6">
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'manual' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Manual Post <CheckCircle2 className="w-4 h-4 inline-block ml-1 text-zinc-900" />
            </button>
            <button
              disabled
              className="flex-1 py-2 text-sm font-medium rounded-md text-zinc-400 cursor-not-allowed opacity-70 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> Automate with AI
              <span className="text-[10px] bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded leading-none uppercase font-bold tracking-wider ml-1">
                Soon
              </span>
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {/* --- 1. Schedule & Platform --- */}
            <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
              {renderSectionHeader('schedule', 'Schedule & Platform', <Calendar className="w-4 h-4 text-zinc-500" />, scheduleWarning)}
              {expandedSection === 'schedule' && (
                <div className="p-4 space-y-5 bg-white border-t border-zinc-200">
                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">
                        Date
                      </label>
                      <input
                        type="date"
                        value={draftPost.date ? format(draftPost.date, 'yyyy-MM-dd') : ''}
                        min={format(new Date(), 'yyyy-MM-dd')}
                        onChange={(e) => {
                          if (e.target.value) {
                            const [y, m, d] = e.target.value.split('-').map(Number);
                            updateDraft({ date: new Date(y, m - 1, d) });
                          }
                        }}
                        className={`w-full p-3 bg-zinc-50 border ${scheduledForPastError ? 'border-red-300 focus:ring-red-500' : 'border-zinc-200 focus:ring-zinc-900'} rounded-lg text-sm font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:border-transparent`}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">
                        Time
                      </label>
                      <input
                        type="time"
                        value={time || '10:00'}
                        onChange={(e) => updateDraft({ time: e.target.value })}
                        className={`w-full p-3 bg-zinc-50 border ${scheduledForPastError ? 'border-red-300 focus:ring-red-500' : 'border-zinc-200 focus:ring-zinc-900'} rounded-lg text-sm font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:border-transparent`}
                      />
                    </div>
                  </div>

                  {/* Timezone */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      Timezone
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent appearance-none cursor-pointer"
                    >
                      {COMMON_TIMEZONES.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                    {!COMMON_TIMEZONES.find(tz => tz.value === timezone) && (
                      <p className="text-[10px] text-zinc-400 mt-1 font-medium">
                        Detected: {timezone}
                      </p>
                    )}
                  </div>

                  {/* Platform Selection */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">
                      Platform
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PLATFORMS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            updateDraft({ platform: p.id });
                            const validRatios = ASPECT_RATIOS[p.id] || ASPECT_RATIOS['instagram'];
                            if (!validRatios.find((r) => r.value === aspectRatio)) {
                              updateDraft({ aspectRatio: validRatios[0].value });
                            }
                          }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                            platform === p.id
                              ? 'border-zinc-900 bg-zinc-900 text-white shadow-md'
                              : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
                          }`}
                        >
                          {p.icon}
                          <span className="font-medium">{p.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Post Type (Feed / Story) */}
                  {platform && (
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">
                        Post Type
                      </label>
                      <div className="flex gap-2">
                        {(['FEED', 'STORY'] as PostType[]).map((pt) => (
                          <button
                            key={pt}
                            onClick={() => {
                              updateDraft({ postType: pt });
                              if (pt === 'STORY') {
                                updateDraft({ aspectRatio: '9:16' });
                              }
                            }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                              postType === pt
                                ? 'border-zinc-900 bg-zinc-900 text-white shadow-md'
                                : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
                            }`}
                          >
                            <span className="font-medium">{pt === 'FEED' ? 'Feed Post' : 'Story'}</span>
                          </button>
                        ))}
                      </div>
                      {isStory && (
                        <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-md px-2.5 py-1.5 font-medium mt-2">
                          Stories are media-only. Caption, first comment, location, tags, and collaborators are not supported.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Aspect Ratio — locked to 9:16 for Stories */}
                  {platform && !isStory && (
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">
                        Aspect Ratio
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(ASPECT_RATIOS[platform] || ASPECT_RATIOS['instagram']).map((ratio) => (
                          <button
                            key={ratio.value}
                            onClick={() => updateDraft({ aspectRatio: ratio.value })}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
                              aspectRatio === ratio.value
                                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                                : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
                            }`}
                          >
                            {ratio.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {platform && isStory && (
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">
                        Aspect Ratio
                      </label>
                      <div className="flex gap-2">
                        <button
                          className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium border-blue-600 bg-blue-50 text-blue-700 shadow-sm cursor-default"
                        >
                          Vertical (9:16)
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1.5 font-medium">
                        Stories require 9:16 vertical format (1080 × 1920 px)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* --- 2. Media --- */}
            <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
              {renderSectionHeader('media', 'Media', <ImageIcon className="w-4 h-4 text-zinc-500" />, mediaWarning || uploadError)}
              {expandedSection === 'media' && (
                <div className="p-4 bg-white border-t border-zinc-200">
                  {renderMediaSection()}
                </div>
              )}
            </div>

            {/* --- 3. Post Details (hidden for Stories) --- */}
            {!isStory && (
            <div className="border border-zinc-200 rounded-xl shadow-sm">
              {renderSectionHeader('details', 'Post Details', <FileText className="w-4 h-4 text-zinc-500" />, captionWarning)}
              {expandedSection === 'details' && (
                <div className="p-4 space-y-5 bg-white border-t border-zinc-200">
                  {/* Global Warning for Instagram */}
                  {platform === 'instagram' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2.5 mb-2 shadow-sm">
                      <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div className="text-[11px] text-amber-800 leading-relaxed font-medium">
                        <strong>Business-to-Business Only:</strong> Due to Meta's privacy restrictions, you can only search, tag, or collaborate with official <strong>Instagram Professional (Business or Creator)</strong> accounts. Private or personal accounts will not appear in search.
                      </div>
                    </div>
                  )}

                  {/* Photo Tagging — Instagram image posts only */}
                  {platform === 'instagram' && renderPhotoTaggingSection()}

                  {/* Collaborators — Instagram only */}
                  {platform === 'instagram' && renderCollaboratorsSection()}

                  {/* Location — all platforms */}
                  {renderLocationSection()}

                  {/* Caption */}
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Caption</label>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest ${
                        isCaptionOverLimit
                          ? 'bg-red-100 text-red-600'
                          : captionLength > captionLimit * 0.9
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-zinc-100 text-zinc-400'
                      }`}>
                        {captionLength.toLocaleString()}/{captionLimit.toLocaleString()}
                      </span>
                    </div>
                    <Textarea
                      placeholder="Write your caption here..."
                      className={`min-h-[100px] resize-none focus-visible:ring-zinc-900 ${isCaptionOverLimit ? 'border-red-300 focus-visible:ring-red-500' : ''}`}
                      value={caption}
                      onChange={(e) => updateDraft({ message: e.target.value })}
                    />
                    {isCaptionOverLimit && (
                      <p className="text-[11px] text-red-500 mt-1 font-medium">
                        Caption exceeds {captionLimit.toLocaleString()} character limit for {platform === 'both' ? 'Instagram' : platform}.
                      </p>
                    )}
                  </div>

                  {/* First Comment (Instagram only) */}
                  {(platform === 'instagram' || platform === 'both') && (
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">
                          First Comment <span className="text-zinc-400 normal-case">(optional)</span>
                        </label>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest ${
                          isFirstCommentOverLimit
                            ? 'bg-red-100 text-red-600'
                            : firstCommentLength > FIRST_COMMENT_LIMIT * 0.9
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-zinc-100 text-zinc-400'
                        }`}>
                          {firstCommentLength.toLocaleString()}/{FIRST_COMMENT_LIMIT.toLocaleString()}
                        </span>
                      </div>
                      <Textarea
                        placeholder="Add hashtags or a first comment..."
                        className={`min-h-[70px] resize-none focus-visible:ring-zinc-900 ${isFirstCommentOverLimit ? 'border-red-300 focus-visible:ring-red-500' : ''}`}
                        value={firstComment}
                        onChange={(e) => updateDraft({ firstComment: e.target.value })}
                      />
                      {isFirstCommentOverLimit && (
                        <p className="text-[11px] text-red-500 mt-1 font-medium">
                          First comment exceeds {FIRST_COMMENT_LIMIT.toLocaleString()} character limit.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            )}
          </div>

          </div>{/* end scrollable content */}

          <div className="shrink-0 p-4 md:px-6 md:py-4 border-t border-zinc-100 flex justify-end gap-3 bg-white">
            <Button variant="ghost" onClick={onClose} className="rounded-full px-6">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!canSave}
              className="rounded-full px-8 bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 min-w-[140px]"
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {Math.max(createMutation.uploadProgress, updateMutation.uploadProgress) > 0 && 
                   Math.max(createMutation.uploadProgress, updateMutation.uploadProgress) < 100 
                    ? `${Math.round(Math.max(createMutation.uploadProgress, updateMutation.uploadProgress))}%` 
                    : 'Saving...'}
                </div>
              ) : (
                isEditing ? 'Update Post' : isStory ? 'Schedule Story' : 'Schedule Post'
              )}
            </Button>
          </div>
        </div>

        {/* Right Side: Preview */}
        {renderPreview()}
      </DialogContent>
    </Dialog>
  );
}
