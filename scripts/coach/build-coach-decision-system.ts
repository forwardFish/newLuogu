import { buildCoachDecisionSystem, parseCoachCliOptions } from "./coach-lib";

buildCoachDecisionSystem(parseCoachCliOptions())
  .then(() => console.log("coach decision system simulated"))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
