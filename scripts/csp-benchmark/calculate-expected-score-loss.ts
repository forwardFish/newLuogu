import { calculateExpectedScoreLoss, parseCspBenchmarkCliOptions } from "./csp-benchmark-lib";

calculateExpectedScoreLoss(parseCspBenchmarkCliOptions()).catch((error) => {
  console.error(error);
  process.exit(1);
});
