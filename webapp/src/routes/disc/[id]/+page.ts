import { global } from "$lib/global.svelte";
import { title, url } from "$lib/consts";
import { getDiscCoverUrl, patchDescription } from "$lib/util";
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

  const melody = patchDescription(
    disc.skills[0].desc,
    disc.skills[0].params,
    1,
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: disc.name,
    description: disc.desc,
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
    description: disc.desc + " " + melody,
    ogImage: `${url}/${getDiscCoverUrl(disc.id).replace(/^([^\/]*\/){2}/, "discs/")}`,
    structuredData: JSON.stringify(structuredData),
  };
}
