import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import MainSideBar from "./components/MainSideBar";
import AuthParentComp from "./features/Authantication/componenets/AuthParentComp";
import ShopifyCallbackHandler from "./features/shopify/componenets/ShopifyCallbackHandler";
import MetaCallbackHandler from "./features/meta/components/MetaCallbackHandler";

// Lazy load components for code splitting
const Dashboard = lazy(() => import("./components/Dashboard"));
const EditDashboard = lazy(() => import("./components/EditDashboard"));
const AuthPage = lazy(
  () => import("./features/Authantication/componenets/AuthPage")
);
const Integrations = lazy(() => import("./pages/Integrations"));
const YouTubeDetailPage = lazy(() => import("./pages/YouTubeDetailPage"));
const WooCommerceDetailPage = lazy(() => import("./pages/WooCommerceDetailPage"));
const Reports = lazy(() => import("./components/Reports"));
const ReportBuilder = lazy(() => import("./pages/ReportBuilder"));
const Goals = lazy(() => import("./pages/GoalsPage"));
const AlertsPage = lazy(() => import("./pages/AlertsPage"));
const TasksPage = lazy(() => import("./pages/TasksPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const YouTubeCallbackHandler = lazy(
  () => import("./features/YouTube/componenets/YouTubeCallbackHandler")
);
const GoogleCallbackHandler = lazy(
  () => import("./components/GoogleCallbackHandler")
);
const GoogleConsoleCallbackHandler = lazy(
  () => import("./components/GoogleConsoleCallbackHandler")
);

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<AuthParentComp />}>
          {/* Public auth routes - no sidebar */}
          <Route path="auth">
            <Route path="login" element={<AuthPage />} />
            <Route path="signup" element={<AuthPage />} />
          </Route>

          {/* Protected routes with sidebar */}
          <Route path="/" element={<MainSideBar />}>
            <Route index element={<Dashboard />} />
            <Route path="edit-dashboard" element={<EditDashboard />} />

            <Route path="data-sources">
              <Route index element={<Integrations />} />
              <Route path="youtube" element={<YouTubeDetailPage />} />
              <Route path="woocommerce" element={<WooCommerceDetailPage />} />
            </Route>

            <Route path="reports">
              <Route index element={<Reports />} />
              <Route path=":id" element={<ReportBuilder />} />
            </Route>

            <Route path="goals" element={<Goals />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="account-setup" element={<SettingsPage />} />
          </Route>

          {/* OAuth callback routes - no sidebar */}
          <Route path="youtube/callback" element={<YouTubeCallbackHandler />} />
          <Route path="google/callback" element={<GoogleCallbackHandler />} />
          <Route
            path="google-console/callback"
            element={<GoogleConsoleCallbackHandler />}
          />
          <Route path="shopify/callback" element={<ShopifyCallbackHandler />} />
          <Route path="meta/callback" element={<MetaCallbackHandler />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
