
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "./ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import GreycatsLogo01 from "@/assets/images/greycats 01 logo.png";
import GreycatsWhiteLogo from "@/assets/images/greycats-white-logo.png";
import type React from "react";
import {
  Bell,
  FileText,
  Layers,
  Settings,
  CircleChevronRight,
  LogOut,
  ShieldAlert,
  CreditCard,
  ChevronDown,
  CalendarDays,
  PenLine,
  Megaphone,
  MessageSquare,
  Mail,
  Search,
} from "lucide-react";
import { FiMenu } from "react-icons/fi";
import { SiGoogleads, SiWhatsapp, SiTelegram } from "react-icons/si";
import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { ClientSelector } from "./ClientSelector";
import { removeAuthToken, StorageKey } from "@/utils/storage";
import { useUserStore } from "@/utils/useUserStore";
import { getProfileImageUrl } from "@/utils/imageUtils";

import { ImpersonationBanner } from "@/components/ImpersonationBanner";
import { GlobalOAuthHandler } from "@/components/GlobalOAuthHandler";
import { TrialExpiryBanner } from "@/components/subscription/TrialExpiryBanner";
import { PlanBadge } from "@/components/subscription/PlanBadge";
import { useSubscriptionQuery } from "@/hooks/subscription/useSubscriptionQuery";
import { useQueryClient } from "@tanstack/react-query";
import { useClientContext } from "@/context/ClientContext";
import { useProductTour } from "./ProductTour";
import { HelpCircle } from "lucide-react";
import { AIQuotaSidebarWidget } from "@/components/ai-studio/AIQuotaSidebarWidget";

function MainSideBar(): React.JSX.Element {
  const location = useLocation();
  const [activeTab, setActive] = useState(location.pathname);
  const is404Page = location.pathname.startsWith("/404");
  const { user, fetchProfile, logout } = useUserStore();
  const { startTour } = useProductTour();
  const queryClient = useQueryClient();
  const { setClients, setCurrentClient, currentClient } = useClientContext();
  const { data: subscriptionData } = useSubscriptionQuery();
  const currentPlanName = subscriptionData?.plan?.planName;
  const currentPlanDisplay = subscriptionData?.plan?.displayName;
  console.log("MainSideBar render user:", user, "role:", user?.role);

  useEffect(() => {
    if (!user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    if (user && !user.hasSeenQuickTour) {
      const timer = setTimeout(() => {
        startTour();
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.hasSeenQuickTour]);

  const userInitials = user?.fullName
    ? user.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : "G";

  useEffect(() => {
    setActive(location.pathname);
    
    // Auto-expand the appropriate sidebar group based on the current route
    if (location.pathname.startsWith('/social-media') || location.pathname.startsWith('/blog')) {
      setOpenGroups({ Scheduler: true });
    } else if (location.pathname.startsWith('/broadcasts')) {
      setOpenGroups({ Broadcast: true });
    } else if (location.pathname.startsWith('/data-sources')) {
      setOpenGroups({ 'Ads Manager': true });
    } else if (location.pathname.startsWith('/seo-report')) {
      setOpenGroups({ 'SEO Tools': true });
    } else if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/account-setup') || location.pathname.startsWith('/billing')) {
      setOpenGroups({ Settings: true });
    } else {
      setOpenGroups({ Analytics: true });
    }
  }, [location.pathname]);

  // Initialize collapse state based on current route.
  // Collapse only on focus-mode pages: the report builder, the client detail page,
  // and the edit-dashboard view. Stay expanded on the reports listing.
  const getInitialCollapseState = () => {
    const isReportBuilder = /^\/clients\/\d+\/reports\/(new|\d+)/.test(location.pathname);
    const isClientDetail = /^\/clients\/\d+$/.test(location.pathname);
    const isEditDashboard = /^\/clients\/\d+\/edit-dashboard/.test(location.pathname);
    return isReportBuilder || isClientDetail || isEditDashboard;
  };

  const [collabsState, setcollabsState] = useState<boolean>(
    getInitialCollapseState()
  );

  useEffect(() => {
    const handleOpenGroup = (e: CustomEvent<{ group: string }>) => {
      setOpenGroups((prev) => ({ ...prev, [e.detail.group]: true }));
      setcollabsState(false);
    };
    window.addEventListener("openSidebarGroup", handleOpenGroup as EventListener);
    return () => window.removeEventListener("openSidebarGroup", handleOpenGroup as EventListener);
  }, []);

  const getInitialOpenGroup = (): Record<string, boolean> => {
    const path = location.pathname;
    if (path.startsWith('/social-media') || path.startsWith('/blog')) return { Scheduler: true };
    if (path.startsWith('/broadcasts')) return { Broadcast: true };
    if (path.startsWith('/data-sources')) return { 'Ads Manager': true };
    if (path.startsWith('/seo-report')) return { 'SEO Tools': true };
    if (path.startsWith('/admin') || path.startsWith('/account-setup') || path.startsWith('/billing')) return { Settings: true };
    return { Analytics: true };
  };

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(getInitialOpenGroup());

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => {
      // If clicking the already open group, close it. Otherwise, open only the clicked group.
      return { [label]: !prev[label] };
    });
  };

  const navigate = useNavigate();

  // Decide whether a sidebar item should appear active for the current path.
  // Explicit per-item rules so /clients/:id/reports highlights "Reports" (not "Clients").
  const isItemActive = (itemPath: string, pathname: string): boolean => {
    if (itemPath === '/clients') {
      // Clients root, client detail, or client edit-dashboard — but NOT /clients/:id/reports
      return /^\/clients(\/\d+)?(\/edit-dashboard)?$/.test(pathname);
    }
    if (itemPath === '/reports') {
      return pathname.startsWith('/reports') || /^\/clients\/\d+\/reports/.test(pathname);
    }
    if (itemPath === '/alerts') {
      return pathname.startsWith('/alerts');
    }
    if (itemPath === '/social-media/scheduler') {
      return pathname.startsWith('/social-media');
    }
    if (itemPath === '/blog/scheduler') {
      return pathname.startsWith('/blog');
    }
    if (itemPath === '/broadcasts') {
      return pathname.startsWith('/broadcasts');
    }
    if (itemPath === '/data-sources/meta-ads/wizard') {
      return pathname.startsWith('/data-sources/meta-ads/wizard');
    }
    if (itemPath === '/data-sources/meta-ads/audiences') {
      return pathname.startsWith('/data-sources/meta-ads/audiences');
    }
    if (itemPath === '/data-sources/meta-ads') {
      // Match the meta-ads root and /:clientId, but NOT /wizard or /audiences subpaths
      return /^\/data-sources\/meta-ads(\/\d+)?$/.test(pathname);
    }
    if (itemPath === '/data-sources/google-ads/wizard') {
      return pathname.startsWith('/data-sources/google-ads/wizard');
    }
    if (itemPath === '/data-sources/google-ads') {
      // Match the google-ads root and /:clientId, but NOT /wizard subpath.
      return /^\/data-sources\/google-ads(\/\d+)?$/.test(pathname);
    }
    if (itemPath === '/seo-report') {
      return pathname.startsWith('/seo-report');
    }
    if (itemPath === '/admin/dashboard') {
      return pathname.startsWith('/admin');
    }
    return pathname === itemPath || pathname.startsWith(itemPath + '/');
  };

  const handleLogout = () => {
    // 1. Clear React Query Cache (removes all cached data like clients, user profile, etc.)
    queryClient.removeQueries();

    // 2. Clear Context State (immediate UI update)
    setClients([]);
    setCurrentClient(null);

    // 3. Clear User Store (Zustand)
    logout();

    // 4. Clear Token
    removeAuthToken(StorageKey.ANALYTICS_TOKEN);

    // 5. Navigate to login
    // Force a hard reload to clear any in-memory state or query caches, then go to login
    window.location.href = "/#/auth/login";
  };

  const handleChangeURL = (path: string, isComingSoon?: boolean): void => {
    if (isComingSoon) return;

    if (path === "logout") {
      handleLogout();
      return;
    }

    // Append clientId to scheduler/wizard paths if available
    let finalPath = path;
    const clientScopedPaths = [
      "social-media/scheduler",
      "blog/scheduler",
      "broadcasts",
      "data-sources/meta-ads/wizard",
      "data-sources/meta-ads/audiences",
      "data-sources/meta-ads",
      "data-sources/google-ads/wizard",
      "data-sources/google-ads",
    ];
    if (currentClient?.id && clientScopedPaths.some(p => path.includes(p))) {
      finalPath = `${path}/${currentClient.id}`;
    }

    navigate(finalPath);
    setActive(finalPath);
  };

  useEffect(() => {
    const isReportBuilder = /^\/clients\/\d+\/reports\/(new|\d+)/.test(location.pathname);
    const isClientDetail = /^\/clients\/\d+$/.test(location.pathname);
    const isEditDashboard = /^\/clients\/\d+\/edit-dashboard/.test(location.pathname);
    setcollabsState(isReportBuilder || isClientDetail || isEditDashboard);
  }, [location.pathname]);
  const isAuthPage = /^\/auth\/(login|signup)$/.test(location.pathname);

  if (isAuthPage)
    return (
      <main className="flex-1 bg-[#F9FAFB] w-full h-full">
        <Outlet />
      </main>
    );

  const isShared = currentClient?._isShared;
  const access = currentClient?.sharedAccess;

  const hasAnalyticsAccess = !isShared || access?.accessAnalytics !== false;
  const hasAlertsAccess = !isShared || access?.accessAlerts !== false;
  const hasReportsAccess = !isShared || access?.accessReports !== false;
  const hasSchedulerAccess = !isShared || access?.accessScheduler !== false;
  const hasAdsAccess = !isShared || access?.accessAds !== false;

  const getTourId = (label: string) => {
    switch (label) {
      case "Clients": return "tour-sidebar-clients";
      case "Integrations": return "tour-sidebar-integrations";
      case "Settings": return "tour-sidebar-settings";
      case "Account Setup": return "tour-sidebar-settings";
      case "Alerts": return "tour-sidebar-alerts";
      default: return undefined;
    }
  };

  const analyticsItems = [];
  if (hasAnalyticsAccess) analyticsItems.push({ label: "Clients", path: "/clients", icon: <Layers /> });
  if (hasAlertsAccess) analyticsItems.push({ label: "Alerts", path: "/alerts", icon: <Bell /> });
  if (hasReportsAccess) analyticsItems.push({ label: "Reports", path: "/reports", icon: <FileText /> });

  const menuGroups = [
    ...(analyticsItems.length > 0 ? [{
      label: "Analytics",
      isCollapsible: true,
      items: analyticsItems,
    }] : []),
    {
      label: "SEO Tools",
      badge: "Beta",
      isCollapsible: true,
      items: [
        { label: "SEO Reporter", path: "/seo-report", icon: <Search /> }
      ]
    },
    ...(hasSchedulerAccess ? [{
      label: "Scheduler",
      isCollapsible: true,
      items: [
        { label: "Social Media", path: "/social-media/scheduler", icon: <CalendarDays /> },
        { label: "Blog", path: "/blog/scheduler", icon: <PenLine /> },
      ],
    }] : []),
    ...(hasSchedulerAccess ? [{
      label: "Broadcast",
      isCollapsible: true,
      items: [
        { label: "WhatsApp", path: "/broadcasts/whatsapp", icon: <SiWhatsapp /> },
        { label: "SMS", path: "/broadcasts/sms", icon: <MessageSquare /> },
        { label: "Email", path: "/broadcasts/email", icon: <Mail /> },
        { label: "Telegram", path: "/broadcasts/telegram", icon: <SiTelegram /> },
      ],
    }] : []),
    ...(hasAdsAccess ? [{
      label: "Ads Manager",
      badge: "Soon",
      isCollapsible: true,
      items: [
        { label: "Meta Ads", path: "/data-sources/meta-ads", icon: <Megaphone />, isComingSoon: true},
        { label: "Google Ads", path: "/data-sources/google-ads", icon: <SiGoogleads className="w-[18px] h-[18px]" />, isComingSoon: false },
      ],
    }] : []),
    {
      label: "Settings",
      isCollapsible: true,
      items: [
        ...(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
          ? [{ label: "Admin Panel", path: "/admin/dashboard", icon: <ShieldAlert /> }]
          : []),
        { label: "Account Setup", path: "/account-setup", icon: <Settings /> },
        { label: "Billing", path: "/billing", icon: <CreditCard /> },
        { label: "Logout", path: "logout", icon: <LogOut /> },
      ],
    },
  ];

  return (
    <div className="flex relative h-[100dvh] overflow-hidden bg-gradient-to-b from-black via-zinc-950 to-zinc-800 ">
      {/* ---------- 🖥️ DESKTOP SIDEBAR ---------- */}
      {is404Page ? null : (
        <SidebarProvider
          className={` transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] hidden lg:block ${!collabsState ? "w-[16rem]" : "w-24"
            }`}
        >
          <Sidebar
            className={`transition-all border-none duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${!collabsState ? "w-[16rem] " : "w-24"
              } h-[100dvh] bg-gradient-to-b from-black via-zinc-950 to-zinc-800`}
          >
            {/* Header */}
            <SidebarHeader className={`pt-4 pb-4 ${collabsState ? "px-0" : "px-2"}`}>
              <SidebarGroup className="p-0">
                <SidebarGroupLabel className="p-0 w-full relative justify-between px-2 pt-6 pb-8">
                  <div
                    onClick={() => navigate("/")}
                    role="button"
                    aria-label="Go to home"
                    className={`flex items-center cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] hover:opacity-80 ${collabsState ? "justify-center w-full" : "justify-center w-full px-4"
                      }`}
                  >
                    {collabsState ? (
                      <div className="bg-white rounded-lg p-1">
                        <img src={GreycatsLogo01} alt="Greycats Logo" className="h-8 w-auto" />
                      </div>
                    ) : (
                      <img src={GreycatsWhiteLogo} alt="Greycats Logo" className="h-10 w-auto object-contain" />
                    )}
                  </div>
                  <span
                    className="absolute right-0 cursor-pointer transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-95 text-zinc-400 hover:text-white"
                    onClick={() => setcollabsState(!collabsState)}
                  >
                    <CircleChevronRight
                      className={`text-xl transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${collabsState ? "rotate-0" : "rotate-180"
                        }`}
                    />
                  </span>
                </SidebarGroupLabel>
              </SidebarGroup>
            </SidebarHeader>

            <SidebarContent
              className={`text-white transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] scrollbar-thin scrollbar-thumb-zinc-700 hover:scrollbar-thumb-zinc-600 scrollbar-track-transparent ${collabsState ? "px-0" : "px-2"}`}
            >
              {/* Client Selector Area */}
              <div className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] mt-4 mb-6 ${collabsState ? "px-0 flex justify-center" : "px-2"}`}>
                <ClientSelector isCollapsed={collabsState} />
              </div>

              {/* Menu Groups */}
              {menuGroups.map((group) => {
                const isOpen = openGroups[group.label] === true;
                return (
                <SidebarGroup key={group.label} className="py-1">
                  {!collabsState && (
                    <div
                      role="button"
                      onClick={() => group.isCollapsible && toggleGroup(group.label)}
                      className={`flex items-center justify-between w-full h-8 px-3 mb-1 rounded-md transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                        group.isCollapsible ? "cursor-pointer bg-zinc-800/40 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/50 shadow-sm" : "text-zinc-500 font-semibold uppercase text-xs"
                      } ${
                        collabsState ? "opacity-0 max-h-0 overflow-hidden hidden" : "opacity-100 max-h-20 flex"
                      }`}
                    >
                      {group.isCollapsible ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium tracking-wide">
                            {group.label}
                          </span>
                          {group.badge && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 px-1.5 py-px rounded shadow-sm border border-blue-500/30">
                              {group.badge}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] tracking-wider uppercase">
                          {group.label}
                        </span>
                      )}
                      {group.isCollapsible && (
                        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  )}
                  <SidebarGroupContent 
                    className={`grid transition-all duration-300 ease-in-out ${
                      group.isCollapsible && !isOpen && !collabsState ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <SidebarMenu>
                        {group.items.map((item, index) => (
                          <SidebarMenuItem key={item.path}>
                            <SidebarMenuButton
                              id={getTourId(item.label)}
                              onClick={() => handleChangeURL(item.path, (item as any).isComingSoon)}
                              className={`group text-[13px] [&_svg]:w-[18px] [&_svg]:h-[18px] rounded-[0.375rem] font-normal h-9 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-zinc-800 hover:text-zinc-100 ${
                                (item as any).isComingSoon ? "opacity-50 cursor-not-allowed grayscale" : ""
                              } ${!collabsState
                                ? "px-3"
                                : "flex justify-center items-center"
                                } ${isItemActive(item.path, activeTab)
                                  ? "bg-zinc-800 text-white"
                                  : "text-zinc-300"
                                  }`}
                              style={{
                                transitionDelay: collabsState
                                  ? "0ms"
                                  : `${index * 20}ms`,
                              }}
                            >
                              <span className="transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110">
                                {item.icon}
                              </span>
                              {!collabsState && (
                                <div className="ml-2 flex items-center justify-between w-full">
                                  <span className="hidden md:hidden lg:block transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                                    {item.label}
                                  </span>
                                  {(item as any).isComingSoon && (
                                    <span className="text-[10px] bg-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">
                                      Soon
                                    </span>
                                  )}
                                </div>
                              )}
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </div>
                  </SidebarGroupContent>
                </SidebarGroup>
              )})}

            </SidebarContent>
            
            {/* Footer */}
            <SidebarFooter className={`mt-auto border-t border-zinc-800 pt-4 pb-4 ${collabsState ? "px-0" : "px-4"}`}>
              <AIQuotaSidebarWidget isCollapsed={collabsState} />
              <div
                onClick={startTour}
                className="flex items-center gap-3 rounded-md px-2 py-3 mb-2 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-zinc-800/50 cursor-pointer"
              >
                <div className="relative flex-shrink-0 flex items-center justify-center w-9 h-9 text-zinc-400">
                  <HelpCircle className="w-5 h-5" />
                </div>
                {!collabsState && (
                  <div className="text-sm font-medium leading-tight text-zinc-300 transition-colors duration-300">
                    Quick Tour
                  </div>
                )}
              </div>
              <div
                onClick={() => handleChangeURL("/account-setup")}
                className="flex items-center gap-3 rounded-md px-2 py-3 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-zinc-800/50 cursor-pointer"
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="h-9 w-9 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110 border border-zinc-700/50">
                    <AvatarImage src={getProfileImageUrl(user?.profilePicture || user?.companyLogo)} alt={user?.fullName} />
                    <AvatarFallback className="bg-zinc-800 text-xs font-medium text-zinc-100">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  {/* Plan badge pill shown in collapsed mode below avatar */}
                  {collabsState && currentPlanName && (
                    <span
                      onClick={(e) => { e.stopPropagation(); handleChangeURL("/billing"); }}
                      className="absolute -bottom-1 -right-1 cursor-pointer"
                    >
                      <PlanBadge planName={currentPlanName} size="sm" className="text-[9px] px-1 py-px" />
                    </span>
                  )}
                </div>
                {!collabsState && (
                  <div
                    className={`min-w-0 md:hidden lg:block transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${collabsState
                      ? "opacity-0 max-w-0 overflow-hidden"
                      : "opacity-100 max-w-full"
                      }`}
                  >
                    <div className="text-sm font-medium leading-tight text-white transition-colors duration-300">
                      {user?.fullName || "User"}
                    </div>
                    <div className="text-xs text-zinc-400 leading-tight transition-colors duration-300">
                      {user?.jobTitle || "Viewer"}
                    </div>
                    {currentPlanName && (
                      <div className="mt-1">
                        <PlanBadge
                          planName={currentPlanName}
                          displayName={currentPlanDisplay}
                          size="sm"
                          className="cursor-pointer hover:opacity-80"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </SidebarFooter>
          </Sidebar>
        </SidebarProvider>
      )}

      {/* ---------- 📱 MOBILE SIDEBAR (ShadCN Sheet) ---------- */}
      {is404Page ? null : (
        <div className="lg:hidden absolute top-4 left-4 z-50">
          <Sheet>
            {/* Menu Button */}
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className=" shadow-md transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-95"
              >
                <FiMenu className="h-5 w-5 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]" />
              </Button>
            </SheetTrigger>

            {/* Sidebar Drawer */}
            <SheetContent
              side="left"
              className="w-72 p-5 bg-gradient-to-bl from-black via-zinc-900 to-zinc-700 text-white flex flex-col"
            >
              <h2 className="text-xl font-semibold mb-6 tracking-wide">
                {user?.jobTitle || "Viewer"}
              </h2>

              {/* Menu Groups */}
              <nav className="flex flex-col space-y-2 grow">
                {menuGroups.map((group, groupIndex) => {
                  const isOpen = openGroups[group.label] === true;
                  return (
                  <div
                    key={group.label}
                    className="transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                    style={{
                      transitionDelay: `${groupIndex * 60}ms`,
                      opacity: 1,
                      transform: "translateX(0)",
                    }}
                  >
                    <div 
                      className={`flex items-center justify-between w-full h-8 px-3 mb-1 rounded-md transition-all duration-300 ${
                        group.isCollapsible ? "cursor-pointer bg-zinc-800/40 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/50 shadow-sm" : "text-zinc-500 uppercase text-xs font-semibold"
                      }`}
                      onClick={() => group.isCollapsible && toggleGroup(group.label)}
                    >
                      {group.isCollapsible ? (
                        <span className="text-[13px] font-medium tracking-wide">
                          {group.label}
                        </span>
                      ) : (
                        <h3 className="tracking-wider m-0 text-[11px] uppercase">
                          {group.label}
                        </h3>
                      )}
                      {group.isCollapsible && (
                        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                      )}
                    </div>
                    <div 
                      className={`grid transition-all duration-300 ease-in-out ${
                        group.isCollapsible && !isOpen ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
                      }`}
                    >
                      <div className="overflow-hidden flex flex-col space-y-1">
                        {group.items.map((item, itemIndex) => (
                          <button
                            key={item.path}
                            onClick={() => handleChangeURL(item.path, (item as any).isComingSoon)}
                            className={`flex items-center justify-between w-full px-3 py-1.5 rounded-md text-[13px] font-normal transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-zinc-800 hover:translate-x-1 [&_svg]:w-[18px] [&_svg]:h-[18px] ${
                              (item as any).isComingSoon ? "opacity-50 cursor-not-allowed" : ""
                            } ${isItemActive(item.path, activeTab)
                              ? "bg-zinc-800 translate-x-1 text-white"
                              : "text-zinc-300"
                              }`}
                            style={{
                              transitionDelay: `${groupIndex * 60 + itemIndex * 30
                                }ms`,
                            }}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110">
                                {item.icon}
                              </span>
                              <span className="transition-colors duration-300">
                                {item.label}
                              </span>
                            </div>
                            {(item as any).isComingSoon && (
                              <span className="text-[9px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter border border-zinc-700">
                                Soon
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )})}
              </nav>

              {/* Footer */}
              <div className="mt-auto pt-6 border-t border-zinc-700 flex flex-col space-y-4">
                <AIQuotaSidebarWidget isCollapsed={false} />
                {/* Quick Tour Button for Mobile */}
                <div
                  onClick={() => startTour()}
                  className="flex items-center gap-3 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:opacity-80 cursor-pointer"
                >
                  <div className="flex items-center justify-center h-9 w-9 rounded-full bg-zinc-800 border border-zinc-700/50 shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-95 text-zinc-400">
                    <HelpCircle size={18} />
                  </div>
                  <div className="text-sm font-medium leading-tight text-zinc-300 transition-colors duration-300">
                    Quick Tour
                  </div>
                </div>
                <div
                  onClick={() => handleChangeURL("/account-setup")}
                  className="flex items-center gap-3 mt-4 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:opacity-80 cursor-pointer"
                >
                  <Avatar className="h-9 w-9 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110">
                    <AvatarImage src={getProfileImageUrl(user?.profilePicture || user?.companyLogo)} alt={user?.fullName} />
                    <AvatarFallback className="bg-zinc-600 text-xs font-medium text-white">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium leading-tight transition-colors duration-300">
                      {user?.fullName || "User"}
                    </div>
                    <div className="text-xs text-zinc-400 leading-tight transition-colors duration-300">
                      {user?.jobTitle || "Viewer"}
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}

      {/* ---------- PAGE CONTENT ---------- */}
      {/* Dark-gradient shell: the sidebar background bleeds into this area so
          the page content appears as a floating rounded panel lifted off the
          sidebar. Each page's own bg class then fills the inner panel. */}
      <div className="flex-1 flex flex-col bg-gradient-to-bl from-black via-zinc-950 to-zinc-800 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] py-4">
        <main className="flex-1 rounded-l-2xl overflow-y-auto custom-scrollbar bg-[#F9FAFB] flex flex-col">
          <TrialExpiryBanner />
          <ImpersonationBanner />
          <GlobalOAuthHandler />
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainSideBar;
