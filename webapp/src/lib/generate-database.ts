// This is run during build time or when you start development
// It will generate the latest database.json by pulling data
// This will be stored in the lib dir and baked into the HTML
import databaseSchema from "$lib/database.schema.json";
import { base } from "$app/paths";
import fs from "fs/promises";
import Ajv from "ajv";
import type { Character, Database, Potential } from "./database.types";
const ajv = new Ajv();

function parseIntStrict(value: any, context?: string): number {
  const result = parseInt(value);
  if (isNaN(result)) {
    const contextMsg = context ? ` (${context})` : "";
    throw new Error(`Failed to parse integer: ${value}${contextMsg}`);
  }
  return result;
}

async function fetchData(): Promise<{}> {
  const data = [
    {
      name: "binCharacter",
      url: "https://raw.githubusercontent.com/Hiro420/StellaSoraData/refs/heads/main/EN/bin/Character.json",
    },
    {
      name: "binItem",
      url: "https://raw.githubusercontent.com/Hiro420/StellaSoraData/refs/heads/main/EN/bin/Item.json",
    },
    {
      name: "binPotential",
      url: "https://raw.githubusercontent.com/Hiro420/StellaSoraData/refs/heads/main/EN/bin/Potential.json",
    },
    {
      name: "binCharPotential",
      url: "https://raw.githubusercontent.com/Hiro420/StellaSoraData/refs/heads/main/EN/bin/CharPotential.json",
    },
    {
      name: "langItem",
      url: "https://raw.githubusercontent.com/Hiro420/StellaSoraData/refs/heads/main/EN/language/en_US/Item.json",
    },
    {
      name: "langPotential",
      url: "https://raw.githubusercontent.com/Hiro420/StellaSoraData/refs/heads/main/EN/language/en_US/Potential.json",
    },
    {
      name: "langCharacterDes",
      url: "https://raw.githubusercontent.com/Hiro420/StellaSoraData/refs/heads/main/EN/language/en_US/CharacterDes.json",
    },
  ];

  const fetchPromises = data.map(async (entry) => {
    const res = await fetch(entry.url);
    if (res.ok == false) throw new Error(`Failed to fetch ${entry.url}`);
    return { name: entry.name, data: await res.json() };
  });

  const resultsArray = await Promise.all(fetchPromises);
  const results = Object.fromEntries(
    resultsArray.map((entry) => [entry.name, entry.data]),
  );

  return results;
}

export async function generateDatabase(): Promise<Database> {
  console.log("Fetching and parsing external data...");
  return fetchData().then((data: any) => {
    let database: Database = {
      timestamp: new Date().toUTCString(),
      data: [],
    };
    // Should probs validate, but the json is very big so problem for later

    // Build mapping for char to potential types
    let incompleteIds = new Set<number>();
    let charToPotentialType = new Map<number, any>();
    Object.values(data.binCharPotential).forEach((entry) => {
      let data = entry as any;
      let charId = parseIntStrict(data.Id);
      let result = {
        type1: [] as number[],
        type2: [] as number[],
        type3: [] as number[],
      };
      if (data.MasterSpecificPotentialIds === undefined) {
        incompleteIds.add(charId);
        return;
      }
      Object.values(data.MasterSpecificPotentialIds).forEach((id) =>
        result.type1.push(parseIntStrict(id)),
      );
      Object.values(data.MasterNormalPotentialIds).forEach((id) =>
        result.type1.push(parseIntStrict(id)),
      );
      Object.values(data.AssistSpecificPotentialIds).forEach((id) =>
        result.type2.push(parseIntStrict(id)),
      );
      Object.values(data.AssistNormalPotentialIds).forEach((id) =>
        result.type2.push(parseIntStrict(id)),
      );
      Object.values(data.CommonPotentialIds).forEach((id) =>
        result.type3.push(parseIntStrict(id)),
      );

      charToPotentialType.set(charId, result);
    });

    // Build mapping from char to potentials
    let charToPotentials = new Map<number, Potential[]>();
    Object.values(data.binPotential).forEach((potential) => {
      let charId = parseIntStrict((potential as any).CharId);
      if (incompleteIds.has(charId)) return;

      if (charToPotentials.has(charId) == false) {
        charToPotentials.set(charId, []);
      }

      // Parse potential data
      let potentialId = parseIntStrict((potential as any).Id);

      // Get rarity
      // Specific potential has stype 42
      // Rare potential has stype 41 and rarity 1
      // Common potential has stype 41 and rarity 2
      let rarity = 0;
      let stype = parseIntStrict((data.binItem[potentialId] as any).Stype);
      let typeRarity = parseIntStrict(
        (data.binItem[potentialId] as any).Rarity,
      );
      if (stype == 42) {
        rarity = 3;
      } else if (stype == 41 && typeRarity == 1) {
        rarity = 2;
      } else if (stype == 41 && typeRarity == 2) {
        rarity = 1;
      } else {
        throw new Error(
          `Unknown potential type. stype: ${stype} rarity: ${typeRarity}`,
        );
      }

      // Get potential type
      // Type depends on where id is located in CharPotential.json
      let type = 0;
      const potentialTypes = charToPotentialType.get(charId);
      if (!potentialTypes) {
        throw new Error(`No potential types found for character: ${charId}`);
      }
      if (potentialTypes.type1.find((id: number) => id == potentialId))
        type = 1;
      else if (potentialTypes.type2.find((id: number) => id == potentialId))
        type = 2;
      else if (potentialTypes.type3.find((id: number) => id == potentialId))
        type = 3;
      else throw new Error(`Unknown potential type: ${potentialId}`);

      charToPotentials.get(charId)!.push({
        id: potentialId,
        name: data.langItem[`Item.${potentialId}.1`],
        descShort: data.langPotential[`Potential.${potentialId}.1`],
        descLong: data.langPotential[`Potential.${potentialId}.2`],
        rarity: rarity,
        build: (potential as any).Build,
        type: type,
      });
    });

    // Populate each character
    for (const [charIdStr, charData] of Object.entries(data.binCharacter)) {
      let charId = parseIntStrict(charIdStr);

      // Get data and filter out unwanted entries
      const potentials = charToPotentials.get(charId)!;
      if (potentials === undefined) continue;
      const charName = data.langCharacterDes[`CharacterDes.${charId}.2`];
      if (charName === "???") continue;
      const name = data.langCharacterDes[`CharacterDes.${charId}.2`];

      // Populate character
      const character: Character = {
        characterId: charId,
        name: name,
        class: parseIntStrict((charData as any).Class),
        element: parseIntStrict((charData as any).EET),
        grade: parseIntStrict((charData as any).Grade),
        portraitUrl: `${base}/portraits/150px-${name}.webp`,
        mainBuild1Name: data.langCharacterDes[`CharacterDes.${charId}.4`],
        mainBuild1Desc: data.langCharacterDes[`CharacterDes.${charId}.9`],
        mainBuild2Name: data.langCharacterDes[`CharacterDes.${charId}.5`],
        mainBuild2Desc: data.langCharacterDes[`CharacterDes.${charId}.10`],
        supportBuild1Name: data.langCharacterDes[`CharacterDes.${charId}.6`],
        supportBuild1Desc: data.langCharacterDes[`CharacterDes.${charId}.11`],
        supportBuild2Name: data.langCharacterDes[`CharacterDes.${charId}.7`],
        supportBuild2Desc: data.langCharacterDes[`CharacterDes.${charId}.12`],
        potentials: potentials,
      };
      database.data.push(character);
    }

    // Validate Database
    const validate = ajv.compile(databaseSchema);
    const valid = validate(database);
    if (valid == false) {
      console.error(validate.errors);
      throw new Error("Invalid database");
    }

    return database;
  });
}

let db = await generateDatabase();
await fs.writeFile("src/lib/database.json", JSON.stringify(db));
