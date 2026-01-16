// Basic Tier 0 tests
const { execSync } = require("child_process");

console.log("🧪 Running Tier 0 tests...\n");

// Test 1: Version command
try {
  const version = execSync("./dist/cli.js version").toString();
  console.log("✅ Version command works");
  console.log(version);
} catch (error) {
  console.log("❌ Version command failed");
}

// Test 2: Help command
try {
  const help = execSync("./dist/cli.js help").toString();
  if (help.includes("USAGE:")) {
    console.log("✅ Help command works");
  }
} catch (error) {
  console.log("❌ Help command failed");
}

console.log("\n✅ Basic tests completed");
