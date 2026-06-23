import { generateTrainingPlanMarkdown, parseTrainingCliOptions } from "./training-lib";

generateTrainingPlanMarkdown(parseTrainingCliOptions())
  .then((filePath) => console.log(`training plan markdown generated: ${filePath}`))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
