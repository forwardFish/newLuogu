import { buildProblemEngine, parseProblemBankCliOptions } from "./problem-bank-lib";

buildProblemEngine(parseProblemBankCliOptions())
  .then(() => console.log("problem selection and generation engine generated"))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
