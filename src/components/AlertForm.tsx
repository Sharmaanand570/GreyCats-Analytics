import React, { useState, useEffect } from 'react';
import { useAvailableMetrics } from '../features/reports/hooks/useAvailableMetrics';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import type { Alert, CreateAlertData, UpdateAlertData, AlertCondition, AlertInterval } from '../types/alert.types';

interface AlertFormProps {
    clientId: number;
    initialData?: Alert;
    onSubmit: (data: CreateAlertData | UpdateAlertData) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export const AlertForm: React.FC<AlertFormProps> = ({ clientId, initialData, onSubmit, onCancel, isLoading }) => {
    // Hooks
    const { groupedMetrics, isLoading: statsLoading } = useAvailableMetrics(clientId);

    // State
    const [integration, setIntegration] = useState<string>(initialData?.integration || '');
    const [accountId, setAccountId] = useState<string>(initialData?.accountId || '');
    const [metricKey, setMetricKey] = useState<string>(initialData?.metricKey || '');
    const [condition, setCondition] = useState<AlertCondition>(initialData?.condition || 'less_than');
    const [triggerValue, setTriggerValue] = useState<string>(initialData?.triggerValue?.toString() || '');
    const [interval, setInterval] = useState<AlertInterval>(initialData?.interval || 'day');
    const [name, setName] = useState<string>(initialData?.name || ''); // Usually auto-generated if empty, but good to have
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Find metric label
        let metricLabel = initialData?.metricLabel || '';
        if (metricKey && integration && accountId && groupedMetrics) {
            const metrics = groupedMetrics[integration]?.[accountId];
            const found = metrics?.find(m => m.metricKey === metricKey);
            if (found) metricLabel = found.displayName;
        }

        const payload: CreateAlertData = {
            integration,
            accountId,
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

    // Derived lists
    const integrations = Object.keys(groupedMetrics || {});
    const accounts = integration ? Object.keys(groupedMetrics?.[integration] || {}) : [];
    const metrics = (integration && accountId) ? groupedMetrics?.[integration]?.[accountId] || [] : [];

    // Auto-fill metric label/name if editing
    useEffect(() => {
        if (!initialData && metricKey && !name) {
            // Logic to auto-suggest name? For now leave blank to let backend handle or user type
        }
    }, [metricKey]);


    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Integration Selection */}
                <div className="space-y-2">
                    <Label>Integration</Label>
                    <Select value={integration} onValueChange={handleIntegrationChange} disabled={!!initialData}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Integration" />
                        </SelectTrigger>
                        <SelectContent>
                            {integrations.map(int => (
                                <SelectItem key={int} value={int}>{int.charAt(0).toUpperCase() + int.slice(1)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Account Selection */}
                <div className="space-y-2">
                    <Label>Account</Label>
                    <Select value={accountId} onValueChange={handleAccountChange} disabled={!integration || !!initialData}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Account" />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map(acc => (
                                <SelectItem key={acc} value={acc}>{acc}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Metric Selection */}
                <div className="space-y-2 md:col-span-2">
                    <Label>Metric</Label>
                    <Select value={metricKey} onValueChange={setMetricKey} disabled={!accountId || !!initialData}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Metric to Monitor" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                            {metrics.map(m => (
                                <SelectItem key={m.metricKey} value={m.metricKey}>{m.displayName}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
                    <Label>Threshold Value</Label>
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
                    <Switch checked={notifyEmail} onCheckedChange={setNotifyEmail} />
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
                <Button type="submit" disabled={isLoading || statsLoading}>
                    {isLoading ? 'Saving...' : initialData ? 'Update Alert' : 'Create Alert'}
                </Button>
            </div>
        </form>
    );
};
