import { load } from "cheerio";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
            tralbumData.trackinfo.forEach((track, index) => {
              if (track.file && track.file["mp3-128"]) {
                const safeTitle = track.title
                  .replace(/[^a-z0-9]/gi, "-")
                  .toLowerCase()
                  .replace(/-+/g, "-")
                  .replace(/^-|-$/g, "");
                const filename = `${track.track_id || track.id}-${safeTitle}.mp3`;
                
                tracks.push({
                  id: track.track_id || track.id,
                  title: track.title,
                  duration: track.duration,
                  path: `/audio/${filename}`,
                  trackNumber: index + 1,
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
  console.log("=== Updating Catalog with Tracks ===\n");

  const catalogPath = path.join(__dirname, "../src/data/bandcamp.json");
  const releases = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

  console.log(`Processing ${releases.length} releases...\n`);

  for (let i = 0; i < releases.length; i++) {
    const release = releases[i];
    
    // Skip singles/tracks
    if (release.url.includes("/track/")) {
      continue;
    }

    // Skip if already has tracks
    if (release.tracks && release.tracks.length > 0) {
      console.log(`[${i + 1}/${releases.length}] ${release.title} - already has tracks`);
      continue;
    }

    console.log(`[${i + 1}/${releases.length}] ${release.artist} - ${release.title}...`);
    const tracks = await scrapeTracksFromAlbum(release.url);

    if (tracks.length > 0) {
      release.tracks = tracks;
      console.log(`  ✓ Added ${tracks.length} track(s)`);
    } else {
      console.log(`  ⚠️  No tracks found`);
    }

    // Throttle between requests
    if (i < releases.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // Write updated catalog
  fs.writeFileSync(catalogPath, JSON.stringify(releases, null, 2));

  console.log(`\n=== Summary ===`);
  const releasesWithTracks = releases.filter((r) => r.tracks && r.tracks.length > 0);
  console.log(`✓ Updated ${releasesWithTracks.length} release(s) with tracks`);
  console.log(`✓ Catalog saved to: ${catalogPath}`);
}

main().catch(console.error);

