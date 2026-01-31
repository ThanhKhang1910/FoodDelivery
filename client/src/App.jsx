import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import Home from "./pages/Home";
import RestaurantDetail from "./pages/RestaurantDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";
import OrderHistory from "./pages/OrderHistory";
import Profile from "./pages/Profile";
import BikeBooking from "./pages/BikeBooking";
import MembershipModal from "./components/MembershipModal";

import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
    setShowDropdown(false);
  };

  return (
    <header className="bg-white shadow p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">
          🍔 FoodDelivery
        </Link>
        <nav className="flex items-center gap-4">
          {isAuthenticated() && (
            <>
              <Link
                to="/orders"
                className="px-4 py-2 text-gray-600 hover:text-black font-medium"
              >
                📦 Đơn hàng
              </Link>
              <button
                onClick={() => {
                  // Open membership modal
                  const event = new CustomEvent("openMembershipModal");
                  window.dispatchEvent(event);
                }}
                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 font-bold rounded-lg shadow-md transition-all flex items-center gap-2"
              >
                💎 Premium
              </button>
            </>
          )}

          {isAuthenticated() ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  {user?.fullName?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="font-medium text-gray-800">
                  {user?.fullName || "User"}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${showDropdown ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100 border-b border-gray-200"
                    onClick={() => setShowDropdown(false)}
                  >
                    <p className="text-sm text-gray-500">👤 Xem thông tin</p>
                    <p className="font-semibold text-gray-800">{user?.email}</p>
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    📦 Đơn hàng của tôi
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-gray-600 hover:text-black"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function App() {
  const [showMembershipModal, setShowMembershipModal] = useState(false);

  // Global listener for membership modal
  React.useEffect(() => {
    const handleOpenModal = () => setShowMembershipModal(true);
    window.addEventListener("openMembershipModal", handleOpenModal);
    return () =>
      window.removeEventListener("openMembershipModal", handleOpenModal);
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/restaurant/:id" element={<RestaurantDetail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order/:id/tracking" element={<OrderTracking />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/bike-booking" element={<BikeBooking />} />
              </Routes>
            </main>

            {/* Global Membership Modal */}
            <MembershipModal
              isOpen={showMembershipModal}
              onClose={() => setShowMembershipModal(false)}
            />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
