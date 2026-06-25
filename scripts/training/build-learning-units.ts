import { buildLearningUnits, parseTargetTrainingOptions } from "./target-score-training-lib";

buildLearningUnits(parseTargetTrainingOptions()).catch((error) => {
  console.error(error);
  process.exit(1);
});
