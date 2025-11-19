import { getAuthToken, StorageKey } from "@/utils/storage";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

function AuthParentComp() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAuthToken(StorageKey.ANALYTICS_TOKEN);
    if (token !== null) navigate("/");
  }, [navigate, getAuthToken]);

  return (
    <div>
      <Outlet />
    </div>
  );
}

export default AuthParentComp;
