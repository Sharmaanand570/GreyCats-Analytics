import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Building2,
    CreditCard,
    Activity,
    FileText,
    LogOut,
    ShieldAlert,
    Menu,
    Send,
    Bell,
    X
} from "lucide-react";
import { useState, useEffect } from "react";
import GreycatsBlackLogo from "@/assets/images/greycats-black-logo.png";
import GreycatsWhiteLogo from "@/assets/images/greycats-white-logo.png";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/utils/useUserStore";
import { cn } from "@/lib/utils";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";
import { isImpersonating } from "@/api/adminApi";

export default function AdminLayout() {
    const { user, logout } = useUserStore();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Prevent access to admin panel when impersonating
    useEffect(() => {
        if (isImpersonating()) {
            // Redirect to main app if trying to access admin panel while impersonating
            navigate("/", { replace: true });
        }
    }, [location.pathname, navigate]);

    // SECURITY: Additional safeguard - check user role
    useEffect(() => {
        if (user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
            console.warn("Unauthorized access attempt to admin panel - user role:", user.role);
            navigate("/", { replace: true });
        }
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate("/auth/login");
    };

    const navItems = [
        {
            title: "Dashboard",
            href: "/admin/dashboard",
            icon: LayoutDashboard,
            roles: ["ADMIN", "SUPER_ADMIN"],
        },
        {
            title: "Users",
            href: "/admin/users",
            icon: Users,
            roles: ["ADMIN", "SUPER_ADMIN"],
        },
        {
            title: "Clients",
            href: "/admin/clients",
            icon: Building2,
            roles: ["ADMIN", "SUPER_ADMIN"],
        },
        {
            title: "Plans",
            href: "/admin/subscriptions/plans",
            icon: CreditCard,
            roles: ["ADMIN", "SUPER_ADMIN"],
        },
        {
            title: "Subscriptions",
            href: "/admin/subscriptions/users",
            icon: CreditCard,
            roles: ["ADMIN", "SUPER_ADMIN"],
        },
        // Super Admin Only
        {
            title: "System Health",
            href: "/admin/monitoring/stats",
            icon: Activity,
            roles: ["SUPER_ADMIN"],
        },
        {
            title: "Activity Feed",
            href: "/admin/monitoring/activity",
            icon: FileText,
            roles: ["SUPER_ADMIN"],
        },
        {
            title: "Integrations",
            href: "/admin/monitoring/integrations",
            icon: ShieldAlert,
            roles: ["SUPER_ADMIN"],
        },
        {
            title: "Broadcasts",
            href: "/admin/broadcasts",
            icon: Send,
            roles: ["ADMIN", "SUPER_ADMIN"],
        },
        {
            title: "Notifications",
            href: "/admin/notifications",
            icon: Bell,
            roles: ["ADMIN", "SUPER_ADMIN"],
        },
    ];

    const filteredNavItems = navItems.filter(
        (item) => user && item.roles.includes(user.role)
    );

    return (
        <div className="flex h-screen w-full bg-[#FAFAFA] dark:bg-[#0A0A0A] font-sans">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 transform bg-white/80 dark:bg-black/80 backdrop-blur-xl border-r border-gray-100 dark:border-white/5 transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
                    !isSidebarOpen && "-translate-x-full md:hidden"
                )}
            >
                <div className="flex h-20 items-center px-8">
                    <Link to="/admin" className="flex items-center gap-3">
                        <img
                            src={GreycatsBlackLogo}
                            alt="GreyCats"
                            className="h-8 w-auto block dark:hidden"
                        />
                        <img
                            src={GreycatsWhiteLogo}
                            alt="GreyCats"
                            className="h-8 w-auto hidden dark:block"
                        />
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex flex-col h-[calc(100vh-80px)] justify-between py-6">
                    <nav className="space-y-1.5 px-4">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Menu
                        </div>
                        {filteredNavItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.href);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={cn(
                                        "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-black text-white shadow-lg shadow-black/10 dark:bg-white dark:text-black dark:shadow-white/10"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white hover:scale-[1.02]"
                                    )}
                                >
                                    <Icon className={cn(
                                        "h-4 w-4 transition-transform duration-200",
                                        isActive ? "text-white dark:text-black" : "text-current group-hover:scale-110"
                                    )} />
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="px-4">
                        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 mb-3 border border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-10 w-10 rounded-full bg-white dark:bg-white/10 shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-center text-sm font-bold text-gray-900 dark:text-white">
                                    {user?.fullName?.substring(0, 2).toUpperCase() || "AD"}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{user?.fullName}</p>
                                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user?.role ? user.role.replace('_', ' ') : 'Admin'}</p>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2 h-9 text-xs font-medium border-gray-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                Sign out
                            </Button>
                        </div>

                        <Link
                            to="/"
                            className="flex w-full items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <LogOut className="h-3 w-3" />
                            Back to Application
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#FAFAFA] dark:bg-[#0A0A0A]">
                <ImpersonationBanner />
                <header className="flex h-16 items-center justify-between px-6 bg-white/50 dark:bg-black/50 backdrop-blur-md sticky top-0 z-40 md:hidden border-b border-gray-100 dark:border-white/5">
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                    <span className="font-semibold text-gray-900 dark:text-white">Admin</span>
                    <div className="w-9" />
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
