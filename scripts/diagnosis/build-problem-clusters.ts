import { buildProblemClusters, parseDiagnosisCliOptions } from "./diagnosis-lib";

buildProblemClusters(parseDiagnosisCliOptions())
  .then(() => console.log("problem_clusters.json generated"))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
