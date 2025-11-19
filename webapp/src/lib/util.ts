import { browser } from "$app/environment";
import type { PotentialConfig } from "./buildData.types";
import type { Potential } from "./database.types";

export function loadPreferenceBool(
  key: string,
  defaultValue: boolean,
): boolean {
  if (browser) {
    const stored = localStorage.getItem(key);
    return stored !== null ? stored === "true" : defaultValue;
  }
  console.error("loadPreferenceBool called in non-browser environment");
  return defaultValue;
}

export function loadPreferenceNum(key: string, defaultValue: number): number {
  if (browser) {
    const stored = localStorage.getItem(key);
    return stored !== null ? parseInt(stored) : defaultValue;
  }
  console.error("loadPreferenceNum called in non-browser environment");
  return defaultValue;
}

// Sort potentials by ID and rarity, multiply so we can "categorize" them
// This seems to match the game quite well
export const sortPotentials = (a: Potential, b: Potential) =>
  a.id + (3 - a.rarity) * 1000 - (b.id + (3 - b.rarity) * 1000);

export const sortPotentialPriorities =
  (potentialConfigs: [number, PotentialConfig][]) =>
  (a: Potential, b: Potential) => {
    {
      const aPrio =
        potentialConfigs.find(
          ([potentialId, value]) => potentialId === a.id,
        )?.[1].priority ?? 2;
      const bPrio =
        potentialConfigs.find(
          ([potentialId, value]) => potentialId === b.id,
        )?.[1].priority ?? 2;
      return bPrio - aPrio;
    }
  };
