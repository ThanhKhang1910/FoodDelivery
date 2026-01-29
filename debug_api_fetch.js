const http = require("http");

console.log(
  "Fetching from http://localhost:5000/api/v1/customer/restaurants...",
);

http
  .get("http://localhost:5000/api/v1/customer/restaurants", (resp) => {
    let data = "";

    // A chunk of data has been received.
    resp.on("data", (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on("end", () => {
      try {
        const restaurants = JSON.parse(data);
        console.log("✅ STATUS: " + resp.statusCode);
        console.log("------- RESTAURANTS FOUND -------");
        if (Array.isArray(restaurants)) {
          restaurants.forEach((r) => {
            console.log(
              `[ID: ${r.restaurant_id}] ${r.shop_name} (Open: ${r.is_open})`,
            );
          });
          if (restaurants.length === 0) console.log("No restaurants found.");
        } else {
          console.log("Response is not an array:", data);
        }
        console.log("---------------------------------");
      } catch (e) {
        console.error("Failed to parse JSON:", e.message);
        console.log("Raw Data:", data);
      }
    });
  })
  .on("error", (err) => {
    console.log("❌ Error: " + err.message);
  });
