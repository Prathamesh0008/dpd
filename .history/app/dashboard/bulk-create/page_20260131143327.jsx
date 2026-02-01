"use client";

import AuthGuard from "@/components/AuthGuard";
import { useState, useRef, useEffect } from "react";
import { downloadPdfFromBase64 } from "@/components/downloadPdf";
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Download,
  AlertCircle,
  Clock,
  BarChart3,
  Users,
  Package,
  ChevronRight,
  Filter,
  Search,
  RefreshCw,
  Cloud,
  FileDown,
  Info
} from "lucide-react";

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
  const [showInstructions, setShowInstructions] = useState(true);
  const fileInputRef = useRef(null);

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
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (selectedFile) => {
    if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith('.csv')) {
      setError("Please upload a valid CSV file");
      return;
    }
    setFile(selectedFile);
    setError("");
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const downloadTemplate = () => {
    const template = `name1,street,city,zipCode,country,phone,email
John Doe,123 Main St,London,SW1A 1AA,GB,+441234567890,john@example.com
Jane Smith,456 Oak Ave,Manchester,M1 1AA,GB,+441987654321,jane@example.com
Robert Brown,789 Pine Rd,Edinburgh,EH1 1AA,GB,+441112223333,robert@example.com`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dpd_bulk_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

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

      clearInterval(progressInterval);
      setUploadProgress(100);

      const text = await res.text();

      if (!text || !text.trim().startsWith("{")) {
        throw new Error("Server did not return valid response");
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error("Invalid response from server");
      }

      if (!data.ok) {
        setError(data.message || "Bulk creation failed");
        return;
      }

      setResults(data.results || []);
      setMergedPdf(data.mergedPdfBase64 || null);

    } catch (err) {
      console.error(err);
      setError(err.message || "Network error or server issue");
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }

  const filteredResults = results.filter(r => {
    if (activeTab === "success") return r.success;
    if (activeTab === "failed") return !r.success;
    if (searchTerm) {
      return r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             r.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const totalSuccess = results.filter(r => r.success).length;
  const totalFailed = results.filter(r => !r.success).length;
  const successRate = results.length > 0 ? (totalSuccess / results.length) * 100 : 0;

  const statusColors = {
    success: "bg-green-500/10 text-green-600 border-green-500/20",
    failed: "bg-red-500/10 text-red-600 border-red-500/20",
    processing: "bg-blue-500/10 text-blue-600 border-blue-500/20"
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bulk Label Creation</h1>
                <p className="text-gray-600 mt-1">Upload a CSV file to create multiple DPD labels at once</p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                <button
                  onClick={downloadTemplate}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Download Template
                </button>
                {results.length > 0 && (
                  <button
                    onClick={() => {
                      setResults([]);
                      setFile(null);
                      setMergedPdf(null);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    New Batch
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Upload & Stats */}
            <div className="lg:col-span-1 space-y-8">
              {/* Upload Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Upload className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Upload CSV</h2>
                      <p className="text-sm text-gray-500">Supports .csv files only</p>
                    </div>
                  </div>
                </div>

                {/* Drag & Drop Area */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  <div className="pointer-events-none">
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                      <Cloud className="w-8 h-8 text-blue-600" />
                    </div>
                    
                    {file ? (
                      <div>
                        <div className="flex items-center justify-center mb-2">
                          <FileText className="w-5 h-5 text-gray-400 mr-2" />
                          <p className="font-medium text-gray-900">{file.name}</p>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          Remove File
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-gray-900 mb-2">Drag & drop your CSV file</p>
                        <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
                        >
                          Browse Files
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {loading && (
                  <div className="mt-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Processing...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Process Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading || !file}
                  className={`w-full mt-6 py-3 rounded-lg font-medium transition-all ${
                    loading
                      ? 'bg-gray-300 cursor-not-allowed'
                      : !file
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Processing Labels...
                    </span>
                  ) : (
                    'Create Labels'
                  )}
                </button>

                {/* Instructions */}
                {showInstructions && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-start">
                      <Info className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 mb-1">CSV Requirements</p>
                        <ul className="text-xs text-blue-800 space-y-1">
                          <li>• Required columns: name1, street, city, zipCode, country, phone, email</li>
                          <li>• Include header row</li>
                          <li>• Use UTF-8 encoding</li>
                          <li>• Maximum 100 rows per file</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats Card */}
              {results.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-gray-500" />
                    Batch Summary
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{results.length}</div>
                        <div className="text-sm text-gray-600">Total Labels</div>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <div className="text-2xl font-bold text-green-700">{totalSuccess}</div>
                        <div className="text-sm text-green-600">Successful</div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="text-2xl font-bold text-blue-700">{successRate.toFixed(1)}%</div>
                      <div className="text-sm text-blue-600">Success Rate</div>
                      <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${successRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Download Merged PDF */}
                    {mergedPdf && (
                      <button
                        onClick={() => downloadPdfFromBase64(mergedPdf, "DPD_Bulk_Labels.pdf")}
                        className="w-full mt-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download All Labels (PDF)
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Results */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Results Header */}
                <div className="border-b p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Processing Results</h2>
                      {results.length > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          Showing {filteredResults.length} of {results.length} labels
                        </p>
                      )}
                    </div>
                    
                    {results.length > 0 && (
                      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                        {/* Search */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search labels..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-48"
                          />
                        </div>
                        
                        {/* Status Filter */}
                        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                          <button
                            onClick={() => setActiveTab("all")}
                            className={`px-4 py-2 text-sm font-medium ${
                              activeTab === "all" 
                                ? "bg-gray-900 text-white" 
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            All ({results.length})
                          </button>
                          <button
                            onClick={() => setActiveTab("success")}
                            className={`px-4 py-2 text-sm font-medium ${
                              activeTab === "success" 
                                ? "bg-green-600 text-white" 
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <CheckCircle className="w-4 h-4 inline mr-1" />
                            {totalSuccess}
                          </button>
                          <button
                            onClick={() => setActiveTab("failed")}
                            className={`px-4 py-2 text-sm font-medium ${
                              activeTab === "failed" 
                                ? "bg-red-600 text-white" 
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <XCircle className="w-4 h-4 inline mr-1" />
                            {totalFailed}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Results Table */}
                {results.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Recipient
                          </th>
                          <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Details
                          </th>
                          <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredResults.map((r, i) => (
                          <tr 
                            key={i} 
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-4 px-6">
                              <div className="font-medium text-gray-900">{r.name || "Unknown"}</div>
                              <div className="text-sm text-gray-500">{r.city}, {r.zipCode}</div>
                            </td>
                            <td className="py-4 px-6">
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                r.success 
                                  ? 'bg-green-100 text-green-800 border border-green-200' 
                                  : 'bg-red-100 text-red-800 border border-red-200'
                              }`}>
                                {r.success ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-1.5" />
                                    Success
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-4 h-4 mr-1.5" />
                                    Failed
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              {r.success ? (
                                <div className="space-y-1">
                                  <div className="font-mono text-sm font-medium text-gray-900">
                                    {r.trackingNumber}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Created just now
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-start">
                                  <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-gray-700">{r.error}</span>
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              {r.success && r.labelBase64 && (
                                <button
                                  onClick={() => downloadPdfFromBase64(r.labelBase64, `${r.trackingNumber}.pdf`)}
                                  className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                  Download
                                  <ChevronRight className="w-4 h-4 ml-1" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {filteredResults.length === 0 && (
                      <div className="text-center py-12">
                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No results found for your search</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16 px-6">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <Package className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Labels Created Yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                      Upload a CSV file to create multiple DPD shipping labels in one batch.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-xl mx-auto">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <Upload className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">Upload CSV</p>
                        <p className="text-xs text-gray-500">Drag & drop your file</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">Process Batch</p>
                        <p className="text-xs text-gray-500">Create all labels at once</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <Download className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">Download All</p>
                        <p className="text-xs text-gray-500">Get single PDF with all labels</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-red-800 mb-1">Processing Error</h3>
                      <p className="text-sm text-red-700">{error}</p>
                      <button
                        onClick={() => setError("")}
                        className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}