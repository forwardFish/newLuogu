import { parseCspBenchmarkCliOptions, selectDiagnosticPastProblems } from "./csp-benchmark-lib";

selectDiagnosticPastProblems(parseCspBenchmarkCliOptions()).catch((error) => {
  console.error(error);
  process.exit(1);
});
