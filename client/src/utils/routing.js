// Utility to fetch real route from OpenRouteService
export async function fetchRoute(start, end) {
  const API_KEY = import.meta.env.VITE_OPENROUTE_API_KEY;

  if (!API_KEY) {
    console.warn("OpenRouteService API key not found, using straight line");
    return null;
  }

  try {
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${API_KEY}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const coordinates = data.features[0].geometry.coordinates;

    // Convert from [lng, lat] to [lat, lng] for Leaflet
    const route = coordinates.map((coord) => [coord[1], coord[0]]);

    // Extract distance and duration
    const distance = data.features[0].properties.segments[0].distance; // meters
    const duration = data.features[0].properties.segments[0].duration; // seconds

    return {
      route,
      distance: Math.round((distance / 1000) * 10) / 10, // km
      duration: Math.round(duration / 60), // minutes
    };
  } catch (error) {
    console.error("Failed to fetch route:", error);
    return null;
  }
}
