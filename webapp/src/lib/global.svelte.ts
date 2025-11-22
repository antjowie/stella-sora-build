import { type Database, Element } from "./types/database.types";
import databaseJson from "./database.json";

export const global = $state({
  // Load english database by default. Loads are async so layout (where we set our language) can run
  // too late, meaning the page runs before and no data is there.
  database: databaseJson as Database,
  darkMode: false,
});

export const darkModeBrightness = 0.8;
export const title = "Stella Sora Builds";
// We need a url here because vite keeps throwing errors during build because the
// asset doesn't exist, but og:image expects an absolute URL.
export const url = "https://stellabuilds.pages.dev";
export const localStorageBuildsKey = "builds";

export const potentialRarityColor = ["", "#fbdb66", "#8fe5f7", "#ff9fe3"];
export const potentialRarityColorDesaturated = [
  "",
  "hsl(38, 93%, 83%)",
  "hsl(240, 73%, 86%)",
  "hsl(324, 85%, 86%)",
];

export const elementColor = [
  "",
  "#52c3eb",
  "#e55833",
  "#dd7d54",
  "#91b93c",
  "#efa750",
  "#bb67af",
  "#80807f",
];

export const characterGradeColor = ["", "#d1abf3", "#fff38b"];
export const characterClassColor = ["", "#db6893", "#7d81e3", "#41cbaf"];
// If we want to expose the info, extract it in the Data repo
export const noteIds = [
  90011, 90012, 90013, 90014, 90015, 90016, 90017, 90018, 90019, 90020, 90021,
  90022, 90023,
];
export const noteIdsToElement = [
  [90018, Element.Aqua],
  [90019, Element.Ignis],
  [90020, Element.Ventus],
  [90021, Element.Terra],
  [90022, Element.Lux],
  [90023, Element.Umbra],
];
