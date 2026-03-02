import { useRef, useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AxiosError } from "axios";
import type { LoginRequest } from "../API/LoginApi";
import type { SendOtpRequest } from "../API/RegisterApi";

import Screenshot from "../../../assets/images/Screenshot.png";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginQuery } from "../hooks/useLoginQuery";
import { useUserStore } from "@/utils/useUserStore";
import {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
} from "../hooks/useRegisterMutation";

// --------------------------
// ZOD SCHEMAS
// --------------------------
const passwordValidation = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(
    /[@$!%*?&]/,
    "Password must contain at least one special character (@$!%*?&)"
  );

const nameValidation = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must not exceed 50 characters")
  .regex(
    /^[a-zA-Z\s'-]+$/,
    "Name can only contain letters, spaces, hyphens, and apostrophes"
  )
  .refine((val) => val.trim().length >= 2, "Name cannot be only spaces");

const LoginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const SignupDetailsSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  fullName: nameValidation,
  password: passwordValidation,
});

const SignupOtpSchema = z.object({
  otp: z.string().min(1, "OTP is required"),
});

type SignupDetailsFormValues = z.infer<typeof SignupDetailsSchema>;
type SignupOtpFormValues = z.infer<typeof SignupOtpSchema>;

type ApiErrorResponse = {
  message?: string;
};

type SignupStep = "DETAILS" | "OTP";

export default function AuthPage() {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const reason = searchParams.get("reason");
    if (reason === "session_expired") {
      // Use setTimeout to ensure toast library is ready/mounted if needed, 
      // or just call it. sonner is usually global.
      toast.error("Your session has expired. Please log in again.");

      // Clear the query param to avoid showing it again if user refreshes
      navigate("/auth/login", { replace: true });
    }
  }, [searchParams, navigate]);

  const [isLogin, setIsLogin] = useState(true);
  const [signupStep, setSignupStep] = useState<SignupStep>("DETAILS");
  const [signupData, setSignupData] = useState<SendOtpRequest | null>(null);

  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { mutateAsync: mutateLogin, isPending: isLoginPending } = useLoginQuery();
  const { mutateAsync: mutateSendOtp, isPending: isSendOtpPending } = useSendOtpMutation();
  const { mutateAsync: mutateVerifyOtp, isPending: isVerifyOtpPending } = useVerifyOtpMutation();
  const { mutateAsync: mutateResendOtp, isPending: isResendOtpPending } = useResendOtpMutation();

  // Determine current schema
  const currentSchema = isLogin
    ? LoginSchema
    : signupStep === "OTP"
      ? SignupOtpSchema
      : SignupDetailsSchema;

  const form = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      otp: "",
    } as any,
    shouldUnregister: true, // Unregister fields not in DOM
  });

  const {
    register,
    handleSubmit,
    reset,
    formState,
  } = form;
  const errors = formState.errors as any; // Cast to any to handle dynamic schema union types

  // -------------------------
  // HELPERS
  // -------------------------
  const getErrorMessage = (error: unknown) => {
    if (error instanceof AxiosError) {
      const serverMessage = (error.response?.data as ApiErrorResponse)?.message;
      return (
        serverMessage ||
        "An error occurred. Please try again."
      );
    }
    if (error instanceof Error) {
      return error.message;
    }
    return "Something went wrong. Please try again.";
  };

  const handleToggle = () => {
    setIsLogin((prev) => !prev);
    setSignupStep("DETAILS");
    setSignupData(null);
    setAuthError(null);
    setAuthSuccess(null);
    reset(); // Reset form values
    navigate(isLogin ? "/auth/signup" : "/auth/login");
  };

  const handleResendOtp = async () => {
    if (!signupData?.email) return;
    setAuthError(null);
    setAuthSuccess(null);
    try {
      const response = await mutateResendOtp({ email: signupData.email });
      setAuthSuccess(response.message || "OTP sent successfully.");
    } catch (error) {
      setAuthError(getErrorMessage(error));
    }
  };

  // -------------------------
  // HANDLE FORM SUBMIT
  // -------------------------
  const onSubmit = async (data: any) => {
    setAuthError(null);
    setAuthSuccess(null);

    try {
      if (isLogin) {
        // --- LOGIN FLOW ---
        const loginPayload: LoginRequest = {
          email: data.email,
          password: data.password,
        };
        const response = await mutateLogin(loginPayload);

        // Update user store immediately with partial data from login response
        // This prevents race conditions in protected routes/RoleGuard
        const { setUser } = useUserStore.getState();
        setUser({
          ...response.user,
          createdAt: new Date().toISOString(), // Fallback for temporary state
        } as any);

        if (response.user.role === "ADMIN" || response.user.role === "SUPER_ADMIN") {
          navigate("/admin/dashboard");
        } else {
          navigate("/clients");
        }
      } else {
        // --- SIGNUP FLOW ---
        if (signupStep === "DETAILS") {
          // Step 1: Send OTP
          const details = data as SignupDetailsFormValues;
          const payload: SendOtpRequest = {
            email: details.email,
            password: details.password,
            fullName: details.fullName,
          };

          const response = await mutateSendOtp(payload);
          // Save data for next step
          setSignupData(payload);
          setSignupStep("OTP");
          setAuthSuccess(response.message || "OTP sent to your email.");
          // We keep the form values? No, we might want to clear them but we need to keep context? 
          // actually better to just rely on signupData state.
          // reset({ otp: "" }); // Reset OTP field if needed
        } else {
          // Step 2: Verify OTP
          if (!signupData) {
            setAuthError("Session expired. Please start over.");
            setSignupStep("DETAILS");
            return;
          }
          const otpVal = (data as SignupOtpFormValues).otp;

          await mutateVerifyOtp({
            email: signupData.email,
            otp: otpVal,
          });

          // On success, backend should return token & user.
          // useVerifyOtpMutation handles storage.
          // Navigate to signup details setup
          navigate("/auth/signup-details");
        }
      }
    } catch (error) {
      const message = getErrorMessage(error);
      setAuthError(message);
    }
  };

  const isPending = isLoginPending || isSendOtpPending || isVerifyOtpPending || isResendOtpPending;

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

        {/* Form Container */}
        <div className="w-full max-w-sm space-y-6">
          {/* Heading */}
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
              {isLogin
                ? "Welcome back"
                : signupStep === "DETAILS"
                  ? "Create an account"
                  : "Verify your Email"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isLogin
                ? "Enter your email below to log in"
                : signupStep === "DETAILS"
                  ? "Enter your details below to create your account"
                  : `We sent a code to ${signupData?.email || "your email"}`}
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>

            {/* LOGIN or SIGNUP DETAILS fields */}
            {(isLogin || signupStep === "DETAILS") && (
              <>
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    {...register("email")}
                    className="px-4 py-6 rounded-[0.4rem]"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email.message as string}</p>
                  )}
                </div>

                {/* Full Name (Signup only) */}
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      {...register("fullName" as any)}
                      className="px-4 py-6 rounded-[0.4rem]"
                      autoComplete="name"
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-500">
                        {errors.fullName.message as string}
                      </p>
                    )}
                    {!errors.fullName && (
                      <p className="text-xs text-muted-foreground">
                        Enter your full name (2-50 characters, letters only)
                      </p>
                    )}
                  </div>
                )}

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {isLogin && (
                      <Link
                        to="/auth/forgot-password"
                        className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                      >
                        Forgot Password?
                      </Link>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("password")}
                      className="px-4 py-6 rounded-[0.4rem] pr-10"
                      autoComplete={isLogin ? "current-password" : "new-password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500">
                      {errors.password.message as string}
                    </p>
                  )}
                  {!isLogin && !errors.password && (
                    <p className="text-xs text-muted-foreground">
                      Must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)
                    </p>
                  )}
                </div>
              </>
            )}

            {/* OTP Fields */}
            {!isLogin && signupStep === "OTP" && (
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  {...register("otp")}
                  className="px-4 py-6 rounded-[0.4rem] tracking-widest text-center text-lg"
                  autoComplete="off"
                  maxLength={6}
                />
                {errors.otp && (
                  <p className="text-xs text-red-500">
                    {errors.otp.message as string}
                  </p>
                )}

                {/* Resend OTP */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResendOtpPending}
                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 disabled:opacity-50"
                  >
                    {isResendOtpPending ? "Sending..." : "Resend OTP"}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="ghost"
              className="w-full px-4 py-6 rounded-[0.4rem] font-medium
                         !text-white bg-gradient-to-bl from-black via-zinc-900 to-zinc-400
                         transition duration-700 ease-in-out
                         hover:bg-black hover:brightness-110 active:brightness-95"
              isLoading={isPending}
              disabled={isPending}
            >
              {isLogin
                ? "Sign in with Email"
                : signupStep === "DETAILS"
                  ? "Sign up with Email"
                  : "Verify Email"}
            </Button>

            {/* Error Message */}
            {authError && (
              <p
                className="text-sm text-red-500 text-center"
                role="alert"
                aria-live="polite"
              >
                {authError}
              </p>
            )}

            {/* Success Message */}
            {authSuccess && (
              <p
                className="text-sm text-green-500 text-center"
                role="alert"
                aria-live="polite"
              >
                {authSuccess}
              </p>
            )}
          </form>


          {/* Toggle Login/Signup */}
          {/* Only show if not in OTP step, or provide a way to go back */}
          {signupStep !== "OTP" ? (
            <p className="px-4 text-center text-xs text-muted-foreground">
              {isLogin ? (
                <>
                  Don’t have an account?{" "}
                  <button
                    type="button"
                    onClick={handleToggle}
                    className="underline underline-offset-2 text-foreground hover:text-primary"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={handleToggle}
                    className="underline underline-offset-2 text-foreground hover:text-primary"
                  >
                    Log in
                  </button>
                </>
              )}
            </p>
          ) : (
            <p className="px-4 text-center text-xs text-muted-foreground">
              <button
                type="button"
                onClick={() => setSignupStep("DETAILS")}
                className="underline underline-offset-2 text-foreground hover:text-primary"
              >
                Back to details
              </button>
            </p>
          )}

          {/* Policies */}
          <p className="px-4 text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link
              to="/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>

      {/* ------------- RIGHT SECTION (DESKTOP ONLY) ------------- */}
      <div className="hidden md:flex relative flex-col justify-between  w-1/2 p-10 rounded-l-2xl text-muted-foreground bg-gradient-to-bl from-black via-zinc-900 to-zinc-700 overflow-hidden">
        <img
          ref={imgRef}
          src={Screenshot}
          alt="Preview Screenshot"
          className="absolute top-1/2 right-[-10rem] w-[68rem] -translate-y-1/2
                      shadow-2xl rounded-2xl p-2 z-0 bg-gradient-to-bl from-black via-zinc-900 to-zinc-700
"
        />

        <blockquote className="relative mt-auto text-sm md:text-base italic text-accent z-10">
          “This platform gives me a complete view of all my client metrics in one place. Reporting that used to take hours now takes minutes.”
          <br />
          <span className="mt-2 block not-italic text-muted-foreground font-medium">
            – Digital Marketing Manager
          </span>
        </blockquote>

      </div>
    </div>
  );
}
