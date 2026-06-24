import { parseDiagnosisCliOptions, propagateClusterDiagnosis } from "./diagnosis-lib";

propagateClusterDiagnosis(parseDiagnosisCliOptions())
  .then(() => console.log("problem_diagnosis.json generated"))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
