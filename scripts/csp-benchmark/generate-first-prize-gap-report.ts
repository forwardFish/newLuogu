import { generateFirstPrizeGapReport, parseCspBenchmarkCliOptions } from "./csp-benchmark-lib";

generateFirstPrizeGapReport(parseCspBenchmarkCliOptions()).catch((error) => {
  console.error(error);
  process.exit(1);
});
