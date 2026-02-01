"use client";

import AuthGuard from "@/components/AuthGuard";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { downloadPdfFromBase64 } from "@/components/downloadPdf";
import {
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Download,
} from "lucide-react";

const DPD_RED = "#DC0032";

export default function CreateLabelPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [checkingToken, setCheckingToken] = useState(true);

  const sender = useMemo(
    () => ({
      name1: "Your Company Name",
      street: "Your Street Address",
      city: "Your City",
      zipCode: "1234 AB",
      country: "NL",
      phone: "+31 123 456 789",
      email: "sender@example.com",
    }),
    []
  );

  const sendingDepot = "0511";
  const product = "CL";

  const [weight, setWeight] = useState("");
  const [recipient, setRecipient] = useState({
    name1: "",
    email: "",
    phone: "",
    zipCode: "",
    houseNo: "",
    addition: "",
    street: "",
    city: "",
    country: "NL",
  });

  useEffect(() => {
    checkTokenValidity();
  }, []);

  async function checkTokenValidity() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return setIsTokenValid(false);

      const r = await fetch("/api/auth/check-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const j = await r.json().catch(() => ({}));
      setIsTokenValid(Boolean(j.isValid));
    } catch {
      setIsTokenValid(false);
    } finally {
      setCheckingToken(false);
    }
  }

  async function refreshToken() {
    try {
      setLoading(true);
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token");

      const r = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      const j = await r.json().catch(() => ({}));
      if (!j.ok) throw new Error("Refresh failed");

      localStorage.setItem("token", j.token);
      if (j.refreshToken) localStorage.setItem("refreshToken", j.refreshToken);
      setIsTokenValid(true);
      setError("");
    } catch {
      setIsTokenValid(false);
      setError("Session expired. Please login again.");
    } finally {
      setLoading(false);
    }
  }

  async function createLabel() {
    if (!isTokenValid) return setError("Session expired");

    if (!weight || Number(weight) <= 0)
      return setError("Enter valid parcel weight");

    if (
      !recipient.name1 ||
      !recipient.street ||
      !recipient.city ||
      !recipient.zipCode ||
      !recipient.houseNo
    ) {
      return setError("Fill all required receiver fields");
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const payload = {
        sendingDepot,
        product,
        sender,
        parcel: { weight: String(weight) },
        recipient: {
          ...recipient,
          country: "NL",
        },
      };

      const r = await fetch("/api/shipments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const j = await r.json().catch(() => ({}));
      if (!j.ok) throw new Error(j.message || "Create failed");

      setResult(j.shipment);
      setStep(4);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (checkingToken) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-600">Checking authentication…</div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white text-gray-900">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Create DPD Label</h1>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm text-red-600"
            >
              <ArrowLeft size={16} />
              Dashboard
            </Link>
          </div>
        </div>

        <main className="max-w-6xl mx-auto p-6 grid md:grid-cols-3 gap-6">
          {/* Steps */}
          <div className="border rounded-xl p-5 space-y-4">
            {["Country", "Weight", "Receiver", "Done"].map((t, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  step === i + 1
                    ? "bg-red-50 border border-red-200"
                    : step > i + 1
                    ? "bg-green-50"
                    : "bg-gray-50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    step > i + 1
                      ? "bg-green-600 text-white"
                      : step === i + 1
                      ? "bg-red-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span className="text-sm font-medium">{t}</span>
              </div>
            ))}

            {!isTokenValid && (
              <button
                onClick={refreshToken}
                className="w-full mt-4 py-2 text-white rounded-lg"
                style={{ backgroundColor: DPD_RED }}
              >
                Refresh Token
              </button>
            )}
          </div>

          {/* Form */}
          <div className="md:col-span-2 space-y-6">
            {/* Step 1 */}
            {step === 1 && (
              <div className="border rounded-xl p-6">
                <h2 className="font-semibold mb-4">Destination Country</h2>
                <button
                  onClick={() => setStep(2)}
                  className="w-full border p-4 rounded-lg hover:border-red-600"
                >
                  Netherlands (NL)
                </button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="border rounded-xl p-6 space-y-4">
                <h2 className="font-semibold">Parcel Weight</h2>
                <input
                  type="number"
                  min="0.01"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full border px-4 py-3 rounded-lg"
                  placeholder="Weight in kg"
                />
                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="text-sm text-gray-600"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="px-6 py-2 text-white rounded-lg"
                    style={{ backgroundColor: DPD_RED }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="border rounded-xl p-6 space-y-4">
                <h2 className="font-semibold">Receiver Details</h2>

                {[
                  ["Full Name", "name1"],
                  ["Street", "street"],
                  ["City", "city"],
                  ["Postal Code", "zipCode"],
                  ["House No", "houseNo"],
                  ["Email", "email"],
                  ["Phone", "phone"],
                ].map(([label, key]) => (
                  <input
                    key={key}
                    placeholder={label}
                    value={recipient[key]}
                    onChange={(e) =>
                      setRecipient((p) => ({ ...p, [key]: e.target.value }))
                    }
                    className="w-full border px-4 py-3 rounded-lg"
                  />
                ))}

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="text-sm text-gray-600"
                  >
                    Back
                  </button>
                  <button
                    onClick={createLabel}
                    disabled={loading}
                    className="px-6 py-2 text-white rounded-lg"
                    style={{ backgroundColor: DPD_RED }}
                  >
                    {loading ? "Creating…" : "Create Label"}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && result && (
              <div className="border rounded-xl p-8 text-center space-y-6">
                <CheckCircle className="mx-auto text-green-600" size={48} />
                <h2 className="text-xl font-bold">Label Created</h2>
                <div className="font-mono text-lg">
                  {result.trackingNumber}
                </div>

                <button
                  onClick={() =>
                    downloadPdfFromBase64(
                      result.labelBase64,
                      `${result.trackingNumber}.pdf`
                    )
                  }
                  className="w-full py-3 text-white rounded-lg flex items-center justify-center gap-2"
                  style={{ backgroundColor: DPD_RED }}
                >
                  <Download size={18} />
                  Download PDF
                </button>
              </div>
            )}

            {error && (
              <div className="border border-red-300 bg-red-50 p-4 rounded-lg flex gap-3">
                <AlertCircle className="text-red-600" />
                <div className="text-red-700 text-sm">{error}</div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
