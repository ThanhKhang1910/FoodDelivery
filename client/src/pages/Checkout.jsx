import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const {
    cartItems,
    restaurantId,
    totalAmount,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  // Checkout Form State
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(0);

  // Discount Logic (Mock)
  const handleApplyDiscount = () => {
    if (discountCode.toUpperCase() === "BRONAUTO50") {
      setDiscountApplied(50000); // 50k discount
      alert("Đã áp dụng mã giảm giá 50k!");
    } else {
      alert("Mã giảm giá không hợp lệ");
      setDiscountApplied(0);
    }
  };

  const finalTotal = totalAmount + 15000 - discountApplied;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          Giỏ hàng của bạn đang trống
        </h2>
        <button onClick={() => navigate("/")} className="btn-primary px-8 py-3">
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        restaurant_id: restaurantId,
        payment_method: paymentMethod,
        address: address, // Send address to backend
        note: note,
        discount: discountApplied,
        items: cartItems.map((item) => ({
          food_id: item.food_id,
          quantity: item.quantity,
          price: item.price,
          // toppings: []
        })),
      };

      // Ensure address is present
      if (!address) {
        alert("Vui lòng nhập địa chỉ giao hàng");
        setLoading(false);
        return;
      }

      const res = await axiosClient.post("/customer/orders", orderData);

      // Navigate to Tracking Page
      alert(`Đặt hàng thành công! Mã đơn: ${res.data.order_id}`);
      clearCart();
      navigate(`/order/${res.data.order_id}/tracking`);
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message || "Đặt hàng thất bại. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white mb-8">
          Thanh toán
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Info & Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in-up">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-gray-800 dark:text-white">
                <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">
                  📍
                </span>
                Địa chỉ giao hàng
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nhập địa chỉ nhận hàng..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-gray-800 transition text-gray-800 dark:text-white font-medium"
                />
                <input
                  type="text"
                  placeholder="Ghi chú cho tài xế (VD: Gọi khi tới, để ở sảnh...)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-gray-800 transition text-gray-800 dark:text-white"
                />
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in-up animation-delay-100">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-gray-800 dark:text-white">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                  📦
                </span>
                Món ăn đã chọn
              </h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.food_id}
                    className="flex gap-4 py-4 border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 p-2 rounded-xl transition"
                  >
                    <img
                      src={item.image_url || "https://via.placeholder.com/80"}
                      className="w-20 h-20 rounded-xl object-cover bg-gray-100"
                      alt={item.name}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                          {item.name}
                        </h3>
                        <p className="font-bold text-primary">
                          {item.price.toLocaleString()}đ
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        Ghi chú món ăn...
                      </p>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                          <button
                            onClick={() => updateQuantity(item.food_id, -1)}
                            className="w-6 h-6 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300"
                          >
                            -
                          </button>
                          <span className="font-bold text-sm w-4 text-center dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.food_id, 1)}
                            className="w-6 h-6 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.food_id)}
                          className="text-xs text-red-500 font-bold hover:underline"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Payment & Total */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 sticky top-8 animate-fade-in-right">
              <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
                Thanh toán
              </h2>

              {/* Method Selection */}
              <div className="space-y-3 mb-6">
                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "CASH" ? "border-primary bg-primary-50 dark:bg-primary-900/20" : "border-gray-100 dark:border-gray-700"}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="CASH"
                    checked={paymentMethod === "CASH"}
                    onChange={() => setPaymentMethod("CASH")}
                    className="accent-primary w-5 h-5"
                  />
                  <span className="text-2xl">💵</span>
                  <span className="font-bold text-gray-800 dark:text-white">
                    Tiền mặt
                  </span>
                </label>
                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "CARD" ? "border-primary bg-primary-50 dark:bg-primary-900/20" : "border-gray-100 dark:border-gray-700"}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="CARD"
                    checked={paymentMethod === "CARD"}
                    onChange={() => setPaymentMethod("CARD")}
                    className="accent-primary w-5 h-5"
                  />
                  <span className="text-2xl">💳</span>
                  <div className="flex-1">
                    <span className="font-bold block text-gray-800 dark:text-white">
                      Thẻ tín dụng
                    </span>
                    <span className="text-xs text-gray-500">
                      Visa, Mastercard...
                    </span>
                  </div>
                </label>
              </div>

              {/* Discount Code */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Mã giảm giá
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Mã KM"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="flex-1 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary uppercase font-bold"
                  />
                  <button
                    onClick={handleApplyDiscount}
                    className="px-4 py-2 bg-gray-900 dark:bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-800"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-3 border-t dark:border-gray-700 pt-4 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tạm tính</span>
                  <span>{totalAmount.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Phí giao hàng</span>
                  <span>15,000đ</span>
                </div>
                {discountApplied > 0 && (
                  <div className="flex justify-between text-green-500 font-bold">
                    <span>Giảm giá</span>
                    <span>-{discountApplied.toLocaleString()}đ</span>
                  </div>
                )}
                <div className="flex justify-between text-2xl font-black text-gray-900 dark:text-white pt-4 border-t dark:border-gray-700 mt-2">
                  <span>Tổng cộng</span>
                  <span className="text-primary">
                    {Math.max(0, finalTotal).toLocaleString()}đ
                  </span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Đang xử lý..." : "Đặt hàng ngay"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
