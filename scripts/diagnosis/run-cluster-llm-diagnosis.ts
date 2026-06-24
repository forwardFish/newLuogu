import { parseDiagnosisCliOptions, runClusterLlmDiagnosis } from "./diagnosis-lib";

runClusterLlmDiagnosis(parseDiagnosisCliOptions())
  .then(() => console.log("cluster_llm_diagnosis.json generated"))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
