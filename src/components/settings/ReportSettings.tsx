import { useEffect } from "react";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/api/userApi";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const reportSettingsSchema = z.object({
    defaultDateRange: z.string(),
    defaultFrequency: z.string(),
    preferredFormat: z.string(),
});

type ReportSettingsFormValues = z.infer<typeof reportSettingsSchema>;

export default function ReportSettings() {
    const queryClient = useQueryClient();

    // 1. Fetch Defaults
    const { data: defaultsResponse, isLoading, error } = useQuery({
        queryKey: ["reportDefaults"],
        queryFn: userApi.getReportDefaults,
    });

    const defaults = defaultsResponse?.data;

    // 2. Form Setup
    const {
        handleSubmit,
        control,
        reset,
    } = useForm<ReportSettingsFormValues>({
        resolver: zodResolver(reportSettingsSchema),
    });

    useEffect(() => {
        if (defaults) {
            reset({
                defaultDateRange: defaults.defaultDateRange,
                defaultFrequency: defaults.defaultReportFreq,
                preferredFormat: defaults.preferredFormat,
            });
        }
    }, [defaults, reset]);

    // 3. Update Mutation
    const updateMutation = useMutation({
        mutationFn: userApi.updateReportDefaults,
        onSuccess: (res) => {
            if (res.success) {
                toast.success("Report defaults updated");
                queryClient.invalidateQueries({ queryKey: ["reportDefaults"] });
            } else {
                toast.error(res.message || "Failed to update defaults");
            }
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "An error occurred");
        }
    });

    const onSubmit: SubmitHandler<ReportSettingsFormValues> = (data) => {
        updateMutation.mutate({
            defaultDateRange: data.defaultDateRange,
            defaultReportFreq: data.defaultFrequency,
            preferredFormat: data.preferredFormat,
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-96" />
                <div className="space-y-6 mt-8">
                    <Skeleton className="h-10 w-full max-w-xl" />
                    <Skeleton className="h-10 w-full max-w-xl" />
                    <Skeleton className="h-10 w-full max-w-xl" />
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500">Error loading report defaults. Please try again later.</div>;
    }

    return (
        <div className="space-y-6">
            <Card className="shadow-none border-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                    <CardTitle>Default Report Settings</CardTitle>
                    <CardDescription>
                        Configure default settings for new reports.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">

                        <div className="grid gap-2">
                            <Label>Default Date Range</Label>
                            <Controller
                                control={control}
                                name="defaultDateRange"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select date range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="7d">Last 7 days</SelectItem>
                                            <SelectItem value="30d">Last 30 days</SelectItem>
                                            <SelectItem value="90d">Last 90 days</SelectItem>
                                            <SelectItem value="custom">Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Default Report Frequency</Label>
                            <Controller
                                control={control}
                                name="defaultFrequency"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select frequency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Preferred Report Format</Label>
                            <Controller
                                control={control}
                                name="preferredFormat"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select format" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pdf">PDF Download</SelectItem>
                                            <SelectItem value="email_link">Email Link (Live View)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" isLoading={updateMutation.isPending}>Save Defaults</Button>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
