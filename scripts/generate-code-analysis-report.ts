import { generateCodeAnalysisReport, parseCliOptions } from "./code-analysis-lib";

const options = parseCliOptions();

generateCodeAnalysisReport(options)
  .then((reportPath) => {
    console.log(`Code analysis report written: ${reportPath}`);
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
