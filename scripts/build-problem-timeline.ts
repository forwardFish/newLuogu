import { buildProblemTimeline, parseCliOptions } from "./code-analysis-lib";

const options = parseCliOptions();

buildProblemTimeline(options)
  .then((timeline) => {
    console.log(`Problem timeline written: ${timeline.totalProblems} problems`);
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
