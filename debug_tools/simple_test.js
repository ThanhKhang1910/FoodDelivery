const fs = require("fs");
console.log("Simple Test Starting...");
try {
  fs.writeFileSync("simple_test.txt", "Hello from Simple Test");
  console.log("File written successfully.");
} catch (e) {
  console.error("File write failed:", e);
}
