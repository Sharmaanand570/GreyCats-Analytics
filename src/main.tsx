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

// Initialize security monitoring
if (typeof window !== 'undefined') {
  initCSPReporting();
  initIntegrityMonitoring();
}

const queryClient = new QueryClient({
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
        <ClientProvider>
          <App />
          <Toaster closeButton />
        </ClientProvider>
      </HashRouter>
    </QueryClientProvider>
  </StrictMode>
);
