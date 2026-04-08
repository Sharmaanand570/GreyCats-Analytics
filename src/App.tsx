import { lazy, Suspense } from "react";
import { usePageTracking } from "./hooks/usePageTracking";
import CookieConsentBanner from "./components/CookieConsentBanner";
import { Routes, Route, Navigate } from "react-router-dom";
import MainSideBar from "./components/MainSideBar";
import AuthParentComp from "./features/Authantication/componenets/AuthParentComp";
import ShopifyCallbackHandler from "./features/shopify/componenets/ShopifyCallbackHandler";
import MetaCallbackHandler from "./features/meta/components/MetaCallbackHandler";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import { UpgradeModal } from "./components/subscription/UpgradeModal";
import { useUpgradeModalStore } from "./store/useUpgradeModalStore";

// Lazy load components
// Dashboard removed from App.tsx as it is now only used in ClientDetailPage

const EditDashboard = lazy(() => import("./components/EditDashboard"));
const AuthPage = lazy(
  () => import("./features/Authantication/componenets/AuthPage")
);
const SignupDetailsPage = lazy(
  () => import("./features/Authantication/componenets/SignupDetailsPage")
);

const ForgotPassword = lazy(
  () => import("./features/Authantication/componenets/ForgotPassword")
);
const Integrations = lazy(() => import("./pages/Integrations"));
const YouTubeDetailPage = lazy(() => import("./pages/YouTubeDetailPage"));
const WooCommerceDetailPage = lazy(
  () => import("./pages/WooCommerceDetailPage")
);
const ShopifyDetailPage = lazy(() => import("./pages/ShopifyDetailPage"));
const GoogleAnalyticsDetailPage = lazy(
  () => import("./pages/GoogleAnalyticsDetailPage")
);
const GoogleConsoleDetailPage = lazy(
  () => import("./pages/GoogleConsoleDetailPage")
);
const MetaDetailPage = lazy(() => import("./pages/MetaDetailPage"));
const MetaBusinessDetailPage = lazy(() => import("./pages/MetaBusinessDetailPage"));
const FacebookInsightsPage = lazy(() => import("./pages/FacebookInsightsPage"));
const InstagramInsightsPage = lazy(
  () => import("./pages/InstagramInsightsPage")
);
const GoogleAdsDetailPage = lazy(() => import("./pages/GoogleAdsDetailPage"));
const GoogleAdsConnectPage = lazy(() => import("./pages/GoogleAdsConnectPage"));
const ReportsLandingPage = lazy(() => import("./pages/ReportsLandingPage"));

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
const GoogleAdsCallbackHandler = lazy(
  () => import("./components/GoogleAdsCallbackHandler")
);
const TwitterCallbackHandler = lazy(
  () => import("./features/twitter/components/TwitterCallbackHandler")
);
const TwitterDetailPage = lazy(
  () => import("./pages/TwitterDetailPage")
);
const LinkedinCallbackHandler = lazy(
  () => import("./features/linkedin/components/LinkedinCallbackHandler")
);
const LinkedinDetailPage = lazy(
  () => import("./pages/LinkedinDetailPage")
);
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

const SocialMediaSchedulerPage = lazy(() => import("./pages/SocialMediaSchedulerPage"));
const BlogSchedulerPage = lazy(() => import("./pages/BlogSchedulerPage"));

// Multi-Client Pages
const ClientsPage = lazy(() => import("./pages/ClientsPage"));
const ClientDetailPage = lazy(() => import("./pages/ClientDetailPage"));
const OAuthCallbackPage = lazy(() => import("./pages/OAuthCallbackPage"));
const SharedReportPage = lazy(() => import("./pages/SharedReportPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const CookiePolicyPage = lazy(() => import("./pages/CookiePolicyPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const PricingPage = lazy(() => import("./pages/pricing/PricingPage"));
const BillingPage = lazy(() => import("./pages/billing/BillingPage"));
const CheckoutPage = lazy(() => import("./pages/pricing/CheckoutPage"));

// Admin Pages
const AdminLayout = lazy(() => import("./components/AdminLayout"));
const AdminDashboard = lazy(() => import("./features/admin/pages/AdminDashboard"));
const UsersListPage = lazy(() => import("./features/admin/pages/UsersListPage"));
const UserDetailsPage = lazy(() => import("./features/admin/pages/UserDetailsPage"));
const ClientsListPage = lazy(() => import("./features/admin/pages/ClientsListPage"));
const ClientDetailsPage = lazy(() => import("./features/admin/pages/ClientDetailsPage"));
const PlansPage = lazy(() => import("./features/admin/pages/PlansPage"));
const UserSubscriptionsPage = lazy(() => import("./features/admin/pages/UserSubscriptionsPage"));
const SystemStatsPage = lazy(() => import("./features/admin/pages/SystemStatsPage"));
const ActivityTimelinePage = lazy(() => import("./features/admin/pages/ActivityTimelinePage"));
const IntegrationHealthPage = lazy(() => import("./features/admin/pages/IntegrationHealthPage"));
const SystemConfigPage = lazy(() => import("./features/admin/pages/SystemConfigPage"));
const RoleGuard = lazy(() => import("./components/RoleGuard"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

/** Reads from the global Zustand store — auto-shown on any 403 upgradeRequired */
function GlobalUpgradeModal() {
  const { isOpen, reason, close } = useUpgradeModalStore();
  return <UpgradeModal isOpen={isOpen} onClose={close} reason={reason} />;
}

function App() {
  usePageTracking();
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <ScrollToTop />
        <GlobalUpgradeModal />
        <CookieConsentBanner />
        <Routes>
          <Route path="/" element={<AuthParentComp />}>
            <Route index element={<LandingPage />} />
            {/* Public auth routes */}
            {/* Public auth routes */}
            <Route path="auth">
              <Route index element={<AuthPage />} />
              <Route path="login" element={<AuthPage />} />
              <Route path="signup" element={<AuthPage />} />
              <Route path="signup-details" element={<SignupDetailsPage />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Protected routes with sidebar */}
            <Route path="/" element={<MainSideBar />}>
              {/* Multi-Client Routes */}
              <Route path="clients">
                <Route index element={<ClientsPage />} />
                <Route path=":clientId/reports/new" element={<ReportBuilder />} />
                <Route path=":clientId/reports/:id" element={<ReportBuilder />} />
                <Route path=":clientId/reports" element={<Reports />} />
                <Route path=":clientId/edit-dashboard" element={<EditDashboard />} />
                <Route path=":clientId" element={<ClientDetailPage />} />
              </Route>

              <Route index element={<Navigate to="clients" replace />} />


              <Route path="data-sources">
                <Route index element={<Integrations />} />
                <Route path="youtube/:clientId?" element={<YouTubeDetailPage />} />
                <Route path="woocommerce" element={<WooCommerceDetailPage />} />
                <Route path="shopify" element={<ShopifyDetailPage />} />
                <Route
                  path="google-analytics/:clientId?"
                  element={<GoogleAnalyticsDetailPage />}
                />
                <Route
                  path="google-console/:clientId?"
                  element={<GoogleConsoleDetailPage />}
                />
                <Route path="meta-ads/:clientId?" element={<MetaDetailPage />} />
                <Route path="meta-business/:clientId?" element={<MetaBusinessDetailPage />} />
                <Route path="meta-facebook/:clientId?" element={<FacebookInsightsPage />} />
                <Route
                  path="meta-instagram/:clientId?"
                  element={<InstagramInsightsPage />}
                />
                <Route path="google-ads/:clientId?" element={<GoogleAdsDetailPage />} />
                <Route path="twitter/:clientId?" element={<TwitterDetailPage />} />
                <Route path="linkedin/:clientId?" element={<LinkedinDetailPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              <Route path="integrations">
                <Route index element={<Integrations />} />
                <Route path="google-ads/connect" element={<GoogleAdsConnectPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>



              <Route path="goals" element={<Goals />} />
              <Route path="reports" element={<ReportsLandingPage />} />
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="account-setup" element={<SettingsPage />} />
              <Route path="social-media/scheduler" element={<SocialMediaSchedulerPage />} />
              <Route path="blog/scheduler" element={<BlogSchedulerPage />} />
            </Route>

            {/* 404 catch-all for protected area — outside sidebar */}
            <Route path="404" element={<NotFoundPage />} />

            {/* Admin Routes */}
            <Route element={<RoleGuard allowedRoles={["ADMIN", "SUPER_ADMIN"]} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="user" element={<Navigate to="users" replace />} />
                <Route path="users" element={<UsersListPage />} />
                <Route path="users/:userId" element={<UserDetailsPage />} />
                <Route path="client" element={<Navigate to="clients" replace />} />
                <Route path="clients" element={<ClientsListPage />} />
                <Route path="clients/:clientId" element={<ClientDetailsPage />} />
                <Route path="subscriptions/plans" element={<PlansPage />} />
                <Route path="subscriptions/users" element={<UserSubscriptionsPage />} />
                <Route path="monitoring/stats" element={<SystemStatsPage />} />
                <Route path="monitoring/activity" element={<ActivityTimelinePage />} />
                <Route path="monitoring/integrations" element={<IntegrationHealthPage />} />
                <Route path="system" element={<SystemConfigPage />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Route>
            </Route>

            {/* Pricing & Billing — full-page, no sidebar */}
            <Route path="pricing" element={<PricingPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="checkout" element={<CheckoutPage />} />

            {/* OAuth callback routes */}
            <Route path="youtube/callback" element={<YouTubeCallbackHandler />} />
            <Route path="google/callback" element={<GoogleCallbackHandler />} />
            <Route
              path="google-console/callback"
              element={<GoogleConsoleCallbackHandler />}
            />
            <Route
              path="google-seo/callback"
              element={<GoogleConsoleCallbackHandler />}
            />
            <Route path="shopify/callback" element={<ShopifyCallbackHandler />} />
            <Route path="meta/callback" element={<MetaCallbackHandler />} />
            <Route path="meta-business/callback" element={<MetaCallbackHandler />} />
            <Route path="google-ads/callback" element={<GoogleAdsCallbackHandler />} />
            <Route path="twitter/callback" element={<TwitterCallbackHandler />} />
            <Route path="linkedin/callback" element={<LinkedinCallbackHandler />} />

            {/* Multi-Client OAuth Callback */}
            <Route path="oauth/callback" element={<OAuthCallbackPage />} />

          </Route>

          {/* Shared Report View (Public) */}
          <Route path="shared/reports/:id" element={<SharedReportPage />} />

          {/* Legal Pages (Public - no auth required) */}
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          <Route path="/terms" element={<Navigate to="/terms-of-service" replace />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/cookies" element={<CookiePolicyPage />} />

          {/* Dedicated 404 route (accessible from anywhere) */}
          <Route path="/404" element={<NotFoundPage />} />

          {/* Global catch-all for any unmatched routes — no sidebar */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
