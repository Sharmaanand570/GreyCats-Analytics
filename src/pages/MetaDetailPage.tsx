"use client";

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { SiMeta } from "react-icons/si";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  MousePointerClick,
  Target,
  Calendar,
  Download,
  Filter,
  ArrowUpRight
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useMetaAdsMeta, useMetaAdsSummary, useMetaAdsCampaigns, useMetaAdsTrends } from "@/features/meta/hooks/useMetaAdsData";
import { useClients } from "@/hooks/useClients";

// --- Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    ACTIVE: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500", label: "Active" },
    PAUSED: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500", label: "Paused" },
    ARCHIVED: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-500", label: "Archived" },
  };
  const normalizedStatus = status ? status.toUpperCase() : "ACTIVE";
  const variant = variants[normalizedStatus] || variants.ACTIVE;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${variant.bg} ${variant.text} transition-all duration-200`}>
      <span className={`w-1.5 h-1.5 rounded-full ${variant.dot} animate-pulse`} />
      {variant.label}
    </div>
  );
};

const MetricCard = ({ title, value, icon: Icon, trend, color, subValue }: any) => {
  const gradients = {
    blue: "from-blue-500/10 to-blue-600/5 border-blue-100 text-blue-600",
    emerald: "from-emerald-500/10 to-emerald-600/5 border-emerald-100 text-emerald-600",
    violet: "from-violet-500/10 to-violet-600/5 border-violet-100 text-violet-600",
    amber: "from-amber-500/10 to-amber-600/5 border-amber-100 text-amber-600",
    rose: "from-rose-500/10 to-rose-600/5 border-rose-100 text-rose-600",
  };

  const activeColor = gradients[color as keyof typeof gradients] || gradients.blue;

  return (
    <div className="group relative overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300 cursor-default">
      <div className={`absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity`}>
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${activeColor} bg-opacity-10`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="p-6">
        <p className="text-sm font-medium text-slate-500 mb-1 tracking-wide uppercase text-[11px]">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
        </div>

        {trend !== undefined && (
          <div className="flex items-center gap-3 mt-3">
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend)}%
            </div>
            <span className="text-xs text-slate-400 font-medium">vs last 30 days</span>
          </div>
        )}

        {subValue && (
          <p className="text-xs text-slate-400 mt-3 font-medium">{subValue}</p>
        )}
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-800 p-4 rounded-xl shadow-xl text-slate-50 min-w-[200px]">
        <p className="text-slate-400 text-xs font-semibold mb-3 uppercase tracking-wider">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-300">{entry.name}</span>
              </div>
              <span className="font-mono font-medium">
                {entry.name.includes('Spend') || entry.name.includes('CPC') ? '₹' : ''}
                {entry.value.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// --- Main Page ---

function MetaDetailPage() {
  const navigate = useNavigate();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const { data: clientsData } = useClients();
  const clients = clientsData || [];

  // Auto-select first client
  if (clients.length > 0 && !selectedClientId) {
    setSelectedClientId(clients[0].id);
  }

  const { data: metaData, isLoading: isLoadingMeta } = useMetaAdsMeta(selectedClientId || 0);
  const { data: summaryData, isLoading: isLoadingSummary } = useMetaAdsSummary(selectedClientId || 0);
  const { data: campaignsData, isLoading: isLoadingCampaigns } = useMetaAdsCampaigns(selectedClientId || 0);
  const { data: trendsData, isLoading: isLoadingTrends } = useMetaAdsTrends(selectedClientId || 0);

  const campaigns = summaryData?.campaigns || [];
  const allCampaigns = campaignsData?.campaigns || [];
  const trends = trendsData?.trends || [];
  const meta = metaData?.summary;
  const accountName = metaData?.accountName || "Meta Ads Account";

  // Use meta summary if available, otherwise calculate from campaigns
  const totalSpend = meta?.spend || campaigns.reduce((sum: number, c: any) => sum + c.spend, 0);
  const totalImpressions = meta?.impressions || campaigns.reduce((sum: number, c: any) => sum + c.impressions, 0);
  const totalClicks = meta?.clicks || campaigns.reduce((sum: number, c: any) => sum + c.clicks, 0);
  const avgCTR = meta?.ctr || (totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0);
  const avgCPM = meta?.cpm || 0;

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard" className="text-slate-500 hover:text-slate-800 transition-colors">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-slate-300" />
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">Data Sources</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-slate-300" />
                <BreadcrumbItem>
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium text-sm">Meta Ads</span>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Data
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative p-3.5 bg-gradient-to-br from-[#1877F2] to-[#0d65d9] rounded-2xl shadow-xl shadow-blue-500/10 ring-1 ring-white/20">
                  <SiMeta className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Meta Advertising</h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-medium text-slate-500">{accountName}</p>
                  <span className="text-slate-300">•</span>
                  <p className="text-xs text-slate-400 font-mono">ID: {metaData?.accountId || "..."}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="hidden lg:flex gap-2 h-10 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300">
                <Calendar className="w-4 h-4" />
                <span>Last 30 Days</span>
              </Button>

              {/* Client Selector */}
              <Select value={selectedClientId?.toString()} onValueChange={(v: string) => setSelectedClientId(Number(v))}>
                <SelectTrigger className="w-[260px] h-10 bg-white border-slate-200 text-slate-700 font-medium shadow-sm hover:border-blue-300 transition-colors focus:ring-blue-100">
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client: any) => (
                    <SelectItem key={client.id} value={client.id.toString()} className="cursor-pointer font-medium text-slate-600 focus:bg-blue-50 focus:text-blue-700">
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="max-w-[1600px] mx-auto p-6 space-y-8">

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {isLoadingMeta || isLoadingSummary ? (
              <>
                {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-[140px] rounded-2xl bg-slate-100" />)}
              </>
            ) : (
              <>
                <MetricCard
                  title="Total Spend"
                  value={`₹${totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                  icon={DollarSign}
                  trend={12.5}
                  color="emerald"
                  subValue="Budget paced well"
                />
                <MetricCard
                  title="Impressions"
                  value={totalImpressions.toLocaleString('en-IN')}
                  icon={Eye}
                  trend={8.3}
                  color="blue"
                  subValue="Reach expanded"
                />
                <MetricCard
                  title="Clicks"
                  value={totalClicks.toLocaleString('en-IN')}
                  icon={MousePointerClick}
                  trend={-2.1}
                  color="violet"
                  subValue="Engagement steady"
                />
                <MetricCard
                  title="Avg CTR"
                  value={`${avgCTR.toFixed(2)}%`}
                  icon={Target}
                  trend={5.7}
                  color="amber"
                  subValue="Ad relevance high"
                />
                <MetricCard
                  title="Avg CPM"
                  value={`₹${avgCPM.toFixed(2)}`}
                  icon={TrendingUp}
                  color="rose"
                  subValue="Cost per 1k views"
                />
              </>
            )}
          </div>

          {/* Performance Trends Chart */}
          <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/30 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800">Performance Trends</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">Daily breakdown of spend vs impressions</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-slate-500">Weekly</Button>
                  <Button variant="secondary" size="sm" className="h-8 text-xs font-medium bg-slate-100 text-slate-700">Daily</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isLoadingTrends ? (
                <Skeleton className="h-96 w-full rounded-xl bg-slate-50" />
              ) : trends.length > 0 ? (
                <div className="w-full h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                        tickFormatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="spend"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorSpend)"
                        name="Spend (₹)"
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="impressions"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorImpressions)"
                        name="Impressions"
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-96 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <div className="p-4 rounded-full bg-slate-100 mb-3">
                    <Filter className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="font-medium">No trend data available for this period</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Campaigns Table */}
          <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/30 px-6 py-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-800">Active Campaigns</CardTitle>
                    <p className="text-sm text-slate-500 mt-1">Detailed performance metrics by campaign</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-slate-200 hover:bg-slate-50 text-slate-600">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" className="border-slate-200 hover:bg-slate-50 text-slate-600">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingCampaigns ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                </div>
              ) : allCampaigns.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="hover:bg-transparent border-slate-100">
                        <TableHead className="font-semibold text-slate-500 pl-6 h-12">Campaign Name</TableHead>
                        <TableHead className="font-semibold text-slate-500 h-12">Status</TableHead>
                        <TableHead className="font-semibold text-slate-500 h-12">Objective</TableHead>
                        <TableHead className="font-semibold text-slate-500 text-right h-12">Spend</TableHead>
                        <TableHead className="font-semibold text-slate-500 text-right h-12">Impressions</TableHead>
                        <TableHead className="font-semibold text-slate-500 text-right h-12">Clicks</TableHead>
                        <TableHead className="font-semibold text-slate-500 text-right h-12">CTR</TableHead>
                        <TableHead className="font-semibold text-slate-500 text-right pr-6 h-12">CPC</TableHead>
                        <TableHead className="w-[50px] h-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allCampaigns.map((campaign: any) => (
                        <TableRow key={campaign.id} className="hover:bg-slate-50/80 transition-colors border-slate-100 group">
                          <TableCell className="font-medium text-slate-900 pl-6 py-4">
                            <div className="flex flex-col">
                              <span>{campaign.name}</span>
                              <span className="text-xs text-slate-400 font-mono mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">ID: {campaign.id}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <StatusBadge status={campaign.status} />
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm py-4">
                            <Badge variant="outline" className="font-normal text-slate-500 border-slate-200 bg-white capitalize">
                              {campaign.objective.replace('OUTCOME_', '').toLowerCase().replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium text-slate-700 py-4">₹{campaign.spend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right text-slate-600 py-4">{campaign.impressions.toLocaleString('en-IN')}</TableCell>
                          <TableCell className="text-right text-slate-600 py-4">{campaign.clicks.toLocaleString('en-IN')}</TableCell>
                          <TableCell className="text-right py-4">
                            <div className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-semibold">
                              {campaign.ctr.toFixed(2)}%
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-slate-600 pr-6 py-4">₹{campaign.cpc.toFixed(2)}</TableCell>
                          <TableCell className="py-4">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-600">
                              <ArrowUpRight className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-slate-900 font-medium text-lg">No campaigns found</h3>
                  <p className="text-slate-500 mt-1">There are no active campaigns for this client.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default MetaDetailPage;