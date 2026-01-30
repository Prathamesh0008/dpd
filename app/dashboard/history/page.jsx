"use client";
import AuthGuard from "@/components/AuthGuard";
import { useEffect, useState } from "react";
import Link from "next/link";
import { downloadPdfFromBase64 } from "@/components/downloadPdf";

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("Loading...");

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      const r = await fetch("/api/shipments/history", {
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
    <AuthGuard>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My History</h1>
          <Link href="/dashboard" className="text-white/70 hover:text-white">← Back</Link>
        </div>

        {msg && <div className="mt-4 text-white/70">{msg}</div>}

        <div className="mt-6 space-y-3">
          {items.map((s) => (
            <div key={s.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="text-sm text-white/70">Tracking</div>
                  <div className="text-lg font-bold">{s.trackingNumber || "-"}</div>
                  <div className="text-xs text-white/60 mt-1">
                    To: {s.recipient?.name1 || "-"}, {s.recipient?.city || "-"} {s.recipient?.zipCode || ""}
                  </div>
                </div>

                <button
                  onClick={() => downloadPdfFromBase64(s.labelBase64, `${s.trackingNumber || "label"}.pdf`)}
                  className="bg-green-600 hover:bg-green-700 rounded-lg px-4 py-2 font-semibold"
                >
                  Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
}
