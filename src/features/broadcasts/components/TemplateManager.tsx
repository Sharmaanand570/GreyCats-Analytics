import { useState, useEffect } from 'react';
import { useTemplates, useAdminTemplates, useCreateTemplate, useCreateSystemTemplate, useDeleteTemplate, useApproveTemplate } from '../hooks/useBroadcasts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  FileText, 
  Plus, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Loader2, 
  Trash2, 
  Check, 
  X,
  ShieldCheck,
  Layout,
  MessageSquare,
  Mail as MailIcon,
  Search,
  Info,
  AlertCircle
} from 'lucide-react';
import type { BroadcastChannel } from '../api/types';
import { useUserStore } from '@/utils/useUserStore';
import { cn } from '@/lib/utils';

export function TemplateManager() {
  const { user } = useUserStore();
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'SUPER_ADMIN';

  const { data: templates, isLoading } = isAdmin ? useAdminTemplates() : useTemplates();
  const createTemplate = useCreateTemplate();
  const createSystemTemplate = useCreateSystemTemplate();
  const deleteTemplate = useDeleteTemplate();
  const approveTemplate = useApproveTemplate();

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<BroadcastChannel>('SMS');
  const [content, setContent] = useState('');
  const [externalId, setExternalId] = useState('');
  const [isSystemTemplate, setIsSystemTemplate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingExternalIds, setEditingExternalIds] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  const filteredTemplates = templates?.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!isCreating) {
      setError(null);
      return;
    }

    if (name && name.length < 3) {
      setError('Template name is too short');
    } else if (channel === 'SMS' && content.length > 160) {
      setError(`SMS exceeds 160 characters (${content.length})`);
    } else {
      setError(null);
    }
  }, [name, content, channel, isCreating]);

  const handleSubmit = async () => {
    if (!name || !content) {
      setError('Name and content are required');
      return;
    }
    
    if (isAdmin && isSystemTemplate) {
      await createSystemTemplate.mutateAsync({ name, channel, content, externalId });
    } else {
      await createTemplate.mutateAsync({ name, channel, content, externalId });
    }
    
    setIsCreating(false);
    setName('');
    setContent('');
    setExternalId('');
    setIsSystemTemplate(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': 
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
            <CheckCircle2 className="w-3 h-3" />
            Approved
          </div>
        );
      case 'PENDING': 
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest animate-pulse">
            <Clock className="w-3 h-3" />
            Pending
          </div>
        );
      case 'REJECTED': 
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-black uppercase tracking-widest">
            <XCircle className="w-3 h-3" />
            Rejected
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Search */}
      <Card className="border-gray-200 dark:border-white/10 shadow-sm overflow-hidden bg-white dark:bg-[#111]">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Layout className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Message Templates</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Standardize communications across all channels.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search templates..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64 outline-none"
              />
            </div>
            <Button 
              onClick={() => setIsCreating(!isCreating)}
              variant={isCreating ? "outline" : "default"}
              className="rounded-xl px-6 h-10 font-bold transition-all flex items-center gap-2"
            >
              {isCreating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isCreating ? 'Cancel' : 'Create Template'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Creation Form */}
      {isCreating && (
        <Card className="border-gray-200 dark:border-white/10 shadow-lg overflow-hidden bg-white dark:bg-[#111] animate-in zoom-in-95 duration-300">
          <CardHeader className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] p-6">
            <CardTitle className="text-lg font-bold">Create New Blueprint</CardTitle>
            <CardDescription>Define the content and channel for your messages.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Template Name</label>
                <input 
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Welcome Series - High Value"
                  className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Communication Channel</label>
                <div className="flex bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-1.5">
                  <button onClick={() => setChannel('SMS')} className={cn("flex-1 py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2", channel === 'SMS' ? 'bg-white dark:bg-white/10 shadow-md text-black dark:text-white' : 'text-gray-400 hover:text-gray-600')}>
                    <MessageSquare className="w-3.5 h-3.5" /> SMS
                  </button>
                  <button onClick={() => setChannel('EMAIL')} className={cn("flex-1 py-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2", channel === 'EMAIL' ? 'bg-white dark:bg-white/10 shadow-md text-black dark:text-white' : 'text-gray-400 hover:text-gray-600')}>
                    <MailIcon className="w-3.5 h-3.5" /> Email
                  </button>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Message Content</label>
              <textarea 
                value={content} onChange={(e) => setContent(e.target.value)}
                placeholder="Craft your message here. Use {{name}} for dynamic tags..." rows={5}
                className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none leading-relaxed outline-none"
              />
              {channel === 'SMS' && (
                <div className="flex justify-end pr-2">
                  <span className={cn("text-[9px] font-black uppercase tracking-widest", content.length > 160 ? "text-red-500" : "text-gray-400")}>
                    {content.length} / 160 Characters
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/5 rounded-xl border border-red-500/10 mb-6 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">{error}</p>
              </div>
            )}

            {channel === 'SMS' && (
              <div className="flex items-center gap-2 mb-8 ml-1 text-[10px] font-bold text-amber-600 dark:text-amber-500/80 uppercase tracking-widest bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
                <Info className="w-3.5 h-3.5" />
                Your template must be approved by an DLT Provider and Service Provider Adbizz before it can be used for broadcasts.
              </div>
            )}

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-6">
                {channel === 'SMS' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">DLT ID (Optional)</label>
                    <input 
                      type="text" value={externalId} onChange={(e) => setExternalId(e.target.value)}
                      placeholder="DLT External ID"
                      className="px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                )}
                {isAdmin && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                    <input 
                      type="checkbox" 
                      id="isSystem"
                      checked={isSystemTemplate} 
                      onChange={(e) => setIsSystemTemplate(e.target.checked)}
                      className="w-5 h-5 rounded border-blue-200 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                    />
                    <label htmlFor="isSystem" className="text-sm font-bold text-blue-900 dark:text-blue-400 cursor-pointer flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Global System Template
                    </label>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={!name || !content || createTemplate.isPending || createSystemTemplate.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-10 h-12 font-bold shadow-lg shadow-blue-500/20 min-w-[180px]"
              >
                {createTemplate.isPending || createSystemTemplate.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Deploy Template'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="col-span-full py-32 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Harvesting Templates...</p>
          </div>
        ) : filteredTemplates?.length === 0 ? (
          <div className="col-span-full py-32 text-center">
             <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-dashed border-gray-200 dark:border-white/10">
              <FileText className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No Templates Found</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Start by creating your first message blueprint.</p>
          </div>
        ) : (
          filteredTemplates?.map(t => (
            <Card key={t.id} className="group border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden bg-white dark:bg-[#111]">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                      t.channel === 'SMS' ? 'bg-orange-500/10 text-orange-600' : 'bg-blue-500/10 text-blue-600'
                    )}>
                      {t.channel === 'SMS' ? <MessageSquare className="w-5 h-5" /> : <MailIcon className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-base tracking-tight leading-tight">{t.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        {!t.userId && (
                          <div className="flex items-center gap-1 text-[8px] font-black text-blue-600 uppercase tracking-widest bg-blue-500/5 px-1.5 py-0.5 rounded">
                            <ShieldCheck className="w-2 h-2" />
                            System
                          </div>
                        )}
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">{t.channel}</p>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(t.status)}
                </div>

                <div className="flex-1 bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-100 dark:border-white/5 mb-6">
                  <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed italic">"{t.content}"</p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5 mt-auto">
                  {t.status === 'PENDING' && t.channel === 'SMS' && isAdmin ? (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Assign DLT Template ID</label>
                      <input 
                        type="text" 
                        placeholder="Enter ID..."
                        value={editingExternalIds[t.id] ?? t.externalId ?? ''}
                        onChange={(e) => {
                          setEditingExternalIds(prev => ({
                            ...prev,
                            [t.id]: e.target.value
                          }));
                        }}
                        className="px-2.5 py-1.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded text-[10px] font-bold focus:ring-2 focus:ring-blue-500/20 outline-none w-32 transition-all"
                      />
                    </div>
                  ) : t.externalId ? (
                    <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                      DLT ID: <span className="text-gray-900 dark:text-white">{t.externalId}</span>
                    </div>
                  ) : <div />}
                  
                  <div className="flex items-center gap-2">
                    {isAdmin && t.status === 'PENDING' && (
                      <div className="flex items-center gap-2">
                        <Button 
                          onClick={() => approveTemplate.mutate({ 
                            id: t.id, 
                            status: 'APPROVED', 
                            externalId: editingExternalIds[t.id] || t.externalId 
                          })}
                          disabled={t.channel === 'SMS' && !t.externalId && !editingExternalIds[t.id]}
                          size="sm"
                          className="h-8 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 text-[9px] font-black uppercase tracking-widest px-3"
                        >
                          <Check className="w-3 h-3 mr-1.5" />
                          Approve
                        </Button>
                        <Button 
                          onClick={() => approveTemplate.mutate({ id: t.id, status: 'REJECTED' })}
                          size="sm"
                          variant="destructive"
                          className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest px-3"
                        >
                          <X className="w-3 h-3 mr-1.5" />
                          Reject
                        </Button>
                      </div>
                    )}
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this template?')) {
                          deleteTemplate.mutate(t.id);
                        }
                      }}
                      className="w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
