import { useNavigate } from "react-router-dom";
import { isImpersonating, stopImpersonating } from "@/api/adminApi";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserX } from "lucide-react";

export const ImpersonationBanner = () => {
    const navigate = useNavigate();

    if (!isImpersonating()) return null;

    const handleStop = () => {
        try {
            stopImpersonating();
            toast.success('Stopped impersonating user');
            // Use window.location.href to force a full reload
            setTimeout(() => {
                window.location.href = '/admin/users';
            }, 100);
        } catch (error) {
            console.error('Stop impersonation error:', error);
            toast.error('Failed to stop impersonating');
        }
    };

    return (
        <div className="bg-red-600 text-white px-4 py-2 flex justify-between items-center shadow-lg fixed top-0 left-0 right-0 z-50">
            <div className="flex items-center gap-2">
                <span className="text-xl">🔴</span>
                <span className="font-medium">You are currently impersonating a user</span>
            </div>
            <Button
                onClick={handleStop}
                variant="secondary"
                size="sm"
                className="bg-white text-red-600 hover:bg-gray-100 font-semibold"
            >
                <UserX className="mr-2 h-4 w-4" />
                Stop Impersonating
            </Button>
        </div>
    );
};
