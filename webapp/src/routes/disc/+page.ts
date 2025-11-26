import { global } from "$lib/global.svelte";
import { title, url } from "$lib/global.svelte";

export async function load() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Stella Sora Trekkers",
    description: "Browse all Trekkers in Stella Sora and view their potentials",
    url: `${url}/trekker`,
    mainEntity: {
      "@type": "ItemList",
      name: "Stella Sora Disc List",
      description: "List of all discs in Stella Sora",
      numberOfItems: global.database.discs.length,
    },
    isPartOf: {
      "@type": "WebSite",
      name: "Stella Sora Builds",
      url: url,
    },
  };

  return {
    title: `${title} - Discs`,
    description:
      "Browse all Discs in Stella Sora and view their harmony and melodies. Create custom builds for your favorite characters.",
    structuredData: JSON.stringify(structuredData),
  };
}
