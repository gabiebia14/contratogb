
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true, // Escuta em todas as interfaces de rede
    port: 8080,
    cors: true, // Habilita CORS
    hmr: {
      // Configura o HMR para usar o hostname correto
      clientPort: 443,
      host: process.env.VITE_HMR_HOST || undefined,
      protocol: 'wss'
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
