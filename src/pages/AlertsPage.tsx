import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FiSearch, FiBell, FiPlus, FiArrowDownRight, FiArrowUpRight, FiActivity, FiServer, FiDollarSign } from "react-icons/fi";
import { format } from "date-fns";

// --- Types ---
type AlertType = 'financial' | 'performance' | 'system';
type AlertStatus = 'critical' | 'warning' | 'healthy';

interface Alert {
  id: string;
  name: string;
  client: string;
  type: AlertType;
  status: AlertStatus;
  value: string | number;
  threshold: string;
  lastTriggered: Date;
  trend?: 'up' | 'down' | 'stable';
}

// --- Demo Data ---
const DEMO_ALERTS: Alert[] = [
  // CRITICAL
  {
    id: '1',
    name: 'Revenue Drop',
    client: 'Acme Corp',
    type: 'financial',
    status: 'critical',
    value: 12450,
    threshold: '< $15,000',
    lastTriggered: new Date(),
    trend: 'down'
  },
  {
    id: '2',
    name: 'API Latency High',
    client: 'TechStart Inc',
    type: 'system',
    status: 'critical',
    value: '2.4s',
    threshold: '> 1.0s',
    lastTriggered: new Date(),
    trend: 'up'
  },
  {
    id: '3',
    name: 'Conversion Rate Dip',
    client: 'Global Solutions',
    type: 'performance',
    status: 'critical',
    value: '1.2%',
    threshold: '< 2.5%',
    lastTriggered: new Date(),
    trend: 'down'
  },
  // HEALTHY / WARNING
  {
    id: '4',
    name: 'Ad Spend Limit',
    client: 'Acme Corp',
    type: 'financial',
    status: 'healthy',
    value: 4200,
    threshold: 'Budget: $5,000',
    lastTriggered: new Date(Date.now() - 86400000 * 2),
    trend: 'stable'
  },
  {
    id: '5',
    name: 'Server Uptime',
    client: 'TechStart Inc',
    type: 'system',
    status: 'healthy',
    value: '99.99%',
    threshold: '> 99.9%',
    lastTriggered: new Date(Date.now() - 86400000 * 5),
    trend: 'stable'
  },
  {
    id: '6',
    name: 'Daily Active Users',
    client: 'Social Media Hub',
    type: 'performance',
    status: 'healthy',
    value: '15.4k',
    threshold: '> 10k',
    lastTriggered: new Date(Date.now() - 86400000),
    trend: 'up'
  }
];

const AlertsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlerts = DEMO_ALERTS.filter(alert => {
    const matchesSearch = alert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all'
      ? true
      : activeTab === 'critical'
        ? alert.status === 'critical'
        : activeTab === 'healthy'
          ? alert.status === 'healthy'
          : true;
    return matchesSearch && matchesTab;
  });

  const criticalAlerts = filteredAlerts.filter(a => a.status === 'critical');
  const healthyAlerts = filteredAlerts.filter(a => a.status !== 'critical');

  return (
    <div className="w-full h-[2000vh] flex flex-col overflow-x-hidden bg-gradient-to-bl from-black via-zinc-950 to-zinc-800">
      <div className="w-full rounded-l-2xl overflow-hidden h-full my-4 bg-[#fdfdfd] flex flex-col">

        {/* Sticky Header */}
        <div className="w-full h-[4.8em] border-b flex justify-between items-center px-6 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
          <h1 className="font-semibold text-xl text-zinc-900">Alerts Monitor</h1>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-9 h-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 border-l pl-4">
              <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors relative">
                <FiBell className="text-lg" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              <Button size="sm" className="gap-2 bg-zinc-900 hover:bg-zinc-800">
                <FiPlus /> Create Alert
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 space-y-8 overflow-y-auto">

          {/* Filters */}
          <div className="flex justify-between items-center">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList className="bg-zinc-100/50 p-1 border border-zinc-200/50">
                <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">All Monitors</TabsTrigger>
                <TabsTrigger value="critical" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-red-600 data-[state=active]:text-red-600">
                  Critical <span className="ml-2 bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full text-xs">{DEMO_ALERTS.filter(a => a.status === 'critical').length}</span>
                </TabsTrigger>
                <TabsTrigger value="healthy" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-green-600 data-[state=active]:text-green-600">
                  Healthy <span className="ml-2 bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-xs">{DEMO_ALERTS.filter(a => a.status === 'healthy').length}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Critical Section - "Pulse Grid" */}
          {criticalAlerts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Critical Attention Needed</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {criticalAlerts.map(alert => (
                  <PulseCard key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
          )}

          {/* Healthy Section - Compact Grid */}
          {healthyAlerts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Active Monitors</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {healthyAlerts.map(alert => (
                  <MonitorCard key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
          )}

          {filteredAlerts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                <FiSearch className="text-zinc-300 text-2xl" />
              </div>
              <h3 className="text-zinc-900 font-medium">No alerts found</h3>
              <p className="text-zinc-500 text-sm mt-1">Try adjusting your search or filters.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};


// --- Components ---

const PulseCard = ({ alert }: { alert: Alert }) => {
  return (
    <div className="group relative bg-white rounded-xl border border-red-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Pulse Effect Background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-red-100/50 transition-colors"></div>

      <div className="relative flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${alert.type === 'financial' ? 'bg-orange-50 text-orange-600' :
            alert.type === 'system' ? 'bg-blue-50 text-blue-600' :
              'bg-purple-50 text-purple-600'
            }`}>
            {alert.type === 'financial' && <FiDollarSign className="text-xl" />}
            {alert.type === 'system' && <FiServer className="text-xl" />}
            {alert.type === 'performance' && <FiActivity className="text-xl" />}
          </div>
          <div>
            <h4 className="font-semibold text-zinc-900">{alert.name}</h4>
            <p className="text-xs text-zinc-500">{alert.client}</p>
          </div>
        </div>
        {/* Live Pulse Dot */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>
      </div>

      <div className="relative mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-zinc-900">
            {typeof alert.value === 'number' && alert.type === 'financial' ? `$${alert.value.toLocaleString()}` : alert.value}
          </span>
          {alert.trend && (
            <span className={`flex items-center text-sm font-medium ${alert.trend === 'down' ? 'text-red-600' : 'text-green-600'
              }`}>
              {alert.trend === 'down' ? <FiArrowDownRight /> : <FiArrowUpRight />}
            </span>
          )}
        </div>
        <p className="text-sm text-red-600 font-medium mt-1">
          Threshold: <span className="opacity-80">{alert.threshold}</span>
        </p>
      </div>

      <div className="relative flex items-center justify-between pt-4 border-t border-red-50">
        <span className="text-xs text-zinc-400">
          Triggered {format(alert.lastTriggered, "h:mm a")}
        </span>
        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 -mr-2 h-8">
          View Details
        </Button>
      </div>
    </div>
  );
};

const MonitorCard = ({ alert }: { alert: Alert }) => {
  return (
    <div className="bg-white rounded-lg border border-zinc-100 p-4 shadow-sm hover:border-zinc-200 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-md flex items-center justify-center text-sm ${alert.type === 'financial' ? 'bg-zinc-50 text-zinc-600' :
            alert.type === 'system' ? 'bg-zinc-50 text-zinc-600' :
              'bg-zinc-50 text-zinc-600'
            }`}>
            {alert.type === 'financial' && <FiDollarSign />}
            {alert.type === 'system' && <FiServer />}
            {alert.type === 'performance' && <FiActivity />}
          </div>
          <div>
            <h4 className="font-medium text-sm text-zinc-900 truncate max-w-[120px]">{alert.name}</h4>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wide">{alert.client}</p>
          </div>
        </div>
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <span className="text-lg font-semibold text-zinc-700">
            {typeof alert.value === 'number' && alert.type === 'financial' ? `$${alert.value.toLocaleString()}` : alert.value}
          </span>
          <p className="text-xs text-zinc-400 mt-0.5">Target: {alert.threshold}</p>
        </div>
        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-100 hover:bg-green-100 font-normal text-xs">
          Healthy
        </Badge>
      </div>
    </div>
  );
};

export default AlertsPage;
