import Ajv from "ajv";
import type { BuildData } from "./buildData.types";
import buildDataSchema from "$lib/schemas/buildData.schema.json";
import { browser } from "$app/environment";
import { localStorageBuildsKey } from "$lib/global.svelte";
const ajv = new Ajv();
const ajvValidate = ajv.compile(buildDataSchema);

export function validate(buildData: BuildData) {
  const maxLength = 5000;
  const buildDataJson = JSON.stringify(buildData);
  if (buildDataJson.length > maxLength) {
    throw new Error(
      `Build data too large to encode ${buildDataJson.length}>${maxLength}`,
    );
  }
  if (!ajvValidate(buildData)) {
    throw new Error(
      "Invalid build data:\n" +
        JSON.stringify(buildData, null, 2) +
        "\nErrors:\n" +
        ajv.errorsText(ajvValidate.errors, { separator: "\n" }),
    );
  }
}

export function decodeJson(encodedBase64: string): any {
  try {
    const padded = encodedBase64.padEnd(
      encodedBase64.length + ((4 - (encodedBase64.length % 4)) % 4),
      "=",
    );
    const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
    const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const decoded = new TextDecoder().decode(binary);
    const build = JSON.parse(decoded);
    return build;
  } catch (e) {
    console.error(e);
    throw new Error("Invalid build data");
  }
}

export function encodeJson(data: any): string {
  const json = JSON.stringify(data);
  const utf8Bytes = new TextEncoder().encode(json);
  const base64 = btoa(String.fromCharCode(...utf8Bytes));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function getLocalStoredBuilds(): BuildData[] {
  if (browser) {
    return JSON.parse(localStorage.getItem(localStorageBuildsKey) || "[]");
  }
  return [];
}
