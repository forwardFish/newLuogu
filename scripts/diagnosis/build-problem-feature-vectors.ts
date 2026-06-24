import { buildProblemFeatureVectors, parseDiagnosisCliOptions } from "./diagnosis-lib";

buildProblemFeatureVectors(parseDiagnosisCliOptions())
  .then(() => console.log("problem_feature_vectors.json generated"))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
