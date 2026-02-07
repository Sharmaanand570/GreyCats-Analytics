import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "@/utils/useUserStore";
import { useEffect } from "react";
import { StorageKey } from "@/utils/storage";
import { toast } from "sonner";

interface RoleGuardProps {
    allowedRoles: ("USER" | "ADMIN" | "SUPER_ADMIN")[];
}

export default function RoleGuard({ allowedRoles }: RoleGuardProps) {
    const { user, isLoading, fetchProfile } = useUserStore();

    useEffect(() => {
        if (!user) {
            fetchProfile();
        }
    }, [user, fetchProfile]);

    const hasToken = !!localStorage.getItem(StorageKey.ANALYTICS_TOKEN);

    if (isLoading) { // isLoading is from store
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!user) {
        // If we have a token but no user, and we're not loading, 
        // it means we haven't started or finished the first fetch.
        // However, if fetchProfile was called and failed (user is still null), 
        // we redirect only if we are sure we are not authenticated.
        if (hasToken) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            );
        }
        return <Navigate to="/auth/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        // Role not authorized - show feedback to user
        toast.error("Access Denied", {
            description: "You don't have permission to access the admin panel.",
            duration: 4000,
        });
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
