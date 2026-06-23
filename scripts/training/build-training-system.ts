import { buildTrainingSystem, parseTrainingCliOptions } from "./training-lib";

buildTrainingSystem(parseTrainingCliOptions())
  .then(() => console.log("training system generated"))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
