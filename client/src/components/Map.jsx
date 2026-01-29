import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default icon
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
  height: "100%", // Changed to 100% to fill parent or keep 400px if wrapper exists
  borderRadius: "0.5rem",
};

const center = {
  lat: 10.7769,
  lng: 106.7009,
};

const MapComponent = ({ restaurants, center: customCenter }) => {
  // Leaflet uses [lat, lng] array
  const mapCenter = customCenter
    ? [customCenter.lat, customCenter.lng]
    : [center.lat, center.lng];

  return (
    <div style={{ height: "400px", width: "100%" }}>
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {restaurants &&
          restaurants.map(
            (res) =>
              res.latitude &&
              res.longitude && (
                <Marker
                  key={res.restaurant_id}
                  position={[
                    parseFloat(res.latitude),
                    parseFloat(res.longitude),
                  ]}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold">{res.shop_name}</h3>
                      <p className="text-xs text-gray-600">{res.address}</p>
                      <a
                        href={`/restaurant/${res.restaurant_id}`}
                        className="text-primary text-xs font-bold mt-1 block"
                      >
                        Xem Menu →
                      </a>
                    </div>
                  </Popup>
                </Marker>
              ),
          )}
      </MapContainer>
    </div>
  );
};

export default React.memo(MapComponent);
