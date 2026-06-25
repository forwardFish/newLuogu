import { mapStudentEvidenceToSkills, parseCspBenchmarkCliOptions } from "./csp-benchmark-lib";

mapStudentEvidenceToSkills(parseCspBenchmarkCliOptions()).catch((error) => {
  console.error(error);
  process.exit(1);
});
