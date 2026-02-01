// "use client";

// import AuthGuard from "@/components/AuthGuard";
// import { useEffect, useMemo, useState } from "react";
// import Link from "next/link";
// import { downloadPdfFromBase64 } from "@/components/downloadPdf";

// export default function CreateLabelPage() {
//   // Steps:
//   // 1 = Country (NL fixed)
//   // 2 = Weight
//   // 3 = Receiver Contact + Address
//   // 4 = Result
//   const [step, setStep] = useState(1);

//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState("");

//   const [isTokenValid, setIsTokenValid] = useState(true);
//   const [checkingToken, setCheckingToken] = useState(true);

//   // ✅ FIXED SENDER DETAILS (YOU SAID FIX SENDER)
//   const sender = useMemo(
//     () => ({
//       name1: "Your Company Name",
//       street: "Your Street Address",
//       city: "Your City",
//       zipCode: "1234 AB",
//       country: "NL",
//       phone: "+31 123 456 789",
//       email: "sender@example.com",
//     }),
//     []
//   );

//   // ✅ Fixed shipment settings
//   const sendingDepot = "0511";
//   const product = "CL";

//   // ✅ Step 2
//   const [weight, setWeight] = useState("");

//   // ✅ Step 3
//   const [recipient, setRecipient] = useState({
//     name1: "",
//     email: "",
//     phone: "",
//     zipCode: "",
//     houseNo: "",
//     addition: "",
//     street: "",
//     city: "",
//     country: "NL",
//   });

//   useEffect(() => {
//     checkTokenValidity();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   async function checkTokenValidity() {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         setIsTokenValid(false);
//         setCheckingToken(false);
//         return;
//       }

//       const response = await fetch("/api/auth/check-token", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ token }),
//       });

//       const data = await response.json().catch(() => ({}));
//       setIsTokenValid(Boolean(data.isValid));
//     } catch (e) {
//       setIsTokenValid(false);
//     } finally {
//       setCheckingToken(false);
//     }
//   }

//   async function refreshToken() {
//     try {
//       setLoading(true);
//       setError("");

//       const refreshToken = localStorage.getItem("refreshToken");
//       if (!refreshToken) {
//         setIsTokenValid(false);
//         setError("No refresh token found. Please login again.");
//         return;
//       }

//       const response = await fetch("/api/auth/refresh", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ refreshToken }),
//       });

//       const data = await response.json().catch(() => ({}));

//       if (data.ok && data.token) {
//         localStorage.setItem("token", data.token);
//         if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
//         setIsTokenValid(true);
//         setError("");
//       } else {
//         setIsTokenValid(false);
//         setError("Failed to refresh token. Please login again.");
//       }
//     } catch (e) {
//       setIsTokenValid(false);
//       setError("Error refreshing token. Please login again.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   function resetForm() {
//     setStep(1);
//     setResult(null);
//     setError("");
//     setWeight("");
//     setRecipient({
//       name1: "",
//       email: "",
//       phone: "",
//       zipCode: "",
//       houseNo: "",
//       addition: "",
//       street: "",
//       city: "",
//       country: "NL",
//     });
//   }

//   // ✅ Simple validations per step (prevents DPD invalid zip errors etc.)
//   const canGoWeight = isTokenValid;
//   const canGoReceiver = Boolean(weight) && Number(weight) > 0 && isTokenValid;

//   const isReceiverValid =
//     recipient.name1.trim() &&
//     recipient.zipCode.trim() &&
//     recipient.houseNo.trim() &&
//     recipient.street.trim() &&
//     recipient.city.trim() &&
//     isTokenValid;

//   async function createLabel() {
//     if (!isTokenValid) {
//       setError("Your session has expired. Refresh token or login again.");
//       return;
//     }

//     if (!isReceiverValid) {
//       setError("Please fill receiver name, zip code, house number, street, city.");
//       return;
//     }

//     if (!weight || Number(weight) <= 0) {
//       setError("Please enter a valid weight (kg).");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setResult(null);

//     const token = localStorage.getItem("token");

//     try {
//       const payload = {
//         sendingDepot,
//         product,
//         sender,
//         // keep weight separate and clean
//         parcel: { weight: String(weight) },
//         recipient: {
//           name1: recipient.name1,
//           email: recipient.email,
//           phone: recipient.phone,
//           zipCode: recipient.zipCode,
//           houseNo: recipient.houseNo,
//           addition: recipient.addition,
//           street: recipient.street,
//           city: recipient.city,
//           country: "NL",
//         },
//       };

//       const r = await fetch("/api/shipments/create", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       const j = await r.json().catch(() => ({}));

//       if (!j.ok) {
//         const msg = j.message || "Failed to create label";

//         // token expired handling
//         if (
//           msg.toLowerCase().includes("token") ||
//           msg.includes("ERR_DELICOM_TOKEN_EXPIRED")
//         ) {
//           setIsTokenValid(false);
//           setError("Your DPD token has expired. Refresh token and try again.");
//         } else {
//           setError(msg);
//         }
//         return;
//       }

//       setResult(j.shipment);
//       setStep(4);
//     } catch (e) {
//       setError("Network error. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   if (checkingToken) {
//     return (
//       <AuthGuard>
//         <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
//           <div className="text-center">
//             <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
//             <p className="text-gray-600 text-sm">Checking authentication...</p>
//           </div>
//         </div>
//       </AuthGuard>
//     );
//   }

//   return (
//     <AuthGuard>
//       <div className="min-h-screen bg-gray-50">
//         {/* TOP BAR */}
//         <div className="bg-white border-b">
//           <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
//             <div>
//               <h1 className="text-xl font-semibold">DPD Label System</h1>
//               <p className="text-xs text-gray-500">Create label step-by-step (NL)</p>
//             </div>
//             <Link
//               href="/dashboard"
//               className="text-sm px-3 py-2 rounded border hover:bg-gray-50"
//             >
//               ← Back
//             </Link>
//           </div>
//         </div>

//         <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
//           {/* LEFT SIDEBAR (DPD STYLE) */}
//           <aside className="col-span-12 md:col-span-3">
//             <div className="bg-white rounded-xl border p-4">
//               <div className="text-sm font-semibold mb-3">Shipment</div>

//               <StepRow active={step === 1} done={step > 1} title="Country" />
//               <StepRow active={step === 2} done={step > 2} title="Weight" />
//               <StepRow active={step === 3} done={step > 3} title="Receiver details" />
//               <StepRow active={step === 4} done={false} title="Result" />
//             </div>

//             {/* TOKEN WARNING */}
//             {!isTokenValid && (
//               <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
//                 <div className="text-sm font-semibold text-red-700">
//                   DPD session expired
//                 </div>
//                 <p className="text-xs text-red-600 mt-1">
//                   Refresh token and continue.
//                 </p>
//                 <button
//                   onClick={refreshToken}
//                   disabled={loading}
//                   className="mt-3 w-full text-sm bg-red-600 text-white py-2 rounded-lg disabled:opacity-60"
//                 >
//                   {loading ? "Refreshing..." : "Refresh Token"}
//                 </button>
//               </div>
//             )}
//           </aside>

//           {/* CENTER FORM (DPD STYLE) */}
//           <main className="col-span-12 md:col-span-6 space-y-6">
//             {/* STEP 1 */}
//             {step === 1 && (
//               <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
//                 <h2 className="text-lg font-semibold mb-1">Destination country</h2>
//                 <p className="text-sm text-gray-600 mb-4">
//                   Country is fixed to Netherlands (NL).
//                 </p>

//                 <button
//                   onClick={() => setStep(2)}
//                   disabled={!canGoWeight}
//                   className="w-full flex items-center justify-between bg-white border rounded-xl p-4 hover:bg-gray-50 disabled:opacity-60"
//                 >
//                   <div className="flex items-center gap-3">
//                     <span className="text-2xl">🇳🇱</span>
//                     <div className="text-left">
//                       <div className="font-semibold">Netherlands (NL)</div>
//                       <div className="text-xs text-gray-500">Continue</div>
//                     </div>
//                   </div>
//                   <span className="text-xl">→</span>
//                 </button>
//               </div>
//             )}

//             {/* STEP 2 (WEIGHT) */}
//             {step === 2 && (
//               <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
//                 <h2 className="text-lg font-semibold mb-1">Parcel details</h2>
//                 <p className="text-sm text-gray-600 mb-4">
//                   Enter weight first (like DPD).
//                 </p>

//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Weight (kg)
//                 </label>
//                 <input
//                   type="number"
//                   min="0.01"
//                   step="0.01"
//                   value={weight}
//                   onChange={(e) => setWeight(e.target.value)}
//                   className="w-full bg-white border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
//                   placeholder="e.g. 1"
//                   disabled={!isTokenValid}
//                 />

//                 <div className="flex items-center justify-between mt-6">
//                   <button
//                     onClick={() => setStep(1)}
//                     className="text-sm px-4 py-2 rounded border bg-white hover:bg-gray-50"
//                   >
//                     ← Back
//                   </button>
//                   <button
//                     onClick={() => setStep(3)}
//                     disabled={!canGoReceiver}
//                     className="text-sm px-5 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
//                   >
//                     Next step
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* STEP 3 (RECEIVER CONTACT + ADDRESS) */}
//             {step === 3 && (
//               <div className="space-y-6">
//                 {/* CONTACT INFO */}
//                 <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
//                   <h2 className="text-lg font-semibold mb-1">Receiver contact</h2>
//                   <p className="text-sm text-gray-600 mb-4">
//                     Email/phone are optional but recommended.
//                   </p>

//                   <TwoCol>
//                     <Field label="Full name *">
//                       <input
//                         className="input"
//                         value={recipient.name1}
//                         onChange={(e) =>
//                           setRecipient((p) => ({ ...p, name1: e.target.value }))
//                         }
//                         placeholder="First and last name"
//                         disabled={!isTokenValid}
//                       />
//                     </Field>

//                     <Field label="Email">
//                       <input
//                         className="input"
//                         value={recipient.email}
//                         onChange={(e) =>
//                           setRecipient((p) => ({ ...p, email: e.target.value }))
//                         }
//                         placeholder="email@example.com"
//                         disabled={!isTokenValid}
//                       />
//                     </Field>

//                     <Field label="Phone">
//                       <input
//                         className="input"
//                         value={recipient.phone}
//                         onChange={(e) =>
//                           setRecipient((p) => ({ ...p, phone: e.target.value }))
//                         }
//                         placeholder="+31..."
//                         disabled={!isTokenValid}
//                       />
//                     </Field>
//                   </TwoCol>
//                 </div>

//                 {/* ADDRESS DETAILS */}
//                 <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
//                   <h2 className="text-lg font-semibold mb-1">Receiver address</h2>
//                   <p className="text-sm text-gray-600 mb-4">
//                     Netherlands address format (Zip + House No).
//                   </p>

//                   <TwoCol>
//                     <Field label="Postal code *">
//                       <input
//                         className="input"
//                         value={recipient.zipCode}
//                         onChange={(e) =>
//                           setRecipient((p) => ({ ...p, zipCode: e.target.value }))
//                         }
//                         placeholder="1234 AB"
//                         disabled={!isTokenValid}
//                       />
//                     </Field>

//                     <Field label="House number *">
//                       <input
//                         className="input"
//                         value={recipient.houseNo}
//                         onChange={(e) =>
//                           setRecipient((p) => ({ ...p, houseNo: e.target.value }))
//                         }
//                         placeholder="10"
//                         disabled={!isTokenValid}
//                       />
//                     </Field>

//                     <Field label="Addition">
//                       <input
//                         className="input"
//                         value={recipient.addition}
//                         onChange={(e) =>
//                           setRecipient((p) => ({ ...p, addition: e.target.value }))
//                         }
//                         placeholder="A / B / 1"
//                         disabled={!isTokenValid}
//                       />
//                     </Field>

//                     <Field label="Street *">
//                       <input
//                         className="input"
//                         value={recipient.street}
//                         onChange={(e) =>
//                           setRecipient((p) => ({ ...p, street: e.target.value }))
//                         }
//                         placeholder="Street name"
//                         disabled={!isTokenValid}
//                       />
//                     </Field>

//                     <Field label="City *">
//                       <input
//                         className="input"
//                         value={recipient.city}
//                         onChange={(e) =>
//                           setRecipient((p) => ({ ...p, city: e.target.value }))
//                         }
//                         placeholder="City"
//                         disabled={!isTokenValid}
//                       />
//                     </Field>
//                   </TwoCol>

//                   <div className="flex items-center justify-between mt-6">
//                     <button
//                       onClick={() => setStep(2)}
//                       className="text-sm px-4 py-2 rounded border bg-white hover:bg-gray-50"
//                     >
//                       ← Back
//                     </button>

//                     <button
//                       onClick={createLabel}
//                       disabled={loading || !isTokenValid}
//                       className="text-sm px-6 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
//                     >
//                       {loading ? "Creating..." : "Create Label"}
//                     </button>
//                   </div>

//                   {/* RESULT BELOW BUTTON (LIKE YOU SAID) */}
//                   {result && (
//                     <div className="mt-6 bg-white border rounded-xl p-4">
//                       <div className="text-sm text-gray-600">Tracking Number</div>
//                       <div className="font-mono text-xl font-semibold">
//                         {result.trackingNumber || "-"}
//                       </div>

//                       <button
//                         onClick={() =>
//                           downloadPdfFromBase64(
//                             result.labelBase64,
//                             `${result.trackingNumber || "label"}.pdf`
//                           )
//                         }
//                         className="mt-4 w-full text-sm bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
//                       >
//                         Download PDF Label
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* STEP 4 (RESULT PAGE) */}
//             {step === 4 && result && (
//               <div className="bg-white border rounded-xl p-6">
//                 <h2 className="text-lg font-semibold">Label created</h2>
//                 <p className="text-sm text-gray-600 mt-1">
//                   Tracking and PDF are ready.
//                 </p>

//                 <div className="mt-4 bg-gray-50 border rounded-xl p-4">
//                   <div className="text-xs text-gray-500">Tracking Number</div>
//                   <div className="font-mono text-2xl font-semibold">
//                     {result.trackingNumber || "-"}
//                   </div>
//                 </div>

//                 <div className="mt-4 flex flex-col sm:flex-row gap-3">
//                   <button
//                     onClick={() =>
//                       downloadPdfFromBase64(
//                         result.labelBase64,
//                         `${result.trackingNumber || "label"}.pdf`
//                       )
//                     }
//                     className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
//                   >
//                     Download PDF Label
//                   </button>

//                   <button
//                     onClick={resetForm}
//                     className="flex-1 bg-white border py-3 rounded-lg hover:bg-gray-50"
//                   >
//                     Create Another
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* ERROR */}
//             {error && (
//               <div className="bg-red-50 border border-red-200 rounded-xl p-4">
//                 <div className="text-sm text-red-700">{error}</div>
//               </div>
//             )}
//           </main>

//           {/* RIGHT SUMMARY (DPD STYLE) */}
//           <aside className="col-span-12 md:col-span-3">
//             <div className="bg-white rounded-xl border p-4 sticky top-6">
//               <div className="text-sm font-semibold mb-3">Parcel labels</div>

//               <div className="text-sm">
//                 <div className="font-semibold">{sender.name1}</div>
//                 <div className="text-gray-600 text-xs">
//                   {sender.street}, {sender.city}, {sender.zipCode}, {sender.country}
//                 </div>
//               </div>

//               <div className="my-4 border-t" />

//               <div className="text-sm">
//                 <div className="text-xs text-gray-500">Country</div>
//                 <div className="font-medium">NL</div>
//               </div>

//               <div className="mt-3 text-sm">
//                 <div className="text-xs text-gray-500">Weight</div>
//                 <div className="font-medium">{weight ? `${weight} kg` : "—"}</div>
//               </div>

//               <div className="mt-3 text-sm">
//                 <div className="text-xs text-gray-500">Receiver</div>
//                 <div className="font-medium">{recipient.name1 || "—"}</div>
//                 <div className="text-xs text-gray-500 mt-1">
//                   {recipient.zipCode || ""} {recipient.houseNo || ""}{" "}
//                   {recipient.street || ""} {recipient.city || ""}
//                 </div>
//               </div>

//               {result?.trackingNumber && (
//                 <>
//                   <div className="my-4 border-t" />
//                   <div className="text-sm">
//                     <div className="text-xs text-gray-500">Tracking</div>
//                     <div className="font-mono font-semibold">{result.trackingNumber}</div>
//                   </div>
//                 </>
//               )}
//             </div>
//           </aside>
//         </div>

//         {/* small utility styles (Tailwind) */}
//         <style jsx global>{`
//           .input {
//             width: 100%;
//             background: #fff;
//             border: 1px solid #e5e7eb;
//             border-radius: 0.5rem;
//             padding: 0.55rem 0.75rem;
//             outline: none;
//           }
//           .input:focus {
//             box-shadow: 0 0 0 3px rgba(191, 219, 254, 1);
//             border-color: #93c5fd;
//           }
//         `}</style>
//       </div>
//     </AuthGuard>
//   );
// }

// function StepRow({ title, active, done }) {
//   return (
//     <div className="flex items-center gap-3 py-2">
//       <div
//         className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
//           done
//             ? "bg-green-600 text-white"
//             : active
//             ? "bg-red-600 text-white"
//             : "bg-gray-100 text-gray-500"
//         }`}
//       >
//         {done ? "✓" : "•"}
//       </div>
//       <div className={`${active ? "font-semibold" : "text-gray-600"} text-sm`}>
//         {title}
//       </div>
//     </div>
//   );
// }

// function Field({ label, children }) {
//   return (
//     <div>
//       <label className="block text-xs font-medium text-gray-700 mb-2">{label}</label>
//       {children}
//     </div>
//   );
// }

// function TwoCol({ children }) {
//   return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
// }

"use client";

import AuthGuard from "@/components/AuthGuard";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { downloadPdfFromBase64 } from "@/components/downloadPdf";

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
      if (!token) {
        setIsTokenValid(false);
        setCheckingToken(false);
        return;
      }

      const response = await fetch("/api/auth/check-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json().catch(() => ({}));
      setIsTokenValid(Boolean(data.isValid));
    } catch (e) {
      setIsTokenValid(false);
    } finally {
      setCheckingToken(false);
    }
  }

  async function refreshToken() {
    try {
      setLoading(true);
      setError("");

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        setIsTokenValid(false);
        setError("No refresh token found. Please login again.");
        return;
      }

      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json().catch(() => ({}));

      if (data.ok && data.token) {
        localStorage.setItem("token", data.token);
        if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
        setIsTokenValid(true);
        setError("");
      } else {
        setIsTokenValid(false);
        setError("Failed to refresh token. Please login again.");
      }
    } catch (e) {
      setIsTokenValid(false);
      setError("Error refreshing token. Please login again.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setStep(1);
    setResult(null);
    setError("");
    setWeight("");
    setRecipient({
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
  }

  const canGoWeight = isTokenValid;
  const canGoReceiver = Boolean(weight) && Number(weight) > 0 && isTokenValid;

  const isReceiverValid =
    recipient.name1.trim() &&
    recipient.zipCode.trim() &&
    recipient.houseNo.trim() &&
    recipient.street.trim() &&
    recipient.city.trim() &&
    isTokenValid;

  async function createLabel() {
    if (!isTokenValid) {
      setError("Your session has expired. Refresh token or login again.");
      return;
    }

    if (!isReceiverValid) {
      setError("Please fill receiver name, zip code, house number, street, city.");
      return;
    }

    if (!weight || Number(weight) <= 0) {
      setError("Please enter a valid weight (kg).");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const token = localStorage.getItem("token");

    try {
      const payload = {
        sendingDepot,
        product,
        sender,
        parcel: { weight: String(weight) },
        recipient: {
          name1: recipient.name1,
          email: recipient.email,
          phone: recipient.phone,
          zipCode: recipient.zipCode,
          houseNo: recipient.houseNo,
          addition: recipient.addition,
          street: recipient.street,
          city: recipient.city,
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

      if (!j.ok) {
        const msg = j.message || "Failed to create label";

        if (
          msg.toLowerCase().includes("token") ||
          msg.includes("ERR_DELICOM_TOKEN_EXPIRED")
        ) {
          setIsTokenValid(false);
          setError("Your DPD token has expired. Refresh token and try again.");
        } else {
          setError(msg);
        }
        return;
      }

      setResult(j.shipment);
      setStep(4);
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingToken) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/70">Checking authentication...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-gray-900 to-black text-white">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center">
                  <span className="mr-2">🚚</span>
                  DPD Label Generator
                </h1>
                <p className="text-blue-200/70 text-sm">Professional shipping label creation</p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                  </svg>
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left Panel - Progress */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sticky top-8">
                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  Creation Steps
                </h2>

                <div className="space-y-4">
                  {[
                    { number: 1, title: "Destination Country", desc: "Select NL" },
                    { number: 2, title: "Parcel Weight", desc: "Enter weight in kg" },
                    { number: 3, title: "Receiver Details", desc: "Contact & address" },
                    { number: 4, title: "Label Ready", desc: "Download PDF" },
                  ].map((item) => (
                    <div
                      key={item.number}
                      className={`flex items-start p-3 rounded-lg transition-all ${
                        step === item.number
                          ? "bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200"
                          : step > item.number
                          ? "bg-green-50 border border-green-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mr-3 flex-shrink-0 ${
                          step === item.number
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                            : step > item.number
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {step > item.number ? "✓" : item.number}
                      </div>
                      <div>
                        <div className={`font-medium ${
                          step >= item.number ? "text-gray-800" : "text-gray-500"
                        }`}>
                          {item.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Token Status */}
                {!isTokenValid && (
                  <div className="mt-8 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-red-700">Session Expired</div>
                        <div className="text-xs text-red-600">Refresh DPD token</div>
                      </div>
                    </div>
                    <button
                      onClick={refreshToken}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-2.5 rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          </svg>
                          Refreshing...
                        </span>
                      ) : "Refresh Token"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Center Panel - Form */}
            <div className="lg:col-span-6">
              <div className="space-y-6">
                {/* Step 1: Country Selection */}
                {step === 1 && (
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-blue-50 rounded-full flex items-center justify-center border-4 border-blue-200">
                        <span className="text-3xl">🇳🇱</span>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">Destination Country</h2>
                      <p className="text-gray-600">Shipments from Netherlands to Netherlands only</p>
                    </div>

                    <button
                      onClick={() => setStep(2)}
                      disabled={!canGoWeight}
                      className="w-full p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:from-blue-100 hover:to-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-14 h-10 bg-gradient-to-r from-red-600 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                            <span className="text-xl">🇳🇱</span>
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-gray-800 text-lg">Netherlands</div>
                            <div className="text-sm text-gray-600">Country code: NL</div>
                          </div>
                        </div>
                        <div className="text-2xl text-gray-400 group-hover:text-blue-600">→</div>
                      </div>
                    </button>

                    <div className="mt-6 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <p className="text-sm text-gray-600">
                          Currently, only domestic shipments within the Netherlands are supported.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Weight */}
                {step === 2 && (
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">Parcel Weight</h2>
                      <p className="text-gray-600">Enter the weight of your parcel in kilograms</p>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Weight (kg) *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="w-full px-4 py-4 text-lg bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                          placeholder="e.g. 2.5"
                          disabled={!isTokenValid}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                          kg
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Minimum: 0.01 kg • Maximum: 31.5 kg (DPD standard)
                      </div>
                    </div>

                    <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
                      <button
                        onClick={() => setStep(1)}
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                        Previous
                      </button>
                      <button
                        onClick={() => setStep(3)}
                        disabled={!canGoReceiver}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continue to Receiver Details
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Receiver Details */}
                {step === 3 && (
                  <div className="space-y-6">
                    {/* Contact Section */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                      <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Receiver Contact Information</h2>
                        <p className="text-gray-600">Enter the recipient's contact details</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            value={recipient.name1}
                            onChange={(e) => setRecipient(p => ({ ...p, name1: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            placeholder="John Doe"
                            disabled={!isTokenValid}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={recipient.email}
                            onChange={(e) => setRecipient(p => ({ ...p, email: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            placeholder="john@example.com"
                            disabled={!isTokenValid}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            value={recipient.phone}
                            onChange={(e) => setRecipient(p => ({ ...p, phone: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            placeholder="+31 6 12345678"
                            disabled={!isTokenValid}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Address Section */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                      <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Receiver Address</h2>
                        <p className="text-gray-600">Dutch address format (Postal Code + House Number)</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Postal Code *
                          </label>
                          <input
                            value={recipient.zipCode}
                            onChange={(e) => setRecipient(p => ({ ...p, zipCode: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            placeholder="1234 AB"
                            disabled={!isTokenValid}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            House Number *
                          </label>
                          <input
                            value={recipient.houseNo}
                            onChange={(e) => setRecipient(p => ({ ...p, houseNo: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            placeholder="10"
                            disabled={!isTokenValid}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Addition (Optional)
                          </label>
                          <input
                            value={recipient.addition}
                            onChange={(e) => setRecipient(p => ({ ...p, addition: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            placeholder="A / B / 1"
                            disabled={!isTokenValid}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Street Name *
                          </label>
                          <input
                            value={recipient.street}
                            onChange={(e) => setRecipient(p => ({ ...p, street: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            placeholder="Main Street"
                            disabled={!isTokenValid}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City *
                          </label>
                          <input
                            value={recipient.city}
                            onChange={(e) => setRecipient(p => ({ ...p, city: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            placeholder="Amsterdam"
                            disabled={!isTokenValid}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
                        <button
                          onClick={() => setStep(2)}
                          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                          </svg>
                          Previous
                        </button>
                        <button
                          onClick={createLabel}
                          disabled={loading || !isTokenValid}
                          className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          {loading ? (
                            <>
                              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                              </svg>
                              Creating Label...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                              </svg>
                              Create Shipping Label
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Results */}
                {step === 4 && result && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl border border-emerald-200 p-8">
                    <div className="text-center mb-10">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                      <h2 className="text-3xl font-bold text-gray-800 mb-3">Label Created Successfully!</h2>
                      <p className="text-gray-600 text-lg">Your DPD shipping label is ready to download</p>
                    </div>

                    <div className="max-w-md mx-auto space-y-6">
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Tracking Number</div>
                        <div className="font-mono text-3xl font-bold text-emerald-600 bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                          {result.trackingNumber || "-"}
                        </div>
                        <div className="mt-3 text-sm text-gray-600">
                          Save this number to track your shipment on the DPD website
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <button
                          onClick={() => downloadPdfFromBase64(
                            result.labelBase64,
                            `${result.trackingNumber || "label"}.pdf`
                          )}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                          </svg>
                          Download PDF Label
                        </button>
                        <button
                          onClick={resetForm}
                          className="flex-1 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                          </svg>
                          Create Another Label
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-red-700 mb-2">Error</h3>
                        <p className="text-red-600">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Summary */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sticky top-8">
                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Shipment Summary
                </h2>

                <div className="space-y-6">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Sender</div>
                    <div className="font-medium text-gray-800">{sender.name1}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {sender.street}, {sender.city}
                      <br />
                      {sender.zipCode}, {sender.country}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Shipment Details</div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Country</span>
                        <span className="font-medium bg-blue-50 px-3 py-1 rounded-full text-blue-700">NL</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Weight</span>
                        <span className="font-medium">{weight ? `${weight} kg` : "—"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Service</span>
                        <span className="font-medium">DPD Classic</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Receiver</div>
                    {recipient.name1 ? (
                      <>
                        <div className="font-medium text-gray-800">{recipient.name1}</div>
                        <div className="text-sm text-gray-600 mt-2 space-y-1">
                          <div>{recipient.street} {recipient.houseNo}{recipient.addition && ` ${recipient.addition}`}</div>
                          <div>{recipient.zipCode} {recipient.city}</div>
                          <div>{recipient.country}</div>
                        </div>
                        {recipient.email && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-500">Email: </span>
                            <span className="text-blue-600">{recipient.email}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-400 italic">No receiver details yet</div>
                    )}
                  </div>

                  {result?.trackingNumber && (
                    <div className="border-t border-gray-100 pt-6">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Tracking Information</div>
                      <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 rounded-lg p-4">
                        <div className="font-mono font-bold text-emerald-700">{result.trackingNumber}</div>
                        <div className="text-xs text-emerald-600 mt-1">Label created successfully</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}