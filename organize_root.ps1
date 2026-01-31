# 1. Create Directories if they don't exist
$dirs = @("batch_scripts", "database_scripts", "debug_tools", "old_fixes", "logs")
foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir
    }
}

# 2. Categorize and Move Files
# Batch Scripts
Get-ChildItem -Path . -Filter "*.bat" | Move-Item -Destination "batch_scripts" -Force

# Logs
Get-ChildItem -Path . -Filter "*.txt" | Move-Item -Destination "logs" -Force
if (Test-Path "setup_log.txt") { Move-Item "setup_log.txt" -Destination "logs" -Force }

# Database Scripts (Explicit patterns to avoid server.js)
$dbPatterns = @("add_*.js", "add_*.sql", "seed*.js", "seed*.sql", "setup_*.sql", "setup_full.js", "create_membership*.sql", "database_schema.sql", "init_membership*.js")
foreach ($pattern in $dbPatterns) {
    Get-ChildItem -Path . -Filter $pattern | Move-Item -Destination "database_scripts" -Force
}

# Debug Tools
$debugPatterns = @("check_*.js", "debug_*.js", "test_*.js", "verify_*.js", "audit_*.js", "quick_check.js", "simple_server.js", "simple_test.js", "tiny_server.js", "server_temp.js", "diagnostic_db.js")
foreach ($pattern in $debugPatterns) {
    Get-ChildItem -Path . -Filter $pattern | Move-Item -Destination "debug_tools" -Force
}

# Old Fixes
$fixPatterns = @("fix_*.js", "fix_*.sql", "delete_*.js", "delete_*.sql", "update_*.js", "clean_restart*.js", "favorites_schema.sql", "manual_fix.sql", "final_hang_house_fix.sql", "list_dbs.js", "fix_*.sql")
foreach ($pattern in $fixPatterns) {
    Get-ChildItem -Path . -Filter $pattern | Move-Item -Destination "old_fixes" -Force
}

# 3. Update Require Paths in moved JS files
$jsDirs = @("database_scripts", "debug_tools", "old_fixes")
foreach ($dir in $jsDirs) {
    Get-ChildItem -Path $dir -Filter "*.js" | ForEach-Object {
        $content = Get-Content $_.FullName
        $newContent = $content -replace "require\('./src/", "require('../src/"
        $newContent = $newContent -replace 'require\("./src/', 'require("../src/'
        Set-Content $_.FullName $newContent
    }
}

Write-Output "Organization Complete!"
