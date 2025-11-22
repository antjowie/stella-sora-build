import { browser } from "$app/environment";
import databaseJson from "$lib/database.json";
import { global, title, url } from "$lib/global.svelte";
import type { Database } from "$lib/types/database.types";
import { loadPreferenceBool } from "$lib/util";

export const prerender = true;

export async function load() {
  global.database = databaseJson as Database;
  if (browser) {
    global.darkMode = loadPreferenceBool("darkMode", false);
  }

  return {
    title: title,
    description:
      "A build editor and database for Potentials of the game Stella Sora by Yostar. Create, save and share custom builds for Trekkers",
    ogImage: `${url}/og-image.webp`,
    disableMainPadding: false,
  };
}
