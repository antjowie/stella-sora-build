import { global, url } from "$lib/global.svelte";
import { title } from "$lib/global.svelte";
import { getDiscCoverUrl } from "$lib/util";
import type { EntryGenerator } from "./$types";

export const entries: EntryGenerator = async () => {
  // Generate a route for each character in the database
  return global.database.discs.map((disc) => ({
    id: String(disc.id),
  }));
};

export async function load({ params }) {
  const disc = global.database.discs.find((c) => c.id === parseInt(params.id));
  if (disc === undefined) {
    return {};
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: disc.name,
    description: `${disc.desc}`,
    image: `${url}/${getDiscCoverUrl(disc.id).replace(/^([^\/]*\/){2}/, "discs/")}`,
    url: `${url}/disc/${disc.name}`,
    mainEntityOfPage: `${url}/disc/${disc.name}`,
    category: "VideoGameItem",
    isAccessoryOrSparePartFor: {
      "@type": "VideoGame",
      name: "Stella Sora",
      publisher: {
        "@type": "Organization",
        name: "Yostar",
      },
    },
  };

  return {
    title: `${title} - ${disc.name}`,
    description: `View harmony and melodies for ${disc.desc} in Stella Sora`,
    ogImage: `${url}/${getDiscCoverUrl(disc.id).replace(/^([^\/]*\/){2}/, "discs/")}`,
    structuredData: JSON.stringify(structuredData),
  };
}
