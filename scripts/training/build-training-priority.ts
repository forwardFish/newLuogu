import { buildTrainingPriority, parseTrainingCliOptions } from "./training-lib";

buildTrainingPriority(parseTrainingCliOptions())
  .then(() => console.log("training_priority.json generated"))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
