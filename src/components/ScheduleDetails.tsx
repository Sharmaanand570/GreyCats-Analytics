import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Loader2, Download, CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';
import { getReportSchedule } from '@/features/reports/api/reportingApi';
import api from '@/apiConfig';

interface ScheduleDetailsProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientId: number;
    scheduleId: number;
}

export const ScheduleDetails: React.FC<ScheduleDetailsProps> = ({
    open,
    onOpenChange,
    clientId,
    scheduleId
}) => {
    const { data: response, isLoading } = useQuery({
        queryKey: ['report-schedule', clientId, scheduleId],
        queryFn: () => getReportSchedule(clientId, scheduleId),
        enabled: open && !!scheduleId
    });

    const schedule = response?.data;

    const handleDownload = (reportId: number, fileName: string) => {
        // Construct download URL
        // We can use window.open or a hidden anchor tag
        // Using api.defaults.baseURL to ensure we hit the right backend
        const baseUrl = api.defaults.baseURL || '';
        const downloadUrl = `${baseUrl}/clients/${clientId}/generated-reports/${reportId}/download`;

        // Create a temporary link to trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Schedule Details</DialogTitle>
                    <DialogDescription>
                        View run history and generated reports.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : schedule ? (
                    <div className="flex-1 overflow-hidden flex flex-col gap-6">
                        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg border">
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Name</p>
                                <p className="font-medium text-sm mt-1">{schedule.name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Template</p>
                                <p className="font-medium text-sm mt-1">{schedule.template.name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Frequency</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="capitalize">{schedule.frequency}</Badge>
                                    <span className="text-sm text-muted-foreground">at {schedule.timeOfDay}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</p>
                                <div className="mt-1">
                                    {schedule.isActive ? (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-green-200">Active</Badge>
                                    ) : (
                                        <Badge variant="secondary">Paused</Badge>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Email Delivery</p>
                                <p className="font-medium text-sm mt-1">{schedule.sendEmail ? 'Enabled' : 'Disabled'}</p>
                            </div>
                            <div className="col-span-1">
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Next Run</p>
                                <p className="font-medium text-sm mt-1">
                                    {schedule.nextRunAt ? format(new Date(schedule.nextRunAt), 'PP p') : '-'}
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col min-h-0">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <HistoryIcon className="w-4 h-4" /> Run History
                            </h3>

                            <div className="flex-1 border rounded-md overflow-hidden bg-white">
                                <div className="grid grid-cols-12 gap-4 p-3 border-b bg-muted/40 text-xs font-medium text-muted-foreground">
                                    <div className="col-span-3">Date</div>
                                    <div className="col-span-2">Status</div>
                                    <div className="col-span-2">Duration</div>
                                    <div className="col-span-3">Report</div>
                                    <div className="col-span-2 text-right">Actions</div>
                                </div>
                                <ScrollArea className="h-[300px]">
                                    {schedule.runLogs.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                                            <Clock className="w-8 h-8 mb-2 opacity-20" />
                                            <p className="text-sm">No runs recorded yet</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y">
                                            {schedule.runLogs.map((log) => (
                                                <div key={log.id} className="grid grid-cols-12 gap-4 p-3 text-sm items-center hover:bg-muted/5 transition-colors">
                                                    <div className="col-span-3 font-medium">
                                                        {format(new Date(log.startedAt), 'PP p')}
                                                    </div>
                                                    <div className="col-span-2">
                                                        {log.status === 'completed' && (
                                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 pl-1 pr-2">
                                                                <CheckCircle2 className="w-3 h-3" /> Success
                                                            </Badge>
                                                        )}
                                                        {log.status === 'failed' && (
                                                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 pl-1 pr-2">
                                                                <XCircle className="w-3 h-3" /> Failed
                                                            </Badge>
                                                        )}
                                                        {log.status === 'running' && (
                                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 pl-1 pr-2">
                                                                <Loader2 className="w-3 h-3 animate-spin" /> Running
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="col-span-2 text-muted-foreground text-xs">
                                                        {log.finishedAt ? (
                                                            <span>
                                                                {Math.round((new Date(log.finishedAt).getTime() - new Date(log.startedAt).getTime()) / 1000)}s
                                                            </span>
                                                        ) : '-'}
                                                    </div>
                                                    <div className="col-span-3 truncate">
                                                        {log.generatedReport ? (
                                                            <div className="flex items-center gap-1.5 text-zinc-700" title={log.generatedReport.fileName}>
                                                                <FileText className="w-3 h-3 text-blue-500" />
                                                                <span className="truncate">{log.generatedReport.fileName}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </div>
                                                    <div className="col-span-2 flex justify-end">
                                                        {log.generatedReport && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 w-7 p-0"
                                                                onClick={() => handleDownload(log.generatedReport!.id, log.generatedReport!.fileName)}
                                                            >
                                                                <Download className="w-4 h-4 text-zinc-500" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-12 text-red-500">
                        Failed to load schedule details
                    </div>
                )}

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

function HistoryIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" />
            <path d="M3 3v9h9" />
            <path d="M12 7v5l4 2" />
        </svg>
    )
}
