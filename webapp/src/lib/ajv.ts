import Ajv from "ajv";
export const ajv = new Ajv({
  strict: true,
  strictTypes: true,
  strictTuples: true,
  allowUnionTypes: true,
});
