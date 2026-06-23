import { buildTrainingProfile, parseTrainingCliOptions } from "./training-lib";

buildTrainingProfile(parseTrainingCliOptions())
  .then(() => console.log("training_profile.json generated"))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
