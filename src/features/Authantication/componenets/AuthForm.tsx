import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AxiosError } from "axios";
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
import type { LoginRequest } from "../API/LoginApi";
import type { SendOtpRequest } from "../API/RegisterApi";

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
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the Terms of Service and Privacy Policy to continue",
  }),
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

interface AuthFormProps {
  initialMode?: "login" | "signup";
  onAuthSuccess?: (user: any) => void;
  disableNavigation?: boolean;
}

export function AuthForm({ 
  initialMode = "login", 
  onAuthSuccess, 
  disableNavigation = false 
}: AuthFormProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [signupStep, setSignupStep] = useState<SignupStep>("DETAILS");
  const [signupData, setSignupData] = useState<SendOtpRequest | null>(null);

  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { mutateAsync: mutateLogin, isPending: isLoginPending } = useLoginQuery();
  const { mutateAsync: mutateSendOtp, isPending: isSendOtpPending } = useSendOtpMutation();
  const { mutateAsync: mutateVerifyOtp, isPending: isVerifyOtpPending } = useVerifyOtpMutation();
  const { mutateAsync: mutateResendOtp, isPending: isResendOtpPending } = useResendOtpMutation();

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
      termsAccepted: false,
    } as any,
    shouldUnregister: true,
  });

  const { register, handleSubmit, reset, formState } = form;
  const errors = formState.errors as any;

  const getErrorMessage = (error: unknown) => {
    if (error instanceof AxiosError) {
      const serverMessage = (error.response?.data as ApiErrorResponse)?.message;
      return serverMessage || "An error occurred. Please try again.";
    }
    if (error instanceof Error) return error.message;
    return "Something went wrong. Please try again.";
  };

  const handleToggle = () => {
    setIsLogin((prev) => !prev);
    setSignupStep("DETAILS");
    setSignupData(null);
    setAuthError(null);
    setAuthSuccess(null);
    reset();
    
    if (!disableNavigation) {
      const currentSearch = searchParams.toString();
      const suffix = currentSearch ? `?${currentSearch}` : "";
      navigate(isLogin ? `/auth/signup${suffix}` : `/auth/login${suffix}`);
    }
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

  const onSubmit = async (data: any) => {
    setAuthError(null);
    setAuthSuccess(null);

    try {
      if (isLogin) {
        const loginPayload: LoginRequest = {
          email: data.email,
          password: data.password,
          ...(searchParams.get("inviteToken") ? { inviteToken: searchParams.get("inviteToken")! } : {}),
        };
        const response = await mutateLogin(loginPayload);

        const { setUser } = useUserStore.getState();
        const userData = {
          ...response.user,
          createdAt: new Date().toISOString(),
        };
        setUser(userData as any);

        if (onAuthSuccess) {
          onAuthSuccess(userData);
        }

        if (!disableNavigation) {
          if (response.user.role === "ADMIN" || response.user.role === "SUPER_ADMIN") {
            navigate("/admin/dashboard");
          } else {
            const redirect = searchParams.get("redirect");
            if (redirect) {
              const url = new URL(redirect, window.location.origin);
              for (const [key, value] of searchParams.entries()) {
                if (key !== "redirect" && key !== "reason") url.searchParams.set(key, value);
              }
              navigate(url.pathname + url.search, { replace: true });
            } else {
              navigate("/clients");
            }
          }
        }
      } else {
        if (signupStep === "DETAILS") {
          const details = data as SignupDetailsFormValues;
          const payload: SendOtpRequest = {
            email: details.email,
            password: details.password,
            fullName: details.fullName,
            ...(searchParams.get("inviteToken") ? { inviteToken: searchParams.get("inviteToken")! } : {}),
          };
          const response = await mutateSendOtp(payload);
          setSignupData(payload);
          setSignupStep("OTP");
          setAuthSuccess(response.message || "OTP sent to your email.");
        } else {
          if (!signupData) {
            setAuthError("Session expired. Please start over.");
            setSignupStep("DETAILS");
            return;
          }
          const otpVal = (data as SignupOtpFormValues).otp;
          const response = await mutateVerifyOtp({
            email: signupData.email,
            otp: otpVal,
            ...(searchParams.get("inviteToken") ? { inviteToken: searchParams.get("inviteToken")! } : {}),
          });

          const { setUser } = useUserStore.getState();
          const userData = {
            ...response.user,
            createdAt: new Date().toISOString(),
            role: "USER",
          };
          setUser(userData as any);

          if (onAuthSuccess) {
            onAuthSuccess(response.user);
          }

          if (!disableNavigation) {
            const redirect = searchParams.get("redirect");
            if (redirect) {
              const url = new URL(redirect, window.location.origin);
              for (const [key, value] of searchParams.entries()) {
                if (key !== "redirect" && key !== "reason") url.searchParams.set(key, value);
              }
              sessionStorage.setItem("postSignupRedirect", url.pathname + url.search);
            }
            navigate("/auth/signup-details");
          }
        }
      }
    } catch (error) {
      setAuthError(getErrorMessage(error));
    }
  };

  const isPending = isLoginPending || isSendOtpPending || isVerifyOtpPending || isResendOtpPending;

  return (
    <div className="w-full max-w-sm space-y-6">
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

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {(isLogin || signupStep === "DETAILS") && (
          <>
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
              </div>
            )}

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
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <div className="flex items-start gap-2">
                  <input
                    id="termsAccepted"
                    type="checkbox"
                    {...register("termsAccepted" as any)}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-foreground"
                  />
                  <label htmlFor="termsAccepted" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                    I agree to the{" "}
                    <Link
                      to="/terms-of-service"
                      target="_blank"
                      className="underline underline-offset-2 hover:text-foreground"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy-policy"
                      target="_blank"
                      className="underline underline-offset-2 hover:text-foreground"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.termsAccepted && (
                  <p className="text-xs text-red-500">
                    {errors.termsAccepted.message as string}
                  </p>
                )}
              </div>
            )}
          </>
        )}

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

        <Button
          type="submit"
          className="w-full px-4 py-6 rounded-[0.4rem] font-medium !text-white bg-gradient-to-bl from-black via-zinc-900 to-zinc-400 hover:bg-black transition duration-700"
          isLoading={isPending}
        >
          {isLogin
            ? "Sign in with Email"
            : signupStep === "DETAILS"
              ? "Sign up with Email"
              : "Verify Email"}
        </Button>

        {authError && <p className="text-sm text-red-500 text-center">{authError}</p>}
        {authSuccess && <p className="text-sm text-green-500 text-center">{authSuccess}</p>}
      </form>

      {signupStep !== "OTP" ? (
        <p className="px-4 text-center text-xs text-muted-foreground">
          {isLogin ? (
            <>
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={handleToggle}
                className="underline underline-offset-2 text-foreground"
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
                className="underline underline-offset-2 text-foreground"
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
            className="underline underline-offset-2 text-foreground"
          >
            Back to details
          </button>
        </p>
      )}
    </div>
  );
}
