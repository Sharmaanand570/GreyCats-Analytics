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
import {
  ChevronLeft,
  ChevronRight,
  PenLine,
  X,
  ChevronDown,
  Pencil,
  Trash2,
  AlertCircle,
  ExternalLink,
  FileText,
  Loader2,
  CalendarPlus,
  Bell,
  Filter,
} from 'lucide-react';
import { FaWordpress, FaLinkedin, FaReddit } from 'react-icons/fa6';
import { SiBlogger, SiTelegram } from 'react-icons/si';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BlogPostModal } from './BlogPostModal';
import { DayBlogPostsSheet } from './DayBlogPostsSheet';
import { BlogPostStatusBadge } from './BlogPostStatusBadge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listBlogPosts, deleteBlogPost } from '../api/blogPostsApi';
import { blogPostKeys } from '../hooks/useBlogPosts';
import type { BlogPlatform, BlogPostStatus, BlogPost } from '../api/types';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/security/ConfirmDialog';
import { useBlogSchedulerStore } from '@/store/useBlogSchedulerStore';

interface BlogCalendarProps {
  clientId: number;
  canPost?: boolean;
  headerExtra?: React.ReactNode;
}

interface CalendarGridProps {
  currentDate: Date;
  slideDirection: 'left' | 'right' | null;
  posts: BlogPost[];
  onDateClick: (day: Date, dayPosts: BlogPost[]) => void;
}

const platformIcons: Record<BlogPlatform, React.ReactNode> = {
  wordpress: <FaWordpress className="w-3.5 h-3.5 text-blue-800" />,
  linkedin: <FaLinkedin className="w-3.5 h-3.5 text-blue-700" />,
  blogger: <SiBlogger className="w-3.5 h-3.5 text-orange-600" />,
  reddit: <FaReddit className="w-3.5 h-3.5 text-orange-500" />,
  telegram: <SiTelegram className="w-3.5 h-3.5 text-[#229ED9]" />,
};

const platformColors: Record<BlogPlatform, string> = {
  wordpress: 'bg-blue-50 border-blue-100 text-blue-900',
  linkedin: 'bg-sky-50 border-sky-100 text-sky-900',
  blogger: 'bg-orange-50 border-orange-100 text-orange-900',
  reddit: 'bg-amber-50 border-amber-100 text-amber-900',
  telegram: 'bg-sky-50 border-sky-100 text-sky-900',
};

const STATUS_FILTERS: { label: string; value: BlogPostStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Failed', value: 'FAILED' },
];

const statusDotColors: Record<BlogPostStatus, string> = {
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
    const map = new Map<string, BlogPost[]>();
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
            {dayPosts.length > 0 && (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isPast ? 'text-zinc-400 bg-zinc-100/80' : 'text-zinc-500 bg-zinc-100'}`}>
                {dayPosts.length}
              </span>
            )}
          </div>
          <div className={`mt-2 flex flex-col gap-1.5 overflow-hidden ${isPast ? 'opacity-60' : ''}`}>
            {dayPosts.slice(0, 3).map((post) => {
              const firstPlatform = post.targets[0]?.platform;
              return (
                <div
                  key={post.id}
                  className="text-[11px] font-medium px-2 py-1.5 rounded-md truncate border flex items-center gap-1.5 shadow-sm bg-white/80 backdrop-blur-sm border-zinc-200/50 text-zinc-800"
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDotColors[post.status]}`} />
                  {firstPlatform && platformIcons[firstPlatform]}
                  {post.targets.length > 1 && (
                    <span className="text-[8px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-500 px-1 py-0 rounded shrink-0">
                      +{post.targets.length - 1}
                    </span>
                  )}
                  <span className="truncate">{post.title || 'Untitled'}</span>
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

export function BlogCalendar({ clientId, canPost, headerExtra }: BlogCalendarProps) {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [statusFilter, setStatusFilter] = useState<BlogPostStatus | 'ALL'>('ALL');

  const [daySheetOpen, setDaySheetOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [selectedDayPosts, setSelectedDayPosts] = useState<BlogPost[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);

  const { updateDraft } = useBlogSchedulerStore();

  const { data: postsData, isError: isPostsError, error: postsError } = useQuery({
    queryKey: blogPostKeys.list(clientId),
    queryFn: () => listBlogPosts({ clientId }),
  });

  const allPosts: BlogPost[] = postsData?.posts || (postsData as any)?.data || [];

  const hasTodayBlogPosts = useMemo(() => {
    const today = new Date();
    return allPosts.some((p: BlogPost) => isSameDay(parseISO(p.scheduledFor), today));
  }, [allPosts]);
  console.log('[BlogCalendar] allPosts:', allPosts);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteBlogPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogPostKeys.all });
      toast.success('Blog post deleted successfully');
      setDaySheetOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete blog post');
    },
  });

  const filteredPosts = statusFilter === 'ALL' ? allPosts : allPosts.filter((p) => p.status === statusFilter);
  console.log('[BlogCalendar] filteredPosts (status filter:', statusFilter, '):', filteredPosts);

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

  const isPastDate = (day: Date) => startOfDay(day) < startOfDay(new Date());

  const onDateClick = (day: Date, dayPosts: BlogPost[]) => {
    if (dayPosts.length > 0 || isPastDate(day)) {
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

  const handleEditPost = (post: BlogPost) => {
    setDaySheetOpen(false);
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleDeletePost = (post: BlogPost) => {
    setDeleteTarget(post);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id, {
        onSettled: () => setDeleteTarget(null),
      });
    }
  };

  const getDeleteDescription = (post: BlogPost) => {
    if (post.status === 'PUBLISHED') {
      return 'This will remove the published blog post record. The post may remain on the platform.';
    }
    if (post.status === 'FAILED') {
      return 'This will remove the failed post record from your history.';
    }
    return 'This will cancel the scheduled blog post. It will not be published.';
  };

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: allPosts.length };
    allPosts.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return counts;
  }, [allPosts]);

  const renderHeader = () => (
    <div className="flex justify-between items-end mb-4">
      <div className="flex items-end gap-4">
        <h2 className="text-lg font-semibold text-zinc-900 tracking-tight leading-none">Blog Scheduler</h2>
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
            hasTodayBlogPosts && !showUpcoming && "border-blue-200 bg-blue-50/30"
          )}
        >
          <Bell className={cn(
            "w-4 h-4 transition-colors",
            hasTodayBlogPosts ? "text-blue-600 fill-blue-600/10" : "text-zinc-500"
          )} />
          {hasTodayBlogPosts && (
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
            <PenLine className="w-4 h-4 mr-2" />
            New Blog
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
                    f.value === 'ALL' ? 'bg-zinc-400' : statusDotColors[f.value as BlogPostStatus]
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
      .filter((p) => {
        const postDate = parseISO(p.scheduledFor);
        return postDate >= monthStart && postDate <= monthEnd;
      })
      .sort((a, b) => compareAsc(parseISO(a.scheduledFor), parseISO(b.scheduledFor)));

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
            <div className="text-center py-10 text-zinc-500 text-sm">No upcoming blog posts</div>
          ) : (
            upcoming.map((post) => {
              const postDate = parseISO(post.scheduledFor);
              const firstPlatform = post.targets[0]?.platform;

              return (
                <div
                  key={post.id}
                  className={`p-4 rounded-xl border shadow-sm flex flex-col gap-3 relative ${
                    firstPlatform ? platformColors[firstPlatform] : 'bg-white border-zinc-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-zinc-100">
                        {firstPlatform ? platformIcons[firstPlatform] : <FileText className="w-3.5 h-3.5 text-zinc-500" />}
                      </div>
                      {post.targets.length > 1 && (
                        <div className="flex items-center -space-x-1">
                          {post.targets.slice(1, 4).map((t, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-zinc-100 shadow-sm">
                              {platformIcons[t.platform]}
                            </div>
                          ))}
                          {post.targets.length > 4 && (
                            <span className="text-[8px] font-bold text-zinc-500 ml-1">+{post.targets.length - 4}</span>
                          )}
                        </div>
                      )}
                      <BlogPostStatusBadge
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
                    <h4 className="font-semibold text-[15px] leading-snug line-clamp-2">
                      {post.title || 'Untitled'}
                    </h4>
                  </div>

                  {post.status === 'FAILED' && post.errorMessage && (
                    <div className="flex items-start gap-1.5 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      {post.errorMessage}
                    </div>
                  )}

                  {post.insights && post.status === 'PUBLISHED' && (
                    <div className="flex items-center gap-4 text-[11px] font-semibold text-zinc-500">
                      {post.insights.views != null && <span>{post.insights.views} views</span>}
                      {post.insights.likes != null && <span>{post.insights.likes} likes</span>}
                      {post.insights.comments != null && <span>{post.insights.comments} comments</span>}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                      {post.targets.some(t => t.status === 'FAILED' && t.errorMessage === 'Post was deleted on LinkedIn') ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md">
                          <AlertCircle className="w-2.5 h-2.5" />
                          Removed from LinkedIn
                        </span>
                      ) : post.status === 'PUBLISHED' && post.publishedUrls && post.publishedUrls.length > 0 ? (
                        <a
                          href={post.publishedUrls[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md transition-colors"
                        >
                          View Post
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-1">
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
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </div>
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
          {(postsError as Error)?.message || 'Failed to load blog posts. Please try again.'}
        </div>
      )}
      <div className="flex-1 min-h-0 flex gap-4">
        <div className="flex-1 min-w-0 overflow-auto bg-white border border-zinc-200 rounded-xl shadow-sm transition-all duration-300 relative">
          {allPosts.length === 0 && !postsData ? (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-zinc-300 animate-spin" />
                <p className="text-sm font-medium text-zinc-400 tracking-wide">Fetching your scheduler data...</p>
              </div>
            </div>
          ) : allPosts.length === 0 && canPost ? (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/60 backdrop-blur-[2px]">
              <div className="text-center px-8 py-10 bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-sm">
                <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                  <CalendarPlus className="w-7 h-7 text-zinc-400" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 tracking-tight mb-1">No blog posts scheduled</h3>
                <p className="text-sm text-zinc-500 mb-5 leading-relaxed">
                  Click any future date on the calendar or use the button below to create your first blog post.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    onClick={() => openNewPostModal()}
                    className="h-10 px-6 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm shadow-sm"
                  >
                    <PenLine className="w-4 h-4 mr-2" />
                    Create Your First Blog
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
          <div className="min-w-[800px] h-full flex flex-col">
            {renderDays()}
            <div className="flex-1">
              {renderCells()}
            </div>
          </div>
        </div>
        {allPosts.length > 0 && renderUpcomingSidebar()}
      </div>

      <BlogPostModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPost(null);
        }}
        clientId={clientId}
        editingPost={editingPost}
      />

      <DayBlogPostsSheet
        isOpen={daySheetOpen}
        onClose={() => setDaySheetOpen(false)}
        date={selectedDay}
        posts={selectedDayPosts}
        onEdit={handleEditPost}
        onDelete={handleDeletePost}
        onNewPost={() => openNewPostModal(selectedDay)}
        onStatusClick={setStatusFilter}
        isPast={isPastDate(selectedDay)}
        isDeleting={deleteMutation.isPending}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        onConfirm={confirmDelete}
        title={
          deleteTarget?.status === 'PUBLISHED'
            ? 'Delete published blog post?'
            : deleteTarget?.status === 'FAILED'
              ? 'Remove failed blog post?'
              : 'Cancel scheduled blog post?'
        }
        description={deleteTarget ? getDeleteDescription(deleteTarget) : ''}
        confirmText="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
