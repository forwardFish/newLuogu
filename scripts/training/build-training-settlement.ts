import { buildTrainingSettlement, parseTargetTrainingOptions } from "./target-score-training-lib";

buildTrainingSettlement(parseTargetTrainingOptions()).catch((error) => {
  console.error(error);
  process.exit(1);
});
