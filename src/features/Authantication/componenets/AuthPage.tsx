import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { AuthForm } from "./AuthForm";
import Screenshot from "../../../assets/images/Screenshot.png";

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const reason = searchParams.get("reason");
    if (reason === "session_expired") {
      toast.error("Your session has expired. Please log in again.");
      navigate("/auth/login", { replace: true });
    }
  }, [searchParams, navigate]);

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
        <AuthForm initialMode={window.location.pathname.includes("signup") ? "signup" : "login"} />

        {/* Policies — Footer style as in original */}
        <div className="mt-8 space-y-4 w-full max-w-sm">
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
      <div className="hidden md:flex relative flex-col justify-between w-1/2 p-10 rounded-l-2xl text-muted-foreground bg-gradient-to-bl from-black via-zinc-900 to-zinc-700 overflow-hidden">
        <img
          src={Screenshot}
          alt="Preview Screenshot"
          className="absolute top-1/2 right-[-10rem] w-[68rem] -translate-y-1/2 shadow-2xl rounded-2xl p-2 z-0 bg-gradient-to-bl from-black via-zinc-900 to-zinc-700"
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
