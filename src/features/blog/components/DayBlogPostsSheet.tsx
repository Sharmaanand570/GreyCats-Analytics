import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { Pencil, Trash2, Plus, AlertCircle, ExternalLink, FileText } from 'lucide-react';
import { FaWordpress, FaLinkedin, FaReddit } from 'react-icons/fa6';
import { SiBlogger } from 'react-icons/si';
import { BlogPostStatusBadge } from './BlogPostStatusBadge';
import type { BlogPost, BlogPlatform, BlogPostStatus } from '../api/types';

const platformIcons: Record<BlogPlatform, React.ReactNode> = {
  wordpress: <FaWordpress className="w-4 h-4 text-blue-800" />,
  linkedin: <FaLinkedin className="w-4 h-4 text-blue-700" />,
  blogger: <SiBlogger className="w-4 h-4 text-orange-600" />,
  reddit: <FaReddit className="w-4 h-4 text-orange-500" />,
};

interface DayBlogPostsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  posts: BlogPost[];
  onEdit: (post: BlogPost) => void;
  onDelete: (post: BlogPost) => void;
  onNewPost: () => void;
  onStatusClick?: (status: BlogPostStatus) => void;
  isPast?: boolean;
}

export function DayBlogPostsSheet({
  isOpen,
  onClose,
  date,
  posts,
  onEdit,
  onDelete,
  onNewPost,
  onStatusClick,
  isPast = false,
}: DayBlogPostsSheetProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white rounded-2xl gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 pr-12 border-b border-zinc-100">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="text-lg font-semibold text-zinc-900 leading-tight">
                {format(date, 'EEEE, MMMM d')}
              </DialogTitle>
              <p className="text-xs text-zinc-500 mt-1 font-medium">
                {posts.length} blog {posts.length === 1 ? 'post' : 'posts'} scheduled
              </p>
            </div>
            {!isPast && (
              <Button
                size="sm"
                onClick={onNewPost}
                className="h-8 shrink-0 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                New Blog
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto p-5 space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-sm">
              No blog posts scheduled for this day.
            </div>
          ) : (
            posts.map((post) => {
              const postDate = parseISO(post.scheduledFor);
              const firstPlatform = post.targets[0]?.platform;

              return (
                <div
                  key={post.id}
                  className="p-4 rounded-xl border border-zinc-200 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
                >
                  {/* Top row: platforms + status + time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 shrink-0 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100">
                        {firstPlatform ? platformIcons[firstPlatform] : <FileText className="w-4 h-4 text-zinc-400" />}
                      </div>
                      {post.targets.length > 1 && (
                        <div className="flex items-center -space-x-1">
                          {post.targets.slice(1, 3).map((t, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-zinc-100 shadow-sm">
                              {platformIcons[t.platform]}
                            </div>
                          ))}
                          {post.targets.length > 3 && (
                            <span className="text-[8px] font-bold text-zinc-500 ml-1">+{post.targets.length - 3}</span>
                          )}
                        </div>
                      )}
                      <BlogPostStatusBadge
                        status={post.status}
                        onClick={() => {
                          onStatusClick?.(post.status);
                          onClose();
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-zinc-400 shrink-0 ml-2">
                      {format(postDate, 'h:mm a')}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-sm text-zinc-800 font-semibold line-clamp-2 leading-relaxed">
                    {post.title || <span className="text-zinc-400 italic">Untitled</span>}
                  </h4>

                  {/* Insights for published */}
                  {post.status === 'PUBLISHED' && post.insights && (
                    <div className="flex items-center gap-4 text-[11px] font-semibold text-zinc-500">
                      {post.insights.views != null && <span>{post.insights.views} views</span>}
                      {post.insights.likes != null && <span>{post.insights.likes} likes</span>}
                      {post.insights.comments != null && <span>{post.insights.comments} comments</span>}
                    </div>
                  )}

                  {/* Error for FAILED */}
                  {post.status === 'FAILED' && post.errorMessage && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-xs text-red-700 font-medium leading-relaxed">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{post.errorMessage}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100 mt-0.5">
                    <div className="flex items-center gap-2">
                      {post.status === 'PUBLISHED' && post.publishedUrls && post.publishedUrls.length > 0 && (
                        <a
                          href={post.publishedUrls[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md transition-colors"
                        >
                          View Post
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {post.status === 'PENDING' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-xs font-semibold text-zinc-600 hover:text-zinc-900 gap-1.5 rounded-lg"
                          onClick={() => onEdit(post)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 gap-1.5 rounded-lg"
                        onClick={() => onDelete(post)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
