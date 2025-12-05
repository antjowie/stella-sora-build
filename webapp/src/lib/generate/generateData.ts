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
import assert from "assert";

// In case you want to poll directly but quickly runs into rate limits
// const getUrl = (folder: string, name: string) =>
//   `https://raw.githubusercontent.com/antjowie/StellaSoraData/main/${folder}/${name}.webp`;
const getUrl = (folder: string, name: string) =>
  `https://stellabuildsdata.pages.dev/${folder}/${name}`;

async function generateDatabases(): Promise<Database[]> {
  // Some values we want to insert in dbs
  const potentialIcons: string[] = Object.values(
    await ky(getUrl("potential-icons", "index.json")).json(),
  );
  const loading: string[] = Object.values(
    await ky(getUrl("loading", "index.json")).json(),
  );

  const databaseExtensions = {
    potentialIcons,
    loading,
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
      names: database.characters.map(
        (character) => `head_${character.id}02_XL.webp`,
      ),
      outNames: database.characters.map((character) => character.id + ".webp"),
    },
    {
      folder: "discs",
      names: database.discs.map((disc) => `outfit_${disc.bg}.webp`),
      outNames: database.discs.map((disc) => disc.id + ".webp"),
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

  let completedTasks = 0;
  let tasks: (() => Promise<void>)[] = [];
  for (const folder of folders) {
    console.log("Pulling images for " + folder.folder);
    const dir = `static/${folder.folder}`;
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true });
    }
    fs.mkdirSync(`static/${folder.folder}`, { recursive: true });

    for (const [i, name] of folder.names.entries()) {
      const task = async () => {
        const outName = String(folder.outNames?.[i] ?? name);
        const url = getUrl(folder.folder, name);
        const path = `${dir}/${outName}`;

        return ky(url)
          .arrayBuffer()
          .then((buffer) => {
            fs.writeFileSync(path, Buffer.from(buffer));
            completedTasks++;
          });
      };
      tasks.push(task);
    }
  }

  const totalTasks = tasks.length;
  const maxConcurrentTasks = 10;
  let ongoingTasks = 0;
  let promises: Promise<void>[] = [];

  const interval = setInterval(() => {
    console.log(`Progress: ${completedTasks}/${totalTasks} images downloaded`);
  }, 1000);
  // Might wanna just zip all assets on data side and then download 1 file instead of all assets
  while (tasks.length > 0) {
    while (ongoingTasks < maxConcurrentTasks && tasks.length > 0) {
      const task = tasks.shift()!;
      ongoingTasks++;
      promises.push(
        task().then(() => {
          ongoingTasks--;
        }),
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Make sure we actually finish the last tasks
  await Promise.all(promises);
  assert(completedTasks === totalTasks);
  clearInterval(interval);
  console.log(totalTasks + " Images fetched successfully!");
}

function generateSitemap(database: Database) {
  const pages = [
    `${url}/`,
    `${url}/build`,
    `${url}/trekker`,
    ...database.characters.map((c) => `${url}/trekker/${c.name}`),
    `${url}/disc`,
    ...database.discs.map((d) => `${url}/disc/${d.id}`),
    `${url}/about`,
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${page}</loc>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  fs.writeFileSync("static/sitemap.xml", sitemap);
}

const db = await generateDatabases();
generateSitemap(db[0]);
await fetchImages(db[0]);
