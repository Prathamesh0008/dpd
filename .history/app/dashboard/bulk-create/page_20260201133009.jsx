"use client";

import AuthGuard from "@/components/AuthGuard";
import { useState, useRef } from "react";
import { downloadPdfFromBase64 } from "@/components/downloadPdf";
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Download,
  AlertCircle,
  BarChart3,
  ChevronRight,
  Search,
  RefreshCw,
  Cloud,
  Info,
} from "lucide-react";

const DPD_RED = "#DC0032";

export default function BulkCreatePage() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState([]);
  const [mergedPdf, setMergedPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const processFile = (f) => {
    if (!f || !f.name.endsWith(".csv")) {
      setError("Only CSV files are supported");
      return;
    }
    setFile(f);
    setError("");
  };

  async function handleSubmit() {
    if (!file) {
      setError("Please upload a CSV file");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);
    setMergedPdf(null);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress((p) => (p < 90 ? p + 10 : p));
    }, 200);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/shipments/bulk", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid response from server");
      }

      if (!data.ok) {
        throw new Error(data.message || "Bulk creation failed");
      }

      setResults(data.results || []);
      setMergedPdf(data.mergedPdfBase64 || null);
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      clearInterval(interval);
      setUploadProgress(100);
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 800);
    }
  }

  const filteredResults = results.filter((r) => {
    if (activeTab === "success") return r.success;
    if (activeTab === "failed") return !r.success;
    if (!searchTerm) return true;
    return (
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalSuccess = results.filter((r) => r.success).length;
  const successRate = results.length
    ? Math.round((totalSuccess / results.length) * 100)
    : 0;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white text-gray-900">
        {/* Header */}
        <div className="border-b px-6 py-5">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Bulk Label Creation</h1>
              <p className="text-sm text-gray-500">
                Upload CSV to generate multiple DPD labels
              </p>
            </div>

            {results.length > 0 && (
              <button
                onClick={() => {
                  setFile(null);
                  setResults([]);
                  setMergedPdf(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="flex items-center gap-2 text-sm border px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw size={16} />
                New Batch
              </button>
            )}
          </div>
        </div>

        <main className="max-w-7xl mx-auto p-6 grid lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="space-y-6">
            {/* Upload */}
            <div className="border rounded-xl p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Upload size={18} />
                Upload CSV
              </h2>

              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center ${
                  dragActive
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => processFile(e.target.files?.[0])}
                />

                {!file ? (
                  <>
                    <Cloud className="mx-auto mb-3 text-gray-400" />
                    <p className="text-sm mb-2">Drag CSV or click below</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 text-white rounded-lg"
                      style={{ backgroundColor: DPD_RED }}
                    >
                      Browse File
                    </button>
                  </>
                ) : (
                  <>
                    <FileText className="mx-auto mb-2 text-gray-400" />
                    <p className="font-medium">{file.name}</p>
                    <button
                      onClick={() => {
                        setFile(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                      className="text-sm text-red-600 mt-2"
                    >
                      Remove file
                    </button>
                  </>
                )}
              </div>

              {loading && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Processing</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${uploadProgress}%`,
                        backgroundColor: DPD_RED,
                      }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!file || loading}
                className="w-full mt-5 py-3 rounded-lg text-white font-medium disabled:bg-gray-300"
                style={{ backgroundColor: DPD_RED }}
              >
                {loading ? "Processing..." : "Create Labels"}
              </button>

              <div className="mt-5 text-xs text-gray-500 flex gap-2">
                <Info size={14} />
                Required columns: name1, street, city, zipCode, country
              </div>
            </div>

            {/* Stats */}
            {results.length > 0 && (
              <div className="border rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 size={18} />
                  Batch Summary
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-xl font-bold">{results.length}</div>
                    <div className="text-sm text-gray-500">Total</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-xl font-bold text-green-700">
                      {totalSuccess}
                    </div>
                    <div className="text-sm text-green-600">Success</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm mb-1">Success rate</div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${successRate}%`,
                        backgroundColor: DPD_RED,
                      }}
                    />
                  </div>
                </div>

                {mergedPdf && (
                  <button
                    onClick={() =>
                      downloadPdfFromBase64(
                        mergedPdf,
                        "DPD_Bulk_Labels.pdf"
                      )
                    }
                    className="w-full py-3 bg-green-600 text-white rounded-lg flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    Download All Labels
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-2 border rounded-xl overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="font-semibold">Results</h2>

              {results.length > 0 && (
                <div className="flex gap-3">
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="border px-3 py-2 rounded-lg text-sm
                               text-gray-900 placeholder-gray-400 bg-white"
                  />
                  <select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="border px-3 py-2 rounded-lg text-sm bg-white"
                  >
                    <option value="all">All</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              )}
            </div>

            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left">Recipient</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Tracking</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-4">{r.name || "-"}</td>
                    <td className="p-4">
                      {r.success ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle size={14} /> Success
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-1">
                          <XCircle size={14} /> Failed
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-mono">
                      {r.trackingNumber || "-"}
                    </td>
                    <td className="p-4">
                      {r.success && r.labelBase64 && (
                        <button
                          onClick={() =>
                            downloadPdfFromBase64(
                              r.labelBase64,
                              `${r.trackingNumber}.pdf`
                            )
                          }
                          className="text-red-600 flex items-center gap-1"
                        >
                          Download <ChevronRight size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!results.length && (
              <div className="p-12 text-center text-gray-500">
                No batch processed yet
              </div>
            )}
          </div>
        </main>

        {error && (
          <div className="max-w-7xl mx-auto px-6 pb-6">
            <div className="border border-red-300 bg-red-50 p-4 rounded-lg flex gap-3">
              <AlertCircle className="text-red-600" />
              <div>
                <div className="font-medium text-red-700">Error</div>
                <div className="text-sm text-red-600">{error}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
