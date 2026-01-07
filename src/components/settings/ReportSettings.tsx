import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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

const reportSettingsSchema = z.object({
    defaultDateRange: z.string(),
    defaultFrequency: z.string(),
    preferredFormat: z.string(),
});

type ReportSettingsFormValues = z.infer<typeof reportSettingsSchema>;

export default function ReportSettings() {
    const {
        handleSubmit,
        control,
        formState: { isSubmitting },
    } = useForm<ReportSettingsFormValues>({
        resolver: zodResolver(reportSettingsSchema),
        defaultValues: {
            defaultDateRange: "30d",
            defaultFrequency: "weekly",
            preferredFormat: "pdf",
        },
    });

    const onSubmit: SubmitHandler<ReportSettingsFormValues> = async (data) => {
        console.log("Report Settings Submitted:", data);
        await new Promise((resolve) => setTimeout(resolve, 800));
    };

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
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <Button type="submit" isLoading={isSubmitting}>Save Defaults</Button>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
