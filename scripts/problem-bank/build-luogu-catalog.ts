import { buildLuoguCatalog, parseProblemBankCliOptions } from "./problem-bank-lib";

buildLuoguCatalog(parseProblemBankCliOptions())
  .then(() => console.log("luogu_problem_catalog.json generated"))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
