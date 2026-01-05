import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { createReportSchedule, updateReportSchedule } from '@/features/reports/api/reportingApi';
import type { ReportSchedule, CreateReportSchedulePayload, ReportScheduleFrequency, ReportTemplateSummary } from '@/features/reports/api/types';
import { Loader2 } from 'lucide-react';

interface CreateScheduleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientId: number;
    templates: ReportTemplateSummary[];
    scheduleToEdit?: ReportSchedule | null;
    onSuccess?: () => void;
}

const TIMEZONES = [
    "UTC",
    "America/New_York",
    "America/Los_Angeles",
    "Europe/London",
    "Asia/Kolkata",
    "Asia/Tokyo",
    "Australia/Sydney"
];

const DAYS_OF_WEEK = [
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
    { value: 7, label: "Sunday" },
];

export const CreateScheduleModal: React.FC<CreateScheduleModalProps> = ({
    open,
    onOpenChange,
    clientId,
    templates,
    scheduleToEdit,
    onSuccess
}) => {
    const queryClient = useQueryClient();
    const isEditing = !!scheduleToEdit;

    // Form State
    const [name, setName] = useState('');
    const [templateId, setTemplateId] = useState<string>('');
    const [frequency, setFrequency] = useState<ReportScheduleFrequency>('weekly');
    const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [timeOfDay, setTimeOfDay] = useState('09:00');
    const [dayOfWeek, setDayOfWeek] = useState<string>('1');
    const [dayOfMonth, setDayOfMonth] = useState<string>('1');

    // Email State
    const [sendEmail, setSendEmail] = useState(false);
    const [emailTo, setEmailTo] = useState('');
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');

    // Reset form when opening/closing or changing edit target
    useEffect(() => {
        if (open) {
            if (scheduleToEdit) {
                setName(scheduleToEdit.name);
                setTemplateId(scheduleToEdit.templateId.toString());
                setFrequency(scheduleToEdit.frequency);
                setTimezone(scheduleToEdit.timezone);
                setTimeOfDay(scheduleToEdit.timeOfDay);
                setDayOfWeek(scheduleToEdit.dayOfWeek?.toString() || '1');
                setDayOfMonth(scheduleToEdit.dayOfMonth?.toString() || '1');
                setSendEmail(scheduleToEdit.sendEmail);
                setEmailTo(scheduleToEdit.emailTo || '');
                setEmailSubject(scheduleToEdit.emailSubject || '');
                setEmailBody(scheduleToEdit.emailBody || '');
            } else {
                setName('');
                setTemplateId('');
                setFrequency('weekly');
                setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
                setTimeOfDay('09:00');
                setDayOfWeek('1');
                setDayOfMonth('1');
                setSendEmail(false);
                setEmailTo('');
                setEmailSubject('');
                setEmailBody('');
            }
        }
    }, [open, scheduleToEdit]);

    const { mutate: createSchedule, isPending: isCreating } = useMutation({
        mutationFn: async (payload: CreateReportSchedulePayload) => {
            return createReportSchedule(clientId, payload);
        },
        onSuccess: () => {
            toast.success('Schedule created successfully');
            queryClient.invalidateQueries({ queryKey: ['report-schedules', clientId] });
            onSuccess?.();
            onOpenChange(false);
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create schedule');
        }
    });

    const { mutate: updateSchedule, isPending: isUpdating } = useMutation({
        mutationFn: async (payload: Partial<CreateReportSchedulePayload>) => {
            if (!scheduleToEdit) return;
            return updateReportSchedule(clientId, scheduleToEdit.id, payload);
        },
        onSuccess: () => {
            toast.success('Schedule updated successfully');
            queryClient.invalidateQueries({ queryKey: ['report-schedules', clientId] });
            onSuccess?.();
            onOpenChange(false);
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update schedule');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!templateId) {
            toast.error('Please select a report template');
            return;
        }

        const payload: CreateReportSchedulePayload = {
            templateId: parseInt(templateId),
            name,
            frequency,
            timezone,
            timeOfDay,
            sendEmail,
            emailTo: sendEmail ? emailTo : undefined,
            emailSubject: sendEmail ? emailSubject : undefined,
            emailBody: sendEmail ? emailBody : undefined,
            dayOfWeek: frequency === 'weekly' ? parseInt(dayOfWeek) : null,
            dayOfMonth: frequency === 'monthly' ? parseInt(dayOfMonth) : null,
        };

        if (isEditing) {
            updateSchedule(payload);
        } else {
            createSchedule(payload);
        }
    };

    const isLoading = isCreating || isUpdating;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Schedule' : 'Create Schedule'}</DialogTitle>
                    <DialogDescription>
                        Automate report generation for this client.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                            <Label>Schedule Name</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Weekly Sales Report"
                                required
                            />
                        </div>

                        <div className="space-y-2 col-span-2">
                            <Label>Report Template</Label>
                            <Select
                                value={templateId}
                                onValueChange={setTemplateId}
                                disabled={isEditing}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a template" />
                                </SelectTrigger>
                                <SelectContent>
                                    {templates.map(t => (
                                        <SelectItem key={t.id} value={t.id.toString()}>
                                            {t.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Frequency</Label>
                            <Select
                                value={frequency}
                                onValueChange={(v) => setFrequency(v as ReportScheduleFrequency)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Time of Day</Label>
                            <Input
                                type="time"
                                value={timeOfDay}
                                onChange={(e) => setTimeOfDay(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Timezone</Label>
                            <Select value={timezone} onValueChange={setTimezone}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TIMEZONES.map(tz => (
                                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {frequency === 'weekly' && (
                            <div className="space-y-2">
                                <Label>Day of Week</Label>
                                <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DAYS_OF_WEEK.map(d => (
                                            <SelectItem key={d.value} value={d.value.toString()}>
                                                {d.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {frequency === 'monthly' && (
                            <div className="space-y-2">
                                <Label>Day of Month</Label>
                                <Select value={dayOfMonth} onValueChange={setDayOfMonth}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                                            <SelectItem key={d} value={d.toString()}>
                                                {d}{d === 1 ? 'st' : d === 2 ? 'nd' : d === 3 ? 'rd' : 'th'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="sendEmail"
                                checked={sendEmail}
                                onCheckedChange={(c) => setSendEmail(!!c)}
                            />
                            <Label htmlFor="sendEmail" className="font-medium cursor-pointer">
                                Send Email Validation
                            </Label>
                        </div>

                        {sendEmail && (
                            <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                                <div className="space-y-2">
                                    <Label>Recipient Email(s)</Label>
                                    <Input
                                        value={emailTo}
                                        onChange={(e) => setEmailTo(e.target.value)}
                                        placeholder="client@example.com, boss@example.com"
                                        required={sendEmail}
                                    />
                                    <p className="text-xs text-muted-foreground">Separate multiple emails with commas</p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Email Subject</Label>
                                    <Input
                                        value={emailSubject}
                                        onChange={(e) => setEmailSubject(e.target.value)}
                                        placeholder="Your Weekly Report"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Email Body</Label>
                                    <Textarea
                                        value={emailBody}
                                        onChange={(e) => setEmailBody(e.target.value)}
                                        placeholder="Please find your latest report attached..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isEditing ? 'Update Schedule' : 'Create Schedule'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
