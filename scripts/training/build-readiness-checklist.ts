import { buildReadinessChecklist, parseTrainingCliOptions } from "./training-lib";

buildReadinessChecklist(parseTrainingCliOptions())
  .then(() => console.log("readiness checklist and report generated"))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
