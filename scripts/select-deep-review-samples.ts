import {
  buildCspRiskProfile,
  buildErrorPatternCandidates,
  parseCliOptions,
  selectDeepReviewSamples,
} from "./code-analysis-lib";

const options = parseCliOptions();

Promise.all([
  buildErrorPatternCandidates(options),
  selectDeepReviewSamples(options),
  buildCspRiskProfile(options),
])
  .then(() => {
    console.log("Deep review samples, error candidates, and CSP risk profile written");
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
