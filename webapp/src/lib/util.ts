import { browser } from "$app/environment";
import { base } from "$app/paths";
import type { PotentialConfig } from "./types/buildData.types";
import {
  type Disc,
  type DiscSkill,
  type Potential,
  Element,
} from "./types/database.types";

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

export function loadPreferenceString(
  key: string,
  defaultValue: string,
): string {
  if (browser) {
    const stored = localStorage.getItem(key);
    return stored !== null ? stored : defaultValue;
  }
  console.error("loadPreferenceString called in non-browser environment");
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

export function getImageUrl(name: string, path: string): string {
  return `${encodeURI(base + "/" + path + "/" + name + ".webp")}`;
}

export function getCharacterPortraitUrl(
  id: number | undefined = undefined,
): string {
  if (id === undefined) return getImageUrl("Portrait", "fallback");
  return getImageUrl(String(id), "portraits");
}

export function getDiscCoverUrl(
  discId: number | undefined = undefined,
): string {
  if (discId === undefined) return getImageUrl("Disc", "fallback");
  return getImageUrl(String(discId), "discs");
}

export function getPotentialIconUrl(
  potentialIcon: string | undefined = undefined,
): string {
  if (potentialIcon === undefined)
    return getImageUrl("PotentialIcon", "fallback");
  return getImageUrl(String(potentialIcon), "potential-icons");
}

export function getElementIconUrl(
  element: Element | undefined = undefined,
): string {
  if (element === undefined) return getImageUrl("Element", "fallback");
  const name = Element[element];
  return getImageUrl(name, "elements");
}

export function getNoteIconUrl(noteId: number | undefined = undefined): string {
  if (noteId === undefined) return getImageUrl("Note", "fallback");
  if (noteId < 90011 && noteId > 90023) {
    return getImageUrl("Note", "fallback");
  }
  return getImageUrl(String(noteId), "notes");
}

export function getEffectiveNoteIdsFromDisc(disc: Disc): number[] {
  const effectiveNoteIds = [];
  for (const skill of disc.skills) {
    for (const note of skill.notes) {
      effectiveNoteIds.push(note.id);
    }
  }
  return [...new Set(effectiveNoteIds)];
}

export function getDiscSkillLevelFromNotes(
  skill: DiscSkill,
  notes: [number, number][],
): number {
  let level = 99;
  for (const noteLvl of skill.notes) {
    const idx = notes.findIndex(([id]) => id === noteLvl.id);
    if (idx < 0) return 1;

    const ownedNotes = notes[idx][1];
    let newLevel = 0;
    while (
      newLevel < noteLvl.values.length &&
      ownedNotes >= noteLvl.values[newLevel]
    ) {
      newLevel++;
    }
    level = Math.min(level, newLevel);
  }
  return level + 1;
}
