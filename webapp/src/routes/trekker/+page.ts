import { title } from "$lib/global.svelte";

export async function load() {
  return {
    title: `${title} - Trekkers`,
  };
}
