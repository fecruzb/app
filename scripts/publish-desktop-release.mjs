/**
 * Build (optional) and publish the macOS desktop installer + updater payload to R2.
 *
 *   node scripts/publish-desktop-release.mjs [--build] [path-to.dmg]
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
const DMG_KEY = `${RELEASES_PREFIX}/latest/AppBase.dmg`;
const INSTALL_SCRIPT_KEY = `${RELEASES_PREFIX}/latest/install-macos.sh`;
const UPDATER_KEY = `${RELEASES_PREFIX}/latest/AppBase.app.tar.gz`;
const INSTALL_SCRIPT_PATH = join(root, "scripts/install-macos.sh");

const UNIVERSAL_DMG_DIR = join(
  root,
  "apps/desktop/src-tauri/target/universal-apple-darwin/release/bundle/dmg",
);
const DEFAULT_DMG_DIR = join(root, "apps/desktop/src-tauri/target/release/bundle/dmg");
const UNIVERSAL_MACOS_DIR = join(
  root,
  "apps/desktop/src-tauri/target/universal-apple-darwin/release/bundle/macos",
);
const DEFAULT_MACOS_DIR = join(root, "apps/desktop/src-tauri/target/release/bundle/macos");

function buildUniversal() {
  requireEnv("TAURI_SIGNING_PRIVATE_KEY", process.env.TAURI_SIGNING_PRIVATE_KEY);
  console.log("Building universal macOS app…");
  const result = spawnSync("npm", ["run", "release:mac:universal", "-w", "@app/desktop"], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--build")) buildUniversal();

  const dmg =
    args.find((a) => !a.startsWith("--")) ??
    findNewestWithSuffix(UNIVERSAL_DMG_DIR, ".dmg") ??
    findNewestWithSuffix(DEFAULT_DMG_DIR, ".dmg");
  if (!dmg || !existsSync(dmg)) {
    console.error("No .dmg found — run with --build or build first.");
    process.exit(1);
  }
  if (!existsSync(INSTALL_SCRIPT_PATH)) {
    console.error("Missing", INSTALL_SCRIPT_PATH);
    process.exit(1);
  }

  const tarball =
    findNewestWithSuffix(UNIVERSAL_MACOS_DIR, ".app.tar.gz") ??
    findNewestWithSuffix(DEFAULT_MACOS_DIR, ".app.tar.gz");
  if (!tarball) {
    console.error("No .app.tar.gz found (createUpdaterArtifacts must be true).");
    process.exit(1);
  }
  const sigPath = `${tarball}.sig`;
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
    key: DMG_KEY,
    path: dmg,
    contentType: "application/x-apple-diskimage",
    disposition: 'attachment; filename="AppBase.dmg"',
  });
  await putFile(client, bucket, {
    key: INSTALL_SCRIPT_KEY,
    path: INSTALL_SCRIPT_PATH,
    contentType: "text/x-shellscript; charset=utf-8",
    disposition: 'inline; filename="install-macos.sh"',
  });
  await putFile(client, bucket, {
    key: UPDATER_KEY,
    path: tarball,
    contentType: "application/gzip",
    disposition: 'attachment; filename="AppBase.app.tar.gz"',
  });

  const updaterUrl = `${base}/${UPDATER_KEY}`;
  const platform = { signature, url: updaterUrl };
  const manifest = await mergeAndPutManifest(client, bucket, {
    version,
    platforms: {
      "darwin-aarch64": platform,
      "darwin-x86_64": platform,
    },
  });

  console.log("Done macOS:");
  console.log("  Version:", version);
  console.log("  DMG:", `${base}/${DMG_KEY}`);
  console.log("  Manifest:", `${base}/${MANIFEST_KEY}`);
  console.log("  Platforms:", Object.keys(manifest.platforms).join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
