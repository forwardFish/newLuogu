import { buildExplanations, parseTargetTrainingOptions } from "./target-score-training-lib";

buildExplanations(parseTargetTrainingOptions()).catch((error) => {
  console.error(error);
  process.exit(1);
});
