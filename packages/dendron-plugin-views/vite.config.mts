import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(() => {
  return {
    plugins: [react(), svgr({ svgrOptions: { icon: true } }), tailwindcss()],
    build: {
      outDir: "build",
      assetsDir: "static",
      rollupOptions: {
        output: {
          format: "cjs",
          entryFileNames: "static/js/[name].bundle.js",
          chunkFileNames: "static/js/[name].[hash].js",
          assetFileNames: "static/css/[name].styles.[ext]",
          interop: "auto",
          freeze: false,
          externalLiveBindings: false,
          manualChunks(id) {
            if (id.includes("mermaid") && id.includes("themes")) {
              return "mermaid-themes";
            }
          },
        },
      },
    },
    resolve: {
      alias: {
        path: "path-browserify",
      },
    },
    optimizeDeps: {
      include: ["mermaid"],
    },
    define: {
      "process.env.MERMAID_THEMES": JSON.stringify(["default"]),
    },
  };
});
