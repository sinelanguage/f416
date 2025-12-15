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
      console.log(`  Downloading (attempt ${attempt}/${retries})...`);
      const response = await axios({
        method: "GET",
        url: url,
        responseType: "stream",
        timeout: 120000, // 2 minutes timeout
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

      // Verify file was downloaded
      const stats = fs.statSync(filepath);
      if (stats.size > 0) {
        console.log(`  ✓ Downloaded (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
        return true;
      } else {
        throw new Error("Downloaded file is empty");
      }
    } catch (error) {
      console.error(`  ✗ Attempt ${attempt} failed: ${error.message}`);
      if (attempt < retries) {
        console.log(`  Retrying in ${attempt * 2} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
      }
    }
  }
  return false;
}

async function scrapeTracksFromAlbum(albumUrl) {
  try {
    console.log(`\nScraping tracks from: ${albumUrl}`);
    const response = await axios.get(albumUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });
    const $ = load(response.data);

    const tracks = [];

    // Look for script tag with data-tralbum attribute (contains track info)
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
                  artist: track.artist || tralbumData.artist,
                  duration: track.duration,
                  url: track.file["mp3-128"],
                });
              }
            });
          }
        } catch (e) {
          console.error("Error parsing data-tralbum:", e.message);
        }
      }
    });

    return tracks;
  } catch (error) {
    console.error(`Error scraping ${albumUrl}:`, error.message);
    return [];
  }
}

async function downloadAlbumTracks(albumUrl, albumId, outputDir) {
  const tracks = await scrapeTracksFromAlbum(albumUrl);

  if (tracks.length === 0) {
    console.log(`  No tracks found for album ${albumId}`);
    return [];
  }

  console.log(`  Found ${tracks.length} track(s)`);

  const downloadedTracks = [];

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    const safeTitle = track.title
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase()
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const filename = `${track.trackId}-${safeTitle}.mp3`;
    const filepath = path.join(outputDir, filename);

    // Skip if already downloaded
    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);
      if (stats.size > 0) {
        console.log(`  [${i + 1}/${tracks.length}] ${track.title} (already exists)`);
        downloadedTracks.push({
          ...track,
          filename: filename,
          path: `/audio/${filename}`,
        });
        continue;
      }
    }

    console.log(`  [${i + 1}/${tracks.length}] ${track.title}`);
    const success = await downloadAudio(track.url, filepath);

    if (success) {
      downloadedTracks.push({
        ...track,
        filename: filename,
        path: `/audio/${filename}`,
      });
    }

    // Throttle between downloads
    if (i < tracks.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  return downloadedTracks;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage: node download-audio.js <album-url> [album-id]");
    console.log("\nExample:");
    console.log(
      '  node download-audio.js "https://format416.bandcamp.com/album/doom-scrolling" album-2947447909'
    );
    process.exit(1);
  }

  const albumUrl = args[0];
  const albumId = args[1] || "album-unknown";

  // Ensure audio directory exists
  const outputDir = path.join(__dirname, "../public/audio");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`\n=== Downloading Audio for ${albumId} ===`);
  console.log(`URL: ${albumUrl}`);

  const tracks = await downloadAlbumTracks(albumUrl, albumId, outputDir);

  console.log(`\n=== Summary ===`);
  console.log(`Downloaded ${tracks.length} track(s)`);
  tracks.forEach((track, idx) => {
    console.log(`  ${idx + 1}. ${track.title} - ${track.filename}`);
  });
}

main().catch(console.error);

