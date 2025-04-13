import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["./packages/engine-test-utils/src/**/*.(test|spec)*.ts"],
    globals: true,
  },
});
