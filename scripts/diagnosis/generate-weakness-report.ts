import {
  generateTargetedTrainingPlan,
  generateWeaknessReport,
  generateWeaknessSummary,
  parseDiagnosisCliOptions,
} from "./diagnosis-lib";

const options = parseDiagnosisCliOptions();

Promise.all([
  generateWeaknessSummary(options),
  generateWeaknessReport(options),
  generateTargetedTrainingPlan(options),
])
  .then(() => console.log("weakness summary, report, and targeted plan generated"))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
