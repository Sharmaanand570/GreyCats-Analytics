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

    const publicPaths = ["/", "/auth/login", "/auth/signup", "/auth/forgot-password"];
    const isPublic = publicPaths.includes(location.pathname);

    if (!authed && !isPublic) {
      navigate("/auth/login");
      return;
    }

    // Only redirect to dashboard if we are on a public path OTHER THAN the landing page
    if (authed && isPublic && location.pathname !== "/") {
      navigate("/clients");
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
