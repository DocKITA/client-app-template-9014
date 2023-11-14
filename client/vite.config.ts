import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";
import dotenv from "dotenv";

dotenv.config();
const react_env_key = [
    "REACT_APP_NAME",
    "REACT_APP_AUTH0_DOMAIN",
    "REACT_APP_AUTH0_CLIENT_ID",
    "REACT_APP_FIREBASE_APIKEY",
    "REACT_APP_FIREBASE_AUTHDOMAIN",
    "REACT_APP_FIREBASE_PROJECTID",
    "REACT_APP_FIREBASE_STORAGEBUCKET",
    "REACT_APP_FIREBASE_MESSAGING_SENDER_ID",
    "REACT_APP_FIREBASE_APPID",
    "REACT_APP_APPLICATION_NAME",
    "REACT_APP_APPLICATION_THEME_COLOR",
    "REACT_APP_APPLICATION_ALLOW_FOOTER",
    "REACT_APP_APPLICATION_LOGO_URL",
    "REACT_APP_APPLICATION_ICON_URL",
    "REACT_APP_APPLICATION_FOOTER_CONTENT"
];

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const processEnv = {};
    react_env_key.forEach(key => processEnv[key] = env[key]);
    return {
        define: {'process.env' : processEnv},
        plugins: [react(), mkcert()],
        server: {
            https: true,
            host: true,
            port: parseInt(process.env.REACT_APP_CLIENT_URL),
            proxy: {
                '/api/': {
                    target: process.env.REACT_APP_SERVER_URL,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api/, '/api')
                },
                '/py/': {
                    target: process.env.REACT_APP_PY_URL,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/py/, '/py')
                }
            }
        }
    }
})