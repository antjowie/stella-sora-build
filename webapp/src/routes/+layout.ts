import { title, url } from "$lib/global.svelte";

export const prerender = true;

export async function load() {
  return {
    title: title,
    description:
      "A build editor and database for Potentials of the game Stella Sora by Yostar. Create, save and share custom builds for Trekkers",
    ogImage: `${url}/og-image.webp`,
    disableMainPadding: false,
  };
}
