import { parseTargetTrainingOptions, updateMastery } from "./target-score-training-lib";

updateMastery(parseTargetTrainingOptions()).catch((error) => {
  console.error(error);
  process.exit(1);
});
