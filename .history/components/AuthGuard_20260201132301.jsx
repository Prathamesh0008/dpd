"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children, role }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");

    // Not logged in
    if (!token || !userRaw) {
      router.replace("/");
      return;
    }

    let user;
    try {
      user = JSON.parse(userRaw);
    } catch {
      router.replace("/");
      return;
    }

    // Role check
    if (role && user.role !== role) {
      router.replace("/dashboard");
      return;
    }

    // ✅ Passed all checks
    setAllowed(true);
  }, [router, role]);

  // ⛔ Block rendering until checks finish
  if (!allowed) return null;

  return children;
}
