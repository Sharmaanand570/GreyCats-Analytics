import React, { useState, useEffect, useCallback } from "react";
import { 
  Mail, 
  AlertCircle, 
  CheckCircle2, 
  BarChart3, 
  RefreshCcw, 
  CalendarDays,
  Clock,
  ChevronDown
} from "lucide-react";
import { adminApi } from "@/api/adminApi";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface EmailStats {
    summary: { sent: number; failed: number; total: number; deliveryRate: number };
    byType: Array<{ type: string; sent: number; failed: number }>;
    byDate: Array<{ date: string; sent: number; failed: number }>;
    recentLogs: Array<{ to: string; type: string; status: string; errorMsg?: string; sentAt: string }>;
}

export default function EmailStatsPage() {
    const [stats, setStats] = useState<EmailStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            const data = await adminApi.getEmailStats(days);
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch email stats:", error);
            toast.error("Failed to fetch email statistics");
        } finally {
            setLoading(false);
        }
    }, [days]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Email Statistics
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Monitor email delivery performance and logs.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <CalendarDays className="h-4 w-4" />
                                Last {days} Days
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setDays(7)}>Last 7 Days</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDays(30)}>Last 30 Days</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDays(90)}>Last 90 Days</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={fetchStats}
                        disabled={loading}
                    >
                        <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {loading && !stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-gray-100 dark:bg-white/5 rounded-2xl"></div>
                    ))}
                </div>
            ) : stats ? (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard 
                            title="Total Processed" 
                            value={stats.summary.total} 
                            icon={Mail} 
                            color="blue"
                        />
                        <StatCard 
                            title="Successfully Sent" 
                            value={stats.summary.sent} 
                            icon={CheckCircle2} 
                            color="green"
                        />
                        <StatCard 
                            title="Failed Delivery" 
                            value={stats.summary.failed} 
                            icon={AlertCircle} 
                            color="red"
                        />
                        <StatCard 
                            title="Delivery Rate" 
                            value={`${stats.summary.deliveryRate}%`} 
                            icon={BarChart3} 
                            color="purple"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Area Chart: Activity over time */}
                        <div className="lg:col-span-2 bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Delivery Over Time</h2>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.byDate} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150, 150, 150, 0.1)" />
                                        <XAxis 
                                            dataKey="date" 
                                            tickLine={false} 
                                            axisLine={false} 
                                            tick={{ fontSize: 12, fill: '#888' }} 
                                            tickFormatter={(val: string | number | Date) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        />
                                        <YAxis 
                                            tickLine={false} 
                                            axisLine={false} 
                                            tick={{ fontSize: 12, fill: '#888' }} 
                                        />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            labelFormatter={(label: string | number | Date) => new Date(label).toLocaleDateString()}
                                        />
                                        <Area type="monotone" dataKey="sent" name="Sent" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorSent)" />
                                        <Area type="monotone" dataKey="failed" name="Failed" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorFailed)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Bar Chart: By Type */}
                        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Delivery By Type</h2>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.byType} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150, 150, 150, 0.1)" />
                                        <XAxis dataKey="type" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                                        <Tooltip 
                                            cursor={{ fill: 'rgba(150, 150, 150, 0.05)' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                                        <Bar dataKey="sent" name="Sent" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="failed" name="Failed" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Recent Logs Table */}
                    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-gray-100 dark:border-white/5">
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Recent Email Logs</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Recipient</th>
                                        <th className="px-6 py-4 font-medium">Type</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium">Sent At</th>
                                        <th className="px-6 py-4 font-medium">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {stats.recentLogs.map((log, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                        <Mail className="h-4 w-4" />
                                                    </div>
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">{log.to}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-300 capitalize">
                                                    {log.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {log.status === 'sent' || log.status === 'delivered' ? (
                                                    <span className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        <span className="capitalize">{log.status}</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span className="capitalize">{log.status}</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5 opacity-70" />
                                                    {new Date(log.sentAt).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {log.errorMsg ? (
                                                    <span className="text-red-500 text-xs truncate max-w-[200px] block" title={log.errorMsg}>
                                                        {log.errorMsg}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {stats.recentLogs.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                No recent email logs found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: 'blue' | 'green' | 'red' | 'purple' }) {
    const colorClasses = {
        blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10",
        green: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10",
        red: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10",
        purple: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10",
    };

    return (
        <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm flex items-center gap-4 transition-all hover:scale-[1.02]">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
            </div>
        </div>
    );
}
