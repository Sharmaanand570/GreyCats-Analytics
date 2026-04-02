import { isAuthenticated, StorageKey } from "@/utils/storage";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";


function AuthParentComp(): React.JSX.Element | null {
  const location = useLocation();
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const { hash, pathname, search, origin } = window.location;
      const hasHashRoute = Boolean(hash);
      const isRootPath = pathname === "/";

      if (!hasHashRoute && !isRootPath) {
        window.location.replace(`${origin}/#${pathname}${search}`);
        return;
      }

      if (hasHashRoute && !isRootPath) {
        window.location.replace(`${origin}/${hash}`);
        return;
      }
    }

    const authed = isAuthenticated(StorageKey.ANALYTICS_TOKEN);

    // Pages accessible without login
    const allPublicPaths = ["/", "/auth/login", "/auth/signup", "/auth/forgot-password", "/pricing", "/billing", "/checkout"];
    // Pages that should redirect already-logged-in users away (auth-only pages)
    const authRedirectPaths = ["/auth/login", "/auth/signup", "/auth/forgot-password"];

    const isPublic = allPublicPaths.includes(location.pathname);
    const isAuthOnlyPage = authRedirectPaths.includes(location.pathname);

    if (!authed && !isPublic) {
      navigate("/auth/login");
      return;
    }

    // Only redirect to dashboard if on an auth page (login/signup) — NOT pricing/billing
    // But if there's a redirect param (e.g. from pricing flow), honour it instead
    if (authed && isAuthOnlyPage) {
      const params = new URLSearchParams(location.search);
      const redirect = params.get("redirect");
      if (redirect) {
        const url = new URL(redirect, window.location.origin);
        for (const [key, value] of params.entries()) {
          if (key !== "redirect" && key !== "reason") url.searchParams.set(key, value);
        }
        navigate(url.pathname + url.search, { replace: true });
      } else {
        navigate("/clients");
      }
      return;
    }

    setCheckingAuth(false);
  }, [location.pathname, navigate]);

  if (checkingAuth) return null; // prevents flicker

  return (
    <>

      <Outlet />
    </>
  );
}

export default AuthParentComp;
