import { importNoiSyllabus, parseCspBenchmarkCliOptions } from "./csp-benchmark-lib";

importNoiSyllabus(parseCspBenchmarkCliOptions()).catch((error) => {
  console.error(error);
  process.exit(1);
});
