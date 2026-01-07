import { useEffect } from "react";
import { useForm, type SubmitHandler, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/api/userApi";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const notificationSchema = z.object({
    emailReportDelivery: z.boolean(),
    emailAlerts: z.boolean(),
    emailWeeklySummary: z.boolean(),
    emailSystemUpdates: z.boolean(),
    inAppAlerts: z.boolean(),
    inAppReportCompletion: z.boolean(),
    inAppIntegrationSync: z.boolean(),
    notificationEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

export default function NotificationSettings() {
    const queryClient = useQueryClient();

    // 1. Fetch Settings
    const { data: settingsResponse, isLoading, error } = useQuery({
        queryKey: ["notificationSettings"],
        queryFn: userApi.getNotifications,
    });

    const settings = settingsResponse?.data;

    // 2. Form Setup
    const {
        register,
        handleSubmit,
        setValue,
        control,
        reset,
        formState: { errors },
    } = useForm<NotificationFormValues>({
        resolver: zodResolver(notificationSchema),
    });

    const formValues = useWatch({ control });

    useEffect(() => {
        if (settings) {
            reset({
                emailReportDelivery: settings.emailNotifications.reports,
                emailAlerts: settings.emailNotifications.alerts,
                emailWeeklySummary: settings.emailNotifications.weekly,
                emailSystemUpdates: settings.emailNotifications.system,
                inAppAlerts: settings.inAppNotifications.alerts,
                inAppReportCompletion: settings.inAppNotifications.reports,
                inAppIntegrationSync: settings.inAppNotifications.syncStatus,
                notificationEmail: settings.notificationEmail || "",
            });
        }
    }, [settings, reset]);

    // 3. Update Mutation
    const updateMutation = useMutation({
        mutationFn: userApi.updateNotifications,
        onSuccess: (res) => {
            if (res.success) {
                toast.success("Notification settings updated");
                queryClient.invalidateQueries({ queryKey: ["notificationSettings"] });
            } else {
                toast.error(res.message || "Failed to update settings");
            }
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "An error occurred");
        }
    });

    const onSubmit: SubmitHandler<NotificationFormValues> = (data) => {
        updateMutation.mutate({
            emailNotifications: {
                reports: data.emailReportDelivery,
                alerts: data.emailAlerts,
                weekly: data.emailWeeklySummary,
                system: data.emailSystemUpdates,
            },
            inAppNotifications: {
                alerts: data.inAppAlerts,
                reports: data.inAppReportCompletion,
                syncStatus: data.inAppIntegrationSync,
            },
            notificationEmail: data.notificationEmail,
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-96" />
                <div className="space-y-4 mt-8">
                    <Skeleton className="h-20 w-full max-w-3xl" />
                    <Skeleton className="h-20 w-full max-w-3xl" />
                    <Skeleton className="h-20 w-full max-w-3xl" />
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500">Error loading notification settings. Please try again later.</div>;
    }

    return (
        <div className="space-y-6">
            <Card className="shadow-none border-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>
                        Manage how and when you want to be notified.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">

                        {/* Email Notifications */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Email Notifications</h3>
                            <div className="space-y-4">
                                <NotificationToggle
                                    title="Report Delivery"
                                    description="Receive emails when your scheduled reports are delivered."
                                    checked={formValues.emailReportDelivery}
                                    onChange={(val) => setValue("emailReportDelivery", val)}
                                />
                                <NotificationToggle
                                    title="Alert Notifications"
                                    description="Get notified immediately when critical alerts are triggered."
                                    checked={formValues.emailAlerts}
                                    onChange={(val) => setValue("emailAlerts", val)}
                                />
                                <NotificationToggle
                                    title="Weekly Summary"
                                    description="A weekly digest of your account activity and performance."
                                    checked={formValues.emailWeeklySummary}
                                    onChange={(val) => setValue("emailWeeklySummary", val)}
                                />
                                <NotificationToggle
                                    title="System Updates"
                                    description="News about features, maintenance, and security updates."
                                    checked={formValues.emailSystemUpdates}
                                    onChange={(val) => setValue("emailSystemUpdates", val)}
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* In-App Notifications */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">In-App Notifications</h3>
                            <div className="space-y-4">
                                <NotificationToggle
                                    title="Alert Triggers"
                                    description="Show popup notifications for alerts while using the app."
                                    checked={formValues.inAppAlerts}
                                    onChange={(val) => setValue("inAppAlerts", val)}
                                />
                                <NotificationToggle
                                    title="Report Completion"
                                    description="Notify when a manual report generation is finished."
                                    checked={formValues.inAppReportCompletion}
                                    onChange={(val) => setValue("inAppReportCompletion", val)}
                                />
                                <NotificationToggle
                                    title="Integration Sync Status"
                                    description="Notify when data integration syncs complete or fail."
                                    checked={formValues.inAppIntegrationSync}
                                    onChange={(val) => setValue("inAppIntegrationSync", val)}
                                />
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="notificationEmail">Alternative Notification Email <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                                <Input id="notificationEmail" placeholder="Send notifications to a different email..." {...register("notificationEmail")} />
                                <p className="text-[0.8rem] text-muted-foreground">Leave blank to use your primary account email.</p>
                                {errors.notificationEmail && <p className="text-sm text-red-500">{errors.notificationEmail.message}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" isLoading={updateMutation.isPending}>Update Notifications</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

function NotificationToggle({ title, description, checked, onChange }: { title: string, description: string, checked?: boolean, onChange: (val: boolean) => void }) {
    return (
        <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
                <Label className="text-base">{title}</Label>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <Switch
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
        </div>
    );
}
