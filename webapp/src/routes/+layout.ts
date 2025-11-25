import { browser } from "$app/environment";
import { global, setLanguage, title, url } from "$lib/global.svelte";
import { Language } from "$lib/types/lang.types";
import { loadPreferenceBool, loadPreferenceString } from "$lib/util";

export const prerender = true;

export async function load() {
  if (browser) {
    global.darkMode = loadPreferenceBool("darkMode", false);
    setLanguage(loadPreferenceString("language", Language.EN) as Language);
  }

  return {
    title: title,
    description:
      "A build editor and database for Potentials of the game Stella Sora by Yostar. Create, save and share custom builds for Trekkers",
    ogImage: `${url}/og-image.webp`,
    disableMainPadding: false,
  };
}
