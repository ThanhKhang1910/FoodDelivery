const fs = require("fs");
const path = require("path");

const dirs = [
  "batch_scripts",
  "database_scripts",
  "debug_tools",
  "old_fixes",
  "logs",
];
dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

const skipFiles = [
  "server.js",
  "package.json",
  "package-lock.json",
  ".env",
  ".env.gpg",
  ".gitignore",
  "README.md",
  "HUONG_DAN_CHAY.md",
  "organize.js",
  "organize_root.ps1",
];

const files = fs.readdirSync(".");

files.forEach((file) => {
  if (skipFiles.includes(file)) return;
  if (dirs.includes(file)) return;
  if (
    file === ".git" ||
    file === "node_modules" ||
    file === "client" ||
    file === "src" ||
    file === "tests"
  )
    return;

  let dest = null;
  if (file.endsWith(".bat")) dest = "batch_scripts";
  else if (file.endsWith(".txt")) dest = "logs";
  else if (
    file.match(
      /^(add_|seed|setup_|create_membership|database_schema|init_membership)/,
    )
  )
    dest = "database_scripts";
  else if (
    file.match(
      /^(check_|debug_|test_|verify_|audit_|quick_check|simple_|tiny_|server_temp|diagnostic_|list_dbs)/,
    )
  )
    dest = "debug_tools";
  else if (
    file.match(
      /^(fix_|delete_|update_|clean_restart|favorites_schema|manual_fix|final_hang_house_fix|force_fix_db)/,
    )
  )
    dest = "old_fixes";

  if (dest) {
    const oldPath = path.join(".", file);
    const newPath = path.join(dest, file);
    try {
      fs.renameSync(oldPath, newPath);
      console.log(`Moved ${file} to ${dest}`);

      // Update require paths if JS
      if (file.endsWith(".js")) {
        let content = fs.readFileSync(newPath, "utf8");
        let updated = content.replace(/require\(['"]\.\/src\//g, (match) =>
          match.replace("./src/", "../src/"),
        );
        if (content !== updated) {
          fs.writeFileSync(newPath, updated);
          console.log(`  Updated imports in ${file}`);
        }
      }
    } catch (err) {
      console.error(`Failed to move ${file}: ${err.message}`);
    }
  }
});
