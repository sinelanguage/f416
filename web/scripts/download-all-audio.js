import { load } from "cheerio";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function downloadAudio(url, filepath, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios({
        method: "GET",
        url: url,
        responseType: "stream",
        timeout: 120000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        },
      });

      const writer = fs.createWriteStream(filepath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      const stats = fs.statSync(filepath);
      if (stats.size > 0) {
        return true;
      }
    } catch (error) {
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
      }
    }
  }
  return false;
}

async function scrapeTracksFromAlbum(albumUrl) {
  try {
    const response = await axios.get(albumUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });
    const $ = load(response.data);

    const tracks = [];

    $('script[data-tralbum]').each((i, el) => {
      const dataAttr = $(el).attr("data-tralbum");
      if (dataAttr) {
        try {
          const tralbumData = JSON.parse(dataAttr);
          if (tralbumData.trackinfo && Array.isArray(tralbumData.trackinfo)) {
            tralbumData.trackinfo.forEach((track) => {
              if (track.file && track.file["mp3-128"]) {
                tracks.push({
                  trackId: track.track_id || track.id,
                  title: track.title,
                  duration: track.duration,
                  url: track.file["mp3-128"],
                });
              }
            });
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    });

    return tracks;
  } catch (error) {
    return [];
  }
}

async function main() {
  console.log("=== Downloading Audio for All Releases ===\n");

  // Load catalog
  const catalogPath = path.join(__dirname, "../src/data/bandcamp.json");
  const releases = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

  // Ensure audio directory exists
  const audioDir = path.join(__dirname, "../public/audio");
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  // Filter to albums/EPs (skip singles/tracks)
  const albumsAndEPs = releases.filter(
    (r) => r.type === "album" || r.type === "ep"
  );

  console.log(`Found ${albumsAndEPs.length} albums/EPs to process\n`);

  let totalTracksDownloaded = 0;
  let totalReleasesProcessed = 0;

  for (let i = 0; i < albumsAndEPs.length; i++) {
    const release = albumsAndEPs[i];
    
    // Skip if it's a single track URL
    if (release.url.includes("/track/")) {
      continue;
    }

    console.log(
      `[${i + 1}/${albumsAndEPs.length}] ${release.artist} - ${release.title}`
    );

    const tracks = await scrapeTracksFromAlbum(release.url);

    if (tracks.length === 0) {
      console.log("  ⚠️  No tracks found\n");
      continue;
    }

    console.log(`  Found ${tracks.length} track(s)`);

    let downloadedCount = 0;

    for (let j = 0; j < tracks.length; j++) {
      const track = tracks[j];
      const safeTitle = track.title
        .replace(/[^a-z0-9]/gi, "-")
        .toLowerCase()
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      const filename = `${track.trackId}-${safeTitle}.mp3`;
      const filepath = path.join(audioDir, filename);

      // Skip if already downloaded
      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        if (stats.size > 0) {
          console.log(`  [${j + 1}/${tracks.length}] ${track.title} (already exists)`);
          downloadedCount++;
          continue;
        }
      }

      console.log(`  [${j + 1}/${tracks.length}] ${track.title}...`);
      const success = await downloadAudio(track.url, filepath);

      if (success) {
        downloadedCount++;
        totalTracksDownloaded++;
      } else {
        console.log(`  ✗ Failed to download`);
      }

      // Throttle between tracks
      if (j < tracks.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    if (downloadedCount > 0) {
      totalReleasesProcessed++;
    }

    console.log(`  ✓ Downloaded ${downloadedCount}/${tracks.length} track(s)\n`);

    // Throttle between releases
    if (i < albumsAndEPs.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  console.log("=== Summary ===");
  console.log(`Processed ${totalReleasesProcessed} release(s)`);
  console.log(`Downloaded ${totalTracksDownloaded} track(s) total`);
}

main().catch(console.error);

