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

// Mock data for connected accounts
const googleAnalyticsAccounts = [
    { id: "ga_1", name: "GreyCats Main" },
    { id: "ga_2", name: "Client A Website" },
];

const facebookAccounts = [
    { id: "fb_1", name: "GreyCats FB Page" },
];

const integrationSchema = z.object({
    defaultGoogleAnalytics: z.string().optional(),
    defaultFacebook: z.string().optional(),
});

type IntegrationFormValues = z.infer<typeof integrationSchema>;

export default function IntegrationPreferences() {
    const {
        handleSubmit,
        control,
        formState: { isSubmitting },
    } = useForm<IntegrationFormValues>({
        resolver: zodResolver(integrationSchema),
        defaultValues: {
            defaultGoogleAnalytics: "ga_1",
            defaultFacebook: "fb_1",
        },
    });

    const onSubmit: SubmitHandler<IntegrationFormValues> = async (data) => {
        console.log("Integration Preferences Submitted:", data);
        await new Promise((resolve) => setTimeout(resolve, 800));
    };

    return (
        <div className="space-y-6">
            <Card className="shadow-none border-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                    <CardTitle>Integration Preferences</CardTitle>
                    <CardDescription>
                        Set default accounts for your connected integrations.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">

                        <div className="grid gap-2">
                            <Label>Default Google Analytics Account</Label>
                            <Controller
                                control={control}
                                name="defaultGoogleAnalytics"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select account" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {googleAnalyticsAccounts.map((acc) => (
                                                <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Default Facebook Account</Label>
                            <Controller
                                control={control}
                                name="defaultFacebook"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select account" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {facebookAccounts.map((acc) => (
                                                <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <p className="text-sm text-muted-foreground">Some integrations may not require a default account selection.</p>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" isLoading={isSubmitting}>Save Integration Settings</Button>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
