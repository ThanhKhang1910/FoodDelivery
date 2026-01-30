import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useTheme } from "../contexts/ThemeContext";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isDark } = useTheme();

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      const res = await axiosClient.get("/orders/history");
      setOrders(res.data);
    } catch (error) {
      console.error("Failed to fetch order history:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      CONFIRMED:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      PREPARING:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      DELIVERING:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      COMPLETED:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return colors[status] || colors.PENDING;
  };

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: "Chờ xác nhận",
      CONFIRMED: "Đã xác nhận",
      PREPARING: "Đang chuẩn bị",
      DELIVERING: "Đang giao",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl h-32"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white">
              📦 Lịch sử đơn hàng
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Xem lại các đơn hàng đã đặt
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition"
          >
            🏠 Về trang chủ
          </button>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Chưa có đơn hàng nào
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Bắt đầu đặt món ngay để trải nghiệm dịch vụ giao đồ ăn nhanh
              chóng!
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition"
            >
              Khám phá nhà hàng
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.order_id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition cursor-pointer"
                onClick={() => navigate(`/order/${order.order_id}/tracking`)}
              >
                <div className="flex items-start justify-between">
                  {/* Left: Restaurant Info */}
                  <div className="flex items-center space-x-4 flex-1">
                    <img
                      src={order.image_url || "/placeholder-restaurant.jpg"}
                      alt={order.shop_name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {order.shop_name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {order.item_count} món • {formatDate(order.created_at)}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & Action */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {order.total_amount?.toLocaleString()}đ
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/order/${order.order_id}/tracking`);
                      }}
                      className="mt-3 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-medium transition text-sm"
                    >
                      {order.status === "COMPLETED"
                        ? "Xem chi tiết"
                        : "Theo dõi"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
