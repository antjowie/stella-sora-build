// This is run during build time or when you start development
// It will generate the latest database.json by pulling data
// This will be stored in the lib dir and baked into the HTML
import databaseSchema from "$lib/schemas/database.schema.json";
import fs from "fs";
import ky from "ky";
import { ajv } from "$lib/ajv";
import type { Database } from "$lib/types/database.types";
import { Language } from "$lib/types/lang.types";
import { url } from "$lib/consts";

// In case you want to poll directly but quickly runs into rate limits
// const getUrl = (folder: string, name: string) =>
//   `https://raw.githubusercontent.com/antjowie/StellaSoraData/main/${folder}/${name}.webp`;
const getUrl = (folder: string, name: string) =>
  `https://stellabuildsdata.pages.dev/${folder}/${name}`;

async function generateDatabases(): Promise<Database[]> {
  // Some values we want to insert in dbs
  const databaseExtensions = {
    potentialIcons: Object.values(
      await ky(getUrl("potential-icons", "index.json")).json(),
    ),
    loading: Object.values(await ky(getUrl("loading", "index.json")).json()),
  };

  let databases = [];
  if (fs.existsSync("static/databases")) {
    fs.rmSync("static/databases", { recursive: true });
  }
  fs.mkdirSync("static/databases", { recursive: true });
  for (const lang of Object.values(Language)) {
    const url = `https://stellabuildsdata.pages.dev/databases/database_${lang}.json`;
    console.log("Fetching", url);
    const database: Database = {
      ...(await ky(url).json()),
      ...databaseExtensions,
    };
    const validate = ajv.compile(databaseSchema);
    const valid = validate(database);
    if (valid === false) {
      console.error(database);
      console.error(validate.errors);
      throw new Error("Failed to validate database");
    }

    databases.push(database);
    if (lang === Language.EN) {
      fs.writeFileSync(`src/lib/database_en.json`, JSON.stringify(database));
    } else {
      fs.writeFileSync(
        `static/databases/database_${lang}.json`,
        JSON.stringify(database),
      );
    }
  }
  return databases;
}

async function fetchImages(database: Database): Promise<void> {
  const folders = [
    {
      folder: "portraits",
      names: database.characters.map((character) => character.name + ".webp"),
      outNames: database.characters.map((character) => character.id + ".webp"),
    },
    {
      folder: "discs",
      names: database.discs.map((disc) => disc.id + ".webp"),
    },
    {
      folder: "potential-icons",
      names: database.potentialIcons,
    },
    {
      folder: "loading",
      names: database.loading,
    },
  ];

  let promises = [];
  for (const folder of folders) {
    console.log("Pulling images for " + folder.folder);
    const dir = `static/${folder.folder}`;
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true });
    }

    fs.mkdirSync(`static/${folder.folder}`, { recursive: true });
    const promise = folder.names.map(async (name, i) => {
      const outName = String(folder.outNames?.[i] ?? name);
      const url = getUrl(folder.folder, name);
      const path = `${dir}/${outName}`;

      const buffer = await ky(url).arrayBuffer();
      fs.writeFileSync(path, Buffer.from(buffer));
    });
    promises.push(promise);
  }

  await Promise.all(promises).then(() => {
    console.log("Images fetched successfully!");
  });
}

function generateSitemap(database: Database) {
  const pages = [
    `${url}/`,
    `${url}/build`,
    `${url}/trekker`,
    ...database.characters.map((c) => `${url}/trekker/${c.name}`),
    `${url}/disc`,
    ...database.discs.map((d) => `${url}/disc/${d.id}`),
  ];

  const lastmod = new Date().toISOString();
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${page}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  fs.writeFileSync("static/sitemap.xml", sitemap);
}

const db = await generateDatabases();
generateSitemap(db[0]);
await fetchImages(db[0]);
