import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { checkToken } from "../services/user";

export function HomeRedirect() {
  const [loading, setLoading] = useState(true);
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setRedirect("/home");
      setLoading(false);
      return;
    }

    checkToken(token)
      .then((res) => {
        if (res.message === "admin") {
          setRedirect("/admin");
        } else if (res.message === "petugas") {
          setRedirect("/petugas");
        } else if (res.message === "koordinator") {
          setRedirect("/koordinator");
        } else {
          setRedirect("/404");
        }
      })
      .catch(() => setRedirect("/home"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div></div>;
  return <Navigate to={redirect} replace />;
}
