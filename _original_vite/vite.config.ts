import { defineConfig, type Plugin } from "vite";
import { resolve } from "node:path";

// Vite's dev server doesn't resolve index.html inside public/ directories the
// way static hosts do — map /blog/<slug>/ to the generated page so dev matches
// production (Vercel handles this natively for dist/).
function blogDirIndex(): Plugin {
  return {
    name: "blog-dir-index",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url?.startsWith("/blog/") && req.url.endsWith("/")) {
          req.url += "index.html";
        }
        next();
      });
    },
  };
}

// Without explicit inputs Vite only builds index.html — login.html and
// blog.html would silently vanish from production builds.
export default defineConfig({
  plugins: [blogDirIndex()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        blog: resolve(__dirname, "blog.html"),
        login: resolve(__dirname, "login.html"),
      },
    },
  },
});
