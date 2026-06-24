import { generateDiagnosticProblems, parseProblemBankCliOptions } from "./problem-bank-lib";

generateDiagnosticProblems(parseProblemBankCliOptions())
  .then(() => console.log("generated diagnostic problem drafts generated"))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
