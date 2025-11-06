import Ajv from "ajv";
import type { BuildData } from "./buildData.types";
import buildDataSchema from "$lib/schemas/buildData.schema.json";
const ajv = new Ajv();
const validate = ajv.compile(buildDataSchema);

export function decodeBuild(data: string): BuildData {
  const json: BuildData = JSON.parse(atob(data));
  if (!validate(json)) {
    throw new Error(
      "Invalid build data: \n" +
        JSON.stringify(json, null, 2) +
        "\nErrors:\n" +
        ajv.errorsText(validate.errors, { separator: "\n" }),
    );
  }
  return json;
}

export function encodeBuild(buildData: BuildData): string {
  return btoa(JSON.stringify(buildData));
}
