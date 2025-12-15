import { load } from "cheerio";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function downloadImage(url, filename, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios({
        method: "GET",
        url: url,
        responseType: "stream",
        timeout: 30000,
      });

      const writer = fs.createWriteStream(
        path.join(__dirname, "../public/artwork", filename)
      );
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      return true;
    } catch (error) {
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
      }
    }
  }
  return false;
}

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

async function scrapeBandcampReleases() {
  try {
    console.log("Scraping Format416 music page...");
    const response = await axios.get("https://format416.bandcamp.com/music");
    const $ = load(response.data);

    const releases = [];

    $("li[data-item-id]").each((index, element) => {
      const $item = $(element);
      const $link = $item.find("a").first();
      const relativeUrl = $link.attr("href");

      const fullText = $link.text().trim();
      const lines = fullText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line);
      const title = lines[0] || "";
      const artist = lines[lines.length - 1] || "";

      const artworkImg = $item.find("img").first();
      const artworkUrl = artworkImg.attr("src");

      const fullUrl = relativeUrl
        ? `https://format416.bandcamp.com${relativeUrl}`
        : null;

      const itemId = $item.attr("data-item-id");

      let type = "album";
      if (relativeUrl && relativeUrl.includes("/track/")) {
        type = "single";
      } else if (title.toLowerCase().includes("ep")) {
        type = "ep";
      }

      if (title && artist && artworkUrl) {
        releases.push({
          id: itemId || title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          title: title,
          artist: artist,
          releaseDate: "TBD",
          cover: artworkUrl,
          url: fullUrl || "https://format416.bandcamp.com/",
          duration: "TBD",
          type: type,
        });
      }
    });

    console.log(`Found ${releases.length} releases on Bandcamp`);
    return releases;
  } catch (error) {
    console.error("Error scraping music page:", error.message);
    return [];
  }
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

async function downloadReleaseArtwork(release) {
  let artworkUrl = release.cover;

  if (
    !artworkUrl ||
    artworkUrl.includes("blank.gif") ||
    artworkUrl.includes("/img/0.gif")
  ) {
    return null;
  }

  artworkUrl = artworkUrl.replace("_10.jpg", "_2.jpg").replace("_16.jpg", "_2.jpg");

  const filename = `${release.id}.jpg`;
  const success = await downloadImage(artworkUrl, filename);

  if (success) {
    return `/artwork/${filename}`;
  }
  return null;
}

async function downloadReleaseAudio(release, outputDir) {
  const tracks = await scrapeTracksFromAlbum(release.url);

  if (tracks.length === 0) {
    return [];
  }

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

    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);
      if (stats.size > 0) {
        downloadedTracks.push({
          ...track,
          filename: filename,
          path: `/audio/${filename}`,
        });
        continue;
      }
    }

    const success = await downloadAudio(track.url, filepath);

    if (success) {
      downloadedTracks.push({
        ...track,
        filename: filename,
        path: `/audio/${filename}`,
      });
    }

    if (i < tracks.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  return downloadedTracks;
}

async function main() {
  console.log("=== Format416 Catalog Update ===\n");

  // Ensure directories exist
  const artworkDir = path.join(__dirname, "../public/artwork");
  const audioDir = path.join(__dirname, "../public/audio");
  if (!fs.existsSync(artworkDir)) {
    fs.mkdirSync(artworkDir, { recursive: true });
  }
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  // Load existing catalog
  const catalogPath = path.join(__dirname, "../src/data/bandcamp.json");
  let existingReleases = [];
  if (fs.existsSync(catalogPath)) {
    existingReleases = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
    console.log(`Loaded ${existingReleases.length} existing releases from catalog\n`);
  }

  // Scrape Bandcamp for all releases
  const scrapedReleases = await scrapeBandcampReleases();

  if (scrapedReleases.length === 0) {
    console.log("No releases found on Bandcamp!");
    return;
  }

  // Find new releases
  const existingIds = new Set(existingReleases.map((r) => r.id));
  const newReleases = scrapedReleases.filter((r) => !existingIds.has(r.id));

  console.log(`Found ${newReleases.length} new release(s):`);
  newReleases.forEach((r, idx) => {
    console.log(`  ${idx + 1}. ${r.artist} - ${r.title} (${r.id})`);
  });

  if (newReleases.length === 0) {
    console.log("\n✓ Catalog is up to date!");
    return;
  }

  // Process new releases
  console.log("\n=== Processing New Releases ===\n");

  for (let i = 0; i < newReleases.length; i++) {
    const release = newReleases[i];
    console.log(`[${i + 1}/${newReleases.length}] ${release.artist} - ${release.title}`);

    // Download artwork
    console.log("  Downloading artwork...");
    const artworkPath = await downloadReleaseArtwork(release);
    if (artworkPath) {
      release.cover = artworkPath;
      console.log(`  ✓ Artwork: ${artworkPath}`);
    } else {
      console.log("  ⚠️  Artwork download failed, using original URL");
    }

    // Download audio (only for albums/EPs, not singles)
    if (release.type !== "single" && !release.url.includes("/track/")) {
      console.log("  Downloading audio tracks...");
      const tracks = await downloadReleaseAudio(release, audioDir);
      if (tracks.length > 0) {
        console.log(`  ✓ Downloaded ${tracks.length} track(s)`);
        // Store track info in release (optional - you can extend the schema)
        release.tracks = tracks.map((t) => ({
          id: t.trackId,
          title: t.title,
          duration: t.duration,
          path: t.path,
        }));
      }
    }

    // Throttle between releases
    if (i < newReleases.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  // Merge with existing releases
  const updatedReleases = [...existingReleases, ...newReleases];

  // Write updated catalog
  fs.writeFileSync(catalogPath, JSON.stringify(updatedReleases, null, 2));

  console.log(`\n=== Summary ===`);
  console.log(`✓ Added ${newReleases.length} new release(s)`);
  console.log(`✓ Total releases in catalog: ${updatedReleases.length}`);
  console.log(`✓ Catalog saved to: ${catalogPath}`);
}

main().catch(console.error);

