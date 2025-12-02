import { title, url } from "$lib/consts";

export async function load() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Stella Builds About",
    description:
      "About page for Stella Builds, as well as handy community resources and a FAQ section.",
    url: `${url}/about`,
    isPartOf: {
      "@type": "WebSite",
      name: "Stella Sora Builds",
      url: url,
    },
  };

  return {
    title: `${title} - About`,
    description:
      "About page for Stella Builds, as well as handy community resources and a FAQ section.",
    structuredData: JSON.stringify(structuredData),
  };
}
