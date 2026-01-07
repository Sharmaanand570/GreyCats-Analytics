import { useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AxiosError } from "axios";
import type { LoginRequest } from "../API/LoginApi";
import type { RegisterRequest } from "../API/RegisterApi";

import Screenshot from "../../../assets/images/Screenshot.png";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginQuery } from "../hooks/useLoginQuery";
import { useRegisterMutation } from "../hooks/useRegisterMutation";

// --------------------------
// ZOD SCHEMAS
// --------------------------
// Strong password validation: at least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
const passwordValidation = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(
    /[a-z]/,
    "Password must contain at least one lowercase letter"
  )
  .regex(
    /[A-Z]/,
    "Password must contain at least one uppercase letter"
  )
  .regex(/\d/, "Password must contain at least one number")
  .regex(
    /[@$!%*?&]/,
    "Password must contain at least one special character (@$!%*?&)"
  );

// Name validation: 2-50 characters, letters, spaces, hyphens, and apostrophes only
const nameValidation = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must not exceed 50 characters")
  .regex(
    /^[a-zA-Z\s'-]+$/,
    "Name can only contain letters, spaces, hyphens, and apostrophes"
  )
  .refine(
    (val) => val.trim().length >= 2,
    "Name cannot be only spaces"
  );

const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const SignupSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  fullName: nameValidation,
  password: passwordValidation,
});

type LoginFormValues = z.infer<typeof LoginSchema>;
type SignupFormValues = z.infer<typeof SignupSchema>;
type AuthFormValues = LoginFormValues | SignupFormValues;

type ApiErrorResponse = {
  message?: string;
};

export default function AuthPage() {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { mutateAsync: mutateLogin, isPending: isLoginPending } =
    useLoginQuery();
  const { mutateAsync: mutateSignup, isPending: isSignupPending } =
    useRegisterMutation();

  // Dynamically switch schema
  const form = useForm({
    resolver: zodResolver(isLogin ? LoginSchema : SignupSchema),
    defaultValues: isLogin
      ? {
        email: "",
        password: "",
      }
      : {
        email: "",
        password: "",
        fullName: "",
      },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  // -------------------------
  // HANDLE FORM SUBMIT
  // -------------------------
  const getErrorMessage = (error: unknown) => {
    if (error instanceof AxiosError) {
      const serverMessage = (error.response?.data as ApiErrorResponse)?.message;
      return (
        serverMessage ||
        "Unable to sign in. Please check your credentials and try again."
      );
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "Something went wrong. Please try again.";
  };

  const onSubmit = async (data: AuthFormValues) => {
    setAuthError(null);

    try {
      console.log("FORM DATA:", data);
      if (isLogin) {
        const loginPayload: LoginRequest = {
          email: data.email,
          password: data.password,
        };
        const response = await mutateLogin(loginPayload);
        console.log("Login successful:", response);
      } else {
        const signupData = data as SignupFormValues;
        const registerPayload: RegisterRequest = {
          email: signupData.email,
          password: signupData.password,
          fullName: signupData.fullName,
        };
        const response = await mutateSignup(registerPayload);
        console.log("Signup successful:", response);
      }
      navigate("/");
    } catch (error) {
      const message = getErrorMessage(error);
      setAuthError(message);
      console.error("Login failed:", error);
    }

    if (isLogin) {
      console.log("Login Request");
    } else {
      console.log("Signup Request");
    }
  };

  const handleToggle = () => {
    setIsLogin((prev) => !prev);
    setAuthError(null);
    navigate(isLogin ? "/auth/signup" : "/auth/login");
  };

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
              {isLogin ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isLogin
                ? "Enter your email below to log in"
                : "Enter your details below to create your account"}
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Signup only — Full Name */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  {...register("fullName")}
                  className="px-4 py-6 rounded-[0.4rem]"
                  autoComplete="name"
                />
                {errors.fullName && (
                  <p className="text-xs text-red-500">
                    {errors.fullName.message}
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
              <Label htmlFor="password">Password</Label>
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
                  {errors.password.message}
                </p>
              )}
              {!isLogin && !errors.password && (
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="ghost"
              className="w-full px-4 py-6 rounded-[0.4rem] font-medium
                         !text-white bg-gradient-to-bl from-black via-zinc-900 to-zinc-400
                         transition duration-700 ease-in-out
                         hover:bg-black hover:brightness-110 active:brightness-95"
              isLoading={isLogin ? isLoginPending : isSignupPending}
              disabled={isLogin ? isLoginPending : isSignupPending}
            >
              {isLogin
                ? "Sign in with Email"
                : "Sign up with Email"}
            </Button>
            {authError && (
              <p
                className="text-sm text-red-500 text-center"
                role="alert"
                aria-live="polite"
              >
                {authError}
              </p>
            )}
          </form>

          {/* Separator - Hidden */}
          {/* <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div> */}

          {/* Google - Hidden */}
          {/* <Button
            variant="outline"
            className="w-full px-4 py-6 rounded-[0.4rem] flex items-center justify-center gap-2"
          >
            <FaGoogle className="h-4 w-4" />
            Google
          </Button> */}

          {/* Toggle Login/Signup */}
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

          {/* Policies */}
          <p className="px-4 text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link to="#" className="underline underline-offset-2">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="#" className="underline underline-offset-2">
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
