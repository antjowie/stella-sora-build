import { loadDatabase } from "$lib/database.svelte";
import { title, url } from "$lib/global";

export const prerender = true;

export async function load() {
  // This runs at build time for static generation
  // The database will be fetched once during build and baked into the HTML
  // TODO: Since it's a static site, we can't show new characters without a new build.
  // The character pages are generated at build time. We'll have to drop the character
  // specific pages, turn that page into a component and in the browser just replace
  // the character select component with the character data component.
  //
  // This way I don't have to push an update every ~2 weeks just to get new pages for the chars.
  // It does hurt SEO and prevent caching the page though. Alternatively, I could also just write
  // a script that triggers a build anytime the data repo updates?
  await loadDatabase();

  return {
    title: title,
    description: "Build editor and database for Stella Sora game by Yostar",
    ogImage: `${url}/og-image.webp`,
    disableMainPadding: false,
  };
}
