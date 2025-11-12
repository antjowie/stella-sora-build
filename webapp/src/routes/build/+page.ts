import { title } from "$lib/global";

export async function load() {
  return {
    title: `${title} - Build`,
  };
}
