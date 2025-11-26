import { browser } from "$app/environment";
import { global, setLanguage } from "$lib/global.svelte";
import { title, url } from "$lib/consts";
import { Language } from "$lib/types/lang.types";
import { loadPreferenceBool, loadPreferenceString } from "$lib/util";

export const prerender = true;

export async function load() {
  if (browser) {
    global.darkMode = loadPreferenceBool("darkMode", false);
    setLanguage(loadPreferenceString("language", Language.EN) as Language);
  }

  // Create structured data for the homepage
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Stella Sora Builds",
    alternateName: "Stella Sora Build Editor",
    url,
    description:
      "Create, optimize and share builds for Trekkers in Stella Sora. Explore Trekker potentials and Runic discs, compare their stats and levels, and discover the best builds for your game.",
    publisher: {
      "@type": "Organization",
      name: "Stella Sora Builds",
      url,
    },
  };

  return {
    title: title,
    description: structuredData.description,
    ogImage: `${url}/og-image.webp`,
    disableMainPadding: false,
    structuredData: JSON.stringify(structuredData),
  };
}
