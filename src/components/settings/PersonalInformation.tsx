import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/api/userApi";
import { useUserStore } from "@/utils/useUserStore";
import { getProfileImageUrl } from "@/utils/imageUtils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const personalInfoSchema = z.object({
    fullName: z.string().min(1, "Full Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    jobTitle: z.string().optional(),
    companyName: z.string().optional(),
});

type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

export default function PersonalInformation() {
    const queryClient = useQueryClient();
    const { fetchProfile } = useUserStore();

    // 1. Fetch Profile
    const { data: profileResponse, isLoading, error } = useQuery({
        queryKey: ["userProfile"],
        queryFn: userApi.getProfile,
    });

    const profile = profileResponse?.data;

    // 2. Form Setup
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PersonalInfoFormValues>({
        resolver: zodResolver(personalInfoSchema),
    });

    // Reset form when profile data is loaded
    useEffect(() => {
        if (profile) {
            reset({
                fullName: profile.fullName,
                email: profile.email,
                phone: profile.phoneNumber || "",
                jobTitle: profile.jobTitle || "",
                companyName: profile.companyName || "",
            });
        }
    }, [profile, reset]);

    // 3. Update Profile Mutation
    const updateProfileMutation = useMutation({
        mutationFn: userApi.updateProfile,
        onSuccess: (res) => {
            if (res.success) {
                toast.success("Profile updated successfully");
                queryClient.invalidateQueries({ queryKey: ["userProfile"] });
                fetchProfile();
            } else {
                toast.error(res.message || "Failed to update profile");
            }
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "An error occurred");
        },
    });

    // 4. Upload Picture Mutation
    const uploadPictureMutation = useMutation({
        mutationFn: userApi.uploadProfilePicture,
        onSuccess: (res) => {
            if (res.success) {
                toast.success("Profile picture updated");
                queryClient.invalidateQueries({ queryKey: ["userProfile"] });
                fetchProfile();
            }
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to upload picture");
        },
    });

    // 5. Email Change Logic
    const [isChangeEmailOpen, setIsChangeEmailOpen] = useState(false);
    const [emailChangeStep, setEmailChangeStep] = useState<"email" | "otp">("email");
    const [newEmail, setNewEmail] = useState("");
    const [otp, setOtp] = useState("");

    const sendEmailOtpMutation = useMutation({
        mutationFn: userApi.sendEmailChangeOTP,
        onSuccess: (res) => {
            if (res.success) {
                toast.success(res.message || "OTP sent to new email");
                setEmailChangeStep("otp");
            } else {
                toast.error(res.message || "Failed to send OTP");
            }
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to send OTP");
        },
    });

    const verifyEmailMutation = useMutation({
        mutationFn: userApi.verifyAndChangeEmail,
        onSuccess: (res) => {
            if (res.success) {
                toast.success("Email updated successfully");
                setIsChangeEmailOpen(false);
                setNewEmail("");
                setOtp("");
                setEmailChangeStep("email");
                queryClient.invalidateQueries({ queryKey: ["userProfile"] });
                fetchProfile();
            } else {
                toast.error(res.message || "Failed to verified OTP");
            }
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Invalid OTP");
        },
    });

    const handleSendOtp = () => {
        if (!newEmail) return toast.error("Please enter a new email");
        if (newEmail === profile?.email) return toast.error("New email cannot be same as current email");
        // Simple regex or let backend handle strict validation, but zod scheme for form exists.
        // We can manually validate if needed.
        sendEmailOtpMutation.mutate({ newEmail });
    };

    const handleVerifyOtp = () => {
        if (!otp || otp.length < 6) return toast.error("Please enter a valid 6-digit OTP");
        verifyEmailMutation.mutate({ otp });
    };

    const onSubmit: SubmitHandler<PersonalInfoFormValues> = (data) => {
        updateProfileMutation.mutate({
            fullName: data.fullName,
            phoneNumber: data.phone,
            jobTitle: data.jobTitle,
            companyName: data.companyName,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File too large! Max 5MB");
                return;
            }
            uploadPictureMutation.mutate(file);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-96" />
                <div className="flex gap-6 mt-8">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-2 py-4">
                        <Skeleton className="h-8 w-40" />
                    </div>
                </div>
                <div className="space-y-4 max-w-xl">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500">Error loading profile. Please try again later.</div>;
    }

    return (
        <div className="space-y-6">
            <Card className="shadow-none border-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                        Update your personal details and public profile.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                    <div className="flex items-center gap-6 mb-8">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={getProfileImageUrl(profile?.profilePicture)} alt={profile?.fullName} />
                            <AvatarFallback className="text-xl">
                                {profile?.fullName?.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="relative cursor-pointer overflow-hidden">
                                    Upload New Picture
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        disabled={uploadPictureMutation.isPending}
                                    />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    disabled={uploadPictureMutation.isPending}
                                >
                                    Remove
                                </Button>
                            </div>
                            {uploadPictureMutation.isPending && <p className="text-xs text-muted-foreground animate-pulse">Uploading...</p>}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
                        <div className="grid gap-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" {...register("fullName")} />
                            {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="flex gap-2">
                                <Input id="email" {...register("email")} disabled className="bg-muted flex-1" />
                                <Dialog open={isChangeEmailOpen} onOpenChange={(open) => {
                                    if (!open) {
                                        setNewEmail("");
                                        setOtp("");
                                        setEmailChangeStep("email");
                                    }
                                    setIsChangeEmailOpen(open);
                                }}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" type="button">Change</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Change Email Address</DialogTitle>
                                            <DialogDescription>
                                                {emailChangeStep === "email"
                                                    ? "Enter your new email address. We'll send you a verification code."
                                                    : `Enter the code sent to ${newEmail}`
                                                }
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="space-y-4 py-4">
                                            {emailChangeStep === "email" ? (
                                                <div className="grid gap-2">
                                                    <Label htmlFor="newEmail">New Email Address</Label>
                                                    <Input
                                                        id="newEmail"
                                                        placeholder="name@example.com"
                                                        value={newEmail}
                                                        onChange={(e) => setNewEmail(e.target.value)}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="grid gap-2">
                                                    <Label htmlFor="otp">Verification Code</Label>
                                                    <Input
                                                        id="otp"
                                                        placeholder="123456"
                                                        maxLength={6}
                                                        className="text-center text-lg tracking-widest"
                                                        value={otp}
                                                        onChange={(e) => setOtp(e.target.value)}
                                                    />
                                                    <p className="text-xs text-muted-foreground text-center">
                                                        Code expires in 10 minutes
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <DialogFooter className="flex-col sm:justify-between sm:flex-row gap-2">
                                            {emailChangeStep === "otp" && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => setEmailChangeStep("email")}
                                                    disabled={verifyEmailMutation.isPending}
                                                >
                                                    Back
                                                </Button>
                                            )}

                                            {emailChangeStep === "email" ? (
                                                <Button
                                                    type="button"
                                                    onClick={handleSendOtp}
                                                    isLoading={sendEmailOtpMutation.isPending}
                                                    className="w-full sm:w-auto ml-auto"
                                                >
                                                    Send Verification Code
                                                </Button>
                                            ) : (
                                                <div className="flex gap-2 w-full justify-end">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={handleSendOtp}
                                                        disabled={verifyEmailMutation.isPending || sendEmailOtpMutation.isPending}
                                                    >
                                                        Resend Code
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        onClick={handleVerifyOtp}
                                                        isLoading={verifyEmailMutation.isPending}
                                                    >
                                                        Verify & Change
                                                    </Button>
                                                </div>
                                            )}
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" {...register("phone")} />
                            {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="jobTitle">Job Title</Label>
                                <Input id="jobTitle" {...register("jobTitle")} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="companyName">Company Name</Label>
                                <Input id="companyName" {...register("companyName")} />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" isLoading={updateProfileMutation.isPending}>
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
