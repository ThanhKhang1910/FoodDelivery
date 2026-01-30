import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axiosClient from "../api/axiosClient";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
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
    const newSocket = io("http://localhost:5005"); // Adjust URL for Prod
    setSocket(newSocket);

    newSocket.emit("join_order", id);

    newSocket.on("order_status_update", (data) => {
      console.log("Status Update:", data);
      setStatus(data.status);
    });

    newSocket.on("driver_location", (data) => {
      setDriverLocation({ lat: data.lat, lng: data.lng });
    });

    newSocket.on("driver_assigned", (data) => {
      setDriverInfo(data.driver);
    });

    return () => newSocket.close();
  }, [id]);

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Map Section */}
          <MapContainer
            center={[
              driverLocation?.lat || center.lat,
              driverLocation?.lng || center.lng,
            ]}
            zoom={15}
            style={{ width: "100%", height: "100%", borderRadius: "1rem" }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Driver Marker */}
            {driverLocation && (
              <Marker
                position={[driverLocation.lat, driverLocation.lng]}
                icon={L.icon({
                  iconUrl:
                    "https://cdn-icons-png.flaticon.com/512/3063/3063823.png",
                  iconSize: [40, 40],
                  iconAnchor: [20, 20],
                })}
              ></Marker>
            )}

            {/* Destination Marker */}
            <Marker position={[10.776, 106.701]} />

            {/* Simple Connection Line (Mock Routing) */}
            {driverLocation && (
              <Polyline
                positions={[
                  [driverLocation.lat, driverLocation.lng],
                  [10.776, 106.701],
                ]}
                color="blue"
                dashArray="10, 10"
              />
            )}
          </MapContainer>

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
                      src="https://i.pravatar.cc/150?img=11"
                      alt="Driver"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                      {driverInfo.name}
                    </h4>
                    <div className="flex items-center text-amber-500 font-bold text-sm">
                      ⭐ {driverInfo.rating}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl mb-4">
                  <span className="font-mono font-bold text-lg text-gray-700 dark:text-gray-200">
                    {driverInfo.plate}
                  </span>
                  <span className="text-sm font-bold text-gray-500">
                    Honda Vision
                  </span>
                </div>
                <a
                  href={`tel:${driverInfo.phone}`}
                  className="w-full py-3 bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition"
                >
                  📞 Gọi tài xế
                </a>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center h-48">
                <div className="animate-spin text-4xl mb-2">🔍</div>
                <p className="text-gray-500 font-medium">
                  Đang tìm tài xế gần bạn...
                </p>
              </div>
            )}

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
      </div>
    </div>
  );
};

export default OrderTracking;
