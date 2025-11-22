// This is run during build time or when you start development
// It will generate the latest database.json by pulling data
// This will be stored in the lib dir and baked into the HTML
import databaseSchema from "$lib/schemas/database.schema.json";
import fs from "fs";
import ky from "ky";
import { ajv } from "./ajv";
import type { Database } from "./types/database.types";

async function generateDatabase(): Promise<Database> {
  console.log("Fetching and parsing external data...");
  // Validate Database
  const res = await fetch("https://stellabuildsdata.pages.dev/database.json");

  const database: Database = await res.json();
  const validate = ajv.compile(databaseSchema);
  const valid = validate(database);
  if (valid === false) {
    console.error(database);
    console.error(validate.errors);
    throw new Error("Failed to validate database");
  }

  fs.writeFileSync("src/lib/database.json", JSON.stringify(database));
  return database;
}

async function fetchImages(): Promise<void> {
  const characters: string[] = db.characters.map((character) => character.name);
  // In case you want to poll directly but quickly runs into rate limits
  // const getUrl = (folder: string, name: string) =>
  //   `https://raw.githubusercontent.com/antjowie/StellaSoraData/main/${folder}/${name}.webp`;
  const getUrl = (folder: string, name: string) =>
    `https://stellabuildsdata.pages.dev/${folder}/${name}.webp`;

  fs.mkdirSync("static/portraits", { recursive: true });
  let promises = characters.map(async (character) => {
    const url = getUrl("portraits", character);
    const path = `static/portraits/${character}.webp`;
    const buffer = await ky(url).arrayBuffer();
    fs.writeFileSync(path, Buffer.from(buffer));
  });

  const discs = db.discs.map((disc) => disc.id);
  fs.mkdirSync("static/discs", { recursive: true });
  promises = promises.concat(
    discs.map(async (disc) => {
      const url = getUrl("discs", String(disc));
      const path = `static/discs/${disc}.webp`;
      const buffer = await ky(url).arrayBuffer();
      fs.writeFileSync(path, Buffer.from(buffer));
    }),
  );

  await Promise.all(promises).then(() => {
    console.log("Images fetched successfully!");
  });
}

const db = await generateDatabase();
await fetchImages();
