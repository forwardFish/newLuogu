import { buildLlmEvidencePacks, parseDiagnosisCliOptions } from "./diagnosis-lib";

buildLlmEvidencePacks(parseDiagnosisCliOptions())
  .then(() => console.log("llm_evidence_packs.json generated"))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
