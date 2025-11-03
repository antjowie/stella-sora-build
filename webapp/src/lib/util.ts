import { browser } from "$app/environment";

export function loadPreference(key: string, defaultValue: boolean): boolean {
  if (browser) {
    const stored = localStorage.getItem(key);
    return stored !== null ? stored === "true" : defaultValue;
  }
  return defaultValue;
}
