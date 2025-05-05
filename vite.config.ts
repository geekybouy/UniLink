import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Dynamically import dependencies only when needed to avoid issues
let visualizer;
let VitePWA;
let viteImagemin;

// Import the dependencies only in production mode
const loadProductionDependencies = async (mode: string) => {
  if (mode === 'production') {
    try {
      visualizer = (await import('rollup-plugin-visualizer')).visualizer;
      VitePWA = (await import('vite-plugin-pwa')).VitePWA;
      // Commenting out viteImagemin due to compatibility issues
      // viteImagemin = (await import('vite-plugin-imagemin')).default;
    } catch (err) {
      console.warn("Failed to load some production dependencies:", err);
    }
  }
};

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  // Load production dependencies if needed
  await loadProductionDependencies(mode);
  
  // Define plugins array
  const plugins = [react()];
  
  // Add development plugins
  if (mode === 'development') {
    plugins.push(componentTagger());
  }
  
  // Add production plugins if they were loaded successfully
  if (mode === 'production') {
    if (visualizer) {
      plugins.push(
        visualizer({
          open: false,
          gzipSize: true,
          brotliSize: true,
        })
      );
    }
    
    if (VitePWA) {
      plugins.push(
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
          manifest: {
            name: 'UniLink',
            short_name: 'UniLink',
            description: 'Connect, Network, Grow with UniLink',
            theme_color: '#1E40AF',
            icons: [
              {
                src: '/pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png',
              },
              {
                src: '/pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
              },
              {
                src: '/pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
              }
            ]
          }
        })
      );
    }
    
    // Commenting out viteImagemin because it's causing issues
    /*
    if (viteImagemin) {
      plugins.push(
        viteImagemin({
          gifsicle: {
            optimizationLevel: 7,
            interlaced: false,
          },
          optipng: {
            optimizationLevel: 7,
          },
          mozjpeg: {
            quality: 80,
          },
          pngquant: {
            quality: [0.8, 0.9],
            speed: 4,
          },
          svgo: {
            plugins: [
              {
                name: 'removeViewBox',
              },
              {
                name: 'removeEmptyAttrs',
                active: false,
              },
            ],
          },
        })
      );
    }
    */
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: plugins.filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      sourcemap: mode !== 'production',
      minify: mode === 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-components': [
              '@radix-ui/react-accordion',
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              // ... other UI components
            ],
            'supabase': ['@supabase/supabase-js'],
          }
        }
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom']
    },
  };
});
