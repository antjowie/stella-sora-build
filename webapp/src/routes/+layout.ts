import { title, url } from "$lib/global";

export const prerender = true;

export async function load() {
  return {
    title: title,
    description: "Build editor and database for Stella Sora game by Yostar",
    ogImage: `${url}/og-image.webp`,
    disableMainPadding: false,
  };
}
