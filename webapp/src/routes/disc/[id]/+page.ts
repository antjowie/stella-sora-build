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

  return {
    title: `${title} - ${disc.name}`,
    description: `${disc.desc}`,
    ogImage: `${url}/${getDiscCoverUrl(disc.id).replace(/^([^\/]*\/){2}/, "discs/")}`,
  };
}
