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
  Sparkles,
} from 'lucide-react';
import { FaLinkedin, FaWordpress, FaTelegram } from 'react-icons/fa6';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { creativeApi } from '@/api/creativeApi';
import { useBlogSchedulerStore } from '@/store/useBlogSchedulerStore';
import { useLinkedInTargets, useWordPressTargets, useTelegramTargets } from '../hooks/useBlogPosts';
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
  const [aiTitleLoading, setAiTitleLoading] = useState(false);
  const [aiBodyLoading, setAiBodyLoading] = useState(false);
  const [showAiTitleInput, setShowAiTitleInput] = useState(false);
  const [aiTitleTopic, setAiTitleTopic] = useState('');
  const [showAiBodyInput, setShowAiBodyInput] = useState(false);
  const [aiBodyTopic, setAiBodyTopic] = useState('');

  const createMutation = useCreateBlogPost();
  const updateMutation = useUpdateBlogPost();

  const { data: linkedinTargets = [], isLoading: linkedinLoading, isError: linkedinError } = useLinkedInTargets(clientId);
  const { data: wordpressTargets = [], isLoading: wpLoading, isError: wpError } = useWordPressTargets(clientId);
  const { data: telegramTargets = [], isLoading: tgLoading, isError: tgError } = useTelegramTargets(clientId);
  const targetsLoading = linkedinLoading || wpLoading || tgLoading;
  const targetsError = linkedinError && wpError && tgError;

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
  const [wpCategorySelections, setWpCategorySelections] = useState<Record<string, number | undefined>>({});

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
      // Restore category selections from existing targets
      const catSelections: Record<string, number | undefined> = {};
      editingPost.targets.forEach((t) => {
        if (t.platform === 'wordpress' && t.targetSettings?.categoryId) {
          catSelections[t.targetAccountId] = t.targetSettings.categoryId;
        }
      });
      setWpCategorySelections(catSelections);
    }
  }, [isOpen, editingPost]);

  // Reset when opening new
  useEffect(() => {
    if (isOpen) {
      // Guard: if the persisted draft belongs to a different client, reset it first
      if (draftPost.clientId !== null && draftPost.clientId !== clientId) {
        resetDraft();
      }

      if (!editingPost) {
        // Stamp the current clientId so stale drafts can be detected on reload
        updateDraft({ clientId });
        editor?.commands.setContent('');
        setMediaUrls([]);
        setUploadError(null);
        setValidationErrors([]);
        setWpCategorySelections({});
      }
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
    setWpCategorySelections({});
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
      setWpCategorySelections((prev) => {
        const next = { ...prev };
        delete next[target.id];
        return next;
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

  const toggleTelegramTarget = (target: any) => {
    if (isTargeted(target.id, 'telegram')) {
      updateDraft({
        targets: targets.filter((t) => !(t.targetAccountId === target.id && t.platform === 'telegram')),
      });
    } else {
      updateDraft({
        targets: [
          ...targets,
          {
            platform: 'telegram',
            targetAccountId: target.id,
            targetAccountName: target.name,
          },
        ],
      });
    }
  };

  const handleWpCategoryChange = (targetId: string, categoryId: number | undefined) => {
    setWpCategorySelections((prev) => ({ ...prev, [targetId]: categoryId }));
    updateDraft({
      targets: targets.map((t) =>
        t.targetAccountId === targetId && t.platform === 'wordpress'
          ? { ...t, targetSettings: categoryId ? { categoryId } : undefined }
          : t
      ),
    });
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
                <div className="relative">
                  <Input
                    value={title}
                    onChange={(e) => updateDraft({ title: e.target.value })}
                    placeholder="Enter blog post title..."
                    className="h-11 text-sm font-medium border-zinc-200 pr-10"
                    maxLength={300}
                  />
                  <button
                    type="button"
                    title={title ? "Rewrite title with AI" : "Generate title with AI"}
                    disabled={aiTitleLoading}
                    onClick={() => {
                      if (title.trim()) {
                        setAiTitleLoading(true);
                        creativeApi.generateCaptions({ clientId, platform: 'linkedin', goal: 'engagement', topic: `Generate a catchy blog title about: ${title}`, count: 1 })
                          .then((res) => { const t = res.data.data.captions[0]?.text; if (t) { updateDraft({ title: t.replace(/^["']|["']$/g, '').slice(0, 300) }); toast.success('Title improved!'); } })
                          .catch(() => toast.error('Failed')).finally(() => setAiTitleLoading(false));
                      } else {
                        setShowAiTitleInput(true);
                      }
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-400 transition-all"
                  >
                    {aiTitleLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  </button>
                  {showAiTitleInput && (
                    <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white rounded-lg border border-zinc-300 shadow-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-700">What's the blog about?</span>
                        <button type="button" onClick={() => setShowAiTitleInput(false)} className="text-zinc-400 hover:text-zinc-600"><XIcon className="w-3.5 h-3.5" /></button>
                      </div>
                      <input autoFocus type="text" value={aiTitleTopic} onChange={(e) => setAiTitleTopic(e.target.value)} placeholder="e.g. Travel tips, Hotel amenities, Guest experiences..."
                        className="w-full text-sm border border-zinc-200 rounded-md px-3 py-2 focus:outline-none focus:border-zinc-400"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && aiTitleTopic.trim()) {
                            e.preventDefault(); setAiTitleLoading(true); setShowAiTitleInput(false);
                            creativeApi.generateCaptions({ clientId, platform: 'linkedin', goal: 'engagement', topic: `Generate a catchy blog post title about: ${aiTitleTopic.trim()}`, count: 1 })
                              .then((res) => { const t = res.data.data.captions[0]?.text; if (t) { updateDraft({ title: t.replace(/^["']|["']$/g, '').slice(0, 300) }); toast.success('Title generated!'); } })
                              .catch(() => toast.error('Failed')).finally(() => { setAiTitleLoading(false); setAiTitleTopic(''); });
                          } else if (e.key === 'Escape') { setShowAiTitleInput(false); }
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-1">
                  <span className={`text-[10px] font-semibold ${title.length > 280 ? 'text-amber-500' : 'text-zinc-400'}`}>
                    {title.length}/300
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-600 mb-1.5 block">Body</label>
                <div className="relative border border-zinc-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-zinc-300 focus-within:border-zinc-300 transition-all">
                  <EditorToolbar editor={editor} />
                  <EditorContent editor={editor} />
                  {/* AI sparkles icon inside the editor */}
                  <button
                    type="button"
                    title={content ? "Rewrite with AI" : "Write with AI"}
                    disabled={aiBodyLoading}
                    onClick={() => {
                      const topic = title.trim() || (content ? content.slice(0, 100) : '');
                      if (topic) {
                        setAiBodyLoading(true);
                        creativeApi.generateContent({ clientId, contentType: 'article', topic: content ? `Rewrite and improve: ${topic}` : topic, platform: 'linkedin' })
                          .then((res) => {
                            if (editor && res.data.data.content) {
                              editor.commands.setContent(res.data.data.content.replace(/\n/g, '<br>'));
                              updateDraft({ content: res.data.data.content });
                              toast.success(`Blog body ${content ? 'improved' : 'generated'}! (${res.data.data.wordCount} words)`);
                            }
                          }).catch(() => toast.error('Failed to generate')).finally(() => setAiBodyLoading(false));
                      } else {
                        setShowAiBodyInput(true);
                      }
                    }}
                    className="absolute bottom-2 right-2 p-1.5 rounded-md bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-400 transition-all z-10"
                  >
                    {aiBodyLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  </button>
                  {/* Floating topic input when no context */}
                  {showAiBodyInput && (
                    <div className="absolute bottom-10 right-2 z-20 w-72 bg-white rounded-lg border border-zinc-300 shadow-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-700">What should the blog be about?</span>
                        <button type="button" onClick={() => setShowAiBodyInput(false)} className="text-zinc-400 hover:text-zinc-600"><XIcon className="w-3.5 h-3.5" /></button>
                      </div>
                      <input autoFocus type="text" value={aiBodyTopic} onChange={(e) => setAiBodyTopic(e.target.value)} placeholder="e.g. Travel tips, Hotel amenities..."
                        className="w-full text-sm border border-zinc-200 rounded-md px-3 py-2 focus:outline-none focus:border-zinc-400"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && aiBodyTopic.trim()) {
                            e.preventDefault(); setAiBodyLoading(true); setShowAiBodyInput(false);
                            creativeApi.generateContent({ clientId, contentType: 'article', topic: aiBodyTopic.trim(), platform: 'linkedin' })
                              .then((res) => {
                                if (editor && res.data.data.content) {
                                  editor.commands.setContent(res.data.data.content.replace(/\n/g, '<br>'));
                                  updateDraft({ content: res.data.data.content });
                                  toast.success(`Blog generated! (${res.data.data.wordCount} words)`);
                                }
                              }).catch(() => toast.error('Failed')).finally(() => { setAiBodyLoading(false); setAiBodyTopic(''); });
                          } else if (e.key === 'Escape') { setShowAiBodyInput(false); }
                        }}
                      />
                      <div className="flex justify-end">
                        <button type="button" disabled={!aiBodyTopic.trim()} onClick={() => {
                          setAiBodyLoading(true); setShowAiBodyInput(false);
                          creativeApi.generateContent({ clientId, contentType: 'article', topic: aiBodyTopic.trim(), platform: 'linkedin' })
                            .then((res) => {
                              if (editor && res.data.data.content) {
                                editor.commands.setContent(res.data.data.content.replace(/\n/g, '<br>'));
                                updateDraft({ content: res.data.data.content });
                                toast.success(`Blog generated! (${res.data.data.wordCount} words)`);
                              }
                            }).catch(() => toast.error('Failed')).finally(() => { setAiBodyLoading(false); setAiBodyTopic(''); });
                        }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 text-white text-xs font-medium disabled:opacity-50 hover:bg-zinc-800 transition-all">
                          <Sparkles className="w-3 h-3" /> Generate
                        </button>
                      </div>
                    </div>
                  )}
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
              {!targetsLoading && linkedinTargets.length === 0 && wordpressTargets.length === 0 && telegramTargets.length === 0 && !targetsError && (
                <div className="text-center py-6 text-zinc-500 text-sm">
                  No publishing accounts connected. Connect one in Integrations.
                </div>
              )}
              {linkedinTargets.map((target) => {
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
                const categories = target.categories || [];
                const selectedCategoryId = wpCategorySelections[target.id];

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
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 overflow-hidden ${
                        selected ? 'bg-white/10' : 'bg-zinc-100'
                      }`}>
                        {target.siteIconUrl ? (
                          <img src={target.siteIconUrl} alt="" className="w-5 h-5 rounded object-cover" />
                        ) : (
                          <FaWordpress className={`w-5 h-5 ${selected ? 'text-white' : 'text-[#21759b]'}`} />
                        )}
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

                    {/* Category selector — shown when target is selected and has categories */}
                    {selected && categories.length > 0 && (
                      <div className="ml-12 mr-3" onClick={(e) => e.stopPropagation()}>
                        <label className="text-[11px] font-semibold text-zinc-500 mb-1 block">Category (optional)</label>
                        <Select
                          value={selectedCategoryId?.toString() ?? 'none'}
                          onValueChange={(val) => handleWpCategoryChange(target.id, val === 'none' ? undefined : Number(val))}
                        >
                          <SelectTrigger className="h-9 text-sm border-zinc-200">
                            <SelectValue placeholder="No category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No category</SelectItem>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Telegram targets */}
              {telegramTargets.map((target) => {
                const selected = isTargeted(target.id, 'telegram');

                return (
                  <div key={`tg-${target.id}`} className="space-y-2">
                    <div
                      onClick={() => toggleTelegramTarget(target)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selected
                          ? 'bg-zinc-900 text-white border-zinc-900 shadow-md'
                          : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-sm'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        selected ? 'bg-white/10' : 'bg-zinc-100'
                      }`}>
                        <FaTelegram className={`w-5 h-5 ${selected ? 'text-white' : 'text-sky-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold flex items-center gap-2 ${selected ? 'text-white' : 'text-zinc-800'}`}>
                          Telegram
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                            selected ? 'bg-white/20' : 'bg-zinc-100 text-zinc-500'
                          }`}>
                            Channel
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

