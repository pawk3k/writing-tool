#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");

console.log("Starting debarrel process...");

try {
  // Execute the TypeScript file directly with yarn
  execSync("yarn tsx debarrel.ts", {
    stdio: "inherit",
    cwd: __dirname,
  });

  console.log("Debarrel process completed successfully!");
} catch (error) {
  console.error("Error executing debarrel script:", error.message);
  process.exit(1);
}
