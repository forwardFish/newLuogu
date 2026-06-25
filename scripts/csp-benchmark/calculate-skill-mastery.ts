import { calculateSkillMastery, parseCspBenchmarkCliOptions } from "./csp-benchmark-lib";

calculateSkillMastery(parseCspBenchmarkCliOptions()).catch((error) => {
  console.error(error);
  process.exit(1);
});
