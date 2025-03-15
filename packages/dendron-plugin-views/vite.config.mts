import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(() => {
  return {
    plugins: [react(), svgr({ svgrOptions: { icon: true } }), tailwindcss()],
    build: {
      outDir: "build", // Output to 'build' instead of default 'dist'
      assetsDir: "static", // Put assets in a 'static' subdirectory
      rollupOptions: {
        output: {
          entryFileNames: "static/js/[name].bundle.js",
          chunkFileNames: "static/js/[name].[hash].js",
          assetFileNames: "static/css/[name].styles.[ext]",
        },
      },
    },
    resolve: {
      alias: {
        // Polyfills for Node.js modules
        path: "path-browserify",
      },
    },
  };
});
