import { buildProblemQualityReports, parseProblemQualityCliOptions } from "./quality-lib";

buildProblemQualityReports(parseProblemQualityCliOptions())
  .then(() => console.log("problem quality reports generated"))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
