import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const notificationSchema = z.object({
    emailReportDelivery: z.boolean(),
    emailAlerts: z.boolean(),
    emailWeeklySummary: z.boolean(),
    emailSystemUpdates: z.boolean(),
    inAppAlerts: z.boolean(),
    inAppReportCompletion: z.boolean(),
    inAppIntegrationSync: z.boolean(),
    notificationEmail: z.string().email().optional().or(z.literal("")),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

export default function NotificationSettings() {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<NotificationFormValues>({
        resolver: zodResolver(notificationSchema),
        defaultValues: {
            emailReportDelivery: true,
            emailAlerts: true,
            emailWeeklySummary: false,
            emailSystemUpdates: true,
            inAppAlerts: true,
            inAppReportCompletion: true,
            inAppIntegrationSync: false,
            notificationEmail: "",
        },
    });

    const formValues = watch();

    const onSubmit: SubmitHandler<NotificationFormValues> = async (data) => {
        console.log("Notification Settings Submitted:", data);
        await new Promise((resolve) => setTimeout(resolve, 800));
    };

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
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Report Delivery</Label>
                                        <p className="text-sm text-muted-foreground">Receive emails when your scheduled reports are delivered.</p>
                                    </div>
                                    <Switch
                                        checked={formValues.emailReportDelivery}
                                        onChange={(e) => setValue("emailReportDelivery", e.target.checked)}
                                    />
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Alert Notifications</Label>
                                        <p className="text-sm text-muted-foreground">Get notified immediately when critical alerts are triggered.</p>
                                    </div>
                                    <Switch
                                        checked={formValues.emailAlerts}
                                        onChange={(e) => setValue("emailAlerts", e.target.checked)}
                                    />
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Weekly Summary</Label>
                                        <p className="text-sm text-muted-foreground">A weekly digest of your account activity and performance.</p>
                                    </div>
                                    <Switch
                                        checked={formValues.emailWeeklySummary}
                                        onChange={(e) => setValue("emailWeeklySummary", e.target.checked)}
                                    />
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">System Updates</Label>
                                        <p className="text-sm text-muted-foreground">News about features, maintenance, and security updates.</p>
                                    </div>
                                    <Switch
                                        checked={formValues.emailSystemUpdates}
                                        onChange={(e) => setValue("emailSystemUpdates", e.target.checked)}
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* In-App Notifications */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">In-App Notifications</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Alert Triggers</Label>
                                        <p className="text-sm text-muted-foreground">Show popup notifications for alerts while using the app.</p>
                                    </div>
                                    <Switch
                                        checked={formValues.inAppAlerts}
                                        onChange={(e) => setValue("inAppAlerts", e.target.checked)}
                                    />
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Report Completion</Label>
                                        <p className="text-sm text-muted-foreground">Notify when a manual report generation is finished.</p>
                                    </div>
                                    <Switch
                                        checked={formValues.inAppReportCompletion}
                                        onChange={(e) => setValue("inAppReportCompletion", e.target.checked)}
                                    />
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Integration Sync Status</Label>
                                        <p className="text-sm text-muted-foreground">Notify when data integration syncs complete or fail.</p>
                                    </div>
                                    <Switch
                                        checked={formValues.inAppIntegrationSync}
                                        onChange={(e) => setValue("inAppIntegrationSync", e.target.checked)}
                                    />
                                </div>
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
                            <Button type="submit" isLoading={isSubmitting}>Update Notifications</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
