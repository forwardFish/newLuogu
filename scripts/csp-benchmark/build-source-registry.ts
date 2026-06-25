import { buildSourceRegistry, parseCspBenchmarkCliOptions } from "./csp-benchmark-lib";

buildSourceRegistry(parseCspBenchmarkCliOptions()).catch((error) => {
  console.error(error);
  process.exit(1);
});
