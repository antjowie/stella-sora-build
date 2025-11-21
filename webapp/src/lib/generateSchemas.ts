import tjs from "ts-json-schema-generator";
import fs from "fs";

const types = fs.readdirSync("./src/lib/types");

types.forEach((type) => {
  const config = {
    path: `./src/lib/types/${type}`,
    tsconfig: "./tsconfig.json",
    type: "*",
  };

  const schema = tjs.createGenerator(config).createSchema(config.type);
  const schemaString = JSON.stringify(schema, null, 2);
  fs.writeFileSync(
    `./src/lib/schemas/${type.split(".")[0]}.schema.json`,
    schemaString,
  );
});
