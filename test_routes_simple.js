const membershipRoutes = require("./src/routes/membershipRoutes");

console.log("Inspecting Membership Routes:");

if (membershipRoutes.stack) {
  membershipRoutes.stack.forEach((r) => {
    if (r.route) {
      Object.keys(r.route.methods).forEach((method) => {
        console.log(`${method.toUpperCase()} ${r.route.path}`);
      });
    }
  });
} else {
  console.log("No stack found on router object.");
}
