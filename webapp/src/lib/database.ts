import { base } from "$app/paths";
import databaseJson from "$lib/database.json";
import type {
  Database as GeneratedDatabase,
  Character as GeneratedCharacter,
  Potential as GeneratedPotential,
} from "$lib/database.types";

export const database = databaseJson;

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

export function getElementIconUrl(element: CharacterElement): string {
  const name = CharacterElement[element];
  return `${base}/elements/${name}.webp`;
}

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

export type Database = GeneratedDatabase;
