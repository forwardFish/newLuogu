import { classifyProblemPatterns, parseDiagnosisCliOptions } from "./diagnosis-lib";

classifyProblemPatterns(parseDiagnosisCliOptions())
  .then(() => console.log("problem_pattern_tags.json generated"))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
