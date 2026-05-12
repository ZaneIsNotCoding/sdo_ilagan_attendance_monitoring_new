import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import path from "path";

const devServerHost = process.env.VITE_DEV_SERVER_HOST;

export default defineConfig({
    server: {
        host: "0.0.0.0",
        port: 5173,
        hmr: devServerHost ? { host: devServerHost } : undefined,
    },
    plugins: [
        laravel({
            input: ["resources/js/app.jsx"],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            "@": path.resolve("resources/js"),
        },
    },
});
