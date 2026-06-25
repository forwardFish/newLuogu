import { buildTargetScoreTrainingSystem, parseTargetTrainingOptions } from "./target-score-training-lib";

buildTargetScoreTrainingSystem(parseTargetTrainingOptions()).catch((error) => {
  console.error(error);
  process.exit(1);
});
