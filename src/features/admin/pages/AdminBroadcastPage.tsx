import { useState } from 'react';
import { 
  Send, 
  Mail, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  BarChart3,
  Search,
  ShieldCheck,
  Activity,
  XCircle
} from 'lucide-react';
import { useAdminBroadcasts, useAdminTemplates, useBroadcastDetail } from '@/features/broadcasts/hooks/useBroadcasts';
import { useUserStore } from '@/utils/useUserStore';
import { CreateBroadcastModal } from '@/features/broadcasts/components/CreateBroadcastModal';
import { TemplateManager } from '@/features/broadcasts/components/TemplateManager';
import { ProviderManager } from '@/features/broadcasts/components/ProviderManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { StatsCard } from '../components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const statusConfig = {
  PENDING: {
    color: 'bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-500 dark:border-amber-500/20',
    icon: Clock
  },
  RUNNING: {
    color: 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-500 dark:border-blue-500/20',
    icon: Loader2
  },
  COMPLETED: {
    color: 'bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-500 dark:border-emerald-500/20',
    icon: CheckCircle2
  },
  FAILED: {
    color: 'bg-red-100 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-500 dark:border-red-500/20',
    icon: AlertCircle
  }
};

export default function AdminBroadcastPage() {
  const { user } = useUserStore();
  const { data: broadcasts, isLoading: broadcastsLoading } = useAdminBroadcasts();
  const { data: templates } = useAdminTemplates();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBroadcastId, setSelectedBroadcastId] = useState<number | null>(null);
  const { data: broadcastDetail, isLoading: isDetailLoading } = useBroadcastDetail(selectedBroadcastId);
  const [searchQuery, setSearchQuery] = useState('');

  // Role check - ensure only admins access this
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'SUPER_ADMIN';

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <ShieldCheck className="w-16 h-16 text-red-500 opacity-20" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
        <p className="text-gray-500">You do not have administrative privileges to view this page.</p>
      </div>
    );
  }

  const stats = {
    total: broadcasts?.length || 0,
    sent: broadcasts?.reduce((acc, b) => acc + (b.sentCount || 0), 0) || 0,
    pendingTemplates: templates?.filter(t => t.status === 'PENDING').length || 0,
    systemTemplates: templates?.filter(t => !t.userId).length || 0
  };

  const filteredBroadcasts = broadcasts?.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.template?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <AdminPageHeader 
        title="Broadcast Control Center" 
        description="Manage enterprise-wide SMS and Email communication."
        action={{
          label: "Launch Campaign",
          onClick: () => setIsModalOpen(true),
          icon: Send
        }}
      >
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Quick search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
        </div>
      </AdminPageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Campaigns"
          value={stats.total}
          icon={BarChart3}
        />
        <StatsCard 
          title="Messages Sent"
          value={stats.sent}
          icon={Send}
        />
        <StatsCard 
          title="Pending Approvals"
          value={stats.pendingTemplates}
          description="Requires action"
          icon={Clock}
          className={stats.pendingTemplates > 0 ? "border-amber-200 dark:border-amber-500/20" : ""}
        />
        <StatsCard 
          title="System Templates"
          value={stats.systemTemplates}
          description="Global presets"
          icon={ShieldCheck}
        />
      </div>

      <Tabs defaultValue="campaigns" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-gray-100/50 dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-white/10">
            <TabsTrigger value="campaigns" className="rounded-lg px-6 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-widest">Campaigns</TabsTrigger>
            <TabsTrigger value="templates" className="rounded-lg px-6 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-widest">Templates</TabsTrigger>
            <TabsTrigger value="providers" className="rounded-lg px-6 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-widest">Providers</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="campaigns">
          <Card className="border-gray-200 dark:border-white/10 shadow-sm overflow-hidden bg-white dark:bg-[#111]">
            <CardHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <CardTitle className="text-lg font-bold">Live Monitoring</CardTitle>
              </div>
              <CardDescription>Real-time campaign performance and status tracking.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-gray-100 dark:border-white/5">
                      <TableHead className="pl-8 py-4 text-[10px] font-black uppercase tracking-widest">Campaign Details</TableHead>
                      <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest">Owner</TableHead>
                      <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest">Channel</TableHead>
                      <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-center">Status</TableHead>
                      <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest">Engagement</TableHead>
                      <TableHead className="pr-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {broadcastsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell className="pl-8 py-6"><div className="w-32 h-4 bg-gray-100 dark:bg-white/5 animate-pulse rounded" /></TableCell>
                          <TableCell><div className="w-24 h-4 bg-gray-100 dark:bg-white/5 animate-pulse rounded" /></TableCell>
                          <TableCell><div className="w-16 h-4 bg-gray-100 dark:bg-white/5 animate-pulse rounded" /></TableCell>
                          <TableCell><div className="w-20 h-4 bg-gray-100 dark:bg-white/5 animate-pulse rounded mx-auto" /></TableCell>
                          <TableCell><div className="w-24 h-4 bg-gray-100 dark:bg-white/5 animate-pulse rounded" /></TableCell>
                          <TableCell className="pr-8"><div className="w-20 h-4 bg-gray-100 dark:bg-white/5 animate-pulse rounded ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredBroadcasts?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-48 text-center">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <Send className="w-10 h-10 text-gray-200 dark:text-gray-800" />
                            <p className="text-gray-400 font-medium">No campaigns matching your criteria.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBroadcasts?.map((b) => {
                        const processedCount = b.sentCount + (b.failedCount || 0);
                        const progress = b.recipientCount ? Math.round((processedCount / b.recipientCount) * 100) : 0;

                        let displayStatus = b.status;
                        let customLabel = null;
                        if (b.status === 'FAILED' && b.sentCount > 0) {
                          displayStatus = 'FAILED';
                          customLabel = 'Partial Success';
                        }
                        const Config = statusConfig[displayStatus as keyof typeof statusConfig] || statusConfig.PENDING;
                        const StatusIcon = Config.icon;
                        const finalLabel = customLabel || b.status;

                        return (
                          <TableRow 
                            key={b.id} 
                            onClick={() => setSelectedBroadcastId(b.id)}
                            className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] border-gray-100 dark:border-white/5 transition-all cursor-pointer"
                          >
                            <TableCell className="pl-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/5 flex items-center justify-center border border-blue-500/10">
                                  <Send className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 dark:text-white leading-tight">{b.name}</p>
                                  <p className="text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-widest">{b.template?.name || 'Custom Message'}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-bold text-xs text-gray-900 dark:text-white">{b.user?.fullName}</span>
                                <span className="text-[10px] text-gray-400">{b.user?.email}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center",
                                  b.channel === 'SMS' ? "bg-orange-500/10 text-orange-600" : "bg-blue-500/10 text-blue-600"
                                )}>
                                  {b.channel === 'SMS' ? <MessageSquare className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-widest">{b.channel}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={cn(
                                "mx-auto flex items-center justify-center gap-1.5 px-3 py-1 rounded-full border shadow-none font-bold text-[10px] uppercase tracking-widest w-fit",
                                Config.color
                              )}>
                                <StatusIcon className={cn("w-3 h-3", displayStatus === 'RUNNING' && "animate-spin")} />
                                {finalLabel}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2 max-w-[120px]">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                  <div className="flex items-center gap-1">
                                    <span className="text-gray-900 dark:text-white">{b.sentCount}</span>
                                    {b.failedCount > 0 && (
                                      <span className="text-red-500">({b.failedCount})</span>
                                    )}
                                    <span className="text-gray-400">/ {b.recipientCount}</span>
                                  </div>
                                  <span className="text-blue-500">{progress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                  <div 
                                    className={cn(
                                      "h-full rounded-full transition-all duration-1000",
                                      b.status === 'FAILED' ? "bg-red-500" : "bg-blue-500"
                                    )}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="pr-8 text-right">
                              <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">{format(new Date(b.createdAt), 'MMM d, yyyy')}</p>
                              <p className="text-[10px] text-gray-400 font-medium mt-0.5">{format(new Date(b.createdAt), 'hh:mm a')}</p>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <TemplateManager />
        </TabsContent>

        <TabsContent value="providers">
          <ProviderManager admin={true} />
        </TabsContent>
      </Tabs>

      <CreateBroadcastModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <Dialog open={!!selectedBroadcastId} onOpenChange={(open) => !open && setSelectedBroadcastId(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <span className="font-bold text-gray-900 dark:text-white">{broadcastDetail?.name ?? '...'}</span>
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-gray-200/50 dark:bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10">
                {broadcastDetail?.channel}
              </span>
            </DialogTitle>
            <DialogDescription>
              Detailed recipient delivery status and error logs.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-900">
            {isDetailLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 text-gray-200 dark:text-gray-700 animate-spin" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Recipient Data...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Total Recipients</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{broadcastDetail?.recipientCount || broadcastDetail?.totalCount || '—'}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">Successfully Sent</p>
                    <p className="text-xl font-bold text-emerald-700 dark:text-emerald-500">{broadcastDetail?.sentCount ?? '—'}</p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-100 dark:border-red-500/20">
                    <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Failed</p>
                    <p className="text-xl font-bold text-red-700 dark:text-red-500">{broadcastDetail?.failedCount ?? 0}</p>
                  </div>
                </div>

                <h4 className="font-bold text-[10px] uppercase tracking-widest text-gray-900 dark:text-white mb-3 border-b border-gray-100 dark:border-white/5 pb-2">Recipient Details</h4>
                
                {!broadcastDetail?.recipients || broadcastDetail.recipients.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm font-medium text-gray-400">No recipient details available for this campaign.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {broadcastDetail.recipients.map((recip) => (
                      <div key={recip.id} className="flex flex-col p-3 rounded-lg border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-colors bg-gray-50/30 dark:bg-white/[0.02]">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">{recip.to}</span>
                          <div className="flex items-center gap-1.5">
                            {recip.status === 'COMPLETED' ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">Delivered</span>
                              </>
                            ) : recip.status === 'FAILED' ? (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-red-500" />
                                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 tracking-wide uppercase">Failed</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 tracking-wide uppercase">{recip.status}</span>
                              </>
                            )}
                          </div>
                        </div>
                        {recip.error && (
                          <div className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 p-2 rounded border border-red-100 dark:border-red-500/20 break-all font-mono">
                            {recip.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
