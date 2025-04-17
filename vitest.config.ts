import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Include all tests under __tests__ except pods-core tests
    include: [
      "./packages/engine-test-utils/src/__tests__/**/*.(test|spec)*.ts",
    ],
    exclude: [
      // Right now I just not feel for pods
      "./packages/engine-test-utils/src/__tests__/pods-core/**/*.(test|spec)*.ts",
    ],
    silent: true,
    globals: true,
  },
});
