import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { PluginOption } from 'vite';

// Define types for the dynamically imported modules
type Visualizer = {
  visualizer: (options?: any) => any;  // Changed to any to avoid type conflicts
};

// Variables to store imported modules
let visualizer: ((options?: any) => any) | undefined;  // Changed to any return type

// Import the dependencies only in production mode
const loadProductionDependencies = async (mode: string) => {
  if (mode === 'production') {
    try {
      visualizer = (await import('rollup-plugin-visualizer')).visualizer;
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
  const plugins: PluginOption[] = [react()]; // Only keep react() here
  
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
        }) as unknown as PluginOption
      );
    }
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
