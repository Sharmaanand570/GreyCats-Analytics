import { isAuthenticated, StorageKey } from "@/utils/storage";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";

function AuthParentComp(): React.JSX.Element | null {
  const location = useLocation();
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const authed = isAuthenticated(StorageKey.ANALYTICS_TOKEN);

    const publicPaths = ["/auth/login", "/auth/signup", "/auth/forgot-password"];
    const isPublic = publicPaths.includes(location.pathname);



    if (!authed && !isPublic) {
      navigate("/auth/login");
      return;
    }

    if (authed && isPublic) {
      navigate("/");
      return;
    }

    setCheckingAuth(false);
  }, [location.pathname, navigate]);

  if (checkingAuth) return null; // prevents flicker

  return (
    <>
      <ImpersonationBanner />
      <Outlet />
    </>
  );
}

export default AuthParentComp;
