import { buildTaskPack, parseProblemBankCliOptions } from "./problem-bank-lib";

buildTaskPack(parseProblemBankCliOptions())
  .then(() => console.log("task_pack_7d generated"))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
