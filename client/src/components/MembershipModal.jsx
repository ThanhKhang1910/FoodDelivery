import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axiosClient from "../api/axiosClient";

const MembershipModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState("1_month");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showQR, setShowQR] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState(null);
  const [pollingStatus, setPollingStatus] = useState("idle"); // idle, polling, success, error

  const plans = {
    "1_month": {
      duration: "1 tháng",
      price: 135000,
      pricePerMonth: 135000,
      save: 0,
    },
    "6_month": {
      duration: "6 tháng",
      price: 750000,
      pricePerMonth: 125000,
      save: 60000,
      badge: "Tiết kiệm 7%",
    },
    "12_month": {
      duration: "12 tháng",
      price: 1400000,
      pricePerMonth: 116667,
      save: 220000,
      badge: "Giá tốt nhất · Tiết kiệm 14%",
    },
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated()) {
      alert("Vui lòng đăng nhập để đăng ký gói hội viên!");
      navigate("/login");
      return;
    }

    const plan = plans[selectedPlan];

    try {
      // Create subscription for BOTH Cash and Bank
      const response = await axiosClient.post("/membership/subscribe", {
        plan_type: selectedPlan,
        amount: plan.price,
        payment_method: paymentMethod,
        transaction_info:
          paymentMethod === "bank"
            ? `Premium ${plan.duration}`
            : "Cash on Delivery",
      });

      const newSubId = response.data.subscriptionId;

      // Cash payment
      if (paymentMethod === "cash") {
        alert(
          `Đăng ký thành công!\nGói: ${plan.duration}\nGiá: ${plan.price.toLocaleString()}đ\nThanh toán: Tiền mặt khi nhận hàng\n\nVui lòng chờ admin xác nhận.`,
        );
        onClose();
        window.location.reload(); // Refresh to show pending sub
        return;
      }

      // Bank payment
      setSubscriptionId(newSubId);
      setShowQR(true);
      setPollingStatus("polling");
    } catch (error) {
      console.error("Subscription error:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(error.response.data.message);
      } else {
        alert("Lỗi tạo đơn đăng ký. Vui lòng thử lại!");
      }
    }
  };

  // Polling effect - check subscription status every 5 seconds
  useEffect(() => {
    if (pollingStatus !== "polling" || !subscriptionId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await axiosClient.get(
          `/membership/check/${subscriptionId}`,
        );

        if (response.data.status === "active") {
          setPollingStatus("success");
          clearInterval(pollInterval);

          // Show success message
          setTimeout(() => {
            alert("🎉 Chúc mừng! Gói Premium đã được kích hoạt thành công!");
            onClose();
            window.location.reload(); // Reload to update UI
          }, 1000);
        }
      } catch (error) {
        console.error("Polling error:", error);
        // Continue polling even if error
      }
    }, 5000); // Check every 5 seconds

    // Cleanup on unmount
    return () => clearInterval(pollInterval);
  }, [pollingStatus, subscriptionId, onClose]);

  const generateQRUrl = () => {
    const plan = plans[selectedPlan];
    const amount = plan.price;
    const description = `Dang ky Premium ${plan.duration}`;

    // VietQR API: https://img.vietqr.io/image/{bank}-{account}-{template}.jpg
    return `https://img.vietqr.io/image/mbbank-0832633306-compact2.jpg?amount=${amount}&addInfo=${encodeURIComponent(description)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-500 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
            >
              ←
            </button>
            <h2 className="text-2xl font-black">Gói hội viên Premium</h2>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Benefits */}
        <div className="p-6 bg-gradient-to-b from-green-50 to-white dark:from-gray-700 dark:to-gray-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            🎁 Quyền lợi
          </h3>
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                🍔
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">
                  Miễn phí giao hàng
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cho đơn hàng từ 150.000đ. Khác nhau tùy theo thành phố.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                💰
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">
                  Tích điểm 2%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cho mỗi hóa đơn, tích lũy để đổi quà.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                ⭐
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">
                  Ưu đãi độc quyền
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Giảm giá đặc biệt chỉ dành cho thành viên Premium.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Selection */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Chọn kỳ hạn gói
          </h3>
          <div className="space-y-3">
            {Object.entries(plans).map(([key, plan]) => (
              <div
                key={key}
                onClick={() => setSelectedPlan(key)}
                className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedPlan === key
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-2 right-4 px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                    {plan.badge}
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {plan.duration}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Sau đó là {plan.pricePerMonth.toLocaleString()}đ / tháng
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-green-600">
                      {plan.price.toLocaleString()}đ
                    </p>
                    {plan.save > 0 && (
                      <p className="text-xs text-orange-600 font-bold">
                        Tiết kiệm {plan.save.toLocaleString()}đ
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="px-6 pb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Phương thức thanh toán
          </h3>
          <div className="space-y-3">
            <div
              onClick={() => setPaymentMethod("cash")}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                paymentMethod === "cash"
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="text-3xl">💵</div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 dark:text-white">
                  Tiền mặt
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Thanh toán khi nhận hàng
                </p>
              </div>
              {paymentMethod === "cash" && (
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                  ✓
                </div>
              )}
            </div>

            <div
              onClick={() => setPaymentMethod("bank")}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                paymentMethod === "bank"
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="text-3xl">🏦</div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 dark:text-white">
                  Ngân hàng
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Chuyển khoản hoặc ví điện tử
                </p>
              </div>
              {paymentMethod === "bank" && (
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                  ✓
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="sticky bottom-0 p-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          {!showQR ? (
            <>
              <button
                onClick={handleSubscribe}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                Thực hiện thanh toán ·{" "}
                {plans[selectedPlan].price.toLocaleString()}đ
              </button>
              <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                Tự động gia hạn mỗi {plans[selectedPlan].duration}, hủy bất cứ
                lúc nào.
              </p>
            </>
          ) : (
            <div className="space-y-4">
              {/* QR Code Display */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-2xl text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Quét mã QR để thanh toán
                </h3>
                <div className="bg-white p-4 rounded-xl inline-block shadow-lg">
                  <img
                    src={generateQRUrl()}
                    alt="VietQR Payment"
                    className="w-64 h-64 mx-auto"
                  />
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    🏦 MB Bank - STK: 0832633306
                  </p>
                  <p className="text-lg font-black text-green-600">
                    Số tiền: {plans[selectedPlan].price.toLocaleString()}đ
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Nội dung: Đăng ký Premium {plans[selectedPlan].duration}
                  </p>
                </div>

                {/* Polling Status Indicator */}
                {pollingStatus === "polling" && (
                  <div className="mt-4 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg flex items-center gap-3">
                    <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                      Đang chờ xác nhận thanh toán... (Tự động kiểm tra mỗi 5s)
                    </p>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">
                  📱 Hướng dẫn thanh toán:
                </p>
                <ol className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                  <li>Mở app ngân hàng hoặc ví điện tử</li>
                  <li>
                    Quét mã QR hoặc chuyển khoản đến STK 0832633306 (MB Bank)
                  </li>
                  <li>Kiểm tra thông tin và xác nhận thanh toán</li>
                  <li>Gói Premium sẽ được kích hoạt sau vài phút</li>
                </ol>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembershipModal;
