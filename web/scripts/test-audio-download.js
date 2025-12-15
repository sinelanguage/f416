import { load } from "cheerio";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test with one album - "Doom Scrolling" by Salem
const testAlbumUrl = "https://format416.bandcamp.com/album/doom-scrolling";

async function downloadAudio(url, filename) {
  try {
    console.log(`Downloading audio: ${url}`);
    const response = await axios({
      method: "GET",
      url: url,
      responseType: "stream",
      timeout: 60000,
    });

    const outputDir = path.join(__dirname, "../public/audio");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const writer = fs.createWriteStream(path.join(outputDir, filename));
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  } catch (error) {
    console.error(`Failed to download ${url}:`, error.message);
    throw error;
  }
}

async function scrapeAudioUrls(albumUrl) {
  try {
    console.log(`Scraping audio URLs from: ${albumUrl}`);
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
            console.log(`\nFound ${tralbumData.trackinfo.length} tracks in data-tralbum`);
            
            tralbumData.trackinfo.forEach((track, idx) => {
              if (track.file && track.file["mp3-128"]) {
                const audioUrl = track.file["mp3-128"];
                tracks.push({
                  trackId: track.track_id || track.id,
                  title: track.title,
                  artist: track.artist || tralbumData.artist,
                  duration: track.duration,
                  url: audioUrl,
                });
                console.log(`  ${idx + 1}. ${track.title} - ${audioUrl.substring(0, 80)}...`);
              }
            });
          }
        } catch (e) {
          console.log("Error parsing data-tralbum:", e.message);
        }
      }
    });

    return tracks;
  } catch (error) {
    console.error(`Error scraping ${albumUrl}:`, error.message);
    return [];
  }
}

async function main() {
  console.log("Testing audio download from Bandcamp...\n");

  const tracks = await scrapeAudioUrls(testAlbumUrl);

  if (tracks.length === 0) {
    console.log("\n❌ No tracks found!");
    return;
  }

  console.log(`\n✓ Found ${tracks.length} track(s)`);

  // Try downloading the first track
  const firstTrack = tracks[0];
  const filename = `${firstTrack.trackId}-${firstTrack.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.mp3`;
  
  console.log(`\nAttempting to download: "${firstTrack.title}"`);
  console.log(`URL: ${firstTrack.url.substring(0, 100)}...`);
  
  try {
    await downloadAudio(firstTrack.url, filename);
    console.log(`\n✓ Successfully downloaded: ${filename}`);
    console.log(`   Saved to: public/audio/${filename}`);
    console.log(`   Duration: ${Math.floor(firstTrack.duration)}s`);
  } catch (error) {
    console.log(`\n✗ Failed to download: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Headers:`, error.response.headers);
    }
  }
}

main().catch(console.error);

