import type { Database } from "$lib/types/database.types";
import { Language } from "$lib/types/lang.types";
import databaseEn from "$lib/database_en.json";
import { asset } from "$app/paths";

export const global = $state({
  // Load english database by default. Loads are async so layout (where we set our language)
  // can run too late, meaning the page runs before and no data is there.
  database: databaseEn as Database,
  darkMode: false,
  language: Language.EN,
});

export function setLanguage(language: Language) {
  // Load the database based on the selected language
  switch (language) {
    case Language.JP:
    case Language.KR:
    case Language.CN:
    case Language.TW:
      const url = asset(`/databases/database_${language}.json`);
      fetch(url).then(async (res) => {
        const db: Database = await res.json();
        updateLanguage(language, db);
      });
      break;
    default:
      global.database = databaseEn as Database;
      updateLanguage(language, databaseEn);
      break;
  }
}

function updateLanguage(language: Language, database: Database) {
  global.database = database;
  global.language = language;
  localStorage.setItem("language", language);
}
