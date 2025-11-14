import { browser } from "$app/environment";
import type { Potential } from "./database.types";

export function loadPreferenceBool(
  key: string,
  defaultValue: boolean,
): boolean {
  if (browser) {
    const stored = localStorage.getItem(key);
    return stored !== null ? stored === "true" : defaultValue;
  }
  return defaultValue;
}

export function loadPreferenceNum(key: string, defaultValue: number): number {
  if (browser) {
    const stored = localStorage.getItem(key);
    return stored !== null ? parseInt(stored) : defaultValue;
  }
  return defaultValue;
}

// Sort potentials by ID and rarity, multiply so we can "categorize" them
// This seems to match the game quite well
export const sortPotentials = (a: Potential, b: Potential) =>
  a.id + (3 - a.rarity) * 1000 - (b.id + (3 - b.rarity) * 1000);
