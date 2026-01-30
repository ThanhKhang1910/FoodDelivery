import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axiosClient from "../api/axiosClient";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await axiosClient.get("/membership/active");
        if (
          response.data.status === "active" ||
          response.data.status === "pending"
        ) {
          setSubscription(response.data);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
      }
    };
    fetchSubscription();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleCancelSubscription = async () => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn hủy gói Premium? Bạn sẽ mất các quyền lợi ngay lập tức.",
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post("/membership/cancel");
      alert("Đã hủy gói Premium thành công!");
      setSubscription(null);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      const statusCode = error.response ? error.response.status : "Unknown";
      const message = error.response?.data?.message || "Lỗi không xác định";
      alert(`Lỗi (${statusCode}): ${message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  const getPlanName = (type) => {
    switch (type) {
      case "1_month":
        return "1 Tháng";
      case "6_month":
        return "6 Tháng";
      case "12_month":
        return "12 Tháng";
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white">
            👤 Thông tin tài khoản
          </h1>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-semibold transition"
          >
            ← Quay lại
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
          {/* Avatar Section */}
          <div className="bg-gradient-to-br from-primary-400 to-primary-600 p-8 text-center">
            <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg">
              {user?.fullName?.charAt(0).toUpperCase() || "U"}
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {user?.fullName || "User"}
            </h2>
            <p className="text-primary-100">Khách hàng thành viên</p>
          </div>

          {/* Info Section */}
          <div className="p-8 space-y-6">
            <div className="grid gap-6">
              {/* Email */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <label className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  📧 Email
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                  {user?.email || "Chưa có"}
                </p>
              </div>

              {/* Full Name */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <label className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  👤 Họ và tên
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                  {user?.fullName || "Chưa có"}
                </p>
              </div>

              {/* ID */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <label className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  🆔 Mã khách hàng
                </label>
                <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white mt-1">
                  #{user?.id || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Subscription Section */}
        {subscription && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl shadow-lg overflow-hidden mb-6 text-white relative">
            <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="p-8 relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black mb-1 flex items-center gap-2">
                    💎 Gói thành viên Premium
                  </h2>
                  <p className="text-white/90 font-medium">
                    Bạn đang hưởng trọn quyền lợi cao cấp
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${
                    subscription.status === "active"
                      ? "bg-white/20"
                      : "bg-yellow-400/50 text-yellow-50"
                  }`}
                >
                  {subscription.status === "active"
                    ? "Active"
                    : "Pending Verification"}
                </div>
              </div>

              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20 mb-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-white/70 font-bold uppercase tracking-wider block mb-1">
                      Loại gói
                    </label>
                    <p className="text-xl font-bold">
                      {getPlanName(subscription.planType)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-white/70 font-bold uppercase tracking-wider block mb-1">
                      Ngày hết hạn
                    </label>
                    <p className="text-xl font-bold">
                      {(() => {
                        if (subscription.expiresAt)
                          return new Date(
                            subscription.expiresAt,
                          ).toLocaleDateString("vi-VN");
                        if (subscription.status === "pending") {
                          const start = subscription.createdAt
                            ? new Date(subscription.createdAt)
                            : new Date();
                          const months =
                            subscription.planType === "12_month"
                              ? 12
                              : subscription.planType === "6_month"
                                ? 6
                                : 1;
                          start.setMonth(start.getMonth() + months);
                          return `${start.toLocaleDateString("vi-VN")} (Dự kiến)`;
                        }
                        return "---";
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleCancelSubscription}
                  disabled={loading}
                  className="px-5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-bold text-sm transition border border-white/30"
                >
                  {loading ? "Đang xử lý..." : "Hủy gói thành viên"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate("/orders")}
            className="w-full px-6 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-2xl font-bold shadow-sm border border-gray-100 dark:border-gray-700 transition flex items-center justify-between group"
          >
            <span className="flex items-center gap-3">
              <span className="text-2xl">📦</span> Xem đơn hàng của tôi
            </span>
            <span className="text-gray-400 group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-6 py-4 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl font-bold transition flex items-center justify-center gap-2"
          >
            <span>🚪</span> Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
