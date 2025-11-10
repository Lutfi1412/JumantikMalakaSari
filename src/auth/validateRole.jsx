import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { checkToken } from "../services/user";

export function RequireRole({ allowedRoles, children }) {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setRole(null);
      setLoading(false);
      return;
    }

    checkToken(token)
      .then((res) => setRole(res.message))
      .catch(() => setRole(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!role) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(role)) return <Navigate to="/404" replace />;

  return children || <Outlet />;
}
