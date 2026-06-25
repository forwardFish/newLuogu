import { classifyPastProblems, parseCspBenchmarkCliOptions } from "./csp-benchmark-lib";

classifyPastProblems(parseCspBenchmarkCliOptions()).catch((error) => {
  console.error(error);
  process.exit(1);
});
