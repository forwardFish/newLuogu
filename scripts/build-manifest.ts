import { buildManifest, parseCliOptions } from "./code-analysis-lib";

const options = parseCliOptions();

buildManifest(options)
  .then((manifest) => {
    console.log(`Manifest written: ${manifest.supportedFiles} files, ${manifest.summary.problems} problems`);
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
