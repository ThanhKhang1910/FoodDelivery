const fs = require("fs");
const logFile = "syntax_check.txt";
const log = (msg) => {
  console.log(msg);
  fs.appendFileSync(logFile, msg + "\n");
};

fs.writeFileSync(logFile, "--- SYNTAX CHECK ---\n");

try {
  log("Checking Order Controller...");
  const ctrl = require("../src/controllers/orderController");
  log("Controller Loaded. Keys: " + Object.keys(ctrl).join(", "));

  if (!ctrl.debugOrder) {
    log("❌ debugOrder is MISSING in Controller export!");
  } else {
    log("✅ debugOrder is present.");
  }

  log("Checking Order Routes...");
  const routes = require("../src/routes/orderRoutes");
  log("Routes Loaded.");

  log("ALL GOOD");
} catch (e) {
  log("❌ CRASH: " + e.message);
  log(e.stack);
}
