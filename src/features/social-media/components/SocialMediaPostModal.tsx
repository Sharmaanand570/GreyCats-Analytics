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
import { Sparkles, Image as ImageIcon, CheckCircle2, SquarePlus, ChevronLeft, ChevronRight, Upload, Globe, Info, Tag, Users2, X as XIcon, Search, UserPlus, AlertCircle, Calendar, FileText, ChevronDown, ChevronUp, MapPin, Building2 } from 'lucide-react';
import { FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa6';
import { useSocialMediaStore } from '@/store/useSocialMediaStore';
import { toast } from 'sonner';
import { creativeApi } from '@/api/creativeApi';

import { useClientContext } from '@/context/ClientContext';
import { useCreatePost } from '../hooks/useCreatePost';
import { useUpdatePost } from '../hooks/useUpdatePost';
import { useSearchCollaborator } from '../hooks/useSearchCollaborator';
import { useSearchLocation } from '../hooks/useSearchLocation';
import type { ScheduledPost, PostPlatform, PostType, UserTag, CollaboratorSearchResult, LocationSearchResult, SelectablePlatform } from '../api/types';
import { Loader2 } from 'lucide-react';

interface SocialMediaPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: number;
  editingPost?: ScheduledPost | null;
}

const SELECTABLE_PLATFORMS: { id: SelectablePlatform; icon: React.ReactNode; label: string; color: string }[] = [
  { id: 'instagram', icon: <FaInstagram className="w-4 h-4" />, label: 'Instagram', color: 'text-pink-600' },
  { id: 'facebook', icon: <FaFacebook className="w-4 h-4" />, label: 'Facebook', color: 'text-blue-600' },
  { id: 'linkedin', icon: <FaLinkedin className="w-4 h-4" />, label: 'LinkedIn', color: 'text-blue-700' },
];

// For the edit flow (single platform display) — keeps legacy 'both' support
const EDIT_PLATFORMS: { id: PostPlatform; icon: React.ReactNode; label: string }[] = [
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
  { id: 'linkedin', icon: <FaLinkedin className="w-5 h-5 text-blue-700" />, label: 'LinkedIn' },
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
  linkedin: [
    { label: 'Any (Auto)', value: '1:1', css: '1/1' },
  ],

};

const CAPTION_LIMITS: Record<string, number> = {
  instagram: 2200,
  facebook: 63206,
  both: 2200,
  linkedin: 3000,

};

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
  const { platform, postType, aspectRatio, message: caption, mediaFiles = [], time, selectedPlatforms = [] } = draftPost;
  const isStory = postType === 'STORY';
  const isEditing = !!editingPost;

  // Derived helpers — what credentials are required for selected platforms
  const isMetaNeeded = !isEditing && (selectedPlatforms.includes('instagram') || selectedPlatforms.includes('facebook'));
  const isLinkedinNeeded = !isEditing && selectedPlatforms.includes('linkedin');

  // Whether any non-Meta platform is selected (LinkedIn doesn't support Stories)
  const hasNonMetaPlatforms = !isEditing && selectedPlatforms.includes('linkedin');

  // Whether any Meta platform is selected (needed to show Story toggle)
  const hasMetaPlatforms = !isEditing &&
    (selectedPlatforms.includes('instagram') || selectedPlatforms.includes('facebook'));

  /**
   * Compute the intersection of aspect ratios supported by ALL currently selected
   * platforms. Falls back to [1:1] if no common ratio exists.
   */
  const compatibleRatios: { label: string; value: string; css: string }[] = (() => {
    if (isEditing || selectedPlatforms.length === 0) {
      return ASPECT_RATIOS[platform || 'instagram'] || ASPECT_RATIOS['instagram'];
    }
    // Seed from the first platform, then intersect against every subsequent one
    let result = ASPECT_RATIOS[selectedPlatforms[0]] || ASPECT_RATIOS['instagram'];
    for (let i = 1; i < selectedPlatforms.length; i++) {
      const next = new Set((ASPECT_RATIOS[selectedPlatforms[i]] || ASPECT_RATIOS['instagram']).map(r => r.value));
      result = result.filter(r => next.has(r.value));
    }
    return result.length > 0 ? result : [{ label: 'Square (1:1)', value: '1:1', css: '1/1' }];
  })();

  // In preview, show the first selected platform (or edit platform)
  const previewPlatform: PostPlatform | '' = isEditing
    ? platform
    : (selectedPlatforms[0] as PostPlatform) || '';

  const createMutation = useCreatePost();
  const updateMutation = useUpdatePost();

  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [timezone, setTimezone] = useState<string>(getBrowserTimezone);
  const [aiCaptionLoading, setAiCaptionLoading] = useState(false);
  const [aiCaptionTopic, setAiCaptionTopic] = useState('');
  const [showAiCaptionInput, setShowAiCaptionInput] = useState(false);

  // Photo tagging
  const [userTags, setUserTags] = useState<UserTag[]>([]);
  const [isTaggingMode, setIsTaggingMode] = useState(false);
  const [pendingTag, setPendingTag] = useState<{ x: number; y: number } | null>(null);

  // Collaborators
  const [collaborators, setCollaborators] = useState<CollaboratorSearchResult[]>([]);

  // Location tagging
  const [selectedLocation, setSelectedLocation] = useState<LocationSearchResult | null>(null);

  // LinkedIn / Twitter account selectors
  const [selectedLinkedinTargetId, setSelectedLinkedinTargetId] = useState<string>('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainVideoRef = useRef<HTMLVideoElement>(null);

  // Meta account ID for collaborator search proxy
  const metaAccountIdRaw = currentClient?.integrations?.find((i) => i.integrationType === 'meta-business')?.accountId;
  const metaAccountIdForSearch: number | null = typeof metaAccountIdRaw === 'number' ? metaAccountIdRaw : metaAccountIdRaw ? parseInt(metaAccountIdRaw as string) || null : null;

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

  // Prefill draft when editing + reset tagging/collaborators
  useEffect(() => {
    if (isOpen) {
      // Guard: if the persisted draft belongs to a different client, reset it first
      if (draftPost.clientId !== null && draftPost.clientId !== clientId) {
        resetDraft();
      }

      if (editingPost) {
        const scheduledDate = new Date(editingPost.scheduledFor);
        updateDraft({
          date: scheduledDate,
          time: format(scheduledDate, 'HH:mm'),
          platform: editingPost.platform,
          postType: editingPost.postType || 'FEED',
          message: editingPost.message || '',
          mediaFiles: [],
          clientId,
        });
        if (editingPost.platform === 'linkedin' && editingPost.linkedinPortAccountId) {
          setSelectedLinkedinTargetId(String(editingPost.linkedinPortAccountId));
        }
      } else {
        // Stamp the current clientId so stale drafts can be detected on reload
        updateDraft({ clientId });
      }
    }
    // Always reset on open
    setUserTags([]);
    setCollaborators([]);
    setIsTaggingMode(false);
    setPendingTag(null);
    clearTagSearch();
    clearCollabSearch();
  }, [isOpen, editingPost]);

  useEffect(() => {
    if (isOpen && platform === 'linkedin') {
      const linked = currentClient?.integrations?.filter(i => i.integrationType === 'linkedin') || [];
      if (linked.length === 1 && !selectedLinkedinTargetId) {
        setSelectedLinkedinTargetId(String(linked[0].accountId));
      }
    }
  }, [isOpen, platform, selectedLinkedinTargetId, currentClient]);

  // Auto-select first platform in create mode — pre-tick instagram
  useEffect(() => {
    if (isOpen && !isEditing && selectedPlatforms.length === 0) {
      updateDraft({ selectedPlatforms: ['instagram'], aspectRatio: '1:1' });
    }
    // For edit mode: keep legacy single-platform in the draft
  }, [isOpen, isEditing, selectedPlatforms.length]);

  // When platform selection changes, auto-correct aspectRatio if it's no longer
  // in the intersection of supported ratios for all selected platforms.
  useEffect(() => {
    if (isEditing || selectedPlatforms.length === 0) return;
    const isCurrentRatioCompatible = compatibleRatios.some((r) => r.value === aspectRatio);
    if (!isCurrentRatioCompatible && compatibleRatios.length > 0) {
      updateDraft({ aspectRatio: compatibleRatios[0].value });
    }
  }, [selectedPlatforms.join(',')]);

  // When Story is selected but all Meta platforms are removed, revert to FEED.
  useEffect(() => {
    if (!isEditing && isStory && !hasMetaPlatforms && selectedPlatforms.length > 0) {
      updateDraft({ postType: 'FEED' });
    }
  }, [selectedPlatforms.join(','), isStory, isEditing, hasMetaPlatforms]);

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

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newMediaFiles = [...mediaFiles];
    const newMediaUrls = [...mediaUrls];

    // Swap files
    const [movedFile] = newMediaFiles.splice(draggedIndex, 1);
    newMediaFiles.splice(targetIndex, 0, movedFile);

    // Swap URLs
    const [movedUrl] = newMediaUrls.splice(draggedIndex, 1);
    newMediaUrls.splice(targetIndex, 0, movedUrl);

    updateDraft({ mediaFiles: newMediaFiles });
    setMediaUrls(newMediaUrls);
    setDraggedIndex(null);
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

  // Caption limit: use the most restrictive platform selected (or edit platform)
  const activePlatformForLimit: string = isEditing
    ? (platform || 'instagram')
    : selectedPlatforms.includes('instagram')
    ? 'instagram'
    : selectedPlatforms[0] || 'instagram';
  const captionLimit = CAPTION_LIMITS[activePlatformForLimit] || 2200;
  const captionLength = caption?.length || 0;
  const isCaptionOverLimit = captionLength > captionLimit;

  // Accordion — only one section open at a time
  const [expandedSection, setExpandedSection] = useState<string | null>('schedule');

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const scheduledForStr = buildScheduledFor();
  const scheduledForPastError = new Date(scheduledForStr) <= new Date() && !isEditing;
  const scheduleWarning = isEditing
    ? (!platform ? 'Platform required' : scheduledForPastError ? 'Date must be future' : null)
    : (selectedPlatforms.length === 0 ? 'Select a platform' : scheduledForPastError ? 'Date must be future' : null);

  const hasNewMedia = mediaFiles.length > 0;
  const hasExistingMedia = isEditing && (editingPost?.mediaUrls?.length || 0) > 0;
  // Media required for Instagram (create) or Stories
  const mediaRequiredForInstagram = !isEditing &&
    (selectedPlatforms.includes('instagram')) && !hasNewMedia;
  const mediaWarning = (isStory || (isEditing && (platform === 'instagram' || platform === 'both'))) && !hasNewMedia && !hasExistingMedia
    ? (isStory ? 'Media required for Stories' : 'Media required for Instagram')
    : (mediaRequiredForInstagram && !isStory ? 'Media required for Instagram' : null);

  const captionWarning = isCaptionOverLimit ? 'Caption limit exceeded' : null;

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
    if (isCaptionOverLimit) return;
    if (scheduledForPastError) {
      setUploadError('Scheduled date/time must be in the future.');
      return;
    }

    setUploadError(null);

    try {
      // ── EDIT FLOW: single-platform PATCH ──
      if (isEditing && editingPost) {
        let metaAccountId: number | undefined;
        if (platform !== 'linkedin') {
          const metaIntegration = currentClient?.integrations?.find(
            (i) => i.integrationType === 'meta-business'
          );
          if (!metaIntegration) {
            throw new Error('No Meta account linked to this workspace.');
          }
          metaAccountId = typeof metaIntegration.accountId === 'number'
            ? metaIntegration.accountId
            : parseInt(metaIntegration.accountId as string) || undefined;
        }

        updateMutation.mutate({
          id: editingPost.id,
          files: mediaFiles,
          payload: {
            postType: postType || 'FEED',
            scheduledFor: scheduledForStr,
            platform: platform as PostPlatform,
            metaAccountId,
            linkedinPortAccountId: platform === 'linkedin' && selectedLinkedinTargetId ? parseInt(selectedLinkedinTargetId) : undefined,
            // Keep existing URLs if no new files are being uploaded
            mediaUrls: mediaFiles.length === 0 ? mediaUrls : undefined,
            ...(isStory ? {} : {
              message: caption || undefined,
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
            setMediaUrls([]);
            setUserTags([]);
            setCollaborators([]);
            setSelectedLocation(null);
            setUploadError(null);
            setCurrentPreviewIndex(0);
            resetDraft();
            onClose();
          }
        });
        return;
      }

      // ── CREATE FLOW: multi-platform POST ──
      if (selectedPlatforms.length === 0) {
        setUploadError('Please select at least one platform.');
        return;
      }

      // Gather account IDs
      let metaAccountId: number | undefined;
      let linkedinPortAccountId: number | undefined;

      if (isMetaNeeded) {
        const metaIntegration = currentClient?.integrations?.find(
          (i) => i.integrationType === 'meta-business'
        );
        if (!metaIntegration) {
          setUploadError('No Meta account linked to this workspace. Please connect one in the studio header.');
          return;
        }
        metaAccountId = typeof metaIntegration.accountId === 'number'
          ? metaIntegration.accountId
          : parseInt(metaIntegration.accountId as string) || undefined;
      }

      if (isLinkedinNeeded) {
        if (!selectedLinkedinTargetId) {
          setUploadError('Please select a LinkedIn page.');
          return;
        }
        linkedinPortAccountId = parseInt(selectedLinkedinTargetId);
      }

      createMutation.mutate({
        mode: 'multi',
        files: mediaFiles,
        payload: {
          platforms: selectedPlatforms as any,
          metaAccountId,
          linkedinPortAccountId,
          clientId,
          postType: postType || 'FEED',
          scheduledFor: scheduledForStr,
          ...(isStory ? {} : {
            message: caption || undefined,
            userTags: selectedPlatforms.includes('instagram') && userTags.length > 0 ? userTags : undefined,
            collaboratorIds:
              selectedPlatforms.includes('instagram') && collaborators.length > 0
                ? collaborators.map((c) => c.username)
                : undefined,
            locationId: selectedLocation?.id || undefined,
          }),
        },
      }, {
        onSuccess: () => {
          setMediaUrls([]);
          setUserTags([]);
          setCollaborators([]);
          setSelectedLocation(null);
          setUploadError(null);
          setCurrentPreviewIndex(0);
          resetDraft();
          onClose();
        }
      });
    } catch (error: any) {
      setUploadError(error.message);
    }
  };

  const previewAspectRatioCss = isStory
    ? '9/16'
    : (previewPlatform && ASPECT_RATIOS[previewPlatform]?.find((r) => r.value === aspectRatio)?.css) || '1/1';

  const canSave = isEditing
    ? (
        !!platform &&
        !uploadError &&
        (!isCaptionOverLimit || isStory) &&
        (isStory
          ? (hasNewMedia || hasExistingMedia)
          : (platform === 'facebook' || platform === 'linkedin' ? true : hasNewMedia || hasExistingMedia)) &&
        !createMutation.isPending &&
        !updateMutation.isPending &&
        !scheduledForPastError
      )
    : (
        selectedPlatforms.length > 0 &&
        !uploadError &&
        (!isCaptionOverLimit || isStory) &&
        (isStory
          ? hasNewMedia
          : (selectedPlatforms.every(p => p === 'facebook' || p === 'linkedin') ? true : hasNewMedia || !selectedPlatforms.includes('instagram'))) &&
        !createMutation.isPending &&
        !updateMutation.isPending &&
        !scheduledForPastError &&
        (!isLinkedinNeeded || !!selectedLinkedinTargetId)
      );

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
                    draggable
                    onDragStart={(e) => handleDragStart(e, i)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, i)}
                    className={`aspect-square relative rounded-lg border border-zinc-300 overflow-hidden bg-white shadow-sm group transition-all ${
                      draggedIndex === i ? 'opacity-40 scale-95 border-blue-400 border-2 cursor-grabbing' : 'hover:border-zinc-400 cursor-grab'
                    }`}
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
                      <XIcon className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black/40 text-white text-[8px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      #{i + 1}
                    </div>
                  </div>
                ))}
                {mediaFiles.length < (isStory ? 1 : 10) && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-zinc-300 bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 transition-colors shadow-sm group"
                  >
                    <SquarePlus className="w-5 h-5 text-zinc-400 group-hover:rotate-12 transition-transform" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase mt-1">Add</span>
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
    <div className="w-full md:w-[55%] lg:flex-1 bg-zinc-50 border-t md:border-t-0 md:border-l border-zinc-200 p-4 md:p-6 flex flex-col items-center md:overflow-y-auto md:min-h-[600px]">
      <div className="w-full max-w-[320px] bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden flex flex-col mt-4 mb-auto shrink-0">
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
            {(previewPlatform === 'instagram' || previewPlatform === 'both') && (
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
          {previewPlatform === 'instagram' && userTags.map((tag, i) => (
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
          {(previewPlatform === 'instagram' || previewPlatform === 'both') && (
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
        </div>
        )}
      </div>
      <p className="text-xs text-zinc-400 mt-4 uppercase tracking-widest font-medium text-center">
        {isEditing
          ? `${EDIT_PLATFORMS.find((p) => p.id === platform)?.label || ''} ${isStory ? 'Story' : ''} Preview`
          : selectedPlatforms.length > 1
          ? `${selectedPlatforms.length} Platforms · Preview`
          : selectedPlatforms.length === 1
          ? `${SELECTABLE_PLATFORMS.find((p) => p.id === selectedPlatforms[0])?.label || ''} ${isStory ? 'Story' : ''} Preview`
          : 'Preview'}
      </p>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[1024px] max-w-5xl p-0 overflow-y-auto overflow-x-hidden md:overflow-hidden bg-white gap-0 rounded-2xl flex flex-col md:flex-row max-h-[90vh] custom-scrollbar">
        {/* Left Side: Inputs */}
        <div className="w-full md:w-[45%] lg:w-[480px] shrink-0 flex flex-col bg-white md:min-h-[600px]">
          {/* Scrollable content area */}
          <div className="flex-1 md:overflow-y-auto p-4 md:p-6 pb-0">
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
              onClick={() => setMode('ai')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                mode === 'ai' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <Sparkles className="w-4 h-4" /> Automate with AI
            </button>
          </div>

          {mode === 'ai' && (
            <AIGeneratePanel
              clientId={clientId}
              platform={platform || 'instagram'}
              onGenerated={(caption, imageFile) => {
                if (caption) updateDraft({ message: caption });
                if (imageFile) updateDraft({ mediaFiles: [...(draftPost.mediaFiles || []), imageFile] });
                setMode('manual');
                toast.success(imageFile ? 'Image added! Review and schedule.' : 'Content generated! Review and schedule.');
              }}
            />
          )}

          <div className="flex flex-col gap-3" style={{ display: mode === 'manual' ? undefined : 'none' }}>
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
                      {isEditing ? 'Platform' : 'Platforms'}
                      {!isEditing && selectedPlatforms.length > 0 && (
                        <span className="ml-2 text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                          {selectedPlatforms.length} selected
                        </span>
                      )}
                    </label>

                    {isEditing ? (
                      /* Edit mode: single-select (legacy) */
                      <div className="flex flex-wrap gap-2">
                        {EDIT_PLATFORMS.map((p) => (
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
                    ) : (
                      /* Create mode: multi-select checkboxes */
                      <div className="grid grid-cols-2 gap-2">
                        {SELECTABLE_PLATFORMS.map((p) => {
                          const isChecked = selectedPlatforms.includes(p.id);
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                const next = isChecked
                                  ? selectedPlatforms.filter((x) => x !== p.id)
                                  : [...selectedPlatforms, p.id];
                                updateDraft({ selectedPlatforms: next });
                                // Sync aspect ratio for preview
                                if (!isChecked) {
                                  const validRatios = ASPECT_RATIOS[p.id] || ASPECT_RATIOS['instagram'];
                                  if (!validRatios.find((r) => r.value === aspectRatio)) {
                                    updateDraft({ aspectRatio: validRatios[0].value });
                                  }
                                }
                              }}
                              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-sm transition-all ${
                                isChecked
                                  ? 'border-zinc-900 bg-zinc-900 text-white shadow-md'
                                  : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300'
                              }`}
                            >
                              <div className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                                isChecked ? 'bg-white border-white' : 'border-current'
                              }`}>
                                {isChecked && (
                                  <svg className="w-2.5 h-2.5 text-zinc-900" viewBox="0 0 10 8" fill="none">
                                    <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                              </div>
                              <span className={`${isChecked ? '' : p.color}`}>{p.icon}</span>
                              <span className="font-medium text-xs">{p.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Info banner when facebook+instagram both selected */}
                    {!isEditing && selectedPlatforms.includes('instagram') && selectedPlatforms.includes('facebook') && (
                      <div className="mt-2 flex items-start gap-2 text-[11px] text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        Facebook + Instagram will be published as a combined Meta post.
                      </div>
                    )}
                  </div>

                  {/* LinkedIn Target Selection */}
                  {(isLinkedinNeeded || (isEditing && platform === 'linkedin')) && (
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        LinkedIn Page
                      </label>
                      <select
                        value={selectedLinkedinTargetId}
                        onChange={(e) => setSelectedLinkedinTargetId(e.target.value)}
                        className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Select a LinkedIn Page...</option>
                        {currentClient?.integrations?.filter(i => i.integrationType === 'linkedin').map((integration) => (
                          <option key={integration.accountId} value={String(integration.accountId)}>
                            {integration.accountName || integration.accountIdentifier}
                          </option>
                        ))}
                      </select>
                      {(currentClient?.integrations?.filter(i => i.integrationType === 'linkedin').length || 0) === 0 && (
                        <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-md px-2.5 py-1.5 font-medium mt-2">
                          No LinkedIn pages linked to this workspace. Please link one in the studio header.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Post Type (Feed / Story) — only shown when Meta is selected or in edit mode */}
                  {(isEditing ? !!platform : hasMetaPlatforms) && (
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

                      {/* Story is meta-only: show note when other platforms are also ticked */}
                      {isStory && hasNonMetaPlatforms && (
                        <div className="mt-2 flex items-start gap-2 text-[11px] text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span>
                            Story applies to <strong>Instagram / Facebook</strong> only.{' '}
                            {[
                              selectedPlatforms.includes('linkedin') && 'LinkedIn',
                            ]
                              .filter(Boolean)
                              .join(' & ')}{' '}
                            will receive a regular <strong>Feed post</strong> with the same content.
                          </span>
                        </div>
                      )}

                      {isStory && !hasNonMetaPlatforms && (
                        <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-md px-2.5 py-1.5 font-medium mt-2">
                          Stories are media-only. Caption, location, tags, and collaborators are not supported.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Aspect Ratio — locked to 9:16 for Stories */}
                  {(isEditing ? (!!platform && !isStory) : (selectedPlatforms.length > 0 && !isStory)) && (
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">
                        Aspect Ratio
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {compatibleRatios.map((ratio) => (
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

                      {/* Show note when ratios are limited by cross-platform incompatibility */}
                      {!isEditing && selectedPlatforms.length > 1 && compatibleRatios.length < (ASPECT_RATIOS[selectedPlatforms[0]] || ASPECT_RATIOS['instagram']).length && (
                        <div className="mt-2 flex items-start gap-2 text-[11px] text-zinc-500 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2">
                          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-zinc-400" />
                          <span>
                            Only ratios supported by <strong>all selected platforms</strong> are shown.
                            {compatibleRatios.length === 1 && ' 1:1 is the only universally compatible ratio.'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {(isEditing ? (!!platform && isStory) : (selectedPlatforms.length > 0 && isStory)) && (
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
                  {/* Multi-platform Meta-only note */}
                  {!isEditing && hasMetaPlatforms && hasNonMetaPlatforms && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2.5 mb-4 shadow-sm">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <div className="text-[11px] text-blue-800 leading-relaxed font-medium">
                        <strong>Meta Features Only:</strong> Photo Tagging, Collaborators, and Location are only supported by Instagram and Facebook. These settings will be <strong>ignored</strong> for your {[
                          selectedPlatforms.includes('linkedin') && 'LinkedIn',
                        ].filter(Boolean).join(' and ')} post.
                      </div>
                    </div>
                  )}

                  {/* Global Warning for Instagram */}
                  {(isEditing ? platform === 'instagram' : selectedPlatforms.includes('instagram')) && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2.5 mb-2 shadow-sm">
                      <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div className="text-[11px] text-amber-800 leading-relaxed font-medium">
                        <strong>Business-to-Business Only:</strong> Due to Meta's privacy restrictions, you can only search, tag, or collaborate with official <strong>Instagram Professional (Business or Creator)</strong> accounts. Private or personal accounts will not appear in search.
                      </div>
                    </div>
                  )}

                  {/* Photo Tagging — Instagram image posts only */}
                  {(isEditing ? platform === 'instagram' : selectedPlatforms.includes('instagram')) && renderPhotoTaggingSection()}

                  {/* Collaborators — Instagram only */}
                  {(isEditing ? platform === 'instagram' : selectedPlatforms.includes('instagram')) && renderCollaboratorsSection()}

                  {/* Location — Meta only (FB/IG) */}
                  {(isEditing
                    ? (platform === 'instagram' || platform === 'facebook' || platform === 'both')
                    : (selectedPlatforms.includes('instagram') || selectedPlatforms.includes('facebook'))
                  ) && renderLocationSection()}

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
                    <div className="relative">
                      <Textarea
                        placeholder="Write your caption here..."
                        className={`min-h-[100px] resize-none focus-visible:ring-zinc-900 pr-10 ${isCaptionOverLimit ? 'border-red-300 focus-visible:ring-red-500' : ''}`}
                        value={caption}
                        onChange={(e) => updateDraft({ message: e.target.value })}
                      />
                      <button
                        type="button"
                        title={caption ? "Rewrite with AI" : "Write with AI"}
                        disabled={aiCaptionLoading}
                        onClick={() => {
                          if (caption) {
                            // Has text → rewrite directly
                            setAiCaptionLoading(true);
                            creativeApi.generateCaptions({
                              clientId,
                              platform: platform || 'instagram',
                              goal: 'engagement',
                              topic: `Rewrite and improve this caption: ${caption.slice(0, 200)}`,
                              count: 1,
                            }).then((res) => {
                              const cap = res.data.data.captions[0];
                              if (cap) {
                                const text = cap.text + (cap.hashtags?.length ? '\n\n' + cap.hashtags.join(' ') : '');
                                updateDraft({ message: text });
                                toast.success('Caption improved!');
                              }
                            }).catch(() => toast.error('Failed to generate')).finally(() => setAiCaptionLoading(false));
                          } else {
                            // Empty → show topic input
                            setShowAiCaptionInput(true);
                          }
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-md bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-400 transition-all"
                      >
                        {aiCaptionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      </button>

                      {/* AI topic input popover */}
                      {showAiCaptionInput && (
                        <div className="absolute top-0 left-0 right-0 z-10 bg-white rounded-lg border border-zinc-300 shadow-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-700">What should the caption be about?</span>
                            <button type="button" onClick={() => setShowAiCaptionInput(false)} className="text-zinc-400 hover:text-zinc-600">
                              <XIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            autoFocus
                            type="text"
                            value={aiCaptionTopic}
                            onChange={(e) => setAiCaptionTopic(e.target.value)}
                            placeholder="e.g. Summer sale, Hotel room tour, Guest testimonial..."
                            className="w-full text-sm border border-zinc-200 rounded-md px-3 py-2 focus:outline-none focus:border-zinc-400"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && aiCaptionTopic.trim()) {
                                e.preventDefault();
                                setAiCaptionLoading(true);
                                setShowAiCaptionInput(false);
                                creativeApi.generateCaptions({
                                  clientId,
                                  platform: platform || 'instagram',
                                  goal: 'engagement',
                                  topic: aiCaptionTopic.trim(),
                                  count: 1,
                                }).then((res) => {
                                  const cap = res.data.data.captions[0];
                                  if (cap) {
                                    updateDraft({ message: cap.text + (cap.hashtags?.length ? '\n\n' + cap.hashtags.join(' ') : '') });
                                    toast.success('Caption generated!');
                                  }
                                }).catch(() => toast.error('Failed to generate')).finally(() => { setAiCaptionLoading(false); setAiCaptionTopic(''); });
                              } else if (e.key === 'Escape') {
                                setShowAiCaptionInput(false);
                              }
                            }}
                          />
                          <div className="flex justify-end">
                            <button
                              type="button"
                              disabled={!aiCaptionTopic.trim() || aiCaptionLoading}
                              onClick={() => {
                                setAiCaptionLoading(true);
                                setShowAiCaptionInput(false);
                                creativeApi.generateCaptions({
                                  clientId,
                                  platform: platform || 'instagram',
                                  goal: 'engagement',
                                  topic: aiCaptionTopic.trim(),
                                  count: 1,
                                }).then((res) => {
                                  const cap = res.data.data.captions[0];
                                  if (cap) {
                                    updateDraft({ message: cap.text + (cap.hashtags?.length ? '\n\n' + cap.hashtags.join(' ') : '') });
                                    toast.success('Caption generated!');
                                  }
                                }).catch(() => toast.error('Failed to generate')).finally(() => { setAiCaptionLoading(false); setAiCaptionTopic(''); });
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 text-white text-xs font-medium disabled:opacity-50 hover:bg-zinc-800 transition-all"
                            >
                              <Sparkles className="w-3 h-3" />
                              Generate
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    {isCaptionOverLimit && (
                      <p className="text-[11px] text-red-500 mt-1 font-medium">
                        Caption exceeds {captionLimit.toLocaleString()} character limit for {platform === 'both' ? 'Instagram' : platform}.
                      </p>
                    )}
                  </div>

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

// ─────────────────────────────────────────────
// AI Generate Panel — shown when mode is "ai"
// ─────────────────────────────────────────────

function AIGeneratePanel({
  clientId,
  platform,
  onGenerated,
}: {
  clientId: number;
  platform: string;
  onGenerated: (caption: string, imageFile?: File) => void;
}) {
  const [topic, setTopic] = useState('');
  const [goal, setGoal] = useState('engagement');
  const [contentType, setContentType] = useState('caption');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCaptions, setGeneratedCaptions] = useState<any[]>([]);
  const [generatedArticle, setGeneratedArticle] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setGeneratedCaptions([]);
    setGeneratedArticle(null);
    setGeneratedImageUrl(null);

    try {
      if (contentType === 'image') {
        const res = await creativeApi.generateImage({
          clientId,
          intent: topic.trim(),
          platform,
          aspectRatio: '1:1',
          mode: 'sync',
        });
        const rawUrl = res.data.data.imageUrl;
        if (rawUrl) {
          // Static files are served at server root (not under /api),
          // so extract only the origin from VITE_API_BASE_URL
          const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';
          const serverRoot = apiBase ? new URL(apiBase).origin : '';
          const fullUrl = rawUrl.startsWith('http') ? rawUrl : `${serverRoot}${rawUrl}`;
          setGeneratedImageUrl(fullUrl);
          toast.success('Image generated!');
        } else {
          toast.error('Image generation returned no image');
        }
      } else if (contentType === 'article' || contentType === 'script') {
        const res = await creativeApi.generateContent({
          clientId,
          contentType,
          topic: topic.trim(),
          platform,
        });
        setGeneratedArticle(res.data.data.content);
        toast.success(`${contentType === 'article' ? 'Article' : 'Script'} generated! (${res.data.data.wordCount} words)`);
      } else {
        const res = await creativeApi.generateCaptions({
          clientId,
          platform,
          goal,
          topic: topic.trim(),
          count: 3,
        });
        setGeneratedCaptions(res.data.data.captions);
        toast.success(`${res.data.data.captions.length} captions generated!`);
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Generation failed';
      toast.error(errMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Content type selector */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-zinc-600">What do you want to create?</label>
        <div className="flex gap-2">
          {[
            { id: 'caption', label: 'Caption' },
            { id: 'image', label: 'Image' },
            { id: 'article', label: 'Article' },
            { id: 'script', label: 'Video Script' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setContentType(t.id)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                contentType === t.id
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Topic input */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-600">Topic / Idea</label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Summer sale announcement, Behind the scenes of our hotel, Travel tips for guests..."
          rows={2}
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none resize-none"
        />
      </div>

      {/* Goal selector (for captions only) */}
      {contentType === 'caption' && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-600">Goal</label>
          <div className="flex gap-2">
            {['awareness', 'engagement', 'conversion', 'product_launch'].map((g) => (
              <button
                key={g}
                onClick={() => setGoal(g)}
                className={`px-2.5 py-1 text-[11px] rounded-md border transition-all capitalize ${
                  goal === g
                    ? 'bg-zinc-100 border-zinc-400 text-zinc-900 font-medium'
                    : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {g.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !topic.trim()}
        className="w-full py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {isGenerating ? 'Generating...' : 'Generate Content'}
      </button>

      {/* Results — captions */}
      {generatedCaptions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-500">Pick a caption:</p>
          {generatedCaptions.map((cap: any, i: number) => (
            <button
              key={i}
              onClick={() => {
                const text = cap.text + (cap.hashtags?.length ? '\n\n' + cap.hashtags.join(' ') : '');
                onGenerated(text);
              }}
              className="w-full text-left p-3 rounded-lg border border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 transition-all group"
            >
              <p className="text-sm text-zinc-800 whitespace-pre-wrap">{cap.text}</p>
              {cap.hashtags?.length > 0 && (
                <p className="text-xs text-blue-500 mt-1">{cap.hashtags.join(' ')}</p>
              )}
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-zinc-400">{cap.characterCount} chars · {cap.tone}</span>
                <span className="text-[10px] text-zinc-400 group-hover:text-zinc-700 font-medium">Click to use →</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Results — image */}
      {generatedImageUrl && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-500">Generated Image</p>
            <button
              onClick={async () => {
                try {
                  const response = await fetch(generatedImageUrl);
                  const blob = await response.blob();
                  const ext = blob.type.split('/')[1] || 'png';
                  const file = new File([blob], `ai-generated.${ext}`, { type: blob.type });
                  onGenerated('', file);
                } catch {
                  toast.error('Failed to load generated image');
                }
              }}
              className="text-xs text-zinc-900 font-medium hover:underline"
            >
              Use as post image →
            </button>
          </div>
          <div className="rounded-lg border border-zinc-200 overflow-hidden">
            <img
              src={generatedImageUrl}
              alt="AI generated"
              className="w-full h-auto max-h-60 object-contain bg-zinc-50"
            />
          </div>
        </div>
      )}

      {/* Results — article/script */}
      {generatedArticle && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-500">
              {contentType === 'article' ? 'Generated Article' : 'Generated Script'}
            </p>
            <button
              onClick={() => onGenerated(generatedArticle)}
              className="text-xs text-zinc-900 font-medium hover:underline"
            >
              Use this →
            </button>
          </div>
          <div className="p-3 rounded-lg border border-zinc-200 bg-zinc-50 max-h-60 overflow-y-auto">
            <pre className="text-xs text-zinc-700 whitespace-pre-wrap font-sans">{generatedArticle}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
