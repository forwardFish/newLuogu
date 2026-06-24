import { buildCspSProblemMap, parseProblemBankCliOptions } from "./problem-bank-lib";

buildCspSProblemMap(parseProblemBankCliOptions())
  .then(() => console.log("csp_s_problem_map.json generated"))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
