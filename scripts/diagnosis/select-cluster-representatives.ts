import { parseDiagnosisCliOptions, selectClusterRepresentatives } from "./diagnosis-lib";

selectClusterRepresentatives(parseDiagnosisCliOptions())
  .then(() => console.log("cluster_representatives.json generated"))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
