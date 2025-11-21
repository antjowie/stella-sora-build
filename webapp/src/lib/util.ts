import { browser } from "$app/environment";
import { base } from "$app/paths";
import type { PotentialConfig } from "./types/buildData.types";
import { type Potential, Element } from "./types/database.types";

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
export function sortPotentials(a: Potential, b: Potential): number {
  return a.id + (3 - a.rarity) * 1000 - (b.id + (3 - b.rarity) * 1000);
}

export function sortPotentialPriorities(
  potentialConfigs: [number, PotentialConfig][],
): (a: Potential, b: Potential) => number {
  return (a: Potential, b: Potential) => {
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
}

export function patchDescription(text: string, inParams: any[], level: number) {
  // Replace all span color with bold
  text = text.replace(/<span style="/g, '<b class="outline" style="');
  text = text.replace(/<\/span>/g, "</b>");
  text = text.replace(/\u000b/g, "<br/>");

  // Params are stored as &Param1&
  const paramRegex = /&[^&]*&/g;
  const paramTexts = text.match(paramRegex);
  if (paramTexts === null) return text;

  for (const paramText of paramTexts) {
    let idx = parseInt(paramText.slice("&Param".length, paramText.length - 1));
    const params = inParams.find((param) => param.idx === idx);
    if (params !== undefined) {
      const levelIdx = Math.min(level - 1, params.values.length - 1);
      const param = params.values[levelIdx];
      text = text.replace(paramText, param);
    } else {
      text = text.replace(paramText, "MISSING");
    }
  }

  return text;
}

export function getCharacterPortraitUrl(characterName: string): string {
  return encodeURI(`${base}/portraits/${characterName}.webp`);
}

export function getDiscCoverUrl(discId: number): string {
  return encodeURI(`${base}/discs/${discId}.webp`);
}

export function getElementIconUrl(element: Element): string {
  const name = Element[element];
  return `${base}/elements/${name}.webp`;
}

export function getNoteIconUrl(noteId: number): string {
  if (noteId < 90011 && noteId > 90023) {
    return `${base}/notes/invalid.webp`;
  }
  return `${base}/notes/${noteId}.webp`;
}
