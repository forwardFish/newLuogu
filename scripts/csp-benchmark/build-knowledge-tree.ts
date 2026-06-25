import { buildKnowledgeTree, parseCspBenchmarkCliOptions } from "./csp-benchmark-lib";

buildKnowledgeTree(parseCspBenchmarkCliOptions()).catch((error) => {
  console.error(error);
  process.exit(1);
});
