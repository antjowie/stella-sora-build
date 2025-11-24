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

  return {
    title: `${title} - ${character.name}`,
    description: `View builds and potentials for ${character.name} in Stella Sora`,
    ogImage: `${url}/${getCharacterPortraitUrl(character.name).replace(/^([^\/]*\/){2}/, "portraits/")}`,
  };
}
