import React, { useState } from "react";
import MembershipModal from "./MembershipModal";

const MembershipBanner = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

        <div className="relative z-10 flex items-center justify-between gap-8">
          {/* Left Content */}
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              🎁 Gói hội viên Premium
            </h2>
            <p className="text-white/90 text-lg mb-6 leading-relaxed max-w-lg">
              Miễn phí giao hàng cho tất cả đơn từ{" "}
              <span className="font-bold">150k</span> và tích điểm{" "}
              <span className="font-bold">2%</span> cho mỗi hóa đơn.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-8 py-4 bg-white text-green-600 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Đăng ký ngay
            </button>
          </div>

          {/* Right Icon */}
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
              <svg
                className="w-20 h-20 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <MembershipModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};

export default MembershipBanner;
