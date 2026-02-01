"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children, role }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token || !user) {
      router.replace("/");
      return;
    }
    if (role) {
      const u = JSON.parse(user);
      if (u.role !== role) router.replace("/dashboard");
    }
  }, [router, role]);

  return children;
}
