import { generateDailyTraining, parseTargetTrainingOptions } from "./target-score-training-lib";

generateDailyTraining(parseTargetTrainingOptions()).catch((error) => {
  console.error(error);
  process.exit(1);
});
