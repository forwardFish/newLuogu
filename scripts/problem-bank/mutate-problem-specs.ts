import { mutateProblemSpecs, parseProblemBankCliOptions } from "./problem-bank-lib";

mutateProblemSpecs(parseProblemBankCliOptions())
  .then(() => console.log("mutated_problem_specs.json generated"))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
