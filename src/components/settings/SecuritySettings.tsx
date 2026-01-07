import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/api/userApi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Smartphone, Laptop, Monitor } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

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
    const queryClient = useQueryClient();

    // 1. Password Change Setup
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
    });

    const passwordMutation = useMutation({
        mutationFn: userApi.changePassword,
        onSuccess: (res) => {
            if (res.success) {
                toast.success("Password updated successfully");
                reset();
            } else {
                toast.error(res.message || "Failed to update password");
            }
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "An error occurred");
        }
    });

    const onPasswordSubmit: SubmitHandler<PasswordFormValues> = (data) => {
        passwordMutation.mutate(data);
    };

    // 2. Sessions Setup
    const { data: sessionsResponse, isLoading: sessionsLoading, error: sessionsError } = useQuery({
        queryKey: ["userSessions"],
        queryFn: userApi.getSessions,
    });

    const sessions = sessionsResponse?.data || [];

    const revokeMutation = useMutation({
        mutationFn: userApi.revokeSession,
        onSuccess: (res) => {
            if (res.success) {
                toast.success("Session revoked");
                queryClient.invalidateQueries({ queryKey: ["userSessions"] });
            } else {
                toast.error(res.message || "Failed to revoke session");
            }
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "An error occurred");
        }
    });

    const revokeAllMutation = useMutation({
        mutationFn: userApi.revokeAllSessions,
        onSuccess: (res) => {
            if (res.success) {
                toast.success("All other sessions revoked");
                queryClient.invalidateQueries({ queryKey: ["userSessions"] });
            } else {
                toast.error(res.message || "Failed to revoke all sessions");
            }
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "An error occurred");
        }
    });

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
                            <Button type="submit" isLoading={passwordMutation.isPending}>Update Password</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Separator />

            {/* Active Sessions */}
            <div className="space-y-4">
                <div className="flex items-center justify-between max-w-3xl">
                    <h3 className="text-lg font-medium">Active Sessions</h3>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        isLoading={revokeAllMutation.isPending}
                        onClick={() => revokeAllMutation.mutate()}
                    >
                        Sign out all devices
                    </Button>
                </div>

                <div className="space-y-4 max-w-3xl">
                    {sessionsLoading ? (
                        <>
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </>
                    ) : sessionsError ? (
                        <div className="p-4 text-center border rounded-lg text-red-500">
                            Error loading active sessions.
                        </div>
                    ) : sessions.length === 0 ? (
                        <p className="text-muted-foreground">No active sessions found.</p>
                    ) : (
                        sessions.map((session) => (
                            <div key={session.id} className="flex items-start justify-between p-4 border rounded-lg bg-card">
                                <div className="flex gap-4">
                                    <div className={`mt-1 p-2 rounded-full h-fit ${session.id === sessions[0].id ? 'bg-primary/10' : 'bg-muted'}`}>
                                        <SessionIcon type={session.deviceType} className={session.id === sessions[0].id ? 'text-primary' : 'text-muted-foreground'} />
                                    </div>
                                    <div>
                                        <p className="font-medium">{session.deviceName} <span className="text-xs font-normal text-muted-foreground ml-2">({session.ipAddress})</span></p>
                                        <p className="text-sm text-muted-foreground">{session.location}</p>
                                        {session.id === sessions[0].id ? (
                                            <p className="text-xs text-green-600 mt-1 font-medium">Active Now</p>
                                        ) : (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Last active: {formatDistanceToNow(new Date(session.lastActiveAt))} ago
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {session.id !== sessions[0].id && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        isLoading={revokeMutation.isPending && revokeMutation.variables === session.id}
                                        onClick={() => revokeMutation.mutate(session.id)}
                                    >
                                        Revoke
                                    </Button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
    );
}

function SessionIcon({ type, className }: { type: 'desktop' | 'mobile' | 'tablet', className?: string }) {
    switch (type) {
        case 'mobile':
            return <Smartphone className={`h-5 w-5 ${className}`} />;
        case 'tablet':
            return <Smartphone className={`h-5 w-5 ${className}`} />;
        case 'desktop':
            return <Monitor className={`h-5 w-5 ${className}`} />;
        default:
            return <Laptop className={`h-5 w-5 ${className}`} />;
    }
}
