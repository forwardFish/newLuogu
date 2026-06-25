import { buildGoalScorePlan, parseTargetTrainingOptions } from "./target-score-training-lib";

buildGoalScorePlan(parseTargetTrainingOptions()).catch((error) => {
  console.error(error);
  process.exit(1);
});
