import { parseCspBenchmarkCliOptions, validatePastProblemDb } from "./csp-benchmark-lib";

validatePastProblemDb(parseCspBenchmarkCliOptions()).catch((error) => {
  console.error(error);
  process.exit(1);
});
