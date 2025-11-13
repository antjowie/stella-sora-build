// This is run during build time or when you start development
// It will generate the latest database.json by pulling data
// This will be stored in the lib dir and baked into the HTML
import databaseSchema from "$lib/schemas/database.schema.json";
import fs from "fs";
import ky from "ky";
import Ajv from "ajv";
import type { Database } from "./database.types";
const ajv = new Ajv();

async function generateDatabase(): Promise<Database> {
  console.log("Fetching and parsing external data...");
  // Validate Database
  const res = await fetch(
    "https://raw.githubusercontent.com/antjowie/StellaSoraData/refs/heads/main/database.json",
  );

  const database: Database = await res.json();
  const validate = ajv.compile(databaseSchema);
  const valid = validate(database);
  if (valid == false) {
    console.error(validate.errors);
    console.error(database);
    throw new Error("Invalid database");
  }

  fs.writeFileSync("src/lib/database.json", JSON.stringify(database, null, 2));
  return database;
}

async function fetchPortraits(characters: string[]): Promise<void> {
  fs.mkdirSync("static/portraits", { recursive: true });
  const promises = characters.map(async (character) => {
    const url = `https://raw.githubusercontent.com/antjowie/StellaSoraData/refs/heads/main/portraits/${character}.png`;
    const path = `static/portraits/${character}.png`;
    const buffer = await ky(url).arrayBuffer();
    fs.writeFileSync(path, Buffer.from(buffer));
  });

  await Promise.all(promises).then(() => {
    console.log("Portraits fetched successfully!");
  });
}

const db = await generateDatabase();
await fetchPortraits(db.map((character) => character.name));
