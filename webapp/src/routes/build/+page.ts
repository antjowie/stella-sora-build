import { title, url } from "$lib/consts";

export async function load() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Stella Sora Build Creator",
    description: "Create custom builds for Trekkers in Stella Sora",
    url: `${url}/build`,
    mainEntity: {
      "@type": "SoftwareApplication",
      name: "Stella Sora Build Editor",
      description: "Create and optimize builds for characters in Stella Sora",
      applicationCategory: "Game",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    isPartOf: {
      "@type": "WebSite",
      name: "Stella Sora Builds",
      url: url,
    },
  };

  return {
    title: `${title} - Build Creator`,
    description:
      "Create custom builds for Trekkers in Stella Sora. Optimize character potentials and share your builds with the community.",
    structuredData: JSON.stringify(structuredData),
  };
}
