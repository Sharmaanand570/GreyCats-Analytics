import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MoveLeft, Home, Copy, Check } from "lucide-react";
import { useUserStore } from "@/utils/useUserStore";

/**
 * SHADCN-UI INSPIRED COMPONENTS (Inline for portability)
 */

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline" | "ghost" | "link";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: " text-black hover:bg-zinc-200 shadow-sm",
    outline:
      "border border-zinc-800 bg-transparent hover:bg-zinc-900 text-zinc-100",
    ghost: "hover:bg-zinc-800 text-zinc-300 hover:text-white",
    link: "text-zinc-100 underline-offset-4 hover:underline",
  };

  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 h-10 px-8 py-2 ${
        variants[variant]
      } ${className || ""}`}
      {...props}
    />
  );
});
Button.displayName = "Button";

const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: "horizontal" | "vertical";
  }
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <div
    ref={ref}
    className={`shrink-0 bg-zinc-800 ${
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]"
    } ${className || ""}`}
    {...props}
  />
));
Separator.displayName = "Separator";

/**
 * MAIN 404 PAGE COMPONENT
 */

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { setPageNotFound } = useUserStore();
  // const location = useLocation();
  // const prevIndex = useRef(window.history.state?.idx);

  // Handle subtle background parallax/gradient movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    setPageNotFound(true);
  }, [setPageNotFound]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`Error Code: 404 - Page Not Found`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    setPageNotFound(false);
    navigate(-1);
  };

  return (
    <div className="min-h-screen  bg-black text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white flex flex-col relative overflow-hidden">
      {/* Subtle Grid Background */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          transform: `translate(${mousePosition.x * 10}px, ${
            mousePosition.y * 10
          }px)`,
        }}
      />

      {/* Radial Gradient Glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 50%)`,
        }}
      />

      {/* Navigation Header */}
      <header className="relative z-10 w-full p-6 md:p-10 flex justify-between items-center">
        <div
          className="flex items-center gap-2 group cursor-pointer"
          onClick={handleGoHome}
        >
          <div className="flex items-center space-x-2 text-foreground">
            <span className="text-xl font-semibold">⌘</span>
            <span className="font-medium">GreyCats</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-6 text-center">
        {/* Error Code Display */}
        <div className="relative mb-8 group">
          <h1 className="text-[120px] md:text-[180px] font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-zinc-100 to-zinc-600 select-none">
            404
          </h1>
          {/* Decorative line through text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[1px] bg-zinc-800 rotate-[-15deg] group-hover:rotate-0 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]" />
        </div>

        <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white">
              Page not found
            </h2>
            <p className="text-zinc-500 text-sm md:text-base leading-relaxed">
              The page you are looking for doesn't exist or has been moved.
              Please verify the URL or navigate back home.
            </p>
          </div>

          <Separator className="bg-zinc-900" />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              className="w-full sm:w-auto gap-2 group"
              onClick={handleGoHome}
            >
              <Home className="w-4 h-4" />
              Return Home
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto gap-2 group"
              onClick={handleGoBack}
            >
              <MoveLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </Button>
          </div>

          {/* Technical Details (Minimal) */}
          <div className="pt-8">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors border border-dashed border-zinc-900 hover:border-zinc-800 px-3 py-1 rounded-full"
            >
              <span>Error Ref: 0x404_NOT_FOUND</span>
              {copied ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full p-6 md:p-10 border-t border-zinc-900/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
          <div className="flex items-center gap-4">
            <span>&copy; {new Date().getFullYear()} GreyCats</span>
            <span className="hidden md:inline text-zinc-800">|</span>
            <a href="#" className="hover:text-zinc-400">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-zinc-400">
              Status
            </a>
          </div>
          <div className="flex items-center gap-1 group cursor-pointer hover:text-zinc-400 transition-colors">
            <span>System Status: Operational</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-2 animate-pulse" />
          </div>
        </div>
      </footer>
    </div>
  );
}
