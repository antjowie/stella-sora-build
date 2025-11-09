import Ajv from "ajv";
import type { BuildData } from "./buildData.types";
import buildDataSchema from "$lib/schemas/buildData.schema.json";
const ajv = new Ajv();
const check = ajv.compile(buildDataSchema);

export function validate(buildData: BuildData) {
  if (!check(buildData)) {
    throw new Error(
      "Invalid build data: \n" +
        JSON.stringify(buildData, null, 2) +
        "\nErrors:\n" +
        ajv.errorsText(check.errors, { separator: "\n" }),
    );
  }
}

export function decodeBuild(data: string): BuildData {
  const json: BuildData = JSON.parse(atob(data));
  validate(json);
  return json;
}

export function encodeBuild(buildData: BuildData): string {
  return btoa(JSON.stringify(buildData));
}
