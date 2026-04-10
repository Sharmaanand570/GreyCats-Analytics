import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import {
  Calendar,
  Upload,
  X as XIcon,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Link as LinkIcon,
  Undo2,
  Redo2,
  CheckSquare,
} from 'lucide-react';
import { FaLinkedin, FaWordpress } from 'react-icons/fa6';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBlogSchedulerStore } from '@/store/useBlogSchedulerStore';
import { useLinkedInTargets, useWordPressTargets } from '../hooks/useBlogPosts';
import { useCreateBlogPost } from '../hooks/useCreateBlogPost';
import { useUpdateBlogPost } from '../hooks/useUpdateBlogPost';
import type { BlogPost, LinkedInTarget, WordPressTarget } from '../api/types';
import { toast } from 'sonner';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapImage from '@tiptap/extension-image';
import TiptapLink from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TiptapUnderline from '@tiptap/extension-underline';

interface BlogPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: number;
  editingPost?: BlogPost | null;
}



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

function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const btnClass = (active: boolean) =>
    `p-1.5 rounded-md transition-colors ${active ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700'}`;

  return (
    <div className="flex items-center gap-0.5 p-2 border-b border-zinc-200 bg-zinc-50/50 flex-wrap">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))} title="Bold">
        <Bold className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))} title="Italic">
        <Italic className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive('underline'))} title="Underline">
        <UnderlineIcon className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-zinc-200 mx-1" />

      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive('heading', { level: 1 }))} title="Heading 1">
        <Heading1 className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive('heading', { level: 2 }))} title="Heading 2">
        <Heading2 className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-zinc-200 mx-1" />

      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))} title="Bullet List">
        <List className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))} title="Ordered List">
        <ListOrdered className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-zinc-200 mx-1" />

      <button type="button" onClick={addLink} className={btnClass(editor.isActive('link'))} title="Insert Link">
        <LinkIcon className="w-4 h-4" />
      </button>
      <button type="button" onClick={addImage} className={btnClass(false)} title="Insert Image">
        <ImageIcon className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-zinc-200 mx-1" />

      <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={`${btnClass(false)} disabled:opacity-30`} title="Undo">
        <Undo2 className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={`${btnClass(false)} disabled:opacity-30`} title="Redo">
        <Redo2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export function BlogPostModal({ isOpen, onClose, clientId, editingPost }: BlogPostModalProps) {
  const { draftPost, updateDraft, resetDraft } = useBlogSchedulerStore();
  const { title, content, mediaFiles = [], time, targets } = draftPost;
  const isEditing = !!editingPost;

  const createMutation = useCreateBlogPost();
  const updateMutation = useUpdateBlogPost();

  const { data: linkedinTargets = [], isLoading: linkedinLoading, isError: linkedinError } = useLinkedInTargets();
  const { data: wordpressTargets = [], isLoading: wpLoading, isError: wpError } = useWordPressTargets();
  const targetsLoading = linkedinLoading || wpLoading;
  const targetsError = linkedinError && wpError;

  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [timezone, setTimezone] = useState<string>(getBrowserTimezone);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    schedule: true,
    content: true,
    platforms: true,
    media: false,
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapUnderline,
      TiptapImage,
      TiptapLink.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Write your blog post content here...' }),
    ],
    content: content || '',
    onUpdate: ({ editor: e }) => {
      updateDraft({ content: e.getHTML() });
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[200px] px-4 py-3 focus:outline-none text-zinc-800',
      },
    },
  });

  // Prefill when editing
  useEffect(() => {
    if (isOpen && editingPost) {
      const scheduledDate = new Date(editingPost.scheduledFor);
      updateDraft({
        date: scheduledDate,
        time: format(scheduledDate, 'HH:mm'),
        title: editingPost.title,
        content: editingPost.content,
        targets: editingPost.targets,
        mediaFiles: [],
      });
      setMediaUrls(editingPost.mediaUrls || []);
      editor?.commands.setContent(editingPost.content || '');
    }
  }, [isOpen, editingPost]);

  // Reset when opening new
  useEffect(() => {
    if (isOpen && !editingPost) {
      editor?.commands.setContent('');
      setMediaUrls([]);
      setUploadError(null);
      setValidationErrors([]);
    }
  }, [isOpen, editingPost]);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleClose = () => {
    resetDraft();
    editor?.commands.setContent('');
    setMediaUrls([]);
    setUploadError(null);
    setValidationErrors([]);
    onClose();
  };

  // Platform target management
  const isTargeted = (targetId: string, platform: string) =>
    targets.some((t) => t.targetAccountId === targetId && t.platform === platform);

  const toggleTarget = (target: LinkedInTarget) => {
    if (isTargeted(target.id, 'linkedin')) {
      updateDraft({
        targets: targets.filter((t) => !(t.targetAccountId === target.id && t.platform === 'linkedin')),
      });
    } else {
      updateDraft({
        targets: [
          ...targets,
          {
            platform: 'linkedin',
            targetAccountId: target.id,
            targetAccountName: target.name,
          },
        ],
      });
    }
  };

  const toggleWordPressTarget = (target: WordPressTarget) => {
    if (isTargeted(target.id, 'wordpress')) {
      updateDraft({
        targets: targets.filter((t) => !(t.targetAccountId === target.id && t.platform === 'wordpress')),
      });
    } else {
      updateDraft({
        targets: [
          ...targets,
          {
            platform: 'wordpress',
            targetAccountId: target.id,
            targetAccountName: target.name,
          },
        ],
      });
    }
  };

  // Media handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadError(null);

    const invalid = files.find((f) => {
      const isImg = /\.(jpe?g|png|gif|webp)$/i.test(f.name);
      if (isImg && f.size > 4 * 1024 * 1024) return true;
      return false;
    });

    if (invalid) {
      setUploadError('Image files must be under 4 MB');
      return;
    }

    updateDraft({ mediaFiles: [...mediaFiles, ...files] });
    e.target.value = '';
  };

  const removeMediaFile = (idx: number) => {
    updateDraft({ mediaFiles: mediaFiles.filter((_, i) => i !== idx) });
  };

  const removeExistingUrl = (idx: number) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  // Validation
  const validate = useCallback((): string[] => {
    const errors: string[] = [];
    if (!title.trim()) errors.push('Title is required');
    if (!editor?.getText().trim()) errors.push('Content is required');
    if (targets.length === 0) errors.push('Select at least one platform');

    const { date } = draftPost;
    const scheduledDate = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    scheduledDate.setHours(hours, minutes, 0, 0);
    if (scheduledDate <= new Date()) errors.push('Schedule time must be in the future');

    return errors;
  }, [title, editor, targets, draftPost, time]);

  const handleSubmit = async () => {
    const errors = validate();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);

    const { date } = draftPost;
    const scheduledDate = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    scheduledDate.setHours(hours, minutes, 0, 0);

    // Convert to timezone-aware UTC
    const tzDate = new Date(
      scheduledDate.toLocaleString('en-US', { timeZone: timezone })
    );
    const offset = scheduledDate.getTime() - tzDate.getTime();
    const utcDate = new Date(scheduledDate.getTime() + offset);

    try {
      if (isEditing && editingPost) {
        await updateMutation.mutateAsync({
          id: editingPost.id,
          files: mediaFiles,
          existingUrls: mediaUrls,
          payload: {
            title,
            content: editor?.getHTML() || '',
            scheduledFor: utcDate.toISOString(),
            targets,
          },
        });
        toast.success('Blog post updated');
      } else {
        await createMutation.mutateAsync({
          files: mediaFiles,
          payload: {
            clientId,
            title,
            content: editor?.getHTML() || '',
            scheduledFor: utcDate.toISOString(),
            targets,
          },
        });
        toast.success('Blog post scheduled');
      }
      handleClose();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    }
  };

  const isBusy = createMutation.isPending || updateMutation.isPending;
  const uploadProgress = createMutation.uploadProgress || updateMutation.uploadProgress;

  const SectionHeader = ({ label, sectionKey, warning }: { label: string; sectionKey: string; warning?: string }) => (
    <button
      type="button"
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between px-5 py-3 bg-zinc-50 hover:bg-zinc-100 transition-colors border-b border-zinc-100"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-zinc-800">{label}</span>
        {warning && (
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
            {warning}
          </span>
        )}
      </div>
      {expandedSections[sectionKey] ? (
        <ChevronUp className="w-4 h-4 text-zinc-400" />
      ) : (
        <ChevronDown className="w-4 h-4 text-zinc-400" />
      )}
    </button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-[720px] p-0 overflow-hidden bg-white rounded-2xl gap-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 pr-12 border-b border-zinc-100 shrink-0">
          <DialogTitle className="text-lg font-semibold text-zinc-900">
            {isEditing ? 'Edit Blog Post' : 'Schedule Blog Post'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg space-y-1">
              {validationErrors.map((err, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-red-700 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {err}
                </div>
              ))}
            </div>
          )}

          {/* ── Schedule Section ── */}
          <SectionHeader label="Schedule" sectionKey="schedule" />
          {expandedSections.schedule && (
            <div className="px-5 py-4 space-y-4 border-b border-zinc-100">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-600 mb-1.5 block">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    <Input
                      type="date"
                      value={draftPost.date ? format(new Date(draftPost.date), 'yyyy-MM-dd') : ''}
                      onChange={(e) => updateDraft({ date: new Date(e.target.value) })}
                      className="pl-9 h-10 text-sm font-medium border-zinc-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-600 mb-1.5 block">Time</label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => updateDraft({ time: e.target.value })}
                    className="h-10 text-sm font-medium border-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-600 mb-1.5 block">Timezone</label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="h-10 text-sm font-medium border-zinc-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* ── Content Section ── */}
          <SectionHeader label="Content" sectionKey="content" warning={!title.trim() ? 'Title required' : undefined} />
          {expandedSections.content && (
            <div className="px-5 py-4 space-y-4 border-b border-zinc-100">
              <div>
                <label className="text-xs font-semibold text-zinc-600 mb-1.5 block">Title</label>
                <Input
                  value={title}
                  onChange={(e) => updateDraft({ title: e.target.value })}
                  placeholder="Enter blog post title..."
                  className="h-11 text-sm font-medium border-zinc-200"
                  maxLength={300}
                />
                <div className="flex justify-end mt-1">
                  <span className={`text-[10px] font-semibold ${title.length > 280 ? 'text-amber-500' : 'text-zinc-400'}`}>
                    {title.length}/300
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-600 mb-1.5 block">Body</label>
                <div className="border border-zinc-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-zinc-300 focus-within:border-zinc-300 transition-all">
                  <EditorToolbar editor={editor} />
                  <EditorContent editor={editor} />
                </div>
              </div>
            </div>
          )}

          {/* ── Platforms Section ── */}
          <SectionHeader
            label="Select Platforms"
            sectionKey="platforms"
            warning={targets.length === 0 ? 'Required' : undefined}
          />
          {expandedSections.platforms && (
            <div className="px-5 py-4 space-y-3 border-b border-zinc-100">
              {targetsLoading && (
                <div className="flex items-center justify-center py-6 text-zinc-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Loading LinkedIn targets...
                </div>
              )}
              {targetsError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Failed to load blog integrations. Please check your connections.
                </div>
              )}
              {/* LinkedIn targets */}
              {!targetsLoading && linkedinTargets.filter((t) => t.type === 'page').length === 0 && wordpressTargets.length === 0 && !targetsError && (
                <div className="text-center py-6 text-zinc-500 text-sm">
                  No publishing accounts connected. Connect one in Integrations.
                </div>
              )}
              {linkedinTargets.filter((t) => t.type === 'page').map((target) => {
                const selected = isTargeted(target.id, 'linkedin');

                return (
                  <div key={`li-${target.id}`} className="space-y-2">
                    <div
                      onClick={() => toggleTarget(target)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selected
                          ? 'bg-zinc-900 text-white border-zinc-900 shadow-md'
                          : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-sm'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        selected ? 'bg-white/10' : 'bg-zinc-100'
                      }`}>
                        <FaLinkedin className={`w-5 h-5 ${selected ? 'text-white' : 'text-blue-700'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold flex items-center gap-2 ${selected ? 'text-white' : 'text-zinc-800'}`}>
                          LinkedIn
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                            selected ? 'bg-white/20' : 'bg-zinc-100 text-zinc-500'
                          }`}>
                            {target.type}
                          </span>
                        </p>
                        <p className={`text-xs truncate ${selected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                          {target.name}
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        selected ? 'bg-white border-white' : 'border-zinc-300'
                      }`}>
                        {selected && <CheckSquare className="w-3.5 h-3.5 text-zinc-900" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* WordPress targets */}
              {wordpressTargets.map((target) => {
                const selected = isTargeted(target.id, 'wordpress');

                return (
                  <div key={`wp-${target.id}`} className="space-y-2">
                    <div
                      onClick={() => toggleWordPressTarget(target)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selected
                          ? 'bg-zinc-900 text-white border-zinc-900 shadow-md'
                          : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-sm'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        selected ? 'bg-white/10' : 'bg-zinc-100'
                      }`}>
                        <FaWordpress className={`w-5 h-5 ${selected ? 'text-white' : 'text-[#21759b]'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold flex items-center gap-2 ${selected ? 'text-white' : 'text-zinc-800'}`}>
                          WordPress
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                            selected ? 'bg-white/20' : 'bg-zinc-100 text-zinc-500'
                          }`}>
                            site
                          </span>
                        </p>
                        <p className={`text-xs truncate ${selected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                          {target.name}
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        selected ? 'bg-white border-white' : 'border-zinc-300'
                      }`}>
                        {selected && <CheckSquare className="w-3.5 h-3.5 text-zinc-900" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Media Section ── */}
          <SectionHeader
            label="Media (Optional)"
            sectionKey="media"
            warning={uploadError ? 'Error' : undefined}
          />
          {expandedSections.media && (
            <div className="px-5 py-4 space-y-3 border-b border-zinc-100">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-200 rounded-xl p-6 text-center cursor-pointer hover:border-zinc-400 hover:bg-zinc-50 transition-all group"
              >
                <Upload className="w-8 h-8 text-zinc-300 mx-auto mb-2 group-hover:text-zinc-500 transition-colors" />
                <p className="text-sm font-semibold text-zinc-600">Click to upload images</p>
                <p className="text-xs text-zinc-400 mt-1">JPG, PNG, GIF, WEBP (max 4 MB each)</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />

              {uploadError && (
                <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {uploadError}
                </div>
              )}

              {/* Existing media URLs (editing) */}
              {mediaUrls.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {mediaUrls.map((url, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg border border-zinc-200 overflow-hidden group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingUrl(i)}
                        className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XIcon className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* New file previews */}
              {mediaFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {mediaFiles.map((file, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg border border-zinc-200 overflow-hidden group">
                      <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeMediaFile(i)}
                        className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XIcon className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-4 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            {targets.length > 0 && (
              <span className="font-semibold bg-zinc-100 px-2 py-1 rounded-md">
                {targets.length} platform{targets.length !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isBusy} className="h-10 px-4 border-zinc-200">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isBusy}
              className="h-10 px-6 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold shadow-sm"
            >
              {isBusy ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Publishing...'}
                </>
              ) : isEditing ? (
                'Update'
              ) : (
                'Schedule'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

