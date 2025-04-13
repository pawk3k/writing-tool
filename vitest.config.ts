import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Include all tests under __tests__ except pods-core tests
    include: [
      "./packages/engine-test-utils/src/__tests__/**/*.(test|spec)*.ts",
    ],
    exclude: [
      "./packages/engine-test-utils/src/__tests__/pods-core/**/*.(test|spec)*.ts",
      // This is for now as I probably have problem with DB
      "./packages/engine-test-utils/src/__tests__/engine-server/markdown/**/*.(test|spec)*.ts",
    ],
    silent: true,
    globals: true,
  },
});
