import React, { useState, useEffect } from 'react';
import { useAvailableMetrics } from '../features/reports/hooks/useAvailableMetrics';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import type { Alert, CreateAlertData, UpdateAlertData, AlertCondition, AlertInterval } from '../types/alert.types';
import type { ClientWithIntegrations } from '../types/client.types';

interface AlertFormProps {
    clientId: number;
    clientName?: string;
    client?: ClientWithIntegrations;
    initialData?: Alert;
    onSubmit: (data: CreateAlertData | UpdateAlertData) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export const AlertForm: React.FC<AlertFormProps> = ({ clientId, clientName, client, initialData, onSubmit, onCancel, isLoading }) => {
    // Hooks
    const { groupedMetrics, isLoading: statsLoading } = useAvailableMetrics(clientId);

    // State
    const [integration, setIntegration] = useState<string>(initialData?.integration || '');
    const [accountId, setAccountId] = useState<string>(initialData?.accountId?.toString() || '');
    const [metricKey, setMetricKey] = useState<string>(initialData?.metricKey || '');
    const [condition, setCondition] = useState<AlertCondition>(initialData?.condition || 'less_than');
    const [triggerValue, setTriggerValue] = useState<string>(initialData?.triggerValue?.toString() || '');
    const [interval, setInterval] = useState<AlertInterval>(initialData?.interval || 'day');
    const [name, setName] = useState<string>(''); // Name not available in Alert type yet
    const [notifyEmail, setNotifyEmail] = useState<boolean>(initialData?.notifyEmail ?? true);
    const [emailTo, setEmailTo] = useState<string>(initialData?.emailTo || '');

    // Reset downstream selections when upstream changes
    const handleIntegrationChange = (val: string) => {
        setIntegration(val);
        setAccountId('');
        setMetricKey('');
    };

    const handleAccountChange = (val: string) => {
        setAccountId(val);
        setMetricKey('');
    };

    // Helper to find friendly account name
    const getAccountName = (accId: string): string => {
        if (!client?.integrations) return accId;

        // Normalize integration type to match client.integrations format (hyphenated)
        // e.g. "google_analytics" -> "google-analytics"
        const normalizedType = integration.toLowerCase().replace(/_/g, '-');

        const match = client.integrations.find(i =>
            (i.integrationType === normalizedType || i.integrationType === integration) &&
            (i.accountId.toString() === accId.toString() || i.accountIdentifier === accId.toString())
        );

        return match ? match.accountName : accId;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!integration) {
            toast.error('Please select an integration');
            return;
        }
        if (!accountId) {
            toast.error('Please select an account');
            return;
        }
        if (!metricKey) {
            toast.error('Please select a metric to monitor');
            return;
        }
        if (!triggerValue) {
            toast.error('Please enter a threshold value');
            return;
        }
        if (notifyEmail && !emailTo) {
            toast.error('Please enter an email address for notifications');
            return;
        }

        // Find metric label
        let metricLabel = initialData?.metricLabel || '';
        if (metricKey && integration && accountId && groupedMetrics) {
            const metrics = groupedMetrics[integration]?.[accountId];
            const found = metrics?.find(m => m.metricKey === metricKey);
            if (found) metricLabel = found.displayName;
        }

        const payload: CreateAlertData = {
            integration, // Send exactly as selected (e.g. google_analytics)
            accountId: accountId,  // Keep as string - backend expects String type
            metricKey,
            metricLabel,
            condition,
            triggerValue: Number(triggerValue),
            interval,
            name: name || `${metricLabel} Alert`, // Default name if empty
            notifyEmail,
            emailTo: notifyEmail ? emailTo : undefined,
            notifyInApp: true // Always true for now
        };

        onSubmit(payload);
    };

    // Normalize integration type (hyphenated from client) to underscore format used by metrics API
    // Exception: google-search-console keeps its hyphen
    const toMetricIntegrationId = (integrationType: string): string => {
        if (integrationType === 'google-search-console') return 'google-search-console';
        return integrationType.replace(/-/g, '_');
    };

    const INTEGRATION_DISPLAY_NAMES: Record<string, string> = {
        meta_business: 'Meta Business',
        meta_ads: 'Meta Ads',
        meta_insights: 'Meta Insights',
        youtube: 'YouTube',
        shopify: 'Shopify',
        woocommerce: 'WooCommerce',
        'google-search-console': 'Google Search Console',
        google_analytics: 'Google Analytics',
        google_ads: 'Google Ads',
    };

    // Derived lists — prefer client.integrations for integration/account lists (more reliable than metrics API)
    const integrations = client?.integrations?.length
        ? [...new Set(client.integrations.map(i => toMetricIntegrationId(i.integrationType)))]
        : Object.keys(groupedMetrics || {});

    const accounts = integration && client?.integrations?.length
        ? client.integrations
            .filter(i => toMetricIntegrationId(i.integrationType) === integration)
            .map(i => ({
                value: (i.accountIdentifier && i.accountIdentifier !== 'unknown')
                    ? i.accountIdentifier
                    : i.accountId.toString(),
                label: i.accountName || i.accountIdentifier || i.accountId.toString(),
            }))
        : integration
            ? Object.keys(groupedMetrics?.[integration] || {}).map(acc => ({ value: acc, label: getAccountName(acc) }))
            : [];

    const metrics = (integration && accountId) ? groupedMetrics?.[integration]?.[accountId] || [] : [];

    console.log('🔔 AlertForm state:', { integration, accountId, availableAccounts: accounts.map(a => a.value), availableIntegrations: integrations });

    // Auto-fill metric label/name if editing
    useEffect(() => {
        if (!initialData && metricKey && !name) {
            // Logic to auto-suggest name? For now leave blank to let backend handle or user type
        }
    }, [metricKey]);

    // Debug logging
    useEffect(() => {
        if (integration && accountId && groupedMetrics) {
            console.log('🔍 AlertForm Debug:', {
                integration,
                accountId,
                availableIntegrations: Object.keys(groupedMetrics),
                availableAccounts: integration ? Object.keys(groupedMetrics[integration] || {}) : [],
                metricsCount: metrics.length,
                metrics: metrics.slice(0, 5) // Show first 5 metrics
            });
        }
    }, [integration, accountId, groupedMetrics, metrics]);


    return (
        <form onSubmit={handleSubmit} className="space-y-4">

            {/* Client Context Banner */}
            {clientName && (
                <div className="bg-zinc-50 border border-zinc-200 rounded-md p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-zinc-200 flex items-center justify-center text-zinc-500 font-bold shrink-0">
                        {clientName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wide font-medium">Creating alert for client</p>
                        <p className="font-semibold text-sm text-zinc-900">{clientName}</p>
                    </div>
                </div>
            )}


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Integration Selection */}
                <div className="space-y-2">
                    <Label>Integration <span className="text-red-500">*</span></Label>
                    <Select value={integration} onValueChange={handleIntegrationChange} disabled={!!initialData}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Integration" />
                        </SelectTrigger>
                        <SelectContent>
                            {integrations.map(int => (
                                <SelectItem key={int} value={int}>
                                    {INTEGRATION_DISPLAY_NAMES[int] || (int.charAt(0).toUpperCase() + int.slice(1).replace(/[_-]/g, ' '))}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Account Selection */}
                <div className="space-y-2">
                    <Label>Account <span className="text-red-500">*</span></Label>
                    <Select value={accountId} onValueChange={handleAccountChange} disabled={!integration || !!initialData}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Account" />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map(acc => (
                                <SelectItem key={acc.value} value={acc.value}>{acc.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {!integration && (
                        <p className="text-xs text-amber-600">⚠️ Please select an integration first</p>
                    )}
                </div>

                {/* Metric Selection */}
                <div className="space-y-2 md:col-span-2">
                    <Label>Metric <span className="text-red-500">*</span></Label>
                    <Select value={metricKey} onValueChange={setMetricKey} disabled={!accountId || !!initialData}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Metric to Monitor" />
                        </SelectTrigger>
                        <SelectContent>
                            {metrics.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    No metrics available for this account
                                </div>
                            ) : (
                                metrics.map(m => (
                                    <SelectItem key={m.metricKey} value={m.metricKey}>{m.displayName}</SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                    {!accountId && integration && (
                        <p className="text-xs text-amber-600">⚠️ Please select an account first</p>
                    )}
                    {metrics.length === 0 && integration && accountId && (
                        <p className="text-xs text-amber-600">
                            ⚠️ No metrics found. Please ensure this integration has data synced.
                        </p>
                    )}
                </div>

                {/* Condition */}
                <div className="space-y-2">
                    <Label>Condition</Label>
                    <Select value={condition} onValueChange={(v) => setCondition(v as AlertCondition)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="greater_than">Greater Than (&gt;)</SelectItem>
                            <SelectItem value="less_than">Less Than (&lt;)</SelectItem>
                            <SelectItem value="greater_than_or_equal">Greater or Equal (&gt;=)</SelectItem>
                            <SelectItem value="less_than_or_equal">Less or Equal (&lt;=)</SelectItem>
                            {/*  <SelectItem value="increase_by">Increase By</SelectItem>   Complexity: needs relative comp */}
                            {/* <SelectItem value="decrease_by">Decrease By</SelectItem> */}
                        </SelectContent>
                    </Select>
                </div>

                {/* Trigger Value */}
                <div className="space-y-2">
                    <Label>Threshold Value <span className="text-red-500">*</span></Label>
                    <Input
                        type="number"
                        value={triggerValue}
                        onChange={e => setTriggerValue(e.target.value)}
                        placeholder="e.g. 1000"
                        required
                    />
                </div>

                {/* Interval */}
                <div className="space-y-2">
                    <Label>Check Frequency</Label>
                    <Select value={interval} onValueChange={(v) => setInterval(v as AlertInterval)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="day">Daily</SelectItem>
                            <SelectItem value="week">Weekly</SelectItem>
                            <SelectItem value="month">Monthly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Custom Name (Optional) */}
            <div className="space-y-2">
                <Label>Alert Name (Optional)</Label>
                <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. High Traffic Warning"
                />
            </div>

            {/* Notification Settings */}
            <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                    <Label className="flex flex-col">
                        <span>Email Notifications</span>
                        <span className="font-normal text-xs text-muted-foreground">Receive an email when triggered</span>
                    </Label>
                    <Switch checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} />
                </div>

                {notifyEmail && (
                    <div className="animate-in fade-in slide-in-from-top-1">
                        <Label>Email Address</Label>
                        <Input
                            type="email"
                            value={emailTo}
                            onChange={e => setEmailTo(e.target.value)}
                            placeholder="user@example.com"
                            required={notifyEmail}
                        />
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button
                    type="submit"
                    disabled={isLoading || statsLoading || !integration || !accountId || !metricKey || !triggerValue}
                >
                    {isLoading ? 'Saving...' : initialData ? 'Update Alert' : 'Create Alert'}
                </Button>
            </div>
        </form>
    );
};
