import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Smartphone, Laptop } from "lucide-react";

// -----------------------
// Password Change Form
// -----------------------
const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SecuritySettings() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
    });

    const onPasswordSubmit: SubmitHandler<PasswordFormValues> = async (data) => {
        console.log("Password Change Submitted:", data);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        reset();
        alert("Password updated successfully");
    };

    return (
        <div className="space-y-8">

            {/* Change Password */}
            <Card className="shadow-none border-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                        Update your password to keep your account secure.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-xl">
                        <div className="grid gap-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input id="currentPassword" type="password" {...register("currentPassword")} />
                            {errors.currentPassword && <p className="text-sm text-red-500">{errors.currentPassword.message}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input id="newPassword" type="password" {...register("newPassword")} />
                            {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword.message}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
                            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button type="submit" isLoading={isSubmitting}>Update Password</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Separator />

            {/* Two-Factor Auth */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between rounded-lg border p-4 max-w-3xl">
                    <div className="space-y-0.5">
                        <Label className="text-base">Enable 2FA</Label>
                        <p className="text-sm text-muted-foreground">Secure your account with SMS or an Authenticator app.</p>
                    </div>
                    <Switch />
                </div>
            </div>

            <Separator />

            {/* Active Sessions */}
            <div className="space-y-4">
                <div className="flex items-center justify-between max-w-3xl">
                    <h3 className="text-lg font-medium">Active Sessions</h3>
                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">Sign out all devices</Button>
                </div>

                <div className="space-y-4 max-w-3xl">
                    {/* Current Session */}
                    <div className="flex items-start justify-between p-4 border rounded-lg bg-card">
                        <div className="flex gap-4">
                            <div className="mt-1 bg-primary/10 p-2 rounded-full h-fit">
                                <Laptop className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">Windows PC - Chrome</p>
                                <p className="text-sm text-muted-foreground">Mumbai, India • 192.168.1.1</p>
                                <p className="text-xs text-green-600 mt-1 font-medium">Active Now</p>
                            </div>
                        </div>
                    </div>

                    {/* Other Session */}
                    <div className="flex items-start justify-between p-4 border rounded-lg bg-card/50">
                        <div className="flex gap-4">
                            <div className="mt-1 bg-muted p-2 rounded-full h-fit">
                                <Smartphone className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="font-medium text-muted-foreground">iPhone 13 - Safari</p>
                                <p className="text-sm text-muted-foreground">London, UK • 10.0.0.5</p>
                                <p className="text-xs text-muted-foreground mt-1">Last active: 2 hours ago</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm">Revoke</Button>
                    </div>
                </div>
            </div>

        </div>
    );
}
