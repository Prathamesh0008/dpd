"use client";

import AuthGuard from "@/components/AuthGuard";
import { useState } from "react";
import { downloadPdfFromBase64 } from "@/components/downloadPdf";

export default function BulkCreatePage() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState([]);
  const [mergedPdf, setMergedPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
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

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/shipments/bulk", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const text = await res.text();

      if (!text || !text.trim().startsWith("{")) {
        console.error("NON-JSON RESPONSE FROM SERVER:", text.slice(0, 300));
        throw new Error("Server did not return JSON");
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("JSON PARSE FAILED:", text.slice(0, 300));
        throw new Error("Invalid JSON response");
      }

      if (!data.ok) {
        setError(data.message || "Bulk creation failed");
        return;
      }

      setResults(data.results || []);
      setMergedPdf(data.mergedPdfBase64 || null);

    } catch (err) {
      console.error(err);
      setError("Network error or server crash");
    } finally {
      setLoading(false);
    }
  }

  const totalSuccess = results.filter(r => r.success).length;
  const totalFailed = results.filter(r => !r.success).length;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
              Bulk DPD Label Creation
            </h1>
            <p className="text-gray-400 text-lg">
              Upload a CSV file to create multiple shipping labels at once
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Panel - Upload & Actions */}
            <div className="lg:col-span-1 space-y-8">
              {/* Upload Card */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center">
                    <svg className="w-6 h-6 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                    </svg>
                    Upload CSV File
                  </h2>
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">Required</span>
                </div>

                {/* Drag & Drop Area */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                    dragActive
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/20'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="file-upload"
                  />
                  
                  <div className="pointer-events-none">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                    
                    {file ? (
                      <div>
                        <p className="font-medium text-white mb-2">{file.name}</p>
                        <p className="text-sm text-gray-400">
                          {(file.size / 1024).toFixed(1)} KB • CSV File
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                          }}
                          className="mt-3 text-sm text-red-400 hover:text-red-300"
                        >
                          Remove File
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-white mb-2">Drag & drop your CSV file</p>
                        <p className="text-sm text-gray-400 mb-4">or click to browse</p>
                        <p className="text-xs text-gray-500">Supports .csv files only</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* File Requirements */}
                <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
                  <p className="text-sm font-medium text-gray-300 mb-2">CSV Format Requirements:</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li className="flex items-center">
                      <svg className="w-3 h-3 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      Include: name1, street, city, zipCode, country, phone, email
                    </li>
                    <li className="flex items-center">
                      <svg className="w-3 h-3 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      UTF-8 encoding recommended
                    </li>
                    <li className="flex items-center">
                      <svg className="w-3 h-3 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      Header row required
                    </li>
                  </ul>
                </div>

                {/* Process Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading || !file}
                  className={`w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] ${
                    loading
                      ? 'bg-gradient-to-r from-gray-600 to-gray-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700'
                  } ${!file ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Processing {results.length > 0 ? `${results.length} labels...` : 'CSV...'}
                    </span>
                  ) : (
                    'Create Labels'
                  )}
                </button>
              </div>

              {/* Stats Card */}
              {results.length > 0 && (
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl">
                  <h2 className="text-xl font-bold mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                    Batch Summary
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/30 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-white">{results.length}</div>
                      <div className="text-sm text-gray-400">Total Labels</div>
                    </div>
                    
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-green-400">{totalSuccess}</div>
                      <div className="text-sm text-green-300">Successful</div>
                    </div>
                    
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-red-400">{totalFailed}</div>
                      <div className="text-sm text-red-300">Failed</div>
                    </div>
                    
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-blue-400">
                        {results.length > 0 ? `${((totalSuccess / results.length) * 100).toFixed(1)}%` : '0%'}
                      </div>
                      <div className="text-sm text-blue-300">Success Rate</div>
                    </div>
                  </div>

                  {/* Download Merged PDF */}
                  {mergedPdf && (
                    <button
                      onClick={() => downloadPdfFromBase64(mergedPdf, "DPD_Bulk_Labels.pdf")}
                      className="w-full mt-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                      Download All Labels (Single PDF)
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right Panel - Results Table */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center">
                    <svg className="w-6 h-6 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Processing Results
                    {results.length > 0 && (
                      <span className="ml-3 px-3 py-1 bg-gray-700 rounded-full text-sm font-normal">
                        {results.length} labels
                      </span>
                    )}
                  </h2>
                  
                  {results.length > 0 && (
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-400">Success ({totalSuccess})</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-400">Failed ({totalFailed})</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Results Table */}
                {results.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-white/10">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-800/50 border-b border-white/10">
                          <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Recipient Name</th>
                          <th className="py-4 px-6 text-center text-sm font-semibold text-gray-300">Status</th>
                          <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">Tracking / Error Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {results.map((r, i) => (
                          <tr 
                            key={i} 
                            className={`transition-colors hover:bg-gray-800/30 ${
                              r.success ? 'hover:bg-green-500/5' : 'hover:bg-red-500/5'
                            }`}
                          >
                            <td className="py-4 px-6">
                              <div className="font-medium text-white">{r.name}</div>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                r.success 
                                  ? 'bg-green-500/20 text-green-300' 
                                  : 'bg-red-500/20 text-red-300'
                              }`}>
                                {r.success ? (
                                  <>
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                                    </svg>
                                    Success
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                    Failed
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              {r.success ? (
                                <div className="space-y-1">
                                  <div className="font-mono text-sm text-green-400">{r.trackingNumber}</div>
                                  {r.labelBase64 && (
                                    <button
                                      onClick={() => downloadPdfFromBase64(r.labelBase64, `${r.trackingNumber}.pdf`)}
                                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
                                    >
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                      </svg>
                                      Download individual label
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="text-sm text-red-300">{r.error}</div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center border border-white/10">
                      <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">No Results Yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Upload a CSV file and click "Create Labels" to process multiple shipments at once.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-8 p-6 bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 rounded-2xl">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-red-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <h3 className="font-semibold text-red-300 mb-2">Error Processing Request</h3>
                  <p className="text-red-300/80">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>  
      </div>
    </AuthGuard>
  );
}