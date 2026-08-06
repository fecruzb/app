/**
 * Build (optional) and publish the Linux AppImage to R2 (merges latest.json).
 *
 *   node scripts/publish-desktop-release-linux.mjs [--build]
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
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
const APPIMAGE_KEY = `${RELEASES_PREFIX}/latest/AppBase.AppImage`;
const APPIMAGE_DIR = join(root, "apps/desktop/src-tauri/target/release/bundle/appimage");

function buildLinux() {
  requireEnv("TAURI_SIGNING_PRIVATE_KEY", process.env.TAURI_SIGNING_PRIVATE_KEY);
  console.log("Building Linux AppImage…");
  const result = spawnSync("npm", ["run", "release:linux", "-w", "@app/desktop"], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

async function main() {
  if (process.argv.includes("--build")) buildLinux();

  const appImage = findNewestWithSuffix(APPIMAGE_DIR, ".AppImage");
  if (!appImage) {
    console.error("No .AppImage in", APPIMAGE_DIR);
    process.exit(1);
  }
  const sigPath = `${appImage}.sig`;
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
    key: APPIMAGE_KEY,
    path: appImage,
    contentType: "application/octet-stream",
    disposition: 'attachment; filename="AppBase.AppImage"',
  });

  const url = `${base}/${APPIMAGE_KEY}`;
  const manifest = await mergeAndPutManifest(client, bucket, {
    version,
    platforms: {
      "linux-x86_64": { signature, url },
    },
  });

  console.log("Done Linux:");
  console.log("  Version:", version);
  console.log("  AppImage:", url);
  console.log("  Manifest:", `${base}/${MANIFEST_KEY}`);
  console.log("  Platforms:", Object.keys(manifest.platforms).join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
