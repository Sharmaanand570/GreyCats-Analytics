import { cn } from '@/lib/utils';
import { useState, useMemo, useRef, useLayoutEffect } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  startOfDay,
  compareAsc,
  parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Share2, X, Image as ImageIcon, Video as VideoIcon, CalendarDays, ChevronDown, Pencil, Trash2, AlertCircle, CalendarPlus, Plus, Filter, Bell } from 'lucide-react';
import { FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa6';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SocialMediaPostModal } from './SocialMediaPostModal';
import { DayPostsSheet } from './DayPostsSheet';
import { PostStatusBadge } from './PostStatusBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSocialMediaStore } from '@/store/useSocialMediaStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listScheduledPosts, deleteScheduledPost } from '../api/scheduledPostsApi';
import { scheduledPostKeys } from '../hooks/useScheduledPosts';
import type { PostPlatform, PostStatus, ScheduledPost } from '../api/types';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/security/ConfirmDialog';
import { retryScheduledPost } from '../api/scheduledPostsApi';

interface SocialMediaCalendarProps {
  clientId: number;
  canPost?: boolean;
  headerExtra?: React.ReactNode;
}

interface CalendarGridProps {
  currentDate: Date;
  slideDirection: 'left' | 'right' | null;
  posts: any[]; // Using any temporarily for integration or defined types
  onDateClick: (day: Date, dayPosts: any[]) => void;
}

const platformIcons: Record<PostPlatform, React.ReactNode> = {
  instagram: <FaInstagram className="w-3.5 h-3.5 text-pink-600" />,
  facebook: <FaFacebook className="w-3.5 h-3.5 text-blue-600" />,
  linkedin: <FaLinkedin className="w-3.5 h-3.5 text-blue-700" />,
  both: (
    <div className="flex -space-x-0.5">
      <FaFacebook className="w-3 h-3 text-blue-600" />
      <FaInstagram className="w-3 h-3 text-pink-600" />
    </div>
  ),
};

const platformColors: Record<PostPlatform, string> = {
  instagram: 'bg-pink-50 border-pink-100 text-pink-900',
  facebook: 'bg-blue-50 border-blue-100 text-blue-900',
  linkedin: 'bg-blue-50 border-blue-100 text-blue-900',
  both: 'bg-purple-50 border-purple-100 text-purple-900',
};

const STATUS_FILTERS: { label: string; value: PostStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Failed', value: 'FAILED' },
];

const statusDotColors: Record<PostStatus, string> = {
  PENDING: 'bg-zinc-400',
  PROCESSING: 'bg-amber-400',
  PUBLISHED: 'bg-green-500',
  FAILED: 'bg-red-500',
};

function CalendarGrid({ currentDate, slideDirection, posts, onDateClick }: CalendarGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const today = useMemo(() => new Date(), []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const postsByDate = useMemo(() => {
    const map = new Map<string, any[]>();
    posts.forEach((p) => {
      const key = format(parseISO(p.scheduledFor), 'yyyy-MM-dd');
      const existing = map.get(key) || [];
      existing.push(p);
      map.set(key, existing);
    });
    return map;
  }, [posts]);

  const rows: React.ReactNode[] = [];
  let days: React.ReactNode[] = [];
  let day = calStart;

  while (day <= calEnd) {
    for (let i = 0; i < 7; i++) {
      const formattedDate = format(day, 'd');
      const cloneDay = day;
      const dateKey = format(day, 'yyyy-MM-dd');
      const dayPosts = postsByDate.get(dateKey) || [];
      const isToday = isSameDay(day, today);
      const isPast = startOfDay(day) < startOfDay(today) && isSameMonth(day, monthStart);
      const isOutside = !isSameMonth(day, monthStart);

      // Determine background color based on post status
      let statusBg = '';
      if (dayPosts.length > 0) {
        if (dayPosts.some(p => p.status === 'FAILED')) statusBg = 'bg-red-50/80';
        else if (dayPosts.some(p => p.status === 'PROCESSING')) statusBg = 'bg-amber-50/60';
        else if (dayPosts.some(p => p.status === 'PENDING')) statusBg = 'bg-blue-50/50';
        else if (dayPosts.some(p => p.status === 'PUBLISHED')) statusBg = 'bg-emerald-50/50';
      }

      const cellClasses = isOutside
        ? 'bg-zinc-50/50 text-zinc-300'
        : isPast
          ? `${statusBg || 'bg-zinc-50/40'} text-zinc-400`
          : isToday
            ? `${statusBg || 'bg-blue-50/30'} ring-2 ring-inset ring-blue-200`
            : `${statusBg || 'bg-white'} text-zinc-800 hover:bg-zinc-50`;

      days.push(
        <div
          key={day.toString()}
          onClick={() => onDateClick(cloneDay, dayPosts)}
          className={`min-h-[130px] p-2 border-b border-r border-zinc-100 transition-all duration-200 cursor-pointer group relative ${cellClasses}`}
        >
          <div className="flex justify-between items-start">
            <span
              className={`flex items-center justify-center w-7 h-7 text-sm rounded-full transition-colors ${
                isToday
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : isPast
                    ? 'text-zinc-400'
                    : 'text-zinc-600 group-hover:bg-zinc-200/60 group-hover:text-zinc-900'
              }`}
            >
              {formattedDate}
            </span>
            {dayPosts.length > 0 && (() => {
              const storyCount = dayPosts.filter((p: any) => p.postType === 'STORY').length;
              const feedCount = dayPosts.length - storyCount;
              return (
                <div className="flex items-center gap-1">
                  {feedCount > 0 && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isPast ? 'text-zinc-400 bg-zinc-100/80' : 'text-zinc-500 bg-zinc-100'}`}>
                      {feedCount}
                    </span>
                  )}
                  {storyCount > 0 && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${isPast ? 'text-pink-300 bg-pink-50/50 border-pink-100/50' : 'text-pink-500 bg-pink-50 border-pink-100'}`}>
                      {storyCount}S
                    </span>
                  )}
                </div>
              );
            })()}
          </div>
          <div className={`mt-2 flex flex-col gap-1.5 overflow-hidden ${isPast ? 'opacity-60' : ''}`}>
            {dayPosts.slice(0, 3).map((post) => {
              const isStoryPost = post.postType === 'STORY';
              return (
                <div
                  key={post.id}
                  className={`text-[11px] font-medium px-2 py-1.5 rounded-md truncate border flex items-center gap-1.5 shadow-sm ${
                    isStoryPost
                      ? 'bg-gradient-to-r from-pink-50 to-orange-50 border-pink-200/60 text-pink-900'
                      : 'bg-white/80 backdrop-blur-sm border-zinc-200/50 text-zinc-800'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDotColors[post.status as PostStatus]}`} />
                  {platformIcons[post.platform as PostPlatform]}
                  {isStoryPost && (
                    <span className="text-[8px] font-bold uppercase tracking-wider bg-pink-100 text-pink-600 px-1 py-0 rounded shrink-0">
                      Story
                    </span>
                  )}
                  <span className="truncate">{isStoryPost ? (post.mediaUrls?.length ? 'Media story' : 'Story') : (post.message || 'No caption')}</span>
                </div>
              );
            })}
            {dayPosts.length > 3 && (
              <span className="text-[10px] text-zinc-400 font-semibold pl-1">+{dayPosts.length - 3} more</span>
            )}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  useLayoutEffect(() => {
    if (!containerRef.current || !slideDirection) return;
    const xOffset = slideDirection === 'right' ? 60 : -60;
    gsap.killTweensOf(containerRef.current);
    gsap.set(containerRef.current, { x: xOffset, opacity: 0, filter: 'blur(8px)' });
    gsap.to(containerRef.current, {
      x: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: 0.8,
      ease: 'expo.out',
      clearProps: 'filter',
    });
  }, [currentDate]);

  return (
    <div ref={containerRef} className="bg-white overflow-hidden">
      {rows}
    </div>
  );
}

export function SocialMediaCalendar({ clientId, canPost, headerExtra }: SocialMediaCalendarProps) {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'ALL'>('ALL');

  const [daySheetOpen, setDaySheetOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [selectedDayPosts, setSelectedDayPosts] = useState<any[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<ScheduledPost | null>(null);

  const { updateDraft } = useSocialMediaStore();

  // Fetch posts from API (using standardized keys)
  const { data: postsData, isError: isPostsError, error: postsError } = useQuery({
    queryKey: scheduledPostKeys.list(clientId),
    queryFn: () => listScheduledPosts({ clientId }),
  });

  const allPosts = postsData?.posts || [];

  const hasTodayPosts = useMemo(() => {
    const today = new Date();
    return allPosts.some((p: ScheduledPost) => isSameDay(parseISO(p.scheduledFor), today));
  }, [allPosts]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteScheduledPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduledPostKeys.all });
      toast.success('Post deleted successfully');
      setDaySheetOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete post');
    },
  });

  const retryMutation = useMutation({
    mutationFn: ({ id, scheduledFor }: { id: number; scheduledFor?: string }) => 
      retryScheduledPost(id, scheduledFor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduledPostKeys.all });
      toast.success('Post queued for retry successfully');
      setDaySheetOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to retry post');
    },
  });

  const filteredPosts = statusFilter === 'ALL' ? allPosts : allPosts.filter((p: ScheduledPost) => p.status === statusFilter);

  const nextMonth = () => {
    setSlideDirection('right');
    setCurrentDate(addMonths(currentDate, 1));
  };
  const prevMonth = () => {
    setSlideDirection('left');
    setCurrentDate(subMonths(currentDate, 1));
  };

  const jumpToDate = (month: number, year: number) => {
    const newDate = new Date(year, month, 1);
    setSlideDirection(newDate > currentDate ? 'right' : 'left');
    setCurrentDate(newDate);
  };

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const arr = [];
    for (let i = currentYear - 5; i <= currentYear + 10; i++) arr.push(i);
    return arr;
  }, []);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const isPastDate = (day: Date) => {
    return startOfDay(day) < startOfDay(new Date());
  };

  const onDateClick = (day: Date, dayPosts: any[]) => {
    if (dayPosts.length > 0 || isPastDate(day)) {
      // Past dates: always open day sheet (view only); future dates with posts: open day sheet
      setSelectedDay(day);
      setSelectedDayPosts(dayPosts);
      setDaySheetOpen(true);
    } else {
      setEditingPost(null);
      updateDraft({ date: day });
      setIsModalOpen(true);
    }
  };

  const openNewPostModal = (day?: Date) => {
    setDaySheetOpen(false);
    setEditingPost(null);
    updateDraft({ date: day || new Date() });
    setIsModalOpen(true);
  };

  const handleEditPost = (post: any) => {
    setDaySheetOpen(false);
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleDeletePost = (post: ScheduledPost) => {
    setDeleteTarget(post);
  };

  const handleRetryPost = (post: ScheduledPost) => {
    if (window.confirm('Retry this post immediately?')) {
      retryMutation.mutate({ id: post.id });
    }
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id, {
        onSettled: () => setDeleteTarget(null),
      });
    }
  };

  const getDeleteDescription = (post: ScheduledPost) => {
    if (post.status === 'PUBLISHED') {
      if (post.postType === 'STORY') {
        return 'This will remove the story from this app, but it will remain on Instagram until it expires (24h).';
      }
      return 'This will also remove the post from your Instagram/Facebook profile. This action cannot be undone.';
    }
    if (post.status === 'FAILED') {
      return 'This will remove the failed post record from your history.';
    }
    return 'This will cancel the scheduled post. It will never go live.';
  };

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: allPosts.length };
    allPosts.forEach((p: ScheduledPost) => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return counts;
  }, [allPosts]);

  const renderHeader = () => (
    <div className="flex justify-between items-end mb-4">
      <div className="flex items-end gap-4">
        <h2 className="text-lg font-semibold text-zinc-900 tracking-tight leading-none">Scheduler</h2>
        {allPosts.length > 0 && renderStatusFilter()}
      </div>
      <div className="flex items-center gap-2">
        {headerExtra}
        <div className="w-px h-6 bg-zinc-200 shrink-0 mx-1" />
        <div className="flex items-center bg-white border border-zinc-200 rounded-lg shadow-sm h-10 px-1 shrink-0">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 hover:bg-zinc-100 rounded-md shrink-0">
            <ChevronLeft className="h-4 w-4 text-zinc-600" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="text-sm font-semibold h-8 px-2 hover:bg-zinc-100 rounded-md flex items-center gap-1.5 min-w-[140px] text-zinc-800 tracking-wide"
              >
                {format(currentDate, 'MMMM yyyy')}
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 rounded-xl shadow-2xl border-zinc-200" align="center">
              <div className="p-4 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
                <h4 className="font-bold text-sm text-zinc-900">Jump to Date</h4>
                <Select
                  value={currentDate.getFullYear().toString()}
                  onValueChange={(val) => jumpToDate(currentDate.getMonth(), parseInt(val))}
                >
                  <SelectTrigger className="w-24 h-8 text-xs font-bold border-zinc-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="p-2 grid grid-cols-3 gap-1 bg-white">
                {months.map((m, idx) => (
                  <Button
                    key={m}
                    variant="ghost"
                    className={`h-9 text-[11px] font-bold uppercase tracking-wider ${
                      currentDate.getMonth() === idx
                        ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                        : 'text-zinc-600 hover:bg-zinc-100'
                    }`}
                    onClick={() => jumpToDate(idx, currentDate.getFullYear())}
                  >
                    {m.substring(0, 3)}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 hover:bg-zinc-100 rounded-md shrink-0">
            <ChevronRight className="h-4 w-4 text-zinc-600" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowUpcoming((prev) => !prev)}
          className={cn(
            "h-10 w-10 bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-sm shrink-0 relative transition-all duration-200 rounded-xl",
            showUpcoming && "bg-zinc-50 border-zinc-300 ring-2 ring-zinc-100",
            hasTodayPosts && !showUpcoming && "border-blue-200 bg-blue-50/30"
          )}
        >
          <Bell className={cn(
            "w-4 h-4 transition-colors",
            hasTodayPosts ? "text-blue-600 fill-blue-600/10" : "text-zinc-500"
          )} />
          {hasTodayPosts && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600 border-2 border-white shadow-sm"></span>
            </span>
          )}
        </Button>
        {canPost && (
          <Button
            onClick={() => openNewPostModal()}
            className="h-10 bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        )}
      </div>
    </div>
  );

  const renderStatusFilter = () => {
    const activeFilter = STATUS_FILTERS.find(f => f.value === statusFilter);
    const activeCount = statusCounts[statusFilter] || 0;

    const filterBadgeColors: Record<string, string> = {
      ALL: 'bg-zinc-900',
      PENDING: 'bg-blue-600',
      PROCESSING: 'bg-amber-600',
      PUBLISHED: 'bg-emerald-600',
      FAILED: 'bg-red-600',
    };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button 
            className="h-10 px-4 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-sm flex items-center gap-2 rounded-xl transition-all outline-none"
          >
            <Filter className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-bold">
              {activeFilter?.label || 'Filter'}
            </span>
            <span className={cn(
              "text-[10px] font-black px-1.5 py-0.5 rounded-full text-white ml-0.5",
              filterBadgeColors[statusFilter] || 'bg-zinc-400'
            )}>
              {activeCount}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-0.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 p-1.5 rounded-2xl shadow-2xl border-zinc-200 bg-white dark:bg-[#0A0A0A]" align="start">
          <div className="px-3 py-2 border-b border-zinc-100 dark:border-white/5 mb-1.5">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Filter by status</p>
          </div>
          {STATUS_FILTERS.map((f) => {
            const count = statusCounts[f.value] || 0;
            const isActive = statusFilter === f.value;
            return (
              <DropdownMenuItem
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all mb-0.5 last:mb-0 border border-transparent",
                  isActive ? "bg-zinc-50 dark:bg-white/5 border-zinc-100 dark:border-white/5 font-bold" : "hover:bg-zinc-50/80 dark:hover:bg-white/[0.02]"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    f.value === 'ALL' ? 'bg-zinc-400' : statusDotColors[f.value as PostStatus]
                  )} />
                  <span className={cn(
                    "text-sm tracking-tight",
                    isActive ? "text-zinc-900 dark:text-white" : "text-zinc-600 dark:text-zinc-400"
                  )}>
                    {f.label}
                  </span>
                </div>
                <span className={cn(
                  "text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none",
                  isActive ? "bg-zinc-900 text-white dark:bg-white dark:text-black" : "bg-zinc-100 dark:bg-white/10 text-zinc-500"
                )}>
                  {count}
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(startOfMonth(currentDate));

    for (let i = 0; i < 7; i++) {
      const isWeekend = i === 0 || i === 6;
      days.push(
        <div key={i} className={`text-center font-semibold text-[11px] py-2.5 uppercase tracking-widest border-b border-zinc-200 ${
          isWeekend ? 'text-zinc-400' : 'text-zinc-600'
        }`}>
          {format(addDays(startDate, i), 'EEE')}
        </div>
      );
    }
    return <div className="grid grid-cols-7 bg-zinc-50 rounded-t-xl sticky top-0 z-[1]">{days}</div>;
  };

  const renderCells = () => (
    <CalendarGrid currentDate={currentDate} slideDirection={slideDirection} posts={filteredPosts} onDateClick={onDateClick} />
  );

  const renderUpcomingSidebar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const upcoming = filteredPosts
      .filter((p: ScheduledPost) => {
        const postDate = parseISO(p.scheduledFor);
        return postDate >= monthStart && postDate <= monthEnd;
      })
      .sort((a: ScheduledPost, b: ScheduledPost) => compareAsc(parseISO(a.scheduledFor), parseISO(b.scheduledFor)));

    return (
      <div
        className={`transition-all duration-300 ease-in-out bg-white border-zinc-200 rounded-xl shadow-sm flex flex-col min-h-0 shrink-0 ${
          showUpcoming ? 'w-[320px] lg:w-[380px] opacity-100 border ml-4 overflow-hidden' : 'w-0 opacity-0 border-transparent ml-0 overflow-hidden'
        }`}
      >
        <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-white sticky top-0 shrink-0">
          <h3 className="font-semibold text-lg text-zinc-900">{format(currentDate, 'MMMM yyyy')}</h3>
          <Button variant="ghost" size="icon" onClick={() => setShowUpcoming(false)} className="h-8 w-8 rounded-full hover:bg-zinc-100">
            <X className="w-4 h-4 text-zinc-500" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {upcoming.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 text-sm">No upcoming posts</div>
          ) : (
            upcoming.map((post: ScheduledPost) => {
              const postDate = parseISO(post.scheduledFor);
              const hasMedia = (post.mediaUrls?.length || 0) > 0;
              const isVideo = post.mediaType === 'VIDEO';

              const isStoryPost = post.postType === 'STORY';

              return (
                <div
                  key={post.id}
                  className={`p-4 rounded-xl border shadow-sm flex flex-col gap-3 relative ${
                    isStoryPost
                      ? 'bg-gradient-to-br from-pink-50 to-orange-50 border-pink-200'
                      : `${platformColors[post.platform as PostPlatform] || 'bg-white border-zinc-200'}`
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {isStoryPost ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center ring-2 ring-white shadow-sm">
                          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                            {platformIcons[post.platform as PostPlatform]}
                          </div>
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-zinc-100">
                          {platformIcons[post.platform as PostPlatform]}
                        </div>
                      )}
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                        isStoryPost
                          ? 'bg-pink-100 text-pink-600 border border-pink-200'
                          : 'bg-white/60 text-zinc-500 border border-zinc-200/50'
                      }`}>
                        {isStoryPost ? 'Story' : 'Feed'}
                      </span>
                      <PostStatusBadge
                        status={post.status}
                        onClick={(e) => {
                          e.stopPropagation();
                          setStatusFilter(post.status);
                        }}
                      />
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold opacity-60 uppercase tracking-widest">
                        {format(postDate, 'MMM dd, yyyy')}
                      </span>
                      <br />
                      <span className="text-[10px] font-semibold opacity-50">{format(postDate, 'h:mm a')}</span>
                    </div>
                  </div>

                  <div className="mt-1">
                    {isStoryPost ? (
                      <h4 className="font-semibold text-[15px] leading-snug text-pink-800 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4" />
                        Media Story
                      </h4>
                    ) : (
                      <>
                        <h4 className="font-semibold text-[15px] leading-snug line-clamp-2">
                          {post.message || 'No caption'}
                        </h4>
                        {post.firstComment && (
                          <p className="text-xs opacity-60 mt-1 line-clamp-1">{post.firstComment}</p>
                        )}
                      </>
                    )}
                  </div>

                  {post.status === 'FAILED' && post.errorMessage && (
                    <div className="flex items-start gap-1.5 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      {post.errorMessage}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-3 text-[11px] font-semibold opacity-70 uppercase tracking-wider">
                      {hasMedia && (
                        <span className="flex items-center gap-1 bg-white/60 px-2 py-0.5 rounded-md">
                          {isVideo ? <VideoIcon className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                          {post.mediaUrls.length} {post.mediaUrls.length === 1 ? 'file' : 'files'}
                        </span>
                      )}
                    </div>
                    {post.status !== 'PROCESSING' && (
                      <div className="flex items-center gap-1">
                        {post.status === 'FAILED' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full hover:bg-blue-50 text-blue-600"
                            onClick={() => handleRetryPost(post)}
                            title="Retry now"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {post.status === 'PENDING' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full hover:bg-white/80"
                            onClick={() => handleEditPost(post)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full hover:bg-red-100 text-red-500"
                          onClick={() => handleDeletePost(post)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {post.status === 'PUBLISHED' && post.publishedPostIds && (
                    <div className="text-[10px] text-green-600 font-medium opacity-70 truncate">
                      Published ID: {Array.isArray(post.publishedPostIds) ? post.publishedPostIds.join(', ') : String(post.publishedPostIds)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col p-2 space-y-2 relative overflow-hidden">
      {renderHeader()}
      {isPostsError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium shrink-0">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {(postsError as Error)?.message || 'Failed to load scheduled posts. Please try again.'}
        </div>
      )}
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-w-0 overflow-auto bg-white border border-zinc-200 rounded-xl shadow-sm transition-all duration-300 relative">
          <div className="min-w-[800px] h-full flex flex-col">
            {renderDays()}
            <div className="flex-1">
              {renderCells()}
            </div>
          </div>
          {/* Empty state overlay */}
          {allPosts.length === 0 && canPost && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/60 backdrop-blur-[2px]">
              <div className="text-center px-8 py-10 bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-sm">
                <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                  <CalendarPlus className="w-7 h-7 text-zinc-400" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 tracking-tight mb-1">No posts scheduled</h3>
                <p className="text-sm text-zinc-500 mb-5 leading-relaxed">
                  Click any future date on the calendar or use the button below to schedule your first post.
                </p>
                <Button
                  onClick={() => openNewPostModal()}
                  className="h-10 px-6 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm shadow-sm"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Schedule Your First Post
                </Button>
              </div>
            </div>
          )}
        </div>
        {renderUpcomingSidebar()}
      </div>

      <SocialMediaPostModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPost(null);
        }}
        clientId={clientId}
        editingPost={editingPost}
      />

      <DayPostsSheet
        isOpen={daySheetOpen}
        onClose={() => setDaySheetOpen(false)}
        date={selectedDay}
        posts={selectedDayPosts}
        onEdit={handleEditPost}
        onDelete={handleDeletePost}
        onRetry={handleRetryPost}
        onNewPost={() => openNewPostModal(selectedDay)}
        onStatusClick={setStatusFilter}
        isPast={isPastDate(selectedDay)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        onConfirm={confirmDelete}
        title={
          deleteTarget?.status === 'PUBLISHED'
            ? 'Delete published post?'
            : deleteTarget?.status === 'FAILED'
              ? 'Remove failed post?'
              : 'Cancel scheduled post?'
        }
        description={deleteTarget ? getDeleteDescription(deleteTarget) : ''}
        confirmText="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
