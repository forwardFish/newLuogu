import { generateWeeklyReview, parseTrainingCliOptions } from "./training-lib";

generateWeeklyReview(parseTrainingCliOptions())
  .then((filePath) => console.log(`weekly review generated: ${filePath}`))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
