const https = require("https");

const calculateDistance = (start, end) => {
  return new Promise((resolve, reject) => {
    // 1. Get API Key from .env
    const apiKey = process.env.OPENROUTE_API_KEY;
    if (!apiKey) {
      console.warn(
        "OPENROUTE_API_KEY missing in .env. Returning simple Haversine distance.",
      );
      return resolve(haversineDistance(start, end));
    }

    // 2. OpenRouteService URL (Driving Car)
    // Format: start=lng,lat & end=lng,lat
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`;

    https
      .get(url, (res) => {
        let data = "";

        // A chunk of data has been received.
        res.on("data", (chunk) => {
          data += chunk;
        });

        // The whole response has been received.
        res.on("end", () => {
          try {
            if (res.statusCode !== 200) {
              console.error(
                `OpenRouteService Error: Status ${res.statusCode}`,
                data,
              );
              // Fallback to Haversine if API fails
              return resolve(haversineDistance(start, end));
            }

            const json = JSON.parse(data);
            if (
              !json.features ||
              json.features.length === 0 ||
              !json.features[0].properties.segments
            ) {
              return resolve(haversineDistance(start, end));
            }

            const distanceMeters =
              json.features[0].properties.segments[0].distance;
            const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10; // Round to 1 decimal

            resolve(distanceKm);
          } catch (e) {
            console.error("Error parsing OpenRouteService response:", e);
            resolve(haversineDistance(start, end));
          }
        });
      })
      .on("error", (err) => {
        console.error("Error calling OpenRouteService:", err);
        resolve(haversineDistance(start, end));
      });
  });
};

// Fallback: Haversine Formula (Straight line)
const haversineDistance = (coords1, coords2) => {
  function toRad(x) {
    return (x * Math.PI) / 180;
  }

  const R = 6371; // km
  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.lng - coords1.lng);
  const lat1 = toRad(coords1.lat);
  const lat2 = toRad(coords2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return Math.round(d * 10) / 10;
};

module.exports = { calculateDistance };
