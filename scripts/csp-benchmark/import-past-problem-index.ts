import { importPastProblemIndex, parseCspBenchmarkCliOptions } from "./csp-benchmark-lib";

importPastProblemIndex(parseCspBenchmarkCliOptions()).catch((error) => {
  console.error(error);
  process.exit(1);
});
