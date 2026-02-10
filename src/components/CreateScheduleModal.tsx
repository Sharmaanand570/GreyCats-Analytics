import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { createReportSchedule, updateReportSchedule } from '@/features/reports/api/reportingApi';
import { userApi } from '@/api/userApi';
import type { ReportSchedule, CreateReportSchedulePayload, ReportScheduleFrequency, ReportTemplateSummary } from '@/features/reports/api/types';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

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

// Zod Schema for Validation
const scheduleSchema = z.object({
    name: z.string().min(1, "Schedule name is required").refine(val => val.trim().length > 0, "Schedule name cannot be empty"),
    templateId: z.string().min(1, "Please select a report template"),
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    timeOfDay: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
    timezone: z.string().min(1, "Timezone is required"),
    dayOfWeek: z.string().optional(), // Logic handled in submit
    dayOfMonth: z.string().optional(), // Logic handled in submit
    sendEmail: z.boolean(),
    emailTo: z.string().optional().refine((val) => {
        if (!val) return true;
        // Split, trim, and remove empty strings (to handle trailing commas like "a@b.com,")
        const emails = val.split(',').map(e => e.trim()).filter(e => e.length > 0);
        if (emails.length === 0) return true; // Allow empty/comma-only here, caught by required check below

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emails.every(email => emailRegex.test(email));
    }, "One or more email addresses are invalid"),
    emailSubject: z.string().optional(),
    emailBody: z.string().optional(),
});


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

    // Fetch User Profile
    const { data: userProfileResponse } = useQuery({
        queryKey: ['user-profile'],
        queryFn: userApi.getProfile
    });
    const userEmail = userProfileResponse?.data?.email;

    // Form State
    const [name, setName] = useState('');
    const [templateId, setTemplateId] = useState<string>('');
    const [frequency, setFrequency] = useState<ReportScheduleFrequency>('weekly');
    const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [timeOfDay, setTimeOfDay] = useState('09:00');
    const [dayOfWeek, setDayOfWeek] = useState<string>('1');
    const [dayOfMonth, setDayOfMonth] = useState<string>('1');

    // Email State
    const [sendEmail, setSendEmail] = useState(true);
    const [emailMode, setEmailMode] = useState<'me' | 'additional'>('me');
    const [emailTo, setEmailTo] = useState('');
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');

    // Error State
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset form when opening/closing or changing edit target
    useEffect(() => {
        if (open) {
            setErrors({}); // Clear errors on open
            if (scheduleToEdit) {
                setName(scheduleToEdit.name);
                setTemplateId(scheduleToEdit.templateId.toString());
                setFrequency(scheduleToEdit.frequency);
                setTimezone(scheduleToEdit.timezone);
                setTimeOfDay(scheduleToEdit.timeOfDay);
                setDayOfWeek(scheduleToEdit.dayOfWeek?.toString() || '1');
                setDayOfMonth(scheduleToEdit.dayOfMonth?.toString() || '1');

                // Email initialization logic
                if (scheduleToEdit.sendEmail) {
                    setSendEmail(true);
                    const savedEmails = (scheduleToEdit.emailTo || '').split(',').map(e => e.trim()).filter(e => e.length > 0);

                    // Logic: If there are ANY emails other than the current user, it's 'additional' mode.
                    // If userEmail is known, filter it out.
                    let additionalEmails = savedEmails;
                    if (userEmail) {
                        additionalEmails = savedEmails.filter(e => e !== userEmail);
                    }

                    if (additionalEmails.length > 0) {
                        setEmailMode('additional');
                        setEmailTo(additionalEmails.join(', '));
                    } else {
                        setEmailMode('me');
                        setEmailTo('');
                    }
                } else {
                    setSendEmail(false);
                    setEmailMode('me');
                    setEmailTo('');
                }

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
                setSendEmail(true);
                setEmailMode('me');
                setEmailTo('');
                setEmailSubject('');
                setEmailBody('');
            }
        }
    }, [open, scheduleToEdit, userEmail]);

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
        setErrors({});

        // Determine if we are sending any email
        const shouldSendEmail = sendEmail;

        // Prepare data for validation
        const formData = {
            name,
            templateId,
            frequency,
            timezone,
            timeOfDay,
            dayOfWeek,
            dayOfMonth,
            sendEmail: shouldSendEmail,
            emailTo: emailMode === 'additional' ? emailTo : undefined,
            emailSubject,
            emailBody,
        };

        const result = scheduleSchema.safeParse(formData);

        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;
            const formattedErrors: Record<string, string> = {};

            Object.keys(fieldErrors).forEach((key) => {
                const messages = fieldErrors[key as keyof typeof fieldErrors];
                if (messages && messages.length > 0) {
                    formattedErrors[key] = messages[0];
                }
            });
            setErrors(formattedErrors);
            if (Object.keys(formattedErrors).length > 0) {
                toast.error("Please correct the errors in the form.");
            }
            return;
        }

        // Construct Payload
        let finalEmails = '';
        if (shouldSendEmail) {
            const emailSet = new Set<string>();

            // Always add current user
            if (userEmail) {
                emailSet.add(userEmail);
            }

            if (emailMode === 'additional') {
                const additional = emailTo.split(',').map(e => e.trim()).filter(e => e.length > 0);
                additional.forEach(e => emailSet.add(e));
            }

            finalEmails = Array.from(emailSet).join(', ');
        }

        const payload: CreateReportSchedulePayload = {
            templateId: parseInt(templateId),
            name: name.trim(),
            frequency,
            timezone,
            timeOfDay,
            sendEmail: shouldSendEmail,
            emailTo: shouldSendEmail ? finalEmails : undefined,
            emailSubject: shouldSendEmail ? emailSubject : undefined,
            emailBody: shouldSendEmail ? emailBody : undefined,
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

    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Schedule' : 'Create Schedule'}</DialogTitle>
                    <DialogDescription>
                        Automate report generation for this client.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                            <Label className={errors.name ? "text-red-500" : ""}>Schedule Name</Label>
                            <Input
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    clearError('name');
                                }}
                                placeholder="e.g. Weekly Sales Report"
                                className={errors.name ? "border-red-500" : ""}
                            />
                            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label className={errors.templateId ? "text-red-500" : ""}>Report Template</Label>
                            <Select
                                value={templateId}
                                onValueChange={(v) => {
                                    setTemplateId(v);
                                    clearError('templateId');
                                }}
                                disabled={isEditing}
                            >
                                <SelectTrigger className={errors.templateId ? "border-red-500" : ""}>
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
                            {errors.templateId && <p className="text-xs text-red-500">{errors.templateId}</p>}
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
                            <Label className={errors.timeOfDay ? "text-red-500" : ""}>Time of Day</Label>
                            <Input
                                type="time"
                                value={timeOfDay}
                                onChange={(e) => {
                                    setTimeOfDay(e.target.value);
                                    clearError('timeOfDay');
                                }}
                                className={errors.timeOfDay ? "border-red-500" : ""}
                            />
                            {errors.timeOfDay && <p className="text-xs text-red-500">{errors.timeOfDay}</p>}
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
                                onCheckedChange={(c) => {
                                    setSendEmail(!!c);
                                    if (!c) clearError('emailTo');
                                }}
                            />
                            <Label htmlFor="sendEmail" className="font-medium cursor-pointer">
                                Send Email Report
                            </Label>
                        </div>

                        {sendEmail && (
                            <div className="space-y-4 pl-6 border-l-2 border-primary/20 mt-4 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">Recipients</Label>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="emailModeMe"
                                            name="emailMode"
                                            value="me"
                                            checked={emailMode === 'me'}
                                            onChange={() => setEmailMode('me')}
                                            className="aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                        <Label htmlFor="emailModeMe" className="font-normal cursor-pointer">
                                            Send only to me ({userEmail || 'current user'})
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="emailModeAdditional"
                                            name="emailMode"
                                            value="additional"
                                            checked={emailMode === 'additional'}
                                            onChange={() => setEmailMode('additional')}
                                            className="aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                        <Label htmlFor="emailModeAdditional" className="font-normal cursor-pointer">
                                            Add additional recipients
                                        </Label>
                                    </div>
                                </div>

                                {emailMode === 'additional' && (
                                    <div className="space-y-2 mt-2 ml-6">
                                        <Label className={errors.emailTo ? "text-red-500" : ""}>Recipient Email(s)</Label>
                                        <Input
                                            value={emailTo}
                                            onChange={(e) => {
                                                setEmailTo(e.target.value);
                                                clearError('emailTo');
                                            }}
                                            placeholder="colleague@example.com, boss@company.com"
                                            className={errors.emailTo ? "border-red-500" : ""}
                                        />
                                        {errors.emailTo && <p className="text-xs text-red-500">{errors.emailTo}</p>}
                                        <p className="text-xs text-muted-foreground">
                                            You ({userEmail || 'current user'}) will also receive this email. Separate multiple additional emails with commas.
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-2 pt-2">
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
