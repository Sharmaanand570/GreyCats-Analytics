import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
    CalendarDays,
    Clock,
    MoreVertical,
    Play,
    Pause,
    Pencil,
    Trash2,
    History,
    Plus,
    Mail,
    AlertCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Skeleton } from './ui/skeleton';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from './ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

import {
    listReportSchedules,
    deleteReportSchedule,
    updateReportSchedule,
    listReportTemplates
} from '@/features/reports/api/reportingApi';
import type { ReportSchedule } from '@/features/reports/api/types';
import { CreateScheduleModal } from './CreateScheduleModal';
import { ScheduleDetails } from './ScheduleDetails';

interface ReportSchedulesProps {
    clientId: number;
}

export const ReportSchedules: React.FC<ReportSchedulesProps> = ({ clientId }) => {
    const queryClient = useQueryClient();
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<ReportSchedule | null>(null);
    const [deletingSchedule, setDeletingSchedule] = useState<ReportSchedule | null>(null);
    const [viewingSchedule, setViewingSchedule] = useState<ReportSchedule | null>(null);

    // Fetch Schedules
    const { data: schedulesData, isLoading, isError } = useQuery({
        queryKey: ['report-schedules', clientId],
        queryFn: async () => {
            const response = await listReportSchedules(clientId);
            console.log("ReportSchedules response:", response);
            return response.data || [];
        }
    });

    // Fetch Templates (needed for create/edit modal)

    const { data: templatesRaw, isLoading: isTemplatesLoading } = useQuery({
        queryKey: ['report-templates', 'list', clientId],
        queryFn: () => listReportTemplates(clientId)
    });
    const templates = templatesRaw?.templates || [];

    // Toggle Active Status
    const { mutate: toggleStatus } = useMutation({
        mutationFn: async ({ id, isActive }: { id: number, isActive: boolean }) => {
            return updateReportSchedule(clientId, id, { isActive });
        },
        onSuccess: (data) => {
            toast.success(data.message || 'Schedule updated');
            queryClient.invalidateQueries({ queryKey: ['report-schedules', clientId] });
        },
        onError: () => toast.error('Failed to update schedule status')
    });

    // Delete Schedule
    const { mutate: deleteSchedule, isPending: isDeleting } = useMutation({
        mutationFn: async (id: number) => {
            return deleteReportSchedule(clientId, id);
        },
        onSuccess: () => {
            toast.success('Schedule deleted successfully');
            setDeletingSchedule(null);
            queryClient.invalidateQueries({ queryKey: ['report-schedules', clientId] });
        },
        onError: () => toast.error('Failed to delete schedule')
    });

    const handleEdit = (schedule: ReportSchedule) => {
        setEditingSchedule(schedule);
        setCreateModalOpen(true);
    };

    const handleModalClose = (open: boolean) => {
        setCreateModalOpen(open);
        if (!open) setEditingSchedule(null);
    };

    if (isLoading || isTemplatesLoading) {
        return (
            <div className="w-full h-full flex flex-col space-y-6">
                <div className="flex justify-between items-center px-1">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">Scheduled Reports</h2>
                        <p className="text-sm text-muted-foreground">Automate your reporting workflow with recurring schedules.</p>
                    </div>
                    <Button disabled>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Schedule
                    </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="relative overflow-hidden">
                            <div className="absolute left-0 top-0 w-1 h-full bg-zinc-100" />
                            <CardHeader className="pb-2 pl-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2 w-full">
                                        <Skeleton className="h-5 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                </div>
                            </CardHeader>
                            <CardContent className="pl-6 pt-2 pb-4 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-4 rounded-full" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-4 rounded-full" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-2 w-2 rounded-full" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <Skeleton className="h-6 w-48 rounded-md" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-8 flex flex-col items-center justify-center text-red-500 gap-4">
                <AlertCircle className="w-8 h-8" />
                <p>Failed to load schedules</p>
                <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['report-schedules', clientId] })}>
                    Retry
                </Button>
            </div>
        );
    }

    // clear and robust extraction of the array
    const rawSchedules = schedulesData as any;
    const listToFilter: ReportSchedule[] = Array.isArray(rawSchedules)
        ? rawSchedules
        : (Array.isArray(rawSchedules?.data) ? rawSchedules.data : []);

    const schedules = listToFilter.filter(schedule => {
        // Try to filter by clientId if available in the response
        const sClientId = schedule.clientId || schedule.client_id;
        if (sClientId) {
            return Number(sClientId) === Number(clientId);
        }

        // Fallback: check if the schedule's template belongs to this client
        // This acts as a safeguard if the API returns mixed data without clientIds
        const templateExists = templates.some(t => t.id === schedule.templateId);
        return templateExists;
    }).sort((a, b) => {
        // Sort by Active status first (Active = true, Paused = false)
        // We want true (Active) first, so b.isActive - a.isActive? No, boolean subtraction isn't standard in TS without coercion.
        // Number(true) = 1, Number(false) = 0.
        // b (1) - a (0) = 1 -> b comes first (Desc order of boolean)
        if (a.isActive !== b.isActive) {
            return Number(b.isActive) - Number(a.isActive);
        }
        // Secondary sort by name for stability
        return a.name.localeCompare(b.name);
    });

    return (
        <div className="w-full h-full flex flex-col space-y-6">
            <div className="flex justify-between items-center px-1">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Scheduled Reports</h2>
                    <p className="text-sm text-muted-foreground">Automate your reporting workflow with recurring schedules.</p>
                </div>
                <Button onClick={() => setCreateModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Schedule
                </Button>
            </div>

            {schedules.length === 0 ? (
                <Card className="border-dashed bg-muted/10">
                    <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
                        <div className="p-4 rounded-full bg-muted">
                            <CalendarDays className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-semibold text-lg">No schedules yet</h3>
                            <p className="text-muted-foreground text-sm max-w-sm">
                                Create a schedule to automatically generate and email reports to your clients.
                            </p>
                        </div>
                        <Button variant="outline" onClick={() => setCreateModalOpen(true)}>
                            Create your first schedule
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {schedules.map((schedule) => (
                        <Card key={schedule.id} className="relative overflow-hidden transition-all hover:shadow-md">
                            <div className={`absolute left-0 top-0 w-1 h-full ${schedule.isActive ? 'bg-green-500' : 'bg-zinc-300'}`} />
                            <CardHeader className="pb-2 pl-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base font-medium leading-none truncate pr-4" title={schedule.name}>
                                            {schedule.name}
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            {templates.find(t => t.id === schedule.templateId)?.name || `Template #${schedule.templateId}`}
                                        </CardDescription>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="-mr-2 -mt-2 h-8 w-8">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(schedule)}>
                                                <Pencil className="w-4 h-4 mr-2" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setViewingSchedule(schedule)}>
                                                <History className="w-4 h-4 mr-2" /> History
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => toggleStatus({ id: schedule.id, isActive: !schedule.isActive })}>
                                                {schedule.isActive ? (
                                                    <>
                                                        <Pause className="w-4 h-4 mr-2" /> Pause
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="w-4 h-4 mr-2" /> Resume
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => setDeletingSchedule(schedule)}>
                                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="pl-6 pt-2 pb-4 space-y-3">
                                <div className="flex items-center text-sm text-zinc-600 gap-2">
                                    <Clock className="w-4 h-4 text-zinc-400" />
                                    <span className="capitalize">{schedule.frequency}</span>
                                    <span>•</span>
                                    <span>{schedule.timeOfDay}</span>
                                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                                        {schedule.timezone.split('/').pop()?.replace('_', ' ')}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <div className={`w-2 h-2 rounded-full ${schedule.isActive ? 'bg-green-500' : 'bg-zinc-300'}`} />
                                    {schedule.isActive ? (
                                        <span>Next run: {schedule.nextRunAt ? format(new Date(schedule.nextRunAt), 'MMM d, h:mm a') : 'Scheduled'}</span>
                                    ) : (
                                        <span>Paused</span>
                                    )}
                                </div>

                                {schedule.sendEmail && (
                                    <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">
                                        <Mail className="w-3 h-3" />
                                        <span className="truncate max-w-[200px]">{schedule.emailTo}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <CreateScheduleModal
                open={createModalOpen}
                onOpenChange={handleModalClose}
                clientId={clientId}
                templates={templates}
                scheduleToEdit={editingSchedule}
            />

            {viewingSchedule && (
                <ScheduleDetails
                    open={!!viewingSchedule}
                    onOpenChange={(open) => !open && setViewingSchedule(null)}
                    clientId={clientId}
                    scheduleId={viewingSchedule.id}
                />
            )}
            <AlertDialog open={!!deletingSchedule} onOpenChange={(open) => !open && setDeletingSchedule(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the schedule "{deletingSchedule?.name}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingSchedule && deleteSchedule(deletingSchedule.id)}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Schedule'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
