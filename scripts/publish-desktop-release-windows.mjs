/**
 * Build (optional) and publish the Windows NSIS installer to R2 (merges latest.json).
 *
 *   node scripts/publish-desktop-release-windows.mjs [--build]
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ARTIFACT_BASENAME,
  createR2Client,
  findNewestWithSuffix,
  loadEnvFiles,
  MANIFEST_KEY,
  mergeAndPutManifest,
  publicBase,
  putFile,
  readAppVersion,
  RELEASES_PREFIX,
  releasesBucket,
  requireEnv,
} from "./lib/r2-releases.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
loadEnvFiles(root);

const TAURI_CONF = join(root, "apps/desktop/src-tauri/tauri.conf.json");
const INSTALLER_KEY = `${RELEASES_PREFIX}/latest/${ARTIFACT_BASENAME}-Windows-Setup.exe`;
const NSIS_DIR = join(root, "apps/desktop/src-tauri/target/release/bundle/nsis");

function buildWindows() {
  requireEnv("TAURI_SIGNING_PRIVATE_KEY", process.env.TAURI_SIGNING_PRIVATE_KEY);
  console.log("Building Windows app…");
  const result = spawnSync("npm", ["run", "release:win", "-w", "@app/desktop"], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
    shell: true,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

async function main() {
  if (process.argv.includes("--build")) buildWindows();

  const exe = findNewestWithSuffix(NSIS_DIR, "-setup.exe");
  if (!exe) {
    console.error("No NSIS .exe in", NSIS_DIR);
    process.exit(1);
  }
  const sigPath = `${exe}.sig`;
  if (!existsSync(sigPath)) {
    console.error("Missing signature:", sigPath);
    process.exit(1);
  }

  const version = readAppVersion(TAURI_CONF);
  const bucket = releasesBucket();
  const base = publicBase();
  const client = createR2Client();
  const signature = readFileSync(sigPath, "utf8").trim();

  await putFile(client, bucket, {
    key: INSTALLER_KEY,
    path: exe,
    contentType: "application/octet-stream",
    disposition: `attachment; filename="${ARTIFACT_BASENAME}-Windows-Setup.exe"`,
  });

  const url = `${base}/${INSTALLER_KEY}`;
  const manifest = await mergeAndPutManifest(client, bucket, {
    version,
    platforms: {
      "windows-x86_64": { signature, url },
    },
  });

  console.log("Done Windows:");
  console.log("  Version:", version);
  console.log("  Installer:", url);
  console.log("  Manifest:", `${base}/${MANIFEST_KEY}`);
  console.log("  Platforms:", Object.keys(manifest.platforms).join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
