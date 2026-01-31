const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");

// Config
dotenv.config();
const db = require("./src/config/db");

// App Init
const app = express();
const fs = require("fs");

// Startup Proof
try {
  fs.writeFileSync(
    "server_startup_proof.txt",
    `Started at ${new Date().toISOString()}`,
  );
} catch (e) {}

// EXTREME DEBUG ROUTE
app.get("/EXTREME_DEBUG", (req, res) => {
  console.log("EXTREME DEBUG HIT");
  res.send("I AM RUNNING AND UPDATED");
});

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Adjust in production
    methods: ["GET", "POST"],
  },
});
app.set("socketio", io);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
const authRoutes = require("./src/routes/authRoutes");
const customerRoutes = require("./src/routes/customerRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const driverRoutes = require("./src/routes/driverRoutes");
const partnerRoutes = require("./src/routes/restaurantPortalRoutes"); // Original name for restaurant portal routes
const rideRoutes = require("./src/routes/rideRoutes");
const restaurantPortalRoutes = require("./src/routes/restaurantPortalRoutes"); // New variable name for the same file, or a new conceptual route
const membershipRoutes = require("./src/routes/membershipRoutes");

app.use("/api/v1/membership", membershipRoutes); // MOVED TO TOP PRIORITY
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/customer", customerRoutes);
app.use("/api/v1/orders", orderRoutes); // Changed path
app.use("/api/v1/customer/rides", rideRoutes); // Kept original ride route
app.use("/api/v1/driver", driverRoutes);
app.use("/api/v1/partner", partnerRoutes); // Kept original partner route
app.use("/api/v1/restaurant-portal", restaurantPortalRoutes); // New restaurant portal route

app.get("/", (req, res) => {
  res.send("Food Ordering System API is running...");
});

// Socket.io Connection
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join_order", (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`Socket ${socket.id} joined room: order_${orderId}`);
  });

  // Join user-specific room for order history updates
  socket.on("join_user_room", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`Socket ${socket.id} joined user room: user_${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });

  // Example: Driver Location Update
  socket.on("update_location", (data) => {
    // Broadcast to specific room (order_id)
    // socket.to(data.order_id).emit('driver_location', data);
    console.log("Location update:", data);
  });
});

// Start Server
const PORT = 5005; // Reverted to 5005
const Membership = require("./src/models/membershipModel");

server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Membership routes loaded and active.");

  // Debug: Dump routes
  const fs = require("fs");
  const getRoutes = (stack, parentPath = "") => {
    let routes = [];
    stack.forEach((layer) => {
      if (layer.route) {
        routes.push(parentPath + layer.route.path);
      } else if (layer.name === "router" && layer.handle.stack) {
        // Express mounts routers with a regex, we need to try to extract the path
        let cleanPath = "";
        if (layer.regexp) {
          const str = layer.regexp.toString();
          // Simple extraction for standard express mounting
          // /^\/api\/v1\/auth\/?(?=\/|$)/i  -> /api/v1/auth
          const match = str.match(/^\/\\\^\\(.*?)\\\/\\\?/);
          if (match) {
            cleanPath = match[1].replace(/\\/g, "");
          } else {
            // Fallback for clearer strings if possible, or just use what we have
            // This part is tricky in Express 4, usually we know the mount point from app.use
          }
        }
        // Actually, let's just rely on the fact that we know the mount points structure effectively enough,
        // or use a better traversal if possible.
        // Simpler approach: Just look for the specific membership router handle.

        routes = routes.concat(getRoutes(layer.handle.stack, parentPath));
      }
    });
    return routes;
  };

  // Hardcoded known mount points for debugging clarity since robust extraction is complex
  const dumpRoutes = () => {
    let output = "Registered Routes:\n";

    // Helper to print router stack
    const printStack = (path, router) => {
      if (!router || !router.stack) return;
      router.stack.forEach((r) => {
        if (r.route) {
          Object.keys(r.route.methods).forEach((method) => {
            output += `${method.toUpperCase()} ${path}${r.route.path}\n`;
          });
        }
      });
    };

    if (authRoutes.stack) printStack("/api/v1/auth", authRoutes);
    if (membershipRoutes.stack)
      printStack("/api/v1/membership", membershipRoutes);

    fs.writeFileSync("routes_dump.txt", output);
    console.log("Routes dumped to routes_dump.txt");
  };

  dumpRoutes();

  // Run Migrations
  const migrateBikeFeature = require("./src/utils/migrateBike");
  await migrateBikeFeature();

  await Membership.initTable();
});
