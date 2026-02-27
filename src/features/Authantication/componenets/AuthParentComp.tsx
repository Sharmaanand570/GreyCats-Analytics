import { isAuthenticated, StorageKey } from "@/utils/storage";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";


function AuthParentComp(): React.JSX.Element | null {
  const location = useLocation();
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const authed = isAuthenticated(StorageKey.ANALYTICS_TOKEN);

    const publicPaths = ["/", "/auth/login", "/auth/signup", "/auth/forgot-password"];
    const isPublic = publicPaths.includes(location.pathname);

    if (!authed && !isPublic) {
      navigate("/auth/login");
      return;
    }

    // Only redirect to / if we are on a public path OTHER THAN the landing page
    if (authed && isPublic && location.pathname !== "/") {
      navigate("/");
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
