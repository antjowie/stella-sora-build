import { loadDatabase } from "$lib/database.svelte";

export const prerender = true;

export async function load() {
  // This runs at build time for static generation
  // The database will be fetched once during build and baked into the HTML
  await loadDatabase();

  return {};
}
