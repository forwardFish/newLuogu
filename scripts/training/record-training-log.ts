import { parseTargetTrainingOptions, recordTrainingLog } from "./target-score-training-lib";

recordTrainingLog(parseTargetTrainingOptions(), process.argv.slice(2)).catch((error) => {
  console.error(error);
  process.exit(1);
});
