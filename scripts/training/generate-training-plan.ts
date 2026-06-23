import { generateTrainingPlan, parseTrainingCliOptions } from "./training-lib";

generateTrainingPlan(parseTrainingCliOptions())
  .then(() => console.log("training_task_plan generated"))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
