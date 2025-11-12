import { database } from "$lib/database";
import { title, url } from "$lib/global";
import type { EntryGenerator } from "./$types";

export const prerender = true;

export const entries: EntryGenerator = async () => {
  // Generate a route for each character in the database
  return database.data.map((character) => ({
    name: character.name,
  }));
};

export async function load({ params }) {
  const character = database.data.find((c) => c.name === params.name);
  if (character === undefined) {
    return {};
  }

  return {
    title: `${title} - ${character.name}`,
    description: `View builds and potentials for ${character.name} in Stella Sora`,
    ogImage: `${url}/${character.portraitUrl.replace(/^([^\/]*\/){2}/, "")}`,
  };
}
