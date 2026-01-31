import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axiosClient from "../api/axiosClient";
import { fetchRoute } from "../utils/routing";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default icon issue in React-Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to auto-center map on driver
const MapAutoCenter = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], map.getZoom(), {
        animate: true,
      });
    }
  }, [position, map]);
  return null;
};

const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "1rem",
};

const center = {
  lat: 10.762622,
  lng: 106.660172,
};

const STATUS_STEPS = [
  { status: "PENDING", label: "Chờ xác nhận", icon: "🕒" },
  { status: "CONFIRMED", label: "Đã xác nhận", icon: "✅" },
  { status: "PREPARING", label: "Đang chuẩn bị", icon: "👨‍🍳" },
  { status: "DELIVERING", label: "Đang giao hàng", icon: "🛵" },
  { status: "COMPLETED", label: "Đã giao", icon: "🎉" },
];

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("PENDING");
  const [driverLocation, setDriverLocation] = useState(null);
  const [driverInfo, setDriverInfo] = useState(null);
  const [socket, setSocket] = useState(null);
  const [routeData, setRouteData] = useState(null); // {route: [[lat,lng]], distance, duration}
  const [routeToPickup, setRouteToPickup] = useState(null); // For Bike: Driver -> Pickup
  const [isSimulating, setIsSimulating] = useState(false);
  // Rating State
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  // Initial Fetch
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axiosClient.get(`/orders/${id}`);
        setOrder(res.data);
        setStatus(res.data.status || "PENDING");
      } catch (e) {
        console.error("Failed to fetch order:", e);
        // Even if fetch fails, still allow socket tracking
      }
    };
    fetchOrder();

    // Socket Connection
    const newSocket = io("http://localhost:5005"); // Fixed: use port 5005
    setSocket(newSocket);

    newSocket.emit("join_order", id);

    newSocket.on("order_status_update", (data) => {
      console.log("Status Update:", data);
      setStatus(data.status);
    });

    newSocket.on("driver_location", (data) => {
      // setDriverLocation({ lat: data.lat, lng: data.lng }); // Disable backend linear update to use local route animation
    });

    newSocket.on("driver_assigned", (data) => {
      console.log("[OrderTracking] Driver assigned:", data.driver);
      setDriverInfo(data.driver);
    });

    return () => newSocket.close();
  }, [id]);

  // Fetch route when order and driver are both ready
  // Animation Interval Ref
  const animationIntervalRef = useRef(null);

  // Fetch route when order coordinates are available (Run ONCE when coords exist)
  useEffect(() => {
    // If we already have route data, DO NOT fetch again (prevents animation reset)
    if (routeData) return;

    const fetchRouteData = async () => {
      // Driver info is optional for route display, but we need coords
      if (!order || !order.customer_latitude || !order.customer_longitude) {
        return;
      }

      // Determine Start Point (Restaurant or Pickup Location)
      let startPoint = center;
      if (order.pickup_latitude && order.pickup_longitude) {
        startPoint = {
          lat: order.pickup_latitude,
          lng: order.pickup_longitude,
        };
      } else if (order.restaurant_lat && order.restaurant_lng) {
        startPoint = { lat: order.restaurant_lat, lng: order.restaurant_lng };
      }

      console.log("[OrderTracking] Fetching route from", startPoint, "to", {
        lat: order.customer_latitude,
        lng: order.customer_longitude,
      });

      const route = await fetchRoute(startPoint, {
        lat: order.customer_latitude,
        lng: order.customer_longitude,
      });

      if (route) {
        console.log("[OrderTracking] Route fetched successfully!", route);
        setRouteData(route);

        // --- Leg 0: For Bike, also fetch Driver -> Pickup ---
        if (order.service_type === "BIKE") {
          // Generate a random virtual driver location ~1km away
          const virtualDriver = {
            lat: startPoint.lat + (Math.random() - 0.5) * 0.02,
            lng: startPoint.lng + (Math.random() - 0.5) * 0.02,
          };
          const toPickup = await fetchRoute(virtualDriver, startPoint);
          if (toPickup) {
            setRouteToPickup(toPickup);
            setDriverLocation(virtualDriver); // Show driver at start
          }
        }
      } else {
        console.error("[OrderTracking] Failed to fetch route");
      }
    };

    fetchRouteData();
  }, [
    order?.customer_latitude,
    order?.customer_longitude,
    order?.restaurant_lat,
    order?.pickup_latitude,
  ]);

  // Demo Simulation for Bike Booking
  useEffect(() => {
    if (order && order.service_type === "BIKE" && status === "PENDING") {
      console.log("Simulating Bike Driver finding...");
      // 1. Found Driver
      setTimeout(() => {
        setStatus("CONFIRMED");
        setDriverInfo({
          name: "Nguyễn Văn Bike",
          rating: 4.9,
          plate: "59-X1 123.45",
          phone: "0901234567",
        });
        // 2. Start Journey
        setTimeout(() => {
          setStatus("DELIVERING");
        }, 3000);
      }, 3000);
    }
  }, [order, status]);

  // Trigger Animation ONLY when status changes
  useEffect(() => {
    if (status === "CONFIRMED" && routeToPickup && !isSimulating) {
      console.log("Status is CONFIRMED -> Moving to Pickup...");
      animateDriver(routeToPickup.route, "PICKUP");
    } else if (status === "DELIVERING" && routeData && routeData.route) {
      console.log("Status is DELIVERING -> Starting Final Animation 🏎️");
      animateDriver(routeData.route, "DESTINATION");
    }
  }, [status, routeData, routeToPickup]);

  // Animation Logic
  const animateDriver = (routePoints, stage = "DESTINATION") => {
    if (!routePoints || routePoints.length < 2) return;
    setIsSimulating(true);

    // Clear any existing interval
    if (animationIntervalRef.current)
      clearInterval(animationIntervalRef.current);

    setDriverLocation({ lat: routePoints[0][0], lng: routePoints[0][1] });

    let index = 1;
    const totalPoints = routePoints.length;
    // Leg 1 (to pickup) is faster (10s), Leg 2 (to destination) is 20s
    const totalTime = stage === "PICKUP" ? 10000 : 20000;
    const stepTime = totalTime / totalPoints;

    const interval = setInterval(() => {
      if (index >= totalPoints) {
        clearInterval(interval);
        setIsSimulating(false);
        if (stage === "DESTINATION") {
          console.log("Trip finished -> Completing Order...");
          axiosClient
            .post(`/orders/${id}/complete`)
            .then((res) => console.log("Order Completed via API", res.data))
            .catch((err) => console.error("Failed to complete order", err));
        }
        return;
      }

      const point = routePoints[index];
      setDriverLocation({ lat: point[0], lng: point[1] });
      index++;
    }, stepTime);

    animationIntervalRef.current = interval;
  };

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationIntervalRef.current)
        clearInterval(animationIntervalRef.current);
    };
  }, []);

  const currentStepIndex =
    STATUS_STEPS.findIndex((s) => s.status === status) !== -1
      ? STATUS_STEPS.findIndex((s) => s.status === status)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Theo dõi đơn hàng #{id}
          </h1>
          <button
            onClick={() => navigate("/")}
            className="text-primary font-bold hover:underline"
          >
            Quay lại trang chủ
          </button>
        </div>

        {/* Status Timeline */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm mb-8 animate-fade-in-up">
          <div className="flex justify-between relative">
            {/* Progress Bar Background */}
            <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-100 dark:bg-gray-700 -z-0 rounded-full"></div>
            {/* Active Progress */}
            <div
              className="absolute top-1/2 left-0 h-2 bg-primary -z-0 rounded-full transition-all duration-1000"
              style={{
                width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`,
              }}
            ></div>

            {STATUS_STEPS.map((step, index) => {
              const isActive = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div
                  key={step.status}
                  className="relative z-10 flex flex-col items-center gap-2"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-4 transition-all duration-500 ${isActive ? "bg-primary border-primary text-white shadow-lg shadow-primary/30" : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400"} ${isCurrent ? "scale-125" : ""}`}
                  >
                    {step.icon}
                  </div>
                  <span
                    className={`text-sm font-bold ${isActive ? "text-primary" : "text-gray-400"}`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <p className="text-xl font-bold text-gray-800 dark:text-white animate-pulse">
              {status === "PENDING" && "Đang chờ nhà hàng xác nhận..."}
              {status === "CONFIRMED" && "Nhà hàng đã nhận đơn!"}
              {status === "PREPARING" &&
                "Bếp đang chuẩn bị món ăn ngon lành..."}
              {status === "DELIVERING" && "Tài xế đang giao đến bạn!"}
              {status === "COMPLETED" &&
                "Giao hàng thành công! Chúc ngon miệng 🎉"}
            </p>
          </div>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        {status === "COMPLETED" ? (
          /* COMPLETION & RATING UI */
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-hard p-12 text-center max-w-2xl mx-auto animate-zoom-in">
            <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">
              🎉
            </div>
            <h2 className="text-3xl font-display font-black text-gray-900 dark:text-white mb-4">
              Giao hàng thành công!
            </h2>
            <p className="text-gray-500 mb-8">
              Cảm ơn bạn đã sử dụng dịch vụ. Bạn thấy tài xế thế nào?
            </p>

            {/* Rating Stars */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-4xl transition-transform hover:scale-125 ${rating >= star ? "text-yellow-400" : "text-gray-300"}`}
                >
                  ★
                </button>
              ))}
            </div>

            {/* Review Textarea */}
            <textarea
              className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl mb-6 focus:ring-2 focus:ring-primary outline-none dark:bg-gray-900 dark:text-white"
              placeholder="Nhập nhận xét của bạn về tài xế..."
              rows="4"
              value={review}
              onChange={(e) => setReview(e.target.value)}
            ></textarea>

            <button
              onClick={() => {
                alert("Cảm ơn đánh giá của bạn!");
                navigate("/");
              }}
              className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all"
            >
              Gửi đánh giá
            </button>
          </div>
        ) : (
          /* TRACKING MAP UI */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Map Section */}
            <div className="md:col-span-2 h-[500px] bg-gray-100 rounded-3xl overflow-hidden shadow-inner relative z-0">
              <MapContainer
                center={[
                  driverLocation?.lat || center.lat,
                  driverLocation?.lng || center.lng,
                ]}
                zoom={15}
                style={{ width: "100%", height: "100%" }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapAutoCenter position={driverLocation} />

                {driverLocation && (
                  <Marker
                    position={[driverLocation.lat, driverLocation.lng]}
                    icon={L.icon({
                      iconUrl:
                        order?.service_type === "BIKE"
                          ? "https://cdn-icons-png.flaticon.com/512/3063/3063822.png" // Bike Icon
                          : "https://cdn-icons-png.flaticon.com/512/3063/3063823.png", // Car/Truck Icon
                      iconSize: [40, 40],
                      iconAnchor: [20, 20],
                    })}
                  ></Marker>
                )}

                {/* Destination Marker */}
                {order &&
                  order.customer_latitude &&
                  order.customer_longitude && (
                    <Marker
                      position={[
                        order.customer_latitude,
                        order.customer_longitude,
                      ]}
                    />
                  )}

                {/* Real Route from OpenRouteService */}
                {routeData && routeData.route && (
                  <Polyline
                    positions={routeData.route}
                    color="#3b82f6"
                    weight={6}
                    opacity={0.8}
                  />
                )}
              </MapContainer>
            </div>

            {/* Driver Info & Order Details */}
            <div className="space-y-6">
              {driverInfo ? (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-hard animate-slide-in-right border-l-4 border-primary">
                  <h3 className="font-bold text-gray-500 uppercase text-xs mb-4">
                    Tài xế của bạn
                  </h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                      <img
                        src="https://randomuser.me/api/portraits/men/32.jpg"
                        alt="Driver"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-lg dark:text-white">
                        {driverInfo.name}
                      </p>
                      <div className="flex items-center text-yellow-500 text-sm">
                        ⭐ {driverInfo.rating}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="font-mono font-bold text-gray-800 dark:text-white">
                        {driverInfo.plate}
                      </p>
                      <p className="text-xs text-gray-500">Honda Vision</p>
                    </div>
                    <div>
                      <p className="font-mono font-bold text-gray-800 dark:text-white">
                        {driverInfo.phone}
                      </p>
                    </div>
                  </div>

                  {routeData && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl text-center">
                        <span className="text-xs text-blue-500 font-bold uppercase">
                          Khoảng cách
                        </span>
                        <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                          {routeData.distance} km
                        </p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-xl text-center">
                        <span className="text-xs text-purple-500 font-bold uppercase">
                          Thời gian
                        </span>
                        <p className="text-lg font-black text-purple-600 dark:text-purple-400">
                          {routeData.duration} phút
                        </p>
                      </div>
                    </div>
                  )}

                  <button className="w-full mt-4 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 flex items-center justify-center gap-2">
                    📞 Gọi tài xế
                  </button>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center h-48">
                  <div className="animate-spin text-4xl mb-2">🔍</div>
                  <p className="text-gray-500 font-medium">
                    Đang tìm tài xế gần bạn...
                  </p>
                </div>
              )}

              {/* Delivery Info */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-800 dark:text-white mb-2">
                  Giao đến
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {order?.address || "Đang tải địa chỉ..."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
