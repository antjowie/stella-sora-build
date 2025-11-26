import { getCharacterPortraitUrl } from "$lib/util";
import { global, title, url } from "$lib/global.svelte";
import type { EntryGenerator } from "./$types";

export const entries: EntryGenerator = async () => {
  // Generate a route for each character in the database
  return global.database.characters.map((character) => ({
    name: character.name,
  }));
};

export async function load({ params }) {
  const character = global.database.characters.find(
    (c) => c.name === params.name,
  );
  if (character === undefined) {
    return {};
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VideoGameCharacter",
    name: character.name,
    description: `A character in the game Stella Sora by Yostar. View builds and potentials for ${character.name}.`,
    image: `${url}/${getCharacterPortraitUrl(character.id).replace(/^([^\/]*\/){2}/, "portraits/")}`,
    url: `${url}/trekker/${character.name}`,
    mainEntityOfPage: `${url}/trekker/${character.name}`,
    game: {
      "@type": "VideoGame",
      name: "Stella Sora",
      publisher: {
        "@type": "Organization",
        name: "Yostar",
      },
    },
  };

  return {
    title: `${title} - ${character.name}`,
    description: `View builds and potentials for ${character.name} in Stella Sora`,
    ogImage: `${url}/${getCharacterPortraitUrl(character.id).replace(/^([^\/]*\/){2}/, "portraits/")}`,
    structuredData: JSON.stringify(structuredData),
  };
}
