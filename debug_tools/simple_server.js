const http = require("http");
const fs = require("fs");

try {
  const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end("alive");
  });

  server.listen(5006, () => {
    const msg = "Simple Server running on 5006";
    console.log(msg);
    fs.writeFileSync("simple_server_status.txt", msg);
  });

  server.on("error", (e) => {
    console.error(e);
    fs.writeFileSync("simple_server_status.txt", "ERROR: " + e.message);
  });
} catch (e) {
  fs.writeFileSync("simple_server_status.txt", "CRASH: " + e.message);
}
