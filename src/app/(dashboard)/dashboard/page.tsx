"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Spinner } from "@/components/ui/spinner";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Dashboard Overview
      </h2>

      {/* User Info Card */}
      {user && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            👤 User Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Username</p>
              <p className="text-gray-900 font-medium">{user.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900 font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">User ID</p>
              <p className="text-gray-900 font-medium">{user.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-gray-900 font-medium">
                {user.is_verified ? (
                  <span className="text-green-600">✅ Verified</span>
                ) : (
                  <span className="text-yellow-600">⏳ Pending</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">1,234</p>
          <p className="text-xs text-gray-500 mt-2">↗︎ 12% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Active Now</h3>
            <span className="text-2xl">🟢</span>
          </div>
          <p className="text-3xl font-bold text-green-600">56</p>
          <p className="text-xs text-gray-500 mt-2">Online users</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-3xl font-bold text-purple-600">$12.5k</p>
          <p className="text-xs text-gray-500 mt-2">↗︎ 8% from last month</p>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🔐 Security Status
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-green-600">✅</span>
            <p className="text-sm text-gray-700">
              HTTPOnly Cookie Authentication Active
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-green-600">✅</span>
            <p className="text-sm text-gray-700">
              Tokens stored in secure HTTPOnly cookies
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-green-600">✅</span>
            <p className="text-sm text-gray-700">Auto token refresh enabled</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-green-600">✅</span>
            <p className="text-sm text-gray-700">
              XSS Protection (JavaScript cannot access tokens)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
