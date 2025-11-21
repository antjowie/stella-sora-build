import { it, describe, expect } from "vitest";
import fs from "fs/promises";
import { validate } from "./build";
import type { BuildData } from "./types/buildData.types";

describe.concurrent("loading builds", async () => {
  // Get all builds json
  for (const fileName of await fs.readdir("tests/builds")) {
    it(`test ${fileName}`, async () => {
      const builds: BuildData[] = JSON.parse(
        await fs.readFile(`tests/builds/${fileName}`, "utf-8"),
      );

      const isBad = fileName.search("bad") >= 0;
      let error = undefined;
      for (const build of builds) {
        if (isBad) {
          try {
            validate(build);
          } catch (e) {
            error = e;
          }
        } else {
          expect(() => validate(build)).not.toThrow();
        }
      }

      if (isBad) {
        expect(error).toBeDefined();
      }
    });
  }
});
