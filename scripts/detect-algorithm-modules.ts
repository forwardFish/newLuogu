import { detectAlgorithmModules, parseCliOptions } from "./code-analysis-lib";

const options = parseCliOptions();

detectAlgorithmModules(options)
  .then((modules) => {
    console.log(`Algorithm modules written: ${modules.files.length} files`);
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
