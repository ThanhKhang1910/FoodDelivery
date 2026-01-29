import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { Link } from "react-router-dom";
import MapComponent from "../components/Map";
import { useTheme } from "../contexts/ThemeContext";
import SkeletonCard from "../components/SkeletonCard";
import FloatingCart from "../components/FloatingCart";

// Fare calculation constants
const BASE_FARES = {
  BIKE: 15000,
  CAR: 30000,
};

const RATES = {
  BIKE: 3000, // per km
  CAR: 8000, // per km
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const Home = () => {
  const { theme, toggleTheme } = useTheme();
  const [restaurants, setRestaurants] = useState([]);
  const [martStores, setMartStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState("FOOD");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedCarClass, setSelectedCarClass] = useState("STANDARD");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [distance, setDistance] = useState(0);

  // Express States
  const [senderInfo, setSenderInfo] = useState({
    name: "",
    phone: "",
  });
  const [receiverInfo, setReceiverInfo] = useState({
    name: "",
    phone: "",
    note: "",
  });
  const [expressDetails, setExpressDetails] = useState({
    weight: "",
    type: "",
    dimensions: "",
  });
  const [extraServices, setExtraServices] = useState({
    cod: false,
    doorToDoor: false,
    bulky: false,
  });
  const [returnToPickup, setReturnToPickup] = useState(false);
  const [showItemDetailsModal, setShowItemDetailsModal] = useState(false);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("distance"); // distance, rating, name
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce Effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch Logic with Filters
  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          lat: 10.762622, // Should get from user location context
          lng: 106.660172,
          search: debouncedSearch,
          category_id: activeFilter,
          sort_by: sortBy,
        });

        const response = await axiosClient.get(
          `/customer/restaurants?${queryParams}`,
        );

        // Filter logic remains similar but now backend handles the heavy lifting
        // We still split Mart/Food for UI separation if needed, or rely on type
        // For now, assuming API returns mixed, we split by ID range as before
        const marts = response.data.filter(
          (r) => r.restaurant_id >= 2001 && r.restaurant_id <= 2006,
        );
        const regular = response.data.filter(
          (r) => r.restaurant_id < 2001 || r.restaurant_id > 2006,
        );

        setMartStores(marts);
        setRestaurants(regular);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [debouncedSearch, activeFilter, sortBy]);

  // Favorites & Order History State
  const [favorites, setFavorites] = useState(new Set());
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [favRes, historyRes] = await Promise.all([
          axiosClient.get("/customer/favorites/ids"),
          axiosClient.get("/customer/orders/history"),
        ]);
        setFavorites(new Set(favRes.data));
        setRecentOrders(historyRes.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchData();
  }, []);

  const toggleFavorite = async (e, restaurantId) => {
    e.preventDefault(); // Prevent link navigation
    try {
      // Optimistic update
      setFavorites((prev) => {
        const newFavs = new Set(prev);
        if (newFavs.has(restaurantId)) {
          newFavs.delete(restaurantId);
        } else {
          newFavs.add(restaurantId);
        }
        return newFavs;
      });

      await axiosClient.post("/customer/favorites/toggle", { restaurantId });
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Revert if error (optional, keep simple for now)
    }
  };

  // Pull to Refresh State
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pull to Refresh Handlers
  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (window.scrollY === 0 && startY > 0) {
      const currentY = e.touches[0].clientY;
      const distance = currentY - startY;
      if (distance > 0) {
        // Resistance effect
        setPullDistance(Math.min(distance * 0.4, 120));
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 80) {
      setIsRefreshing(true);
      setPullDistance(80); // Snap to loading position

      // Trigger refresh
      try {
        const response = await axiosClient.get("/customer/restaurants");

        // Filter logic (duplicated from useEffect for now to ensure freshness)
        const marts = response.data.filter(
          (r) => r.restaurant_id >= 2001 && r.restaurant_id <= 2006,
        );
        setMartStores(marts);

        const regularRestaurants = response.data.filter(
          (r) => r.restaurant_id < 2001 || r.restaurant_id > 2006,
        );
        setRestaurants(regularRestaurants);
      } catch (error) {
        console.error("Refresh failed", error);
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 500);
      }
    } else {
      setPullDistance(0);
    }
    setStartY(0);
  };

  const onPickupLoad = (auto) => setPickupAutocomplete(auto);
  const onDestLoad = (auto) => setDestAutocomplete(auto);

  const calculateDistance = (p1, p2) => {
    if (!p1 || !p2) return 0;
    const R = 6371; // Radius of earth in km
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLon = ((p2.lng - p1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((p1.lat * Math.PI) / 180) *
        Math.cos((p2.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(Math.round(amount)) + " đ";
  };

  const isBetweenHours = (start, end) => {
    const hour = new Date().getHours();
    return hour >= start && hour < end;
  };

  const BASE_FARES = {
    BIKE: 15000,
    STANDARD: 30000,
    BUSINESS: 50000,
    LIMO: 80000,
    EXPRESS: 20000,
  };

  const RATES = {
    BIKE: 5000,
    STANDARD: 12000,
    BUSINESS: 15000,
    LIMO: 20000,
    EXPRESS: 10000,
  };

  const MART_CATEGORIES = [
    {
      id: "fresh",
      name: "Thịt, cá tươi",
      icon: "🥩",
      color: "bg-red-50 text-red-500",
    },
    {
      id: "veggie",
      name: "Rau củ quả",
      icon: "🥦",
      color: "bg-green-50 text-green-500",
    },
    {
      id: "drinks",
      name: "Sữa & Đồ uống",
      icon: "🥛",
      color: "bg-blue-50 text-blue-500",
    },
    {
      id: "dry",
      name: "Bánh mì & Đồ khô",
      icon: "🍞",
      color: "bg-orange-50 text-orange-500",
    },
    {
      id: "home",
      name: "Đồ gia dụng",
      icon: "🧼",
      color: "bg-purple-50 text-purple-500",
    },
    {
      id: "beaty",
      name: "Chăm sóc da",
      icon: "🧴",
      color: "bg-pink-50 text-pink-500",
    },
  ];

  const MART_STORES = [
    {
      id: 1,
      name: "WinMart+ Phú Nhuận",
      image: "https://vnn-imgs-f.vgcloud.vn/2021/09/20/17/winmart.jpg",
      rating: 4.8,
      distance: "0.5 km",
      time: "15 min",
      tags: ["Siêu thị", "Tươi sống", "Giao nhanh"],
    },
    {
      id: 2,
      name: "Co.op Food Đặng Văn Ngữ",
      image: "https://media.cooky.vn/images/content/coop-food-1.jpg",
      rating: 4.6,
      distance: "1.2 km",
      time: "20 min",
      tags: ["Thực phẩm", "Hàng bình ổn"],
    },
    {
      id: 3,
      name: "Circle K - Phan Xích Long",
      image:
        "https://www.circlek.com.vn/wp-content/uploads/2019/12/Circle-K-Vietnam-Store-Front.jpg",
      rating: 4.9,
      distance: "0.8 km",
      time: "10 min",
      tags: ["Cửa hàng tiện lợi", "Mở 24/7"],
    },
    {
      id: 4,
      name: "GS25 - Nguyễn Đình Chiểu",
      image: "https://gs25.com.vn/storage/stores/1.jpg",
      rating: 4.7,
      distance: "1.5 km",
      time: "25 min",
      tags: ["Hàn Quốc", "Đồ ăn nhanh"],
    },
  ];

  const onPickupChanged = () => {
    if (pickupAutocomplete) {
      const place = pickupAutocomplete.getPlace();
      if (place.formatted_address || place.name) {
        setPickup(place.formatted_address || place.name);
      }
      if (place.geometry) {
        const coords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setPickupCoords(coords);
      }
    }
  };

  const onDestChanged = () => {
    if (destAutocomplete) {
      const place = destAutocomplete.getPlace();
      if (place.formatted_address || place.name) {
        setDestination(place.formatted_address || place.name);
      }
      if (place.geometry) {
        const coords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setDestCoords(coords);
      }
    }
  };

  useEffect(() => {
    if (pickupCoords && destCoords) {
      setDistance(calculateDistance(pickupCoords, destCoords));
    }
  }, [pickupCoords, destCoords]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await axiosClient.get("/customer/restaurants");
        setRestaurants(res.data);
      } catch (error) {
        console.error("Failed to fetch restaurants", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await axiosClient.get("/auth/me");
          if (res.data) {
            setSenderInfo({
              name: res.data.fullName || res.data.full_name || "",
              phone: res.data.phone || "",
            });
          }
        } catch (error) {
          console.log("Not logged in or error fetching user");
        }
      }
    };

    fetchUserData();
    // fetchRestaurants(); // ❌ COMMENTED OUT - This was overwriting the filtered restaurants from fetchMartStores!
  }, []);

  // Removed early return for loading to enable Skeleton Loading UI
  // if (loading) return (...)

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-primary-50/40 via-white to-accent-blue/10 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950 transition-colors duration-700 overflow-hidden relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      <div
        className="absolute top-0 left-0 w-full flex justify-center items-center pointer-events-none z-50 transition-transform duration-200 ease-out"
        style={{ transform: `translateY(${pullDistance - 40}px)` }} // Start hidden above
      >
        <div
          className={`w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center border border-gray-100 dark:border-gray-700 ${isRefreshing ? "animate-spin" : ""}`}
        >
          {isRefreshing ? (
            <span className="text-primary text-xl">↻</span>
          ) : (
            <span
              className="text-gray-500 text-xl"
              style={{ transform: `rotate(${pullDistance * 2}deg)` }}
            >
              ↓
            </span>
          )}
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-6xl">
        {/* Hero Section */}
        <section className="mt-8 mb-12 relative">
          {/* Animated Background Gradient */}
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-200/50 dark:bg-primary-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-50 animate-pulse-slow"></div>
          <div className="absolute -top-10 -right-20 w-96 h-96 bg-accent-blue/20 dark:bg-blue-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-50 animate-pulse-slow animation-delay-300"></div>

          <div className="relative z-20 flex justify-between items-start mb-8">
            <div className="hidden md:block"></div> {/* Spacer */}
            <button
              onClick={toggleTheme}
              className="glass p-3 rounded-full hover:bg-white/50 transition-all duration-300 shadow-sm group"
              aria-label="Toggle Dark Mode"
            >
              <span className="text-2xl group-hover:rotate-12 transition-transform block">
                {theme === "dark" ? "☀️" : "🌙"}
              </span>
            </button>
          </div>

          <div className="relative z-10">
            <h1 className="text-5xl font-display font-black text-gray-900 dark:text-white mb-3 animate-fade-in">
              Xin chào! 👋
            </h1>
            <p className="text-xl text-gray-600 font-medium mb-8 max-w-2xl leading-relaxed animate-fade-in animation-delay-100">
              Giao hàng nhanh chóng, an toàn và tiện lợi - Mọi nhu cầu hàng ngày
              trong tầm tay bạn.
            </p>

            {/* Premium Glassmorphism Search Bar - Only for Shopping Services */}
            {["FOOD", "MART"].includes(selectedService) && (
              <div className="max-w-2xl glass p-2 rounded-3xl shadow-medium hover:shadow-hard transition-all duration-300 mb-10 animate-slide-up">
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center px-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg mr-3">
                      🔍
                    </div>
                    <input
                      type="text"
                      placeholder={
                        selectedService === "MART"
                          ? "Tìm sản phẩm, cửa hàng tiện lợi..."
                          : "Tìm món ăn, nhà hàng..."
                      }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full py-3 text-lg outline-none text-gray-700 placeholder:text-gray-400 bg-transparent font-medium"
                    />
                  </div>
                  <button className="btn-primary px-8 py-4 text-lg whitespace-nowrap">
                    Tìm kiếm
                  </button>
                </div>

                {/* Filter Chips */}
                <div className="flex flex-wrap gap-2 px-4 pb-2 animate-fade-in animation-delay-200">
                  <button
                    onClick={() => setActiveFilter("ALL")}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeFilter === "ALL" ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 hover:bg-gray-50"}`}
                  >
                    Tất cả
                  </button>
                  {/* Categories */}
                  {["Cơm", "Bún/Phở", "Đồ uống", "Ăn vặt"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() =>
                        setActiveFilter(cat === activeFilter ? "ALL" : cat)
                      }
                      className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeFilter === cat ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 hover:bg-gray-50"}`}
                    >
                      {cat}
                    </button>
                  ))}

                  <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-2"></div>

                  {/* Sort Options */}
                  <button
                    onClick={() => setSortBy("rating")}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1 ${sortBy === "rating" ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700"}`}
                  >
                    ⭐ Đánh giá
                  </button>
                  <button
                    onClick={() => setSortBy("distance")}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1 ${sortBy === "distance" ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700"}`}
                  >
                    📍 Gần tôi
                  </button>
                </div>
              </div>
            )}

            {/* Premium Service Icons with 3D Effects */}
            <div className="flex flex-wrap gap-6 items-start perspective-1000">
              {[
                {
                  id: "BIKE",
                  title: "BIKE",
                  icon: "🛵",
                  gradient: "from-green-400 to-emerald-500",
                },
                {
                  id: "CAR",
                  title: "CAR",
                  icon: "🚗",
                  gradient: "from-blue-400 to-cyan-500",
                },
                {
                  id: "FOOD",
                  title: "FOOD",
                  icon: "🍴",
                  gradient: "from-orange-400 to-red-500",
                },
                {
                  id: "MART",
                  title: "MART",
                  icon: "🏪",
                  gradient: "from-purple-400 to-pink-500",
                },
                {
                  id: "EXPRESS",
                  title: "EXPRESS",
                  icon: "📦",
                  gradient: "from-amber-400 to-orange-500",
                },
              ].map((service, index) => (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className="flex flex-col items-center gap-3 cursor-pointer group animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative">
                    {/* Glow Effect */}
                    {selectedService === service.id && (
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${service.gradient} rounded-3xl blur-xl opacity-50 animate-pulse`}
                      ></div>
                    )}

                    {/* Icon Container */}
                    <div
                      className={`relative w-20 h-20 rounded-3xl flex items-center justify-center text-3xl transition-all duration-300 transform-3d ${
                        selectedService === service.id
                          ? `bg-gradient-to-br ${service.gradient} text-white shadow-hard scale-110 -rotate-3`
                          : "bg-white text-gray-700 shadow-soft group-hover:shadow-medium group-hover:scale-105 group-hover:-translate-y-1"
                      }`}
                    >
                      <span className="transform group-hover:scale-110 transition-transform duration-200">
                        {service.icon}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-sm font-black tracking-wider transition-all duration-200 ${
                      selectedService === service.id
                        ? "text-gray-900 scale-105"
                        : "text-gray-600 group-hover:text-gray-900"
                    }`}
                  >
                    {service.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Content Area Based on Selection */}
        <div className="animate-fade-in-up">
          {selectedService === "FOOD" && (
            <>
              {/* Recent Orders Section */}
              {recentOrders.length > 0 && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                      Đặt lại gần đây
                    </h2>
                    <span className="text-primary text-sm font-medium cursor-pointer">
                      Xem tất cả
                    </span>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {recentOrders.map((order) => (
                      <div
                        key={order.order_id}
                        className="min-w-[280px] bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-3 cursor-pointer hover:shadow-md transition-all"
                      >
                        <img
                          src={
                            order.image_url || "https://via.placeholder.com/60"
                          }
                          alt={order.shop_name}
                          className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1">
                            {order.shop_name}
                          </h3>
                          <p className="text-xs text-gray-500 mb-2">
                            {order.item_count} món •{" "}
                            {parseFloat(order.total_amount).toLocaleString()}đ
                          </p>
                          <span className="text-xs font-bold text-primary bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded-md">
                            Đặt lại
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Restaurants Near You
                </h2>
                <span className="text-primary font-medium cursor-pointer hover:underline">
                  View All
                </span>
              </div>

              {/* Map Preview */}
              <div className="mb-8 shadow-lg rounded-xl overflow-hidden border border-gray-100 h-64 relative">
                <MapComponent restaurants={restaurants} />
              </div>

              {/* Restaurant List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  // Render 6 Skeleton Cards while loading
                  Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-full">
                      <SkeletonCard />
                    </div>
                  ))
                ) : (
                  <>
                    {console.log(
                      "🎨 RENDERING FOOD - restaurants state:",
                      restaurants,
                    )}
                    {restaurants.map((res) => (
                      <Link
                        to={`/restaurant/${res.restaurant_id}`}
                        key={res.restaurant_id}
                        className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 relative"
                      >
                        {/* Favorite Button */}
                        <button
                          onClick={(e) => toggleFavorite(e, res.restaurant_id)}
                          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform active:scale-95"
                        >
                          <span
                            className={`text-lg leading-none ${favorites.has(res.restaurant_id) ? "text-red-500 scale-110" : "text-gray-400 grayscale"}`}
                          >
                            {favorites.has(res.restaurant_id) ? "❤️" : "🤍"}
                          </span>
                        </button>

                        <div className="relative h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
                          {/* Placeholder or Actual Image Logic */}
                          {res.image_url ? (
                            <img
                              src={res.image_url}
                              alt={res.shop_name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">
                              🏪
                            </div>
                          )}

                          <div className="absolute top-3 right-3">
                            <span
                              className={`px-2 py-1 rounded-lg text-xs font-bold shadow-sm ${res.is_open ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
                            >
                              {res.is_open ? "OPEN" : "CLOSED"}
                            </span>
                          </div>
                        </div>

                        <div className="p-5">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                            {res.shop_name}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 mb-3 truncate">
                            {res.address}
                          </p>

                          <div className="flex items-center justify-between border-t dark:border-gray-700 pt-3 mt-3">
                            <div className="flex items-center gap-1 text-amber-500 font-bold">
                              <span>⭐</span>
                              <span>{res.rating}</span>
                            </div>
                            <span className="text-xs text-gray-400">
                              1.2 km • 15 min
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </>
                )}
              </div>
            </>
          )}

          {selectedService === "MART" && (
            <>
              <div className="flex justify-between items-center mb-8 animate-fade-in">
                <div>
                  <h2 className="text-3xl font-display font-black text-gray-900 mb-1">
                    Cửa hàng tiện lợi
                  </h2>
                  <p className="text-gray-500 font-medium">
                    Mua sắm nhanh chóng, tiện lợi
                  </p>
                </div>
                {martStores.length > 0 && (
                  <button className="btn-outline px-6 py-3">Xem tất cả</button>
                )}
              </div>

              {/* Mart Store List */}
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : martStores.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {martStores.map((store, index) => (
                    <Link
                      to={`/restaurant/${store.restaurant_id}`}
                      key={store.restaurant_id}
                      className="group card-premium hover:-translate-y-2 animate-scale-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-purple-100 to-pink-200 rounded-t-3xl">
                        {/* Store Icon/Image */}
                        {store.image_url ? (
                          <>
                            <img
                              src={store.image_url}
                              alt={store.shop_name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-7xl opacity-40">
                            🏪
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                          <span
                            className={`glass px-3 py-1.5 rounded-full text-xs font-black shadow-lg ${
                              store.is_open
                                ? "text-green-600 bg-green-50/90"
                                : "text-red-600 bg-red-50/90"
                            }`}
                          >
                            {store.is_open ? "● MỞ CỬA" : "● ĐÓNG CỬA"}
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-display font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-2 line-clamp-1">
                          {store.shop_name}
                        </h3>
                        <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                          {store.address}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-1.5">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-sm">
                              ⭐
                            </div>
                            <span className="font-black text-gray-900">
                              {store.rating}
                            </span>
                            <span className="text-xs text-gray-400">
                              (500+)
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                            <span>📍 0.8 km</span>
                            <span>•</span>
                            <span className="text-purple-600 font-bold">
                              ~10 phút
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-200 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-6xl">🏪</span>
                  </div>
                  <h3 className="text-2xl font-display font-bold text-gray-800 mb-2">
                    Chưa có cửa hàng
                  </h3>
                  <p className="text-gray-500 text-center max-w-md mb-8">
                    Hiện tại chưa có cửa hàng tiện lợi nào trong khu vực. Hãy
                    quay lại sau nhé!
                  </p>
                  <button
                    onClick={() => setSelectedService("FOOD")}
                    className="btn-primary px-8 py-3"
                  >
                    Đặt đồ ăn ngay
                  </button>
                </div>
              )}
            </>
          )}

          {selectedService === "BIKE" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Booking Form */}
              <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                    🛵
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Bike Ride
                    </h2>
                    <p className="text-sm text-gray-500">Fast & Affordable</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pickup Location
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-green-500 text-lg">
                        📍
                      </span>
                      <input
                        type="text"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        placeholder="Enter pickup point"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div className="flex justify-center -my-2 relative z-10">
                    <div className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 border-2 border-white">
                      ↓
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Destination
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-red-500 text-lg">
                        🚩
                      </span>
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="Where are you going?"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-green-700">
                        Estimated Fare{" "}
                        {distance > 0 && `(${distance.toFixed(1)} km)`}
                      </span>
                      <span className="font-bold text-green-800">
                        {distance > 0
                          ? formatCurrency(
                              BASE_FARES.BIKE + distance * RATES.BIKE,
                            )
                          : formatCurrency(BASE_FARES.BIKE)}
                      </span>
                    </div>
                    <p className="text-xs text-green-600">
                      * Final price depends on traffic and route.
                    </p>
                  </div>

                  <button className="w-full py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 active:scale-95 transition-all mt-4">
                    Find a Driver
                  </button>
                </div>
              </div>

              {/* Drivers Map & Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-100 h-80 overflow-hidden relative">
                  <MapComponent
                    restaurants={[]}
                    center={{ lat: 10.776, lng: 106.701 }}
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-full shadow-md border border-gray-100 text-xs font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    3 Drivers Online Nearby
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-4">
                    Drivers Nearby
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-xl">
                          🛵
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">
                            Nguyễn Văn Bike 1
                          </p>
                          <p className="text-xs text-gray-500">
                            59-S1 123.45 • 4.9 ⭐
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                        2 min away
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedService === "CAR" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Booking Form */}
              <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                    🚗
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Car Ride
                    </h2>
                    <p className="text-sm text-gray-500">Safe & Comfortable</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pickup Location
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-blue-500 text-lg">
                        📍
                      </span>
                      <input
                        type="text"
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        placeholder="Enter pickup point"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div className="flex justify-center -my-2 relative z-10">
                    <div className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 border-2 border-white">
                      ↓
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Destination
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-red-500 text-lg">
                        🚩
                      </span>
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="Where are you going?"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Vehicle Class Selector */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Vehicle Type
                    </label>
                    <div className="space-y-2">
                      {[
                        {
                          id: "STANDARD",
                          name: "Car thường",
                          desc: "4 Khách • Tiết kiệm",
                          rate: RATES.STANDARD,
                          icon: "🚗",
                        },
                        {
                          id: "BUSINESS",
                          name: "Business",
                          desc: "4 Khách • Sang trọng",
                          rate: RATES.BUSINESS,
                          icon: "💼",
                        },
                        {
                          id: "LIMO",
                          name: "Limo",
                          desc: "6 Khách • Rộng rãi",
                          rate: RATES.LIMO,
                          icon: "🚐",
                        },
                      ].map((tier) => (
                        <div
                          key={tier.id}
                          onClick={() => setSelectedCarClass(tier.id)}
                          className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedCarClass === tier.id ? "border-blue-500 bg-blue-50" : "border-gray-50 bg-gray-50 hover:border-gray-200"}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{tier.icon}</span>
                            <div>
                              <p className="font-bold text-sm text-gray-800">
                                {tier.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {tier.desc}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm text-blue-600">
                              {distance > 0
                                ? formatCurrency(
                                    BASE_FARES[tier.id] + distance * tier.rate,
                                  )
                                : formatCurrency(BASE_FARES[tier.id])}
                            </p>
                            {distance > 0 && (
                              <p className="text-[10px] text-gray-400">
                                {distance.toFixed(1)} km
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all mt-4">
                    Confirm Booking
                  </button>
                </div>
              </div>

              {/* Drivers Map & Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-100 h-[500px] overflow-hidden relative">
                  <MapComponent
                    restaurants={[]}
                    center={{ lat: 10.776, lng: 106.701 }}
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-full shadow-md border border-gray-100 text-xs font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    Many Drivers Available
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedService === "MART" && (
            <div className="space-y-10 mb-20">
              {/* Mart Hero / Banners */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-48 rounded-3xl bg-gradient-to-r from-orange-400 to-orange-600 p-8 flex flex-col justify-center text-white relative overflow-hidden group cursor-pointer shadow-lg">
                  <div className="relative z-10">
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-3 inline-block">
                      Flash Sale
                    </span>
                    <h3 className="text-2xl font-black mb-1">
                      Giảm 50% đồ tươi sống
                    </h3>
                    <p className="text-sm opacity-90">
                      Duy nhất hôm nay tại WinMart
                    </p>
                  </div>
                  <div className="absolute right-[-20px] bottom-[-20px] text-8xl opacity-20 group-hover:scale-110 transition-transform">
                    🥩
                  </div>
                </div>
                <div className="h-48 rounded-3xl bg-gradient-to-r from-green-500 to-emerald-600 p-8 flex flex-col justify-center text-white relative overflow-hidden group cursor-pointer shadow-lg">
                  <div className="relative z-10">
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-3 inline-block">
                      Free Ship
                    </span>
                    <h3 className="text-2xl font-black mb-1">
                      Đi chợ hộ miễn phí
                    </h3>
                    <p className="text-sm opacity-90">
                      Cho đơn hàng từ 200k đầu tiên
                    </p>
                  </div>
                  <div className="absolute right-[-20px] bottom-[-20px] text-8xl opacity-20 group-hover:scale-110 transition-transform">
                    🥕
                  </div>
                </div>
              </div>

              {/* Categories Row */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xl font-black text-gray-900">
                    Danh mục hàng hóa
                  </h3>
                  <button className="text-primary font-bold text-sm">
                    Xem tất cả
                  </button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar no-scrollbar">
                  {MART_CATEGORIES.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex-shrink-0 flex flex-col items-center gap-3 group cursor-pointer"
                    >
                      <div
                        className={`w-16 h-16 ${cat.color} rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition shadow-sm active:scale-95`}
                      >
                        {cat.icon}
                      </div>
                      <span className="text-xs font-bold text-gray-700 text-center max-w-[80px] leading-tight">
                        {cat.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Featured Stores */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-gray-900">
                      Cửa hàng gần bạn
                    </h3>
                    <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Fastest
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
                      🔍
                    </button>
                    <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
                      📍
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {MART_STORES.map((store) => (
                    <div
                      key={store.id}
                      className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                    >
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={store.image}
                          alt={store.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="bg-white/95 backdrop-blur shadow-lg px-3 py-1.5 rounded-full text-xs font-black text-gray-900 flex items-center gap-1.5">
                            ⭐ {store.rating}
                          </span>
                        </div>
                        <div className="absolute bottom-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                          <button className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-xl shadow-lg hover:brightness-110 active:scale-90 transition">
                            +
                          </button>
                        </div>
                      </div>
                      <div className="p-6">
                        <h4 className="font-black text-gray-900 text-lg mb-2 group-hover:text-primary transition-colors">
                          {store.name}
                        </h4>
                        <div className="flex items-center gap-3 text-gray-400 text-xs font-bold mb-4">
                          <span className="flex items-center gap-1">
                            📍 {store.distance}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-primary">
                            🕒 {store.time}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {store.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="bg-gray-50 text-gray-500 text-[10px] font-black px-2 py-1 rounded-lg border border-gray-100 uppercase tracking-tighter"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedService === "EXPRESS" && (
            <div className="max-w-4xl mx-auto bg-gray-50 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 mb-20">
              {/* Header */}
              <div className="bg-white px-6 py-4 flex items-center justify-between border-b sticky top-0 z-20">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedService("FOOD")}
                    className="text-2xl text-gray-800"
                  >
                    ←
                  </button>
                  <h2 className="text-xl font-bold text-gray-800">Giao hàng</h2>
                </div>
                <button className="text-primary font-bold">Lưu</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* Form Side */}
                <div className="p-6 space-y-6 bg-white max-h-[70vh] overflow-y-auto custom-scrollbar">
                  {/* Location Block */}
                  <div className="bg-gray-50 p-6 rounded-2xl space-y-4 border border-gray-100">
                    <div className="flex gap-4 relative">
                      <div className="flex flex-col items-center py-1">
                        <div className="w-5 h-5 rounded-full border-4 border-black bg-white z-10"></div>
                        <div className="w-0.5 h-full bg-gray-200 border-dashed border-l-2 my-1"></div>
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={pickup}
                          onChange={(e) => setPickup(e.target.value)}
                          placeholder="Nhập điểm lấy hàng..."
                          className="w-full bg-transparent font-bold text-gray-800 outline-none placeholder:text-gray-400"
                        />
                        <div className="flex gap-2 text-xs text-gray-500 mt-1 items-center">
                          <input
                            type="text"
                            placeholder="Tên người gửi"
                            value={senderInfo.name}
                            onChange={(e) =>
                              setSenderInfo({
                                ...senderInfo,
                                name: e.target.value,
                              })
                            }
                            className="bg-transparent border-b border-transparent focus:border-primary outline-none w-24"
                          />
                          <span>•</span>
                          <input
                            type="text"
                            placeholder="Số điện thoại"
                            value={senderInfo.phone}
                            onChange={(e) =>
                              setSenderInfo({
                                ...senderInfo,
                                phone: e.target.value,
                              })
                            }
                            className="bg-transparent border-b border-transparent focus:border-primary outline-none flex-1"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const tempP = pickup;
                          const tempC = pickupCoords;
                          setPickup(destination);
                          setPickupCoords(destCoords);
                          setDestination(tempP);
                          setDestCoords(tempC);
                        }}
                        className="text-gray-400 text-xl hover:text-primary transition"
                      >
                        ⇅
                      </button>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center py-1">
                        <div className="w-5 h-5 rounded-full bg-orange-500 z-10 flex items-center justify-center border-2 border-white shadow-sm"></div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          placeholder="Nhập địa chỉ người nhận..."
                          className="w-full bg-transparent font-bold text-gray-800 outline-none placeholder:text-gray-400"
                        />
                        <div className="flex gap-2 text-primary text-xs items-center">
                          <input
                            type="text"
                            placeholder="Tên người nhận"
                            value={receiverInfo.name}
                            onChange={(e) =>
                              setReceiverInfo({
                                ...receiverInfo,
                                name: e.target.value,
                              })
                            }
                            className="bg-transparent border-b border-transparent focus:border-primary outline-none w-24 placeholder:text-blue-300"
                          />
                          <span>•</span>
                          <input
                            type="text"
                            placeholder="Số điện thoại"
                            value={receiverInfo.phone}
                            onChange={(e) =>
                              setReceiverInfo({
                                ...receiverInfo,
                                phone: e.target.value,
                              })
                            }
                            className="bg-transparent border-b border-transparent focus:border-primary outline-none flex-1 placeholder:text-blue-300"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-3 text-gray-600 font-medium cursor-pointer hover:text-black transition">
                      <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                        +
                      </span>
                      <span className="text-sm">Thêm điểm giao</span>
                    </div>

                    <div className="pt-4 border-t border-gray-200 flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={returnToPickup}
                        onChange={(e) => setReturnToPickup(e.target.checked)}
                        className="w-5 h-5 accent-primary cursor-pointer"
                      />
                      <label className="text-sm text-gray-500 font-medium cursor-pointer">
                        Quay về điểm lấy hàng
                      </label>
                    </div>
                  </div>

                  {/* Item Details */}
                  <div
                    onClick={() => setShowItemDetailsModal(true)}
                    className="bg-gray-50 p-5 rounded-2xl flex items-center gap-4 border border-gray-100 hover:border-primary transition group cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition">
                      📦
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">
                        {expressDetails.type || expressDetails.weight ? (
                          <span className="text-primary capitalize">
                            {expressDetails.type}{" "}
                            {expressDetails.weight
                              ? `• ${expressDetails.weight}kg`
                              : ""}
                          </span>
                        ) : (
                          "Thêm chi tiết hàng hóa *"
                        )}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {expressDetails.dimensions
                          ? `KT: ${expressDetails.dimensions}`
                          : "Thêm chi tiết loại hàng hoá, kích thước, cân..."}
                      </p>
                    </div>
                    <span className="text-gray-400">›</span>
                  </div>

                  {/* Extended Services */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-800 px-1">
                      Dịch vụ mở rộng
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center text-primary text-lg font-bold">
                            +
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-gray-700">
                              Thu tiền hộ
                            </span>
                            <span className="text-gray-400 text-xs">ⓘ</span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          className="w-6 h-6 accent-primary"
                          checked={extraServices.cod}
                          onChange={(e) =>
                            setExtraServices({
                              ...extraServices,
                              cod: e.target.checked,
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center text-primary text-lg font-bold">
                            +
                          </span>
                          <span className="font-medium text-gray-700">
                            Giao hàng tận tay
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-600">
                            10.000đ
                          </span>
                          <input
                            type="checkbox"
                            className="w-6 h-6 accent-primary"
                            checked={extraServices.doorToDoor}
                            onChange={(e) =>
                              setExtraServices({
                                ...extraServices,
                                doorToDoor: e.target.checked,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center text-primary text-lg font-bold">
                            +
                          </span>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-gray-700">
                                Hàng cồng kềnh
                              </span>
                              <span className="text-gray-400 text-xs">ⓘ</span>
                            </div>
                            <span className="text-[10px] text-gray-400">
                              (tối đa 50kg, 60x70x60cm)
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-600">
                            15.000đ
                          </span>
                          <input
                            type="checkbox"
                            className="w-6 h-6 accent-primary"
                            checked={extraServices.bulky}
                            onChange={(e) =>
                              setExtraServices({
                                ...extraServices,
                                bulky: e.target.checked,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selection Side (Mimicking Modal/Bottom Sheet) */}
                <div className="p-8 bg-white border-l border-gray-100 flex flex-col items-center justify-center text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-8">
                    Bạn muốn chọn dịch vụ giao nào?
                  </h3>

                  <div className="w-full space-y-4">
                    {/* BronAuto Express - Active */}
                    <div className="w-full p-5 rounded-3xl bg-blue-50 border-2 border-primary shadow-sm flex items-center justify-between relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                      <div className="flex items-center gap-4 text-left">
                        <div className="p-3 bg-white rounded-2xl shadow-sm">
                          📦
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <h4 className="font-black text-gray-900 uppercase">
                              BronAuto Express
                            </h4>
                            <span className="text-gray-400 text-xs">ⓘ</span>
                          </div>
                          <p className="text-xs text-primary font-medium">
                            Lấy hàng nhanh, giao siêu tốc
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-xl text-gray-900 block">
                          {formatCurrency(
                            (distance > 0
                              ? BASE_FARES.EXPRESS + distance * RATES.EXPRESS
                              : BASE_FARES.EXPRESS) +
                              (extraServices.doorToDoor ? 10000 : 0) +
                              (extraServices.bulky ? 15000 : 0),
                          )}
                        </span>
                        {distance > 0 && (
                          <span className="text-[10px] text-gray-400 font-bold italic">
                            {distance.toFixed(1)} km
                          </span>
                        )}
                      </div>
                    </div>

                    {/* BronAuto Express 2H */}
                    {isBetweenHours(6, 18) ? (
                      <div className="w-full p-5 rounded-3xl bg-gray-50 border-2 border-transparent flex items-center justify-between hover:bg-white hover:border-blue-100 transition cursor-pointer">
                        <div className="flex items-center gap-4 text-left">
                          <div className="p-3 bg-white rounded-2xl shadow-sm">
                            🕒
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <h4 className="font-black text-gray-900 uppercase">
                                BronAuto Express 2H
                              </h4>
                              <span className="text-gray-400 text-xs">ⓘ</span>
                            </div>
                            <p className="text-xs text-primary font-medium">
                              Giao hàng trong 2 giờ
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-xl text-gray-900 block">
                            {formatCurrency(
                              distance > 0
                                ? BASE_FARES.EXPRESS * 0.8 +
                                    distance * (RATES.EXPRESS * 0.8)
                                : BASE_FARES.EXPRESS * 0.8,
                            )}
                          </span>
                          {distance > 0 && (
                            <span className="text-[10px] text-gray-400 font-bold italic">
                              {distance.toFixed(1)} km
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full p-5 rounded-3xl bg-gray-50 border-2 border-transparent flex items-center justify-between opacity-50 grayscale">
                        <div className="flex items-center gap-4 text-left">
                          <div className="p-3 bg-white rounded-2xl shadow-sm">
                            🕒
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <h4 className="font-black text-gray-400 uppercase">
                                BronAuto Express 2H
                              </h4>
                              <span className="text-gray-400 text-xs">ⓘ</span>
                            </div>
                            <p className="text-xs text-red-500 font-bold uppercase">
                              Ngoài giờ hoạt động (6h-18h)
                            </p>
                          </div>
                        </div>
                        <span className="font-black text-xl text-gray-300">
                          —
                        </span>
                      </div>
                    )}

                    {/* BronAuto Van */}
                    {isBetweenHours(6, 18) ? (
                      <div className="w-full p-5 rounded-3xl bg-gray-50 border-2 border-transparent flex items-center justify-between hover:bg-white hover:border-blue-100 transition cursor-pointer">
                        <div className="flex items-center gap-4 text-left">
                          <div className="p-3 bg-white rounded-2xl shadow-sm">
                            🚚
                          </div>
                          <div>
                            <h4 className="font-black text-gray-900 uppercase">
                              BronAuto Van
                            </h4>
                            <p className="text-xs text-primary font-medium">
                              Xe tải vận chuyển hàng lớn
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-xl text-gray-900 block">
                            {formatCurrency(
                              distance > 0
                                ? BASE_FARES.EXPRESS * 2 +
                                    distance * (RATES.EXPRESS * 2)
                                : BASE_FARES.EXPRESS * 2,
                            )}
                          </span>
                          {distance > 0 && (
                            <span className="text-[10px] text-gray-400 font-bold italic">
                              {distance.toFixed(1)} km
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full p-5 rounded-3xl bg-gray-50 border-2 border-transparent flex items-center justify-between opacity-50 grayscale">
                        <div className="flex items-center gap-4 text-left">
                          <div className="p-3 bg-white rounded-2xl shadow-sm">
                            🚚
                          </div>
                          <div>
                            <h4 className="font-black text-gray-400 uppercase">
                              BronAuto Van
                            </h4>
                            <p className="text-xs text-red-500 font-bold uppercase">
                              Ngoài giờ hoạt động (6h-18h)
                            </p>
                          </div>
                        </div>
                        <span className="font-black text-xl text-gray-300">
                          —
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="w-full mt-10 pt-10 border-t border-gray-100 flex flex-col gap-4">
                    <div className="flex items-center justify-between text-gray-600 px-2 font-bold">
                      <div className="flex items-center gap-2">
                        💵 <span>Tiền mặt</span>
                      </div>
                      <div className="flex items-center gap-2">
                        🏷️ <span>Ưu đãi</span>
                      </div>
                    </div>
                    <button className="w-full py-5 bg-primary text-white rounded-full font-black text-xl shadow-xl shadow-green-100 hover:brightness-105 active:scale-95 transition-all">
                      Tiếp tục
                    </button>
                  </div>
                </div>
              </div>

              {/* Item Details Modal Overlay */}
              {showItemDetailsModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity">
                  <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up sm:animate-fade-in">
                    <div className="p-6 sm:p-8">
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-gray-900">
                          Chi tiết hàng hóa
                        </h2>
                        <button
                          onClick={() => setShowItemDetailsModal(false)}
                          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="space-y-6">
                        {/* Item Type */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                            Loại hàng hóa
                          </label>
                          <select
                            value={expressDetails.type}
                            onChange={(e) =>
                              setExpressDetails({
                                ...expressDetails,
                                type: e.target.value,
                              })
                            }
                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-primary focus:bg-white transition font-medium text-gray-800"
                          >
                            <option value="">Chọn loại hàng...</option>
                            <option value="Thực phẩm">🍕 Thực phẩm</option>
                            <option value="Quần áo">👕 Quần áo</option>
                            <option value="Điện tử">📱 Điện tử</option>
                            <option value="Tài liệu">📄 Tài liệu</option>
                            <option value="Hàng dễ vỡ">💎 Hàng dễ vỡ</option>
                            <option value="Khác">📦 Khác</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Weight */}
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                              Cân nặng (kg)
                            </label>
                            <input
                              type="number"
                              placeholder="Vd: 5"
                              value={expressDetails.weight}
                              onChange={(e) =>
                                setExpressDetails({
                                  ...expressDetails,
                                  weight: e.target.value,
                                })
                              }
                              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-primary focus:bg-white transition font-medium"
                            />
                          </div>
                          {/* Dimensions */}
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                              Kích thước (cm)
                            </label>
                            <input
                              type="text"
                              placeholder="Vd: 30x20x10"
                              value={expressDetails.dimensions}
                              onChange={(e) =>
                                setExpressDetails({
                                  ...expressDetails,
                                  dimensions: e.target.value,
                                })
                              }
                              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-primary focus:bg-white transition font-medium"
                            />
                          </div>
                        </div>

                        <div className="pt-4">
                          <button
                            onClick={() => setShowItemDetailsModal(false)}
                            className="w-full py-5 bg-primary text-white rounded-full font-black text-xl shadow-xl shadow-green-100 hover:brightness-105 active:scale-95 transition-all"
                          >
                            Xác nhận
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Cart Component */}
      <FloatingCart />
    </div>
  );
};

export default Home;
