/**
 * Compress all MP3 files in public/music/ that haven't been compressed yet.
 * Compressed files get a ".compressed" sidecar marker to skip re-compression.
 *
 * Usage: node scripts/compress-music.js
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const MUSIC_DIR = path.join(__dirname, "..", "public", "music");
const MARKER_EXT = ".compressed";

function getFfmpegPath() {
  // Try system ffmpeg first
  try {
    return execSync("which ffmpeg").toString().trim();
  } catch {
    // Try npm binary
    try {
      const installer = require("@ffmpeg-installer/linux-x64");
      return installer.path;
    } catch {
      return null;
    }
  }
}

function main() {
  const ffmpeg = getFfmpegPath();
  if (!ffmpeg) {
    console.error("❌ ffmpeg not found. Install it and try again.");
    process.exit(1);
  }

  if (!fs.existsSync(MUSIC_DIR)) {
    console.log("No music directory found.");
    return;
  }

  const files = fs.readdirSync(MUSIC_DIR).filter((f) => f.endsWith(".mp3"));
  let compressed = 0;
  let skipped = 0;

  for (const file of files) {
    const filePath = path.join(MUSIC_DIR, file);
    const markerPath = filePath + MARKER_EXT;

    // Skip already compressed files
    if (fs.existsSync(markerPath)) {
      skipped++;
      continue;
    }

    const originalSize = fs.statSync(filePath).size;
    const tmpFile = filePath + ".tmp.mp3";

    console.log(`Compressing ${file}...`);

    try {
      execSync(
        `"${ffmpeg}" -i "${filePath}" -codec:a libmp3lame -b:a 128k -q:a 2 "${tmpFile}" -y`,
        { stdio: "pipe", timeout: 120000 }
      );

      // Replace original with compressed
      fs.renameSync(tmpFile, filePath);
      // Write marker
      fs.writeFileSync(markerPath, "");

      const newSize = fs.statSync(filePath).size;
      const saved = ((1 - newSize / originalSize) * 100).toFixed(0);
      console.log(`  ${(originalSize / 1024 / 1024).toFixed(1)}MB → ${(newSize / 1024 / 1024).toFixed(1)}MB (${saved}% saved)`);
      compressed++;
    } catch (err) {
      console.error(`  Failed: ${err.message}`);
      // Clean up temp file
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    }
  }

  console.log(`\nDone: ${compressed} compressed, ${skipped} already done.`);
}

main();
