
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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
} from "lucide-react";
import { FiMenu } from "react-icons/fi";
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


function MainSideBar(): React.JSX.Element {
  const location = useLocation();
  const [activeTab, setActive] = useState(location.pathname);
  const is404Page = location.pathname.startsWith("/404");
  const { user, fetchProfile, logout } = useUserStore();
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
  }, [location.pathname]);

  // Initialize collapse state based on current route
  const getInitialCollapseState = () => {
    const isReportBuilder = /^\/reports\/.+/.test(location.pathname);
    const isClientDetails = /^\/clients\/.+/.test(location.pathname);
    const isEditDashboard = location.pathname.startsWith("/edit-dashboard");
    return isReportBuilder || isClientDetails || isEditDashboard;
  };

  const [collabsState, setcollabsState] = useState<boolean>(
    getInitialCollapseState()
  );

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Analytics: true,
    Settings: false,
  });

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const navigate = useNavigate();

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

  const handleChangeURL = (path: string): void => {
    if (path === "logout") {
      handleLogout();
      return;
    }

    // Append clientId to scheduler paths if available
    let finalPath = path;
    if (currentClient?.id && (path.includes("social-media/scheduler") || path.includes("blog/scheduler"))) {
      finalPath = `${path}/${currentClient.id}`;
    }

    navigate(finalPath);
    setActive(finalPath);
  };

  useEffect(() => {
    const isSideBarOnReportBuilderPage = /^\/reports\/.+/.test(
      location.pathname
    );
    const isSideBarOnClientDetailsPage = /^\/clients\/.+/.test(
      location.pathname
    );

    const isUserOnEditDashboard = location.pathname.startsWith("/edit-dashboard");

    const shouldCollapse =
      isSideBarOnReportBuilderPage ||
      isSideBarOnClientDetailsPage ||
      isUserOnEditDashboard;
    setcollabsState(shouldCollapse);
  }, [location.pathname]);
  const isAuthPage = /^\/auth\/(login|signup)$/.test(location.pathname);

  if (isAuthPage)
    return (
      <main className="flex-1 bg-[#F9FAFB] w-full h-full">
        <Outlet />
      </main>
    );

  const menuGroups = [
    {
      label: "Analytics",
      isCollapsible: true,
      items: [
        { label: "Clients", path: "/clients", icon: <Layers /> },
        { label: "Alerts", path: "/alerts", icon: <Bell /> },
        { label: "Reports", path: "/reports", icon: <FileText /> },
      ],
    },
    {
      label: "Scheduler",
      isCollapsible: true,
      items: [
        { label: "Social Media", path: "/social-media/scheduler", icon: <CalendarDays /> },
        { label: "Blog", path: "/blog/scheduler", icon: <PenLine /> },
      ],
    },
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
    <div className="flex relative bg-gradient-to-b from-black via-zinc-950 to-zinc-800 ">
      {/* ---------- 🖥️ DESKTOP SIDEBAR ---------- */}
      {is404Page ? null : (
        <SidebarProvider
          className={` transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] hidden md:block ${!collabsState ? "w-[16rem]" : "w-24"
            }`}
        >
          <Sidebar
            className={`transition-all border-none duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${!collabsState ? "w-[16rem] " : "w-24"
              } h-screen`}
          >
            <SidebarContent
              className={`bg-gradient-to-b from-black via-zinc-950 to-zinc-800 text-white transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${collabsState ? "px-0" : "px-2"
                }`}
            >
              {/* className="bg-black" */}
              {/* Header */}
              <SidebarGroup>
                <SidebarGroupLabel className="p-0 w-full relative justify-between px-2 py-8 pb-4">
                  <div
                    className={`flex items-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${collabsState ? "justify-center w-full" : "justify-center w-full px-4"
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

              {/* Client Selector Area */}
              <div className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] mb-6 ${collabsState ? "px-0 flex justify-center" : "px-2"}`}>
                <ClientSelector isCollapsed={collabsState} />
              </div>

              {/* Menu Groups */}
              {menuGroups.map((group) => {
                const isOpen = openGroups[group.label] !== false;
                return (
                <SidebarGroup key={group.label}>
                  {!collabsState && (
                    <div
                      role="button"
                      onClick={() => group.isCollapsible && toggleGroup(group.label)}
                      className={`flex items-center justify-between w-full h-10 px-3 mt-1 mb-1 rounded-md transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                        group.isCollapsible ? "cursor-pointer bg-zinc-800/40 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/50 shadow-sm" : "text-zinc-500 font-semibold uppercase text-xs"
                      } ${
                        collabsState ? "opacity-0 max-h-0 overflow-hidden hidden" : "opacity-100 max-h-20 flex"
                      }`}
                    >
                      {group.isCollapsible ? (
                        <span className="text-[15px] font-medium tracking-wide">
                          {group.label}
                        </span>
                      ) : (
                        <span className="text-xs tracking-wider uppercase">
                          {group.label}
                        </span>
                      )}
                      {group.isCollapsible && (
                        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  )}
                  <SidebarGroupContent className={`transition-all duration-300 ease-in-out overflow-hidden ${group.isCollapsible && !isOpen && !collabsState ? "max-h-0 opacity-0" : "max-h-[1000px] opacity-100"}`}>
                    <SidebarMenu>
                      {group.items.map((item, index) => (
                        <SidebarMenuItem key={item.path}>
                          <SidebarMenuButton
                            onClick={() => handleChangeURL(item.path)}
                            className={`group  text-[1rem] rounded-[0.5rem] font-normal h-11 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-zinc-800 hover:text-zinc-100 ${!collabsState
                              ? "px-4"
                              : "flex justify-center items-center"
                              } ${(item.path !== "/" &&
                                activeTab.startsWith(item.path)) ||
                                item.path === activeTab
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
                              <span className="ml-2 hidden md:hidden lg:block transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                                {item.label}
                              </span>
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              )})}

              {/* Footer */}
              <SidebarFooter className="mt-auto border-t border-zinc-700 pt-4">
                <div
                  onClick={() => handleChangeURL("/account-setup")}
                  className="flex items-center gap-3 rounded-md px-2 py-3 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-zinc-800/50 cursor-pointer"
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-9 w-9 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110">
                      <AvatarImage src={getProfileImageUrl(user?.profilePicture)} alt={user?.fullName} />
                      <AvatarFallback className="bg-zinc-700 text-xs font-medium text-zinc-100">
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
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      )}

      {/* ---------- 📱 MOBILE SIDEBAR (ShadCN Sheet) ---------- */}
      {is404Page ? null : (
        <div className="md:hidden absolute top-4 left-4 z-50">
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
              <nav className="flex flex-col space-y-6 grow">
                {menuGroups.map((group, groupIndex) => {
                  const isOpen = openGroups[group.label] !== false;
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
                      className={`flex items-center justify-between w-full h-11 px-3 mb-2 rounded-md transition-all duration-300 ${
                        group.isCollapsible ? "cursor-pointer bg-zinc-800/40 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/50 shadow-sm" : "text-zinc-500 uppercase text-xs font-semibold"
                      }`}
                      onClick={() => group.isCollapsible && toggleGroup(group.label)}
                    >
                      {group.isCollapsible ? (
                        <span className="text-[15px] font-medium tracking-wide">
                          {group.label}
                        </span>
                      ) : (
                        <h3 className="tracking-wider m-0">
                          {group.label}
                        </h3>
                      )}
                      {group.isCollapsible && (
                        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                      )}
                    </div>
                    <div className={`flex flex-col space-y-2 overflow-hidden transition-all duration-300 ${group.isCollapsible && !isOpen ? "max-h-0 opacity-0" : "max-h-[500px] opacity-100"}`}>
                      {group.items.map((item, itemIndex) => (
                        <button
                          key={item.path}
                          onClick={() => handleChangeURL(item.path)}
                          className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-zinc-800 hover:translate-x-1 ${activeTab === item.path
                            ? "bg-zinc-800 translate-x-1 text-white"
                            : "text-zinc-300"
                            }`}
                          style={{
                            transitionDelay: `${groupIndex * 60 + itemIndex * 30
                              }ms`,
                          }}
                        >
                          <span className="transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110">
                            {item.icon}
                          </span>
                          <span className="transition-colors duration-300">
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )})}
              </nav>

              {/* Footer */}
              <div className="mt-auto pt-6 border-t border-zinc-700">
                <div
                  onClick={() => handleChangeURL("/account-setup")}
                  className="flex items-center gap-3 mt-4 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:opacity-80 cursor-pointer"
                >
                  <Avatar className="h-9 w-9 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110">
                    <AvatarImage src={getProfileImageUrl(user?.profilePicture)} alt={user?.fullName} />
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
      <main className="flex-1 bg-[#F9FAFB] overflow-y-auto transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
        <TrialExpiryBanner />
        <ImpersonationBanner />
        <GlobalOAuthHandler />
        <Outlet />
      </main>
    </div>
  );
}

export default MainSideBar;
