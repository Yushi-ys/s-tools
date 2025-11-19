import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,

    // 添加这些优化配置
    minify: "esbuild", // 使用 esbuild 进行压缩（默认，确保启用）
    target: "es2015", // 指定目标环境
    sourcemap: false, // 生产环境关闭 sourcemap
    rollupOptions: {
      output: {
        // 代码分割优化
        manualChunks: {
          vendor: ["react", "react-dom"],
          antd: ["antd", "@ant-design/icons"],
          utils: ["lodash", "axios", "crypto-js"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "antd",
      "@ant-design/icons",
      "lodash",
      "axios",
    ],
    force: false, // 设置为 false 避免每次都强制预构建
  },
});
