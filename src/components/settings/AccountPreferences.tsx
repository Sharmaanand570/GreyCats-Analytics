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

const preferencesSchema = z.object({
    timezone: z.string().min(1, "Timezone is required"),
    dateFormat: z.string().optional(),
    numberFormat: z.string().optional(),
});

type PreferencesFormValues = z.infer<typeof preferencesSchema>;

export default function AccountPreferences() {
    const {
        handleSubmit,
        control,
        formState: { isSubmitting },
    } = useForm<PreferencesFormValues>({
        resolver: zodResolver(preferencesSchema),
        defaultValues: {
            timezone: "America/New_York",
            dateFormat: "MM/DD/YYYY",
            numberFormat: "US",
        },
    });

    const onSubmit: SubmitHandler<PreferencesFormValues> = async (data) => {
        console.log("Account Preferences Submitted:", data);
        await new Promise((resolve) => setTimeout(resolve, 800));
    };

    return (
        <div className="space-y-6">
            <Card className="shadow-none border-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                    <CardTitle>Account Preferences</CardTitle>
                    <CardDescription>
                        Customize your experience with regional settings.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">

                        <div className="grid gap-2">
                            <Label>Timezone</Label>
                            <Controller
                                control={control}
                                name="timezone"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select timezone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="auto">Auto-detect</SelectItem>
                                            <SelectItem value="America/New_York">Eastern Time (US & Canada)</SelectItem>
                                            <SelectItem value="America/Los_Angeles">Pacific Time (US & Canada)</SelectItem>
                                            <SelectItem value="Europe/London">London</SelectItem>
                                            <SelectItem value="Europe/Paris">Paris</SelectItem>
                                            <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                                            <SelectItem value="Asia/Kolkata">Kolkata</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <p className="text-[0.8rem] text-muted-foreground">Used for scheduling reports and alerts.</p>
                        </div>

                        <div className="grid gap-2">
                            <Label>Date Format</Label>
                            <Controller
                                control={control}
                                name="dateFormat"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select date format" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</SelectItem>
                                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</SelectItem>
                                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Number Format</Label>
                            <Controller
                                control={control}
                                name="numberFormat"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select number format" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="US">1,234.56 (US/UK)</SelectItem>
                                            <SelectItem value="EU">1.234,56 (Europe)</SelectItem>
                                            <SelectItem value="FR">1 234,56 (France)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" isLoading={isSubmitting}>Save Preferences</Button>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
