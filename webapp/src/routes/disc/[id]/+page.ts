import { database } from "$lib/database";
import { title } from "$lib/global.svelte";
import type { EntryGenerator } from "./$types";

export const prerender = true;

export const entries: EntryGenerator = async () => {
  // Generate a route for each character in the database
  return database.discs.map((disc) => ({
    id: String(disc.id),
  }));
};

export async function load({ params }) {
  const disc = database.discs.find((c) => c.id === parseInt(params.id));
  if (disc === undefined) {
    return {};
  }

  return {
    title: `${title} - ${disc.name}`,
    description: `${disc.desc}`,
    // ogImage: `${url}/${getCharacterPortraitUrl(character.name).replace(/^([^\/]*\/){2}/, "portraits/")}`,
  };
}
