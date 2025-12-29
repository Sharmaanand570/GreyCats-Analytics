"use client";

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
import type React from "react";
import {
  Bell,
  FileText,
  Layers,
  Settings,
  CircleChevronRight,
  LogOut,
} from "lucide-react";
import { FiMenu } from "react-icons/fi";
import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { ClientSelector } from "./ClientSelector";
import { removeAuthToken, StorageKey } from "@/utils/storage";



function MainSideBar(): React.JSX.Element {
  const location = useLocation();
  const [activeTab, setActive] = useState(location.pathname);
  const is404Page = location.pathname.startsWith("/404");

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

  const navigate = useNavigate();

  const handleLogout = () => {
    removeAuthToken(StorageKey.ANALYTICS_TOKEN);
    // Force a hard reload to clear any in-memory state or query caches, then go to login
    window.location.href = "/auth/login";
  };

  const handleChangeURL = (path: string): void => {
    if (path === "logout") {
      handleLogout();
      return;
    }
    navigate(path);
    setActive(path);
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
      label: "Main",
      items: [
        { label: "Clients", path: "/clients", icon: <Layers /> },
      ],
    },
    {
      label: "Work",
      items: [
        { label: "Alerts", path: "/alerts", icon: <Bell /> },
      ],
    },
    {
      label: "Data",
      items: [
        { label: "Reports", path: "/reports", icon: <FileText /> },
      ],
    },
    {
      label: "Settings",
      items: [
        { label: "Account Setup", path: "/account-setup", icon: <Settings /> },
        { label: "Logout", path: "logout", icon: <LogOut /> },
      ],
    },
  ];

  return (
    <div className="flex  bg-gradient-to-b from-black via-zinc-950 to-zinc-800 ">
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
                    className={`flex items-center gap-2 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${collabsState ? "justify-center w-full" : "px-0"
                      }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 font-bold">
                      G
                    </div>
                    {!collabsState && (
                      <span className="font-semibold text-lg tracking-tight text-white whitespace-nowrap overflow-hidden">
                        GreyCats
                      </span>
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
              {menuGroups.map((group) => (
                <SidebarGroup key={group.label}>
                  {!collabsState && (
                    <SidebarGroupLabel
                      className={`text-xs mb-2 uppercase tracking-wider text-zinc-400 px-2 pt-6 pb-2 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${collabsState
                        ? "opacity-0 max-h-0 overflow-hidden"
                        : "opacity-100 max-h-20"
                        }`}
                    >
                      {group.label}
                    </SidebarGroupLabel>
                  )}
                  <SidebarGroupContent>
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
              ))}

              {/* Footer */}
              <SidebarFooter className="mt-auto border-t border-zinc-700 pt-4">
                <div className="flex items-center gap-3 rounded-md px-2 py-3 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-zinc-800/50">
                  <div className="flex size-9 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-zinc-100 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110">
                    AV
                  </div>
                  {!collabsState && (
                    <div
                      className={`min-w-0 md:hidden lg:block transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${collabsState
                        ? "opacity-0 max-w-0 overflow-hidden"
                        : "opacity-100 max-w-full"
                        }`}
                    >
                      <div className="text-sm font-medium leading-tight text-white transition-colors duration-300">
                        Alex Cohen
                      </div>
                      <div className="text-xs text-zinc-400 leading-tight transition-colors duration-300">
                        Analyst
                      </div>
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
                Analyst
              </h2>

              {/* Menu Groups */}
              <nav className="flex flex-col space-y-6 grow">
                {menuGroups.map((group, groupIndex) => (
                  <div
                    key={group.label}
                    className="transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                    style={{
                      transitionDelay: `${groupIndex * 60}ms`,
                      opacity: 1,
                      transform: "translateX(0)",
                    }}
                  >
                    <h3 className="text-xs uppercase tracking-wider text-zinc-400 mb-2 px-1 transition-colors duration-300">
                      {group.label}
                    </h3>
                    <div className="flex flex-col space-y-2">
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
                ))}
              </nav>

              {/* Footer */}
              <div className="mt-auto pt-6 border-t border-zinc-700">
                <div className="flex items-center gap-3 mt-4 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:opacity-80">
                  <div className="flex size-9 items-center justify-center rounded-full bg-zinc-600 text-xs font-medium text-white transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110">
                    AV
                  </div>
                  <div>
                    <div className="text-sm font-medium leading-tight transition-colors duration-300">
                      Alex Cohen
                    </div>
                    <div className="text-xs text-zinc-400 leading-tight transition-colors duration-300">
                      Analyst
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
        <Outlet />
      </main>
    </div>
  );
}

export default MainSideBar;
