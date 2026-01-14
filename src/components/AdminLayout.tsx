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
    X
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/utils/useUserStore";
import { cn } from "@/lib/utils";

export default function AdminLayout() {
    const { user, logout } = useUserStore();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
    ];

    const filteredNavItems = navItems.filter(
        (item) => user && item.roles.includes(user.role)
    );

    return (
        <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-slate-950 border-r transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
                    !isSidebarOpen && "-translate-x-full md:hidden"
                )}
            >
                <div className="flex h-16 items-center border-b px-6">
                    <Link to="/admin" className="flex items-center gap-2 font-bold text-xl">
                        <span className="text-xl font-semibold">⌘</span>
                        <span>GreyCats Admin</span>
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

                <div className="flex flex-col h-[calc(100vh-64px)] justify-between py-4">
                    <nav className="space-y-1 px-3">
                        {filteredNavItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.href);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                                            : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="border-t p-4">
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">
                                {user?.fullName?.substring(0, 2).toUpperCase() || "AD"}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="truncate text-sm font-medium">{user?.fullName}</p>
                                <p className="truncate text-xs text-slate-500">{user?.email}</p>
                            </div>
                        </div>

                        <Link
                            to="/"
                            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 mb-2"
                        >
                            <LogOut className="h-4 w-4" />
                            Return to App
                        </Link>

                        <Button
                            variant="destructive"
                            className="w-full justify-start gap-2"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex h-16 items-center justify-between border-b px-6 bg-white dark:bg-slate-950 md:hidden">
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                    <span className="font-semibold">Admin Panel</span>
                    <div className="w-9" /> {/* Spacer */}
                </header>

                <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
