import { buildPastProblemDb, parseCspBenchmarkCliOptions } from "./csp-benchmark-lib";

buildPastProblemDb(parseCspBenchmarkCliOptions()).catch((error) => {
  console.error(error);
  process.exit(1);
});
