import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PlatformNotConnectedProps {
  platformName: string;
  icon: React.ReactNode;
  clientName?: string;
}

export function PlatformNotConnected({ platformName, icon, clientName }: PlatformNotConnectedProps) {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-lg w-full bg-white border border-amber-200/60 rounded-[32px] p-12 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="relative inline-block mb-6">
          <div className="p-5 bg-amber-50 rounded-[24px] ring-1 ring-amber-100">
            {icon}
          </div>
          <div className="absolute -bottom-1 -right-1 p-1.5 bg-amber-100 rounded-full ring-2 ring-white">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight mb-3">
          {platformName} Not Connected
        </h2>
        <p className="text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed mb-8">
          {clientName ? (
            <>
              <span className="font-semibold text-zinc-700">{clientName}</span> does not have a {platformName} account connected. Please connect an account from the integrations page to view analytics.
            </>
          ) : (
            <>
              The selected client does not have a {platformName} account connected. Please connect an account from the integrations page to view analytics.
            </>
          )}
        </p>
        <Button
          onClick={() => navigate("/integrations")}
          className="h-12 px-8 rounded-xl bg-zinc-900 hover:bg-black text-white font-bold shadow-lg shadow-zinc-900/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Go to Integrations
        </Button>
      </div>
    </div>
  );
}
