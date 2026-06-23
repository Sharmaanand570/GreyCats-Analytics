import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { initCSPReporting } from "./utils/security/cspReporter";
import { initIntegrityMonitoring } from "./utils/security/integrityCheck";
import { HashRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ClientProvider } from "./context/ClientContext.tsx";
import { ThemeProvider } from "next-themes";

// Initialize security monitoring
if (typeof window !== 'undefined') {
  const { hash, pathname, search, origin } = window.location;
  const needsHashRedirect =
    !hash &&
    pathname.startsWith("/integrations/") &&
    pathname.includes("/connect");

  if (needsHashRedirect) {
    const nextHash = `#${pathname}${search}`;
    window.location.replace(`${origin}/${nextHash}`);
  } else {
    initCSPReporting();
    initIntegrityMonitoring();
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <ThemeProvider attribute="class" defaultTheme="light">
          <ClientProvider>
            <App />
            <Toaster closeButton />
          </ClientProvider>
        </ThemeProvider>
      </HashRouter>
    </QueryClientProvider>
  </StrictMode>
);
