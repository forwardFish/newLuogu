import { buildProblemLadders, parseTargetTrainingOptions } from "./target-score-training-lib";

buildProblemLadders(parseTargetTrainingOptions()).catch((error) => {
  console.error(error);
  process.exit(1);
});
