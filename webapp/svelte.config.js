import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://svelte.dev/docs/kit/adapters for more information about adapters.
    adapter: adapter({
      pages: ".svelte-kit/cloudflare",
      assets: ".svelte-kit/cloudflare",
      fallback: "404.html",
      precompress: false,
      strict: true,
    }),
    paths: {
      base: process.env.BASE_PATH ?? "",
    },
    prerender: {
      handleHttpError: ({ status, path }) => {
        // It often happens that images are updated before binary data. This shouldn't block building. Missing images are handled with fallbacks.
        if (status === 404 && path.endsWith(".webp")) {
          return "warn";
        }
      },
    },
    // TODO: Look into CSP to prevent XSS attacks
    // csp: {
    //   mode: "hash",
    //   directives: { "script-src": ["self"] },
    // },
  },
};

export default config;
