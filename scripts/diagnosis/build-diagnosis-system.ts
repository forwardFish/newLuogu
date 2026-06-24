import { buildDiagnosisSystem, parseDiagnosisCliOptions } from "./diagnosis-lib";

buildDiagnosisSystem(parseDiagnosisCliOptions())
  .then(() => console.log("diagnosis system generated"))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
