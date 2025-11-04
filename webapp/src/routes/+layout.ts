import { loadDatabase } from "$lib/database.svelte";
import { title, url } from "$lib/global";

export const prerender = true;

export async function load() {
  // This runs at build time for static generation
  // The database will be fetched once during build and baked into the HTML
  await loadDatabase();

  return {
    title: title,
    description: "Build editor and database for Stella Sora game by Yostar",
    ogImage: `${url}/og-image.webp`,
    disableMainPadding: false,
  };
}
