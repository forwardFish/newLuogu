import { buildMockExam, parseTargetTrainingOptions } from "./target-score-training-lib";

buildMockExam(parseTargetTrainingOptions()).catch((error) => {
  console.error(error);
  process.exit(1);
});
