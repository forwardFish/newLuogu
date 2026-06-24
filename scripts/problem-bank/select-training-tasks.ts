import { parseProblemBankCliOptions, selectTrainingTasks } from "./problem-bank-lib";

selectTrainingTasks(parseProblemBankCliOptions())
  .then(() => console.log("selected_training_tasks.json generated"))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
