"use client";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Package, 
  History, 
  Upload, 
  LogOut, 
  User, 
  Download,
  PlusCircle,
  BarChart3
} from "lucide-react";

// Define user type interface
interface UserData {
  email?: string;
  name?: string;
  [key: string]: any; // Allow additional properties
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error("Error parsing user data:", error);
          setUser(null);
        }
      }
      setLoading(false);
    }
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  const stats = [
    { label: "Labels Today", value: "12", change: "+2", color: "bg-blue-500" },
    { label: "This Month", value: "148", change: "+18%", color: "bg-green-500" },
    { label: "Pending", value: "3", change: "-1", color: "bg-amber-500" },
    { label: "Total Shipments", value: "1,284", change: "+12%", color: "bg-purple-500" },
  ];

  const quickActions = [
    {
      title: "Create Single Label",
      description: "Create and print individual shipping labels",
      icon: <PlusCircle className="w-8 h-8" />,
      href: "/dashboard/create",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Bulk Create Labels",
      description: "Upload CSV or create multiple labels at once",
      icon: <Upload className="w-8 h-8" />,
      href: "/dashboard/bulk-create",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Label History",
      description: "View and manage all your created labels",
      icon: <History className="w-8 h-8" />,
      href: "/dashboard/history",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const recentLabels = [
    { id: "DPD123456789", date: "Today, 10:30 AM", status: "Printed", service: "DPD Next Day" },
    { id: "DPD123456788", date: "Yesterday, 15:45 PM", status: "In Transit", service: "DPD 2-Day" },
    { id: "DPD123456787", date: "Nov 28, 09:15 AM", status: "Delivered", service: "DPD Express" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">DPD Label Printing</span>
                </div>
                <nav className="hidden md:ml-10 md:flex md:space-x-8">
                  <Link href="/dashboard" className="text-blue-600 border-b-2 border-blue-600 px-3 py-2 text-sm font-medium">
                    Dashboard
                  </Link>
                  <Link href="/dashboard/create" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                    Create Label
                  </Link>
                  <Link href="/dashboard/history" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                    History
                  </Link>
                  <Link href="/dashboard/bulk-create" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                    Bulk Create
                  </Link>
                </nav>
              </div>

              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-3 bg-gray-100 rounded-lg px-4 py-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">{user?.email || "user@example.com"}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}!
            </h1>
            <p className="text-gray-600 mt-2">Manage your DPD shipments and print labels efficiently</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from last month
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
                <Link href="/dashboard/history" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View all →
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    href={action.href}
                    className="group block bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow p-6"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`${action.bgColor} p-3 rounded-lg`}>
                        <div className={`text-white bg-gradient-to-br ${action.color} p-2 rounded-md`}>
                          {action.icon}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                      </div>
                    </div>
                    <div className="mt-6 flex items-center text-sm text-blue-600 font-medium">
                      Get started
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Recent Labels */}
              <div className="mt-8 bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Labels</h3>
                </div>
                <div className="divide-y">
                  {recentLabels.map((label, index) => (
                    <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{label.id}</p>
                            <p className="text-sm text-gray-500">{label.date} • {label.service}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            label.status === 'Printed' ? 'bg-blue-100 text-blue-800' :
                            label.status === 'In Transit' ? 'bg-amber-100 text-amber-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {label.status}
                          </span>
                          <button className="text-gray-400 hover:text-gray-600">
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Account Summary */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Account Type</span>
                    <span className="font-medium text-gray-900">Business</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Labels this month</span>
                    <span className="font-medium text-gray-900">148/500</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Account Balance</span>
                    <span className="font-medium text-green-600">£245.80</span>
                  </div>
                  <div className="pt-4 border-t">
                    <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">
                      Add Funds
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Tips</h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold">1</span>
                    </div>
                    <span className="text-sm text-gray-700">Ensure package weight is accurate for correct pricing</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold">2</span>
                    </div>
                    <span className="text-sm text-gray-700">Use bulk upload for multiple shipments to save time</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold">3</span>
                    </div>
                    <span className="text-sm text-gray-700">Download labels in PDF format for best print quality</span>
                  </li>
                </ul>
              </div>

              {/* Support Card */}
              <div className="bg-gray-900 text-white rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
                <p className="text-gray-300 text-sm mb-4">Our support team is here to help with your shipping needs</p>
                <button className="w-full bg-white text-gray-900 hover:bg-gray-100 font-medium py-2 px-4 rounded-lg transition-colors">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t bg-white mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-500">© 2024 DPD Label Printing Platform. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">Privacy Policy</Link>
                <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-700">Terms of Service</Link>
                <Link href="/support" className="text-sm text-gray-500 hover:text-gray-700">Support</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </AuthGuard>
  );
}