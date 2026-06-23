import { parseTrainingCliOptions, verifyTrainingLoop } from "./training-lib";

verifyTrainingLoop(parseTrainingCliOptions())
  .then(() => console.log("training_loop_verification.json generated"))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
