import { useState } from 'react';
import { 
  Plus, 
  Send, 
  Mail, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  BarChart3,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBroadcasts } from '@/features/broadcasts/hooks/useBroadcasts';
import { CreateBroadcastModal } from '@/features/broadcasts/components/CreateBroadcastModal';
import { TemplateManager } from '@/features/broadcasts/components/TemplateManager';
import { ProviderManager } from '@/features/broadcasts/components/ProviderManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

const statusConfig = {
  PENDING: {
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: <Clock className="w-3.5 h-3.5" />,
    label: 'Pending'
  },
  PROCESSING: {
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    label: 'Processing'
  },
  COMPLETED: {
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    label: 'Completed'
  },
  FAILED: {
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    label: 'Failed'
  }
};

export default function BroadcastPage() {
  const { data: broadcasts, isLoading } = useBroadcasts();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBroadcasts = broadcasts?.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
      <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd]">
        <div className="w-full h-full flex flex-col relative p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1400px] mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2 flex items-center gap-3">
                  <Send className="w-8 h-8 text-blue-600" />
                  Broadcast System
                </h1>
                <p className="text-zinc-500 font-medium">Manage and monitor your SMS & Email campaigns.</p>
              </div>
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl px-6 h-12 shadow-lg shadow-zinc-200/50 flex items-center gap-2 font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-5 h-5" />
                Create New Campaign
              </Button>
            </div>

            <Tabs defaultValue="campaigns" className="w-full">
              <TabsList className="bg-zinc-100/50 p-1 border border-zinc-200/50 rounded-xl mb-8">
                <TabsTrigger value="campaigns" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Campaigns</TabsTrigger>
                <TabsTrigger value="templates" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Templates</TabsTrigger>
                <TabsTrigger value="providers" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Providers</TabsTrigger>
              </TabsList>

              <TabsContent value="campaigns" className="space-y-8 focus-visible:outline-none">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-6 rounded-[28px] border border-zinc-200/50 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Total Campaigns</p>
                </div>
                <p className="text-4xl font-extrabold text-zinc-900 tracking-tight">{broadcasts?.length || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-[28px] border border-zinc-200/50 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Messages Sent</p>
                </div>
                <p className="text-4xl font-extrabold text-zinc-900 tracking-tight">
                  {broadcasts?.reduce((acc, b) => acc + b.sentCount, 0).toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-white p-6 rounded-[28px] border border-zinc-200/50 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Delivery Failures</p>
                </div>
                <p className="text-4xl font-extrabold text-zinc-900 tracking-tight">
                  {broadcasts?.reduce((acc, b) => acc + b.failedCount, 0).toLocaleString() || 0}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-[32px] border border-zinc-200/60 shadow-xl shadow-zinc-200/20 overflow-hidden min-h-[500px]">
              <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input 
                    type="text" 
                    placeholder="Search campaigns..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="rounded-xl border-zinc-200 text-zinc-600 font-bold text-xs h-10 px-4">
                    <Filter className="w-3.5 h-3.5 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-zinc-50/50">
                      <th className="px-8 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Campaign Details</th>
                      <th className="px-8 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Channel</th>
                      <th className="px-8 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Progress</th>
                      <th className="px-8 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-right">Date Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="py-20 text-center">
                          <Loader2 className="w-10 h-10 text-zinc-200 animate-spin mx-auto mb-4" />
                          <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Loading Campaigns...</p>
                        </td>
                      </tr>
                    ) : filteredBroadcasts?.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-20 text-center">
                          <div className="w-20 h-20 bg-zinc-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-dashed border-zinc-200">
                            <Send className="w-8 h-8 text-zinc-300" />
                          </div>
                          <h3 className="text-zinc-900 font-bold text-lg mb-1">No campaigns found</h3>
                          <p className="text-zinc-500 text-sm font-medium">Create your first broadcast to reach your customers.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredBroadcasts?.map((b) => {
                        const cfg = statusConfig[b.status];
                        const progress = b.totalCount > 0 ? (b.sentCount / b.totalCount) * 100 : 0;
                        
                        return (
                          <tr key={b.id} className="hover:bg-zinc-50/50 transition-colors group">
                            <td className="px-8 py-6">
                              <div className="flex flex-col">
                                <span className="font-bold text-zinc-900 mb-1 group-hover:text-blue-600 transition-colors">{b.name}</span>
                                <span className="text-xs text-zinc-400 font-medium truncate max-w-[200px]">{b.message}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                {b.channel === 'SMS' ? (
                                  <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100">
                                    <MessageSquare className="w-4 h-4 text-orange-600" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                    <Mail className="w-4 h-4 text-blue-600" />
                                  </div>
                                )}
                                <span className="text-xs font-bold text-zinc-600">{b.channel}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-tight ${cfg.color}`}>
                                {cfg.icon}
                                {cfg.label}
                              </div>
                            </td>
                            <td className="px-8 py-6 min-w-[200px]">
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500">
                                  <span>{b.sentCount} / {b.totalCount}</span>
                                  <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/50 shadow-inner">
                                  <div 
                                    className={`h-full transition-all duration-500 rounded-full ${
                                      b.status === 'FAILED' ? 'bg-red-500' : 'bg-blue-600'
                                    }`}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <span className="text-xs font-bold text-zinc-500">
                                {format(new Date(b.createdAt), 'MMM d, yyyy')}
                              </span>
                              <div className="text-[10px] text-zinc-400 font-medium mt-1">
                                {format(new Date(b.createdAt), 'hh:mm a')}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            </TabsContent>

            <TabsContent value="templates" className="focus-visible:outline-none">
              <TemplateManager />
            </TabsContent>

            <TabsContent value="providers" className="focus-visible:outline-none">
              <ProviderManager />
            </TabsContent>
          </Tabs>
          </div>
        </div>
      </div>

      <CreateBroadcastModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}
