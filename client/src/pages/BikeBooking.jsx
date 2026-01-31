import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AddressAutocomplete from "../components/AddressAutocomplete";
import axiosClient from "../api/axiosClient";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAuth } from "../contexts/AuthContext";

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const RecenterMap = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView([coords.lat, coords.lng], 15);
    }
  }, [coords, map]);
  return null;
};

const BikeBooking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pickup, setPickup] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destination, setDestination] = useState("");
  const [destCoords, setDestCoords] = useState(null);

  const [distance, setDistance] = useState(0);
  const [price, setPrice] = useState(0);
  const [formattedPrice, setFormattedPrice] = useState("0đ");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);

  // Set default map center (Saigon)
  const defaultCenter = [10.762622, 106.660172];

  // Calculate Fee Effect
  useEffect(() => {
    if (pickupCoords && destCoords) {
      setLoading(true);
      axiosClient
        .post("/orders/fee", {
          service_type: "BIKE",
          pickup_latitude: pickupCoords.lat,
          pickup_longitude: pickupCoords.lng,
          latitude: destCoords.lat,
          longitude: destCoords.lng,
          restaurant_id: null,
        })
        .then((res) => {
          setDistance(res.data.distance_km);
          setPrice(res.data.shipping_fee);
          setFormattedPrice(res.data.formatted_fee);
        })
        .catch((err) => console.error("Fee error:", err))
        .finally(() => setLoading(false));
    }
  }, [pickupCoords, destCoords]);

  const handleBookRide = async () => {
    if (!pickupCoords || !destCoords) {
      alert("Vui lòng chọn điểm đón và điểm đến!");
      return;
    }

    setBooking(true);
    try {
      const orderData = {
        service_type: "BIKE",
        pickup_address: pickup,
        pickup_latitude: pickupCoords.lat,
        pickup_longitude: pickupCoords.lng,
        address: destination, // Dropoff address
        customer_latitude: destCoords.lat,
        customer_longitude: destCoords.lng,
        restaurant_id: null,
        payment_method: "CASH", // Default
        note: "Đặt xe 2 bánh",
        items: [], // No items for ride
      };

      const res = await axiosClient.post("/orders/create", orderData);
      alert(`Đặt xe thành công! Mã chuyến: ${res.data.order_id}`);
      navigate(`/order/${res.data.order_id}/tracking`);
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Đặt xe thất bại. Vui lòng thử lại.");
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="text-gray-600 hover:text-black font-bold"
        >
          ← Quay lại
        </button>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🛵</span> Đặt xe máy (Bike)
        </h1>
      </div>

      <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)]">
        {/* Left Panel: Inputs & Info */}
        <div className="w-full md:w-1/3 bg-white p-6 shadow-lg z-10 overflow-y-auto">
          <div className="space-y-6">
            {/* Pickup */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Điểm đón
              </label>
              <AddressAutocomplete
                value={pickup}
                onChange={setPickup}
                onSelectLocation={setPickupCoords}
                placeholder="Nhập điểm đón..."
              />
            </div>

            {/* Destination */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Điểm đến
              </label>
              <AddressAutocomplete
                value={destination}
                onChange={setDestination}
                onSelectLocation={setDestCoords}
                placeholder="Nhập điểm đến..."
              />
            </div>

            {/* Info Card */}
            {distance > 0 && (
              <div className="bg-green-50 p-4 rounded-xl border border-green-100 space-y-2 animate-fade-in">
                <div className="flex justify-between text-gray-700">
                  <span>Khoảng cách:</span>
                  <span className="font-bold">{distance} km</span>
                </div>
                <div className="flex justify-between text-xl font-black text-green-700">
                  <span>Giá cước:</span>
                  <span>{formattedPrice}</span>
                </div>
                <p className="text-xs text-gray-500 italic text-center pt-2">
                  (Giá đã bao gồm phụ phí xăng dầu)
                </p>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleBookRide}
              disabled={booking || !price}
              className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {booking ? "Đang tìm tài xế..." : "Đặt xe ngay"}
            </button>
          </div>
        </div>

        {/* Right Panel: Map */}
        <div className="flex-1 relative bg-gray-200">
          <MapContainer
            center={defaultCenter}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {pickupCoords && (
              <>
                <Marker position={[pickupCoords.lat, pickupCoords.lng]}>
                  <Popup>Điểm đón</Popup>
                </Marker>
                <RecenterMap coords={pickupCoords} />
              </>
            )}

            {destCoords && (
              <Marker position={[destCoords.lat, destCoords.lng]}>
                <Popup>Điểm đến</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default BikeBooking;
