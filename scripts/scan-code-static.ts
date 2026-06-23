import { parseCliOptions, scanCodeStatic } from "./code-analysis-lib";

const options = parseCliOptions();

scanCodeStatic(options)
  .then((metrics) => {
    console.log(`Static metrics written: ${metrics.totalFiles} files, ${metrics.summary.filesWithRisk} risk files`);
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
