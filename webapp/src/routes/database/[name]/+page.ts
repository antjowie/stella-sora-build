import { loadDatabase } from "$lib/database.svelte";
import { database } from "$lib/database.svelte";
import type { EntryGenerator } from "./$types";

export const prerender = true;

export const entries: EntryGenerator = async () => {
  // Ensure database is loaded before generating routes
  await loadDatabase();

  // Generate a route for each character in the database
  return database.data.map((character) => ({
    name: character.name,
  }));
};
