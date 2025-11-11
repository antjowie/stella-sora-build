import Ajv from "ajv";
import type { BuildData } from "./buildData.types";
import buildDataSchema from "$lib/schemas/buildData.schema.json";
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
      "Invalid build data: \n" +
        buildData +
        "\nErrors:\n" +
        ajv.errorsText(ajvValidate.errors, { separator: "\n" }),
    );
  }
}

export function decodeBuild(data: string): BuildData {
  try {
    const padded = data.padEnd(
      data.length + ((4 - (data.length % 4)) % 4),
      "=",
    );
    const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
    const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const decoded = new TextDecoder().decode(binary);
    const build: BuildData = JSON.parse(decoded);
    validate(build);
    return build;
  } catch (e) {
    throw new Error("Invalid build data");
  }
}

export function encodeBuild(buildData: BuildData): string {
  validate(buildData);
  const json = JSON.stringify(buildData);
  const utf8Bytes = new TextEncoder().encode(json);
  const base64 = btoa(String.fromCharCode(...utf8Bytes));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
