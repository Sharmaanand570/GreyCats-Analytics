import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { usePlansQuery } from "@/hooks/subscription/usePlansQuery";
import { useSubscriptionQuery } from "@/hooks/subscription/useSubscriptionQuery";
import { useCreateOrderMutation } from "@/hooks/subscription/useCreateOrderMutation";
import { useVerifyPaymentMutation } from "@/hooks/subscription/useVerifyPaymentMutation";
import { useActivateFreePlanMutation } from "@/hooks/subscription/useActivateFreePlanMutation";
import { openRazorpayCheckout } from "@/lib/payments/openRazorpayCheckout";
import { AuthForm } from "@/features/Authantication/componenets/AuthForm";
import { Button } from "@/components/ui/button";
import { isAuthenticated, StorageKey } from "@/utils/storage";
import { useUserStore } from "@/utils/useUserStore";
import { toast } from "sonner";
import logoBlack from "@/assets/images/greycats-black-logo.png";
import { 
  Loader2, 
  CheckCircle2, 
  ArrowLeft, 
  CreditCard, 
  Zap, 
  ShieldCheck,
  Lock
} from "lucide-react";

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const planId = Number(searchParams.get("planId"));
  const navigate = useNavigate();
  
  const { data: plans, isLoading: plansLoading } = usePlansQuery();
  const { data: subscriptionData } = useSubscriptionQuery();
  const createOrder = useCreateOrderMutation();
  const verifyPayment = useVerifyPaymentMutation();
  const activateFreePlan = useActivateFreePlanMutation();
  const user = useUserStore((state) => state.user);
  
  const [isAuthCompleted, setIsAuthCompleted] = useState(false);
  const authed = isAuthenticated(StorageKey.ANALYTICS_TOKEN) || isAuthCompleted;
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Local state to track if user just authenticated on this page
  // We use authed from storage/store as primary source
  
  const selectedPlan = useMemo(() => {
    return plans?.find((p) => p.id === planId);
  }, [plans, planId]);

  const currentPlanName = subscriptionData?.plan?.planName;
  const isAlreadyOnPlan = selectedPlan?.name.toLowerCase() === currentPlanName?.toLowerCase();

  useEffect(() => {
    if (!planId && plans && plans.length > 0) {
      navigate("/pricing", { replace: true });
    }
  }, [planId, plans, navigate]);

  const handlePaymentSuccess = () => {
    // If user doesn't have companyName, they are "new" in terms of setup
    if (!user?.companyName) {
      navigate("/auth/signup-details", { replace: true });
    } else {
      navigate("/clients", { replace: true });
    }
  };

  const handleCheckout = async () => {
    if (!selectedPlan) return;
    setIsProcessing(true);

    try {
      if (selectedPlan.price === 0) {
        if (isAlreadyOnPlan) {
          toast.info("You're already on this plan.");
          setIsProcessing(false);
          return;
        }

        await toast.promise(activateFreePlan.mutateAsync(selectedPlan.id), {
          loading: `Activating ${selectedPlan.displayName}...`,
          success: `Successfully activated ${selectedPlan.displayName}`,
          error: "Failed to activate plan",
        });
        handlePaymentSuccess();
      } else {
        const orderData = await createOrder.mutateAsync(selectedPlan.id);
        await openRazorpayCheckout({
          orderData,
          onSuccess: async (payload) => {
            try {
              await verifyPayment.mutateAsync(payload);
              toast.success(`Successfully subscribed to ${selectedPlan.displayName}!`);
              handlePaymentSuccess();
            } catch (err) {
              toast.error("Payment verification failed. Please contact support.");
            } finally {
              setIsProcessing(false);
            }
          },
          onDismiss: () => {
            toast.info("Payment cancelled.");
            setIsProcessing(false);
          },
        });
      }
    } catch (err: any) {
      console.error("[Checkout error]", err);
      const msg = err?.response?.data?.message || err?.message || "Checkout failed.";
      toast.error(msg);
      setIsProcessing(false);
    }
  };

  if (plansLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-[#4285F4]" />
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center space-y-4">
        <h1 className="text-2xl font-bold">Plan not found</h1>
        <p className="text-gray-600">The plan you're looking for doesn't exist or has been moved.</p>
        <Link to="/pricing" className="text-[#4285F4] font-semibold hover:underline">
          Back to Pricing
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#111] font-sans selection:bg-[#4285F4] selection:text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoBlack} alt="GreyCats" className="h-8 w-auto" />
          </Link>
          <Link to="/pricing" className="flex items-center gap-2 text-sm font-semibold text-[#666] hover:text-[#111] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Plans
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Side: Order Summary */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Checkout</h1>
              <p className="text-[#666]">Complete your subscription to get started.</p>
            </div>

            <div className="bg-white rounded-3xl border border-[#e5e5e5] p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#4285F4] uppercase tracking-wider mb-1">Selected Plan</h3>
                  <h2 className="text-2xl font-bold">{selectedPlan.displayName}</h2>
                </div>
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <Zap className="w-6 h-6 text-[#4285F4]" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#666]">Interval</span>
                  <span className="font-semibold capitalize">{selectedPlan.interval}</span>
                </div>
                <div className="h-px bg-[#f0f0f0]" />
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-medium">Total due</span>
                  <span className="text-3xl font-extrabold">
                    {selectedPlan.price === 0 ? "Free" : `₹${selectedPlan.price.toLocaleString("en-IN")}`}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                 <p className="text-sm font-semibold text-[#111]">What's included:</p>
                 <ul className="grid grid-cols-1 gap-2">
                   {[
                     `${selectedPlan.limits.maxClients === -1 ? 'Unlimited' : selectedPlan.limits.maxClients} Clients`,
                     `${selectedPlan.limits.maxIntegrations === -1 ? 'Unlimited' : selectedPlan.limits.maxIntegrations} Integrations`,
                     "Premium Support",
                     "Real-time Dashboard"
                   ].map((feature, i) => (
                     <li key={i} className="flex items-center gap-2 text-sm text-[#555]">
                       <CheckCircle2 className="w-4 h-4 text-[#34A853]" />
                       {feature}
                     </li>
                   ))}
                 </ul>
              </div>
            </div>

            <div className="flex items-center gap-6 px-4">
              <div className="flex items-center gap-2 text-xs font-medium text-[#999]">
                <ShieldCheck className="w-4 h-4" /> Secure checkout
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#999]">
                <Lock className="w-4 h-4" /> Encrypted data
              </div>
            </div>
          </div>

          {/* Right Side: Auth or Payment */}
          <div className="bg-white rounded-3xl border border-[#e5e5e5] p-8 md:p-10 shadow-xl relative overflow-hidden">
             {!authed ? (
               <div className="space-y-6">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[10px] font-bold text-[#4285F4] uppercase tracking-wider mb-2">
                   Step 1: Account
                 </div>
                 <AuthForm 
                    disableNavigation={true} 
                    onAuthSuccess={() => {
                      toast.success("Account verified successfully!");
                      setIsAuthCompleted(true);
                      // State updates via isAuthenticated on re-render
                    }}
                 />
               </div>
             ) : (
               <div className="space-y-8 py-4">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-[10px] font-bold text-[#34A853] uppercase tracking-wider">
                   Step 2: Payment
                 </div>
                 
                 <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Ready to activate?</h2>
                    <p className="text-[#666] text-sm">
                      You are logged in as <span className="font-bold text-[#111]">{user?.email}</span>. 
                      Click below to complete your {selectedPlan.price === 0 ? 'activation' : 'payment'}.
                    </p>
                 </div>

                 <div className="bg-[#f9f9f9] rounded-2xl p-6 border border-[#eee] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white border border-[#e5e5e5] flex items-center justify-center font-bold text-[#111]">
                      {user?.fullName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{user?.fullName || 'User'}</p>
                      <p className="text-xs text-[#666]">{user?.email}</p>
                    </div>
                    <button 
                      onClick={() => {
                        localStorage.removeItem(StorageKey.ANALYTICS_TOKEN);
                        window.location.reload();
                      }}
                      className="ml-auto text-xs font-semibold text-[#4285F4] hover:underline"
                    >
                      Use another account
                    </button>
                 </div>

                 <Button
                    onClick={handleCheckout}
                    disabled={isProcessing || isAlreadyOnPlan}
                    className="w-full h-14 rounded-2xl text-lg font-bold !text-white bg-[#111] hover:bg-[#222] transition-all shadow-lg flex items-center justify-center gap-2"
                    isLoading={isProcessing}
                 >
                    {isProcessing ? (
                      "Processing..."
                    ) : isAlreadyOnPlan ? (
                      "Already Active"
                    ) : selectedPlan.price === 0 ? (
                      <>Activate Free Plan <Zap className="w-5 h-5 fill-current" /></>
                    ) : (
                      <>Pay Now <CreditCard className="w-5 h-5" /></>
                    )}
                 </Button>

                 <p className="text-[10px] text-center text-[#999] px-6">
                   By clicking the button above, you agree to our Terms of Service and authorize the charge to your payment method. You can cancel anytime from your settings.
                 </p>
               </div>
             )}
          </div>

        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-12 border-t border-[#e5e5e5] mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs text-[#999]">© 2026 Greycats Tech LLP. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
