import { useRef, useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AxiosError } from "axios";
import Screenshot from "../../../assets/images/Screenshot.png";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    useSendOtp,
    useVerifyOtp,
    useResendOtp,
    useResetPassword,
} from "../hooks/useForgotPassword";

// --------------------------
// ZOD SCHEMAS
// --------------------------
const passwordValidation = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)");

const Step1Schema = z.object({
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

const Step2Schema = z.object({
    otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

const Step3Schema = z
    .object({
        newPassword: passwordValidation,
        confirmPassword: z.string().min(1, "Confirm Password is required"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type Step1Values = z.infer<typeof Step1Schema>;
type Step2Values = z.infer<typeof Step2Schema>;
type Step3Values = z.infer<typeof Step3Schema>;

export default function ForgotPassword() {
    const imgRef = useRef<HTMLImageElement | null>(null);
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(""); // Kept for state tracking, used in step 2 submission immediately
    const [authError, setAuthError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Hooks
    const { mutateAsync: sendOtp, isPending: isSendingOtp } = useSendOtp();
    const { mutateAsync: verifyOtp, isPending: isVerifyingOtp } = useVerifyOtp();
    const { mutateAsync: resendOtp, isPending: isResendingOtp } = useResendOtp();
    const { mutateAsync: resetPassword, isPending: isResettingPassword } = useResetPassword();

    // Step 1 Form
    const form1 = useForm<Step1Values>({
        resolver: zodResolver(Step1Schema),
        defaultValues: { email: "" },
    });

    // Step 2 Form
    const form2 = useForm<Step2Values>({
        resolver: zodResolver(Step2Schema),
        defaultValues: { otp: "" },
    });

    // Step 3 Form
    const form3 = useForm<Step3Values>({
        resolver: zodResolver(Step3Schema),
        defaultValues: { newPassword: "", confirmPassword: "" },
    });

    const getErrorMessage = (error: unknown) => {
        if (error instanceof AxiosError) {
            return error.response?.data?.message || "An error occurred. Please try again.";
        }
        if (error instanceof Error) {
            return error.message;
        }
        return "Something went wrong. Please try again.";
    };

    // Handlers
    const onStep1Submit = async (data: Step1Values) => {
        setAuthError(null);
        setSuccessMessage(null);
        try {
            const response = await sendOtp({ email: data.email });
            if (response.success) {
                setEmail(data.email);
                setStep(2);
                setSuccessMessage("OTP sent to your email.");
            } else {
                setAuthError(response.message);
            }
        } catch (error) {
            setAuthError(getErrorMessage(error));
        }
    };

    const onStep2Submit = async (data: Step2Values) => {
        setAuthError(null);
        setSuccessMessage(null);
        try {
            const response = await verifyOtp({ email, otp: data.otp });
            if (response.success) {
                setOtp(data.otp);
                setStep(3);
                setSuccessMessage("OTP verified successfully.");
            } else {
                setAuthError(response.message);
            }
        } catch (error) {
            setAuthError(getErrorMessage(error));
        }
    };

    const onResendOtp = async () => {
        setAuthError(null);
        setSuccessMessage(null);
        try {
            const response = await resendOtp({ email });
            if (response.success) {
                setSuccessMessage("New OTP sent to your email.");
            } else {
                setAuthError(response.message);
            }
        } catch (error) {
            setAuthError(getErrorMessage(error));
        }
    };

    const onStep3Submit = async (data: Step3Values) => {
        setAuthError(null);
        setSuccessMessage(null);
        try {
            const response = await resetPassword({
                email,
                otp,
                newPassword: data.newPassword,
            });
            if (response.success) {
                setSuccessMessage("Password updated successfully. Redirecting to login...");
                setTimeout(() => {
                    navigate("/auth/login");
                }, 2000);
            } else {
                setAuthError(response.message);
            }
        } catch (error) {
            setAuthError(getErrorMessage(error));
        }
    };

    const isLoading = isSendingOtp || isVerifyingOtp || isResettingPassword;

    return (
        <div className="flex flex-col py-4 md:flex-row w-full min-h-screen overflow-hidden bg-background">
            {/* ------------- LEFT AUTH SECTION ------------- */}
            <div className="relative flex flex-col items-center justify-center w-full md:w-1/2 px-6 md:px-16 py-12">
                {/* Logo */}
                <div className="absolute top-4 left-6 md:top-6 md:left-10">
                    <div className="flex items-center space-x-2 text-foreground">
                        <span className="text-xl font-semibold">⌘</span>
                        <span className="font-medium">GreyCats</span>
                    </div>
                </div>

                {/* Back to Login only visible on Step 1 */}
                {step === 1 && (
                    <Link
                        to="/auth/login"
                        className="absolute top-4 right-6 md:top-6 md:right-10 flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Login
                    </Link>
                )}

                {/* Form Container */}
                <div className="w-full max-w-sm space-y-6">
                    {/* Heading */}
                    <div className="space-y-2 text-center md:text-left">
                        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                            {step === 1 && "Forgot Password"}
                            {step === 2 && "Enter OTP"}
                            {step === 3 && "Reset Password"}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {step === 1 && "Enter your email to receive a password reset OTP"}
                            {step === 2 && `We sent a 6-digit code to ${email}`}
                            {step === 3 && "Create a new secure password for your account"}
                        </p>
                    </div>

                    {/* STEP 1: EMAIL */}
                    {step === 1 && (
                        <form className="space-y-4" onSubmit={form1.handleSubmit(onStep1Submit)}>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    {...form1.register("email")}
                                    className="px-4 py-6 rounded-[0.4rem]"
                                    autoComplete="email"
                                    maxLength={256}
                                />
                                {form1.formState.errors.email && (
                                    <p className="text-xs text-red-500">{form1.formState.errors.email.message}</p>
                                )}
                            </div>
                            <Button
                                type="submit"
                                variant="ghost"
                                className="w-full px-4 py-6 rounded-[0.4rem] font-medium
                         !text-white bg-gradient-to-bl from-black via-zinc-900 to-zinc-400
                         transition duration-700 ease-in-out
                         hover:bg-black hover:brightness-110 active:brightness-95"
                                isLoading={isLoading}
                                disabled={isLoading}
                            >
                                Send OTP
                            </Button>
                        </form>
                    )}

                    {/* STEP 2: OTP */}
                    {step === 2 && (
                        <form className="space-y-4" onSubmit={form2.handleSubmit(onStep2Submit)}>
                            <div className="space-y-2">
                                <Label htmlFor="otp">One-Time Password</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="123456"
                                    maxLength={6}
                                    {...form2.register("otp")}
                                    className="px-4 py-6 rounded-[0.4rem] tracking-widest text-center text-lg"
                                    autoComplete="one-time-code"
                                />
                                {form2.formState.errors.otp && (
                                    <p className="text-xs text-red-500">{form2.formState.errors.otp.message}</p>
                                )}
                            </div>
                            <Button
                                type="submit"
                                variant="ghost"
                                className="w-full px-4 py-6 rounded-[0.4rem] font-medium
                         !text-white bg-gradient-to-bl from-black via-zinc-900 to-zinc-400
                         transition duration-700 ease-in-out
                         hover:bg-black hover:brightness-110 active:brightness-95"
                                isLoading={isLoading}
                                disabled={isLoading}
                            >
                                Verify OTP
                            </Button>
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={onResendOtp}
                                    disabled={isResendingOtp}
                                    className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 disabled:opacity-50"
                                >
                                    {isResendingOtp ? "Resending..." : "Resend OTP"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* STEP 3: NEW PASSWORD */}
                    {step === 3 && (
                        <form className="space-y-4" onSubmit={form3.handleSubmit(onStep3Submit)}>
                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        {...form3.register("newPassword")}
                                        className="px-4 py-6 rounded-[0.4rem] pr-10"
                                        autoComplete="new-password"
                                        maxLength={100}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {form3.formState.errors.newPassword && (
                                    <p className="text-xs text-red-500">{form3.formState.errors.newPassword.message}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Must be at least 8 characters with uppercase, lowercase, number, and special character
                                </p>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        {...form3.register("confirmPassword")}
                                        className="px-4 py-6 rounded-[0.4rem] pr-10"
                                        autoComplete="new-password"
                                        maxLength={100}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {form3.formState.errors.confirmPassword && (
                                    <p className="text-xs text-red-500">{form3.formState.errors.confirmPassword.message}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                variant="ghost"
                                className="w-full px-4 py-6 rounded-[0.4rem] font-medium
                         !text-white bg-gradient-to-bl from-black via-zinc-900 to-zinc-400
                         transition duration-700 ease-in-out
                         hover:bg-black hover:brightness-110 active:brightness-95"
                                isLoading={isLoading}
                                disabled={isLoading}
                            >
                                Reset Password
                            </Button>
                        </form>
                    )}

                    {/* Messages */}
                    {authError && (
                        <p className="text-sm text-red-500 text-center" role="alert">
                            {authError}
                        </p>
                    )}
                    {successMessage && (
                        <p className="text-sm text-green-500 text-center" role="alert">
                            {successMessage}
                        </p>
                    )}

                </div>
            </div>

            {/* ------------- RIGHT SECTION (DESKTOP ONLY) ------------- */}
            <div className="hidden md:flex relative flex-col justify-between w-1/2 p-10 rounded-l-2xl text-muted-foreground bg-gradient-to-bl from-black via-zinc-900 to-zinc-700 overflow-hidden">
                <img
                    ref={imgRef}
                    src={Screenshot}
                    alt="Preview Screenshot"
                    className="absolute top-1/2 right-[-12rem] w-[68rem] -translate-y-1/2
                     bg-white shadow-2xl rounded-2xl p-4 z-0"
                />

                <blockquote className="relative mt-auto text-sm md:text-base italic text-accent z-10">
                    “This library has saved me countless hours of work and helped me
                    deliver stunning designs to my clients faster than ever before.”
                    <br />
                    <span className="mt-2 block not-italic text-muted-foreground font-medium">
                        – Sofia Davis
                    </span>
                </blockquote>
            </div>
        </div>
    );
}
