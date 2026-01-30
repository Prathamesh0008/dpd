"use client";
import AuthGuard from "@/components/AuthGuard";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminShipmentsPage() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("Loading...");

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      const r = await fetch("/api/shipments/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await r.json();
      if (!j.ok) {
        setMsg(j.message || "Failed");
        return;
      }
      setItems(j.shipments || []);
      setMsg("");
    })();
  }, []);

  return (
    <AuthGuard role="admin">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">All Shipments</h1>
          <Link href="/admin" className="text-white/70 hover:text-white">← Back</Link>
        </div>

        {msg && <div className="mt-4 text-white/70">{msg}</div>}

        <div className="mt-6 overflow-x-auto bg-white/5 border border-white/10 rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="text-white/70">
              <tr className="border-b border-white/10">
                <th className="text-left p-3">User</th>
                <th className="text-left p-3">Recipient Address</th>
                <th className="text-left p-3">Tracking</th>
                <th className="text-left p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-b border-white/10">
                  <td className="p-3">
                    <div className="font-semibold">{s.user?.name || "-"}</div>
                    <div className="text-white/60">{s.user?.email || "-"}</div>
                  </td>
                  <td className="p-3 text-white/80">
                    <div>{s.recipient?.name1 || "-"}</div>
                    <div className="text-white/60">
                      {s.recipient?.street || "-"}, {s.recipient?.city || "-"} {s.recipient?.zipCode || ""}, {s.recipient?.country || ""}
                    </div>
                  </td>
                  <td className="p-3 font-semibold">{s.trackingNumber || "-"}</td>
                  <td className="p-3 text-white/60">{new Date(s.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AuthGuard>
  );
}
