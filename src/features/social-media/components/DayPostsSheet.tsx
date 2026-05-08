import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus, AlertCircle, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa6';
import { PostStatusBadge } from './PostStatusBadge';
import type { ScheduledPost, PostPlatform, PostStatus } from '../api/types';

const platformIcons: Record<PostPlatform, React.ReactNode> = {
  instagram: <FaInstagram className="w-4 h-4 text-pink-600" />,
  facebook: <FaFacebook className="w-4 h-4 text-blue-600" />,
  linkedin: <FaLinkedin className="w-4 h-4 text-blue-700" />,
  both: (
    <div className="flex -space-x-0.5">
      <FaFacebook className="w-3.5 h-3.5 text-blue-600" />
      <FaInstagram className="w-3.5 h-3.5 text-pink-600" />
    </div>
  ),
};

interface DayPostsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  posts: ScheduledPost[];
  onEdit: (post: ScheduledPost) => void;
  onDelete: (post: ScheduledPost) => void;
  onRetry: (post: ScheduledPost) => void;
  onNewPost: () => void;
  onStatusClick?: (status: PostStatus) => void;
  isPast?: boolean;
}

function MediaThumbnail({ url, isStory, isVideo }: { url: string; isStory: boolean; isVideo: boolean }) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`rounded-lg border overflow-hidden bg-zinc-100 flex items-center justify-center ${
        isStory
          ? 'w-16 h-28 border-pink-200'
          : 'w-14 h-14 border-zinc-200'
      }`}
    >
      {failed ? (
        <div className="flex flex-col items-center gap-0.5 text-zinc-400">
          {isVideo ? <VideoIcon className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
          <span className="text-[8px] font-medium">No preview</span>
        </div>
      ) : (
        <img
          src={url}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

export function DayPostsSheet({
  isOpen,
  onClose,
  date,
  posts,
  onEdit,
  onDelete,
  onRetry,
  onNewPost,
  onStatusClick,
  isPast = false
}: DayPostsSheetProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white rounded-2xl gap-0">
        {/* Header — pr-10 keeps content clear of the dialog's absolute-positioned X button */}
        <DialogHeader className="px-6 pt-6 pb-4 pr-12 border-b border-zinc-100">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="text-lg font-semibold text-zinc-900 leading-tight">
                {format(date, 'EEEE, MMMM d')}
              </DialogTitle>
              <p className="text-xs text-zinc-500 mt-1 font-medium flex items-center gap-2">
                {posts.length} {posts.length === 1 ? 'post' : 'posts'} scheduled
                {(() => {
                  const storyCount = posts.filter(p => p.postType === 'STORY').length;
                  const feedCount = posts.length - storyCount;
                  if (storyCount === 0 || feedCount === 0) return null;
                  return (
                    <span className="text-[10px] text-zinc-400">
                      ({feedCount} feed, {storyCount} {storyCount === 1 ? 'story' : 'stories'})
                    </span>
                  );
                })()}
              </p>
            </div>
            {!isPast && (
              <Button
                size="sm"
                onClick={onNewPost}
                className="h-8 shrink-0 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                New Post
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Post list */}
        <div className="max-h-[60vh] overflow-y-auto p-5 space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-sm">
              No posts scheduled for this day.
            </div>
          ) : (
            posts.map((post) => {
              const postDate = parseISO(post.scheduledFor);
              const hasMedia = (post.mediaUrls?.length || 0) > 0;
              const isVideo = post.mediaType === 'VIDEO';
              const isStoryPost = post.postType === 'STORY';

              return (
                <div
                  key={post.id}
                  className={`p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3 ${
                    isStoryPost
                      ? 'border-pink-200 bg-gradient-to-br from-white to-pink-50/40'
                      : 'border-zinc-200 bg-white'
                  }`}
                >
                  {/* Top row: platform + type badge + status + time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      {isStoryPost ? (
                        <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center ring-2 ring-white shadow-sm">
                          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                            {platformIcons[post.platform]}
                          </div>
                        </div>
                      ) : (
                        <div className="w-8 h-8 shrink-0 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100">
                          {platformIcons[post.platform]}
                        </div>
                      )}
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0 ${
                        isStoryPost
                          ? 'bg-pink-100 text-pink-600 border border-pink-200'
                          : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                      }`}>
                        {isStoryPost ? 'Story' : 'Feed'}
                      </span>
                      <PostStatusBadge
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

                  {/* Caption — stories show "Media story" instead */}
                  {isStoryPost ? (
                    <p className="text-sm text-pink-700 font-medium flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      Media Story
                    </p>
                  ) : (
                    <p className="text-sm text-zinc-800 font-medium line-clamp-3 leading-relaxed">
                      {post.message || <span className="text-zinc-400 italic">No caption</span>}
                    </p>
                  )}

                  {/* First comment — feed only */}
                  {!isStoryPost && post.firstComment && (
                    <p className="text-xs text-zinc-500 line-clamp-1 -mt-1">
                      First comment: {post.firstComment}
                    </p>
                  )}

                  {/* Media thumbnail row */}
                  {hasMedia && (
                    <div className="flex items-center gap-2">
                      {post.mediaUrls.slice(0, isStoryPost ? 1 : 4).map((url: string, i: number) => (
                        <MediaThumbnail key={i} url={url} isStory={isStoryPost} isVideo={isVideo} />
                      ))}
                      {!isStoryPost && post.mediaUrls.length > 4 && (
                        <div className="w-14 h-14 rounded-lg border border-zinc-200 bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-500">
                          +{post.mediaUrls.length - 4}
                        </div>
                      )}
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider ml-auto flex items-center gap-1">
                        {isVideo ? <VideoIcon className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                        {post.mediaUrls.length}
                      </span>
                    </div>
                  )}

                  {/* Error for FAILED */}
                  {post.status === 'FAILED' && post.errorMessage && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-xs text-red-700 font-medium leading-relaxed">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="break-words">{post.errorMessage}</span>
                    </div>
                  )}

                  {/* Actions & Published Link */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100 mt-0.5">
                    <div className="flex items-center gap-2">
                    </div>
                    {post.status !== 'PROCESSING' && (
                      <div className="flex items-center gap-1.5">
                        {post.status === 'FAILED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1.5 rounded-lg"
                            onClick={() => onRetry(post)}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Retry Now
                          </Button>
                        )}
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
                    )}
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
