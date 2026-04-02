import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ParticleBackground from "@/components/ParticleBackground";
import logoBlack from "@/assets/images/greycats-black-logo.png";
import { usePlansQuery } from "@/hooks/subscription/usePlansQuery";
import { useSubscriptionQuery } from "@/hooks/subscription/useSubscriptionQuery";
import { PricingCard } from "@/components/subscription/PricingCard";
import { PricingTable } from "@/components/subscription/PricingTable";
import type { Plan } from "@/types/subscription.types";
import {
  Loader2,
  ChevronDown,
  ArrowRight,
  Menu,
  X,
  Lock,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { isAuthenticated, StorageKey } from "@/utils/storage";

export default function PricingPage() {
  const { data: plans, isLoading: plansLoading } = usePlansQuery();
  const { data: subscriptionData } = useSubscriptionQuery();
  const [showTable, setShowTable] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const authed = isAuthenticated(StorageKey.ANALYTICS_TOKEN);
  const currentPlanName = subscriptionData?.plan?.planName;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, rgba(66, 133, 244, 0.05), transparent 40%)`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-revealed");
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    document.querySelectorAll(".reveal-on-scroll").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Auto-trigger checkout when returning from auth with a pending planId
  const handleSelectPlanById = useCallback(
    (planId: number) => {
      const plan = plans?.find((p) => p.id === planId);
      if (plan) handleSelectPlan(plan);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plans]
  );

  useEffect(() => {
    const pendingPlanId = searchParams.get("planId");
    if (!pendingPlanId || !authed || !plans?.length) return;

    // Clear the param so it doesn't re-trigger
    setSearchParams((prev) => {
      prev.delete("planId");
      return prev;
    }, { replace: true });

    handleSelectPlanById(Number(pendingPlanId));
  }, [authed, plans, searchParams, setSearchParams, handleSelectPlanById]);

  const handleSelectPlan = (plan: Plan) => {
    if (plan.name.toLowerCase() === "enterprise") {
      window.open("mailto:sales@greycats.tech?subject=Enterprise Plan Inquiry", "_blank");
      return;
    }
    navigate(`/checkout?planId=${plan.id}`);
  };

  return (
    <div className="min-h-screen bg-white text-[#111] font-sans selection:bg-[#4285F4] selection:text-white overflow-x-hidden relative">
      {/* Mouse particle background */}
      <ParticleBackground />

      {/* Mouse spotlight */}
      <div
        ref={spotlightRef}
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300"
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .bg-grid-dots {
          background-image: radial-gradient(#e5e5e5 1px, transparent 1px);
          background-size: 30px 30px;
        }
        .reveal-on-scroll {
          opacity: 0;
          transform: translateY(40px);
          transition: all 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-on-scroll.is-revealed {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      {/* ── Sticky Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-[#e5e5e5] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoBlack} alt="GreyCats" className="h-8 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/pricing" className="text-sm font-semibold text-[#111]">Plans</Link>
            <Link to="/contact" className="text-sm font-semibold text-[#666] hover:text-[#111] transition-colors">Support</Link>
            <div className="flex items-center gap-2">
              {authed ? (
                <button
                  onClick={() => navigate("/clients")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full bg-[#111] text-white hover:bg-[#333] transition-all duration-300"
                >
                  Dashboard <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <Link to="/auth/login" className="px-4 py-2 text-sm font-semibold text-[#111] hover:text-[#4285F4] transition-colors">
                    Sign in
                  </Link>
                  <Link
                    to="/auth/signup"
                    className="px-5 py-2.5 text-sm font-semibold rounded-full bg-[#4285F4] hover:bg-[#3367D6] text-white transition-all duration-300 shadow-md shadow-blue-500/10"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>

          <button className="md:hidden text-[#111]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* ── Mobile Nav ── */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-md pt-24 px-6 flex flex-col gap-6">
          <Link to="/pricing" onClick={() => setIsMenuOpen(false)} className="text-2xl font-bold text-[#111]">Plans</Link>
          <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-2xl font-bold text-[#111]">Support</Link>
          <div className="h-px w-full bg-[#e5e5e5] my-2" />
          {authed ? (
            <button
              onClick={() => { navigate("/clients"); setIsMenuOpen(false); }}
              className="w-full py-4 text-lg font-semibold rounded-full bg-[#111] text-white"
            >
              Go to Dashboard
            </button>
          ) : (
            <div className="flex flex-col gap-4">
              <Link to="/auth/login" onClick={() => setIsMenuOpen(false)} className="w-full py-4 text-lg font-semibold rounded-full border border-[#111] text-[#111] text-center">
                Sign in
              </Link>
              <Link to="/auth/signup" onClick={() => setIsMenuOpen(false)} className="w-full py-4 text-lg font-semibold rounded-full bg-[#4285F4] text-white text-center">
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── Hero ── */}
      <section className="relative pt-36 pb-16 px-6 text-center overflow-hidden">
        <div
          className="absolute inset-0 bg-grid-dots opacity-50 pointer-events-none"
          style={{
            WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent)",
            maskImage: "linear-gradient(to bottom, black 60%, transparent)",
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-50/60 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-[#111] bg-white text-[10px] font-bold text-[#111] uppercase tracking-[0.3em]">
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-[4rem] font-medium tracking-tighter text-[#111] leading-tight">
            Choose the plan that fits{" "}
            <span className="text-[#4285F4]">your growth</span>
          </h1>
          <p className="text-lg md:text-xl text-[#666] max-w-xl mx-auto font-light leading-relaxed">
            Start free with a 15-day trial. No credit card required. Upgrade
            anytime as your agency scales.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
            {[
              { icon: <CheckCircle2 className="w-4 h-4 text-[#34A853]" />, label: "No credit card required" },
              { icon: <Lock className="w-4 h-4 text-[#4285F4]" />, label: "Cancel anytime" },
              { icon: <ShieldCheck className="w-4 h-4 text-[#FBBC05]" />, label: "Secure & encrypted" },
            ].map((b) => (
              <span key={b.label} className="flex items-center gap-1.5 text-xs font-medium text-[#666]">
                {b.icon} {b.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Cards ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 reveal-on-scroll">
        {plansLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-[#4285F4]" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 items-start pt-4">
              {plans?.map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  isCurrentPlan={plan.name.toLowerCase() === currentPlanName?.toLowerCase()}
                  onSelectPlan={handleSelectPlan}
                  loading={false}
                />
              ))}
            </div>

            {/* Compare all toggle */}
            <div className="mt-14 text-center">
              <button
                onClick={() => setShowTable((prev) => !prev)}
                className="inline-flex items-center gap-2 text-sm text-[#666] hover:text-[#111] transition-colors font-semibold border border-[#e5e5e5] rounded-full px-5 py-2.5 hover:border-[#111]"
              >
                {showTable ? "Hide comparison" : "Compare all features"}
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showTable ? "rotate-180" : ""}`} />
              </button>
            </div>

            {showTable && plans && (
              <div className="mt-8">
                <h2 className="text-xl font-medium text-[#111] mb-6 text-center tracking-tight">
                  Full Plan Comparison
                </h2>
                <PricingTable plans={plans} />
              </div>
            )}
          </>
        )}
      </section>

      {/* ── Enterprise CTA (matches LandingPage black CTA block) ── */}
      <section className="py-8 px-6 border-t border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#111] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden reveal-on-scroll">
            <div
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            />
            <div className="relative max-w-2xl mx-auto space-y-6">
              <h4 className="text-xs font-bold text-white/60 uppercase tracking-[0.3em]">Enterprise</h4>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tighter text-white leading-tight">
                Need a custom plan?
              </h2>
              <p className="text-lg text-white/60 font-light leading-relaxed">
                Tailored limits, dedicated support, white-label options, and SLA guarantees — designed for agencies at scale.
              </p>
              <a
                href="mailto:sales@greycats.tech?subject=Enterprise Plan Inquiry"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-white text-[#111] font-semibold text-sm hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-2xl"
              >
                Talk to Sales <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-16 px-6 text-sm border-t border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <Link to="/" className="flex items-center gap-3 mb-6">
                <img src={logoBlack} alt="GreyCats Analytics" className="h-8 w-auto" />
              </Link>
              <p className="text-[#666] mb-2 font-medium">Operated by Greycats Tech LLP</p>
              <a href="mailto:info@greycats.tech" className="text-[#4285F4] font-semibold hover:underline">
                info@greycats.tech
              </a>
            </div>
            <div>
              <h4 className="font-bold text-[#111] mb-6 uppercase tracking-widest text-xs">Legal & Support</h4>
              <ul className="space-y-4 text-[#666] font-medium">
                <li><Link to="/pricing" className="text-[#111] font-semibold">Plans & Pricing</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-[#111] transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="hover:text-[#111] transition-colors">Terms of Service</Link></li>
                <li><Link to="/contact" className="hover:text-[#111] transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[#e5e5e5] flex flex-col md:flex-row items-center justify-between gap-6 text-[#666] font-medium">
            <p>© 2026 Greycats Tech LLP. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2"><Lock className="w-4 h-4" /> Secure Data</span>
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Data Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
