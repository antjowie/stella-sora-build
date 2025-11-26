import { global } from "$lib/global.svelte";
import { title, url } from "$lib/consts";

export async function load() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Stella Sora Trekkers",
    description: "Browse all Trekkers in Stella Sora and view their potentials",
    url: `${url}/trekker`,
    mainEntity: {
      "@type": "ItemList",
      name: "Stella Sora Character List",
      description: "List of all characters in Stella Sora",
      numberOfItems: global.database.characters.length,
    },
    isPartOf: {
      "@type": "WebSite",
      name: "Stella Sora Builds",
      url: url,
    },
  };

  return {
    title: `${title} - Trekkers`,
    description:
      "Browse all Trekkers in Stella Sora and view their potentials. Create custom builds for your favorite characters.",
    structuredData: JSON.stringify(structuredData),
  };
}
