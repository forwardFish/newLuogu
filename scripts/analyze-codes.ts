import { parseCliOptions, runFullCodeAnalysis } from "./code-analysis-lib";

const options = parseCliOptions();

runFullCodeAnalysis(options)
  .then(() => {
    console.log(`Full code analysis written to: ${options.output}`);
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
