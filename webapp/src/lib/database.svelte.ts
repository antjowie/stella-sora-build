import type {
  Database as GeneratedDatabase,
  Character as GeneratedCharacter,
  Potential as GeneratedPotential,
} from "$lib/database.types";
import databaseSchema from "$lib/database.schema.json";
import { base } from "$app/paths";
import Ajv from "ajv";
import { building } from "$app/environment";
const ajv = new Ajv();

export const database: Database = $state({
  lastFetch: 0,
  data: [],
});

export const databaseLoading = $state({ value: true });
export const databaseError = $state({ value: null as string | null });

// Cache the loading promise to prevent multiple simultaneous fetches
let loadPromise: Promise<{}> | null = null;

export enum CharacterGrade {
  SR = 1,
  R = 2,
}

export const characterGradeColor = ["", "#d1abf3", "#fff38b"];

export enum CharacterClass {
  Vanguard = 1,
  Versatile = 2,
  Support = 3,
}

export const characterClassColor = ["", "#db6893", "#7d81e3", "#41cbaf"];

export enum CharacterElement {
  Aqua = 1,
  Ignis = 2,
  Terra = 3,
  Ventus = 4,
  Lux = 5,
  Umbra = 6,
}

export const characterElementColor = [
  "",
  "#52c3eb",
  "#e55833",
  "#dd7d54",
  "#91b93c",
  "#efa750",
  "#bb67af",
];

export enum PotentialRarity {
  Common = 1,
  Rare = 2,
  Epic = 3,
}

export const potentialRarityColor = ["", "#fbdb66", "#8fe5f7", "#ff9fe3"];

// Type-safe versions of generated types
export type Character = Omit<GeneratedCharacter, "class" | "element"> & {
  class: CharacterClass;
  element: CharacterElement;
};

export type Potential = Omit<GeneratedPotential, "rarity"> & {
  rarity: PotentialRarity;
};

export type Database = Omit<GeneratedDatabase, "data"> & {
  data: Character[];
};

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

export async function loadDatabase(forceFetch: boolean = false): Promise<{}> {
  // If already loading and not forcing a fetch, return the existing promise
  if (loadPromise !== null && forceFetch === false) {
    return loadPromise;
  }

  console.log("Loading database...");
  databaseLoading.value = true;
  databaseError.value = null;

  loadPromise = _loadDatabaseInternal(forceFetch);
  return loadPromise;
}

async function _loadDatabaseInternal(forceFetch: boolean): Promise<{}> {
  // Wait a few second for testing purposes
  // Please don't push this to prod
  // if (building) {
  //   throw new Error(
  //     "You forget to remove the timeout test in _loadDatabaseInternal",
  //   );
  // }
  // await new Promise((resolve) => setTimeout(resolve, 3000));

  try {
    // Check if database is stored in localStorage in the future
    const data =
      typeof window !== "undefined" ? localStorage.getItem("database") : null;
    if (data != null && forceFetch == false) {
      const json: GeneratedDatabase = JSON.parse(data);
      const valid = ajv.validate(databaseSchema, json);
      if (valid == false) {
        console.log("Cached database fails schema, will fetch latest");
      } else {
        let elapsed: number = Date.now() - json.lastFetch;
        elapsed /= 1000 * 60 * 60;
        console.log(`Hours since last fetch ${elapsed}`);
        if (Math.floor(elapsed) < 1.0) {
          console.log("Using cached data");
          database.lastFetch = json.lastFetch;
          database.data = json.data;
          databaseLoading.value = false;
          return database;
        }
      }
    }

    console.log("Fetching and parsing external data...");
    return fetchData().then((data: any) => {
      database.lastFetch = Date.now();
      database.data = [];
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
      if (typeof window !== "undefined") {
        localStorage.setItem("database", JSON.stringify(database));
      }
      databaseLoading.value = false;
      return database;
    });
  } catch (error) {
    databaseError.value =
      error instanceof Error ? error.message : String(error);
    databaseLoading.value = false;
    loadPromise = null;
    throw error;
  } finally {
    // Clear the promise after it resolves/rejects
    loadPromise = null;
  }
}

// Auto-initialize on browser
if (typeof window !== "undefined") {
  loadDatabase().catch(console.error);
}
