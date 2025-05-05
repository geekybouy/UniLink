
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { PluginOption } from 'vite';

// Define types for the dynamically imported modules
type Visualizer = {
  visualizer: (options?: any) => PluginOption;
};

type PWA = {
  VitePWA: (options?: any) => PluginOption;
};

// Variables to store imported modules
let visualizer: ((options?: any) => PluginOption) | undefined;
let VitePWA: ((options?: any) => PluginOption) | undefined;
let viteImagemin: any;

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
  const plugins: PluginOption[] = [react()];
  
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
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              {
                urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'gstatic-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              {
                urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'images-cache',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                  },
                },
              },
              {
                urlPattern: /\.(?:js|css)$/,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'static-resources',
                  expiration: {
                    maxEntries: 30,
                    maxAgeSeconds: 60 * 60 * 24, // 1 day
                  },
                },
              },
              {
                urlPattern: /^https:\/\/tchudsedvmebjqzewlyb\.supabase\.co\/.*/i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'api-cache',
                  networkTimeoutSeconds: 10,
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 10, // 10 minutes
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
            ],
          },
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
            ],
            screenshots: [
              {
                src: '/screenshots/dashboard.png',
                sizes: '1280x720',
                type: 'image/png',
                form_factor: 'wide',
              },
              {
                src: '/screenshots/dashboard-mobile.png',
                sizes: '750x1334',
                type: 'image/png',
                form_factor: 'narrow',
              }
            ],
            shortcuts: [
              {
                name: 'Dashboard',
                short_name: 'Dashboard',
                description: 'View your dashboard',
                url: '/dashboard',
                icons: [{ src: '/shortcuts/dashboard.png', sizes: '192x192' }]
              },
              {
                name: 'Find Mentors',
                short_name: 'Mentors',
                description: 'Find mentors in your field',
                url: '/mentorship/find-mentors',
                icons: [{ src: '/shortcuts/mentors.png', sizes: '192x192' }]
              }
            ],
            display: 'standalone',
            start_url: '/?source=pwa',
            background_color: '#f8fafc',
            orientation: 'portrait',
            categories: ['social', 'education', 'networking']
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
    plugins,
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
