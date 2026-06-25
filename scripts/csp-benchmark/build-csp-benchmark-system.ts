import { buildCspBenchmarkSystem, parseCspBenchmarkCliOptions } from "./csp-benchmark-lib";

buildCspBenchmarkSystem(parseCspBenchmarkCliOptions()).catch((error) => {
  console.error(error);
  process.exit(1);
});
