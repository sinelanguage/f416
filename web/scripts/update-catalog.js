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
      console.log(`Downloading ${filename} (attempt ${attempt}): ${url}`);

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

      console.log(`✓ Successfully downloaded: ${filename}`);
      return true;
    } catch (error) {
      console.error(
        `Attempt ${attempt} failed for ${filename}:`,
        error.message
      );
      if (attempt < retries) {
        console.log(`Retrying in ${attempt * 2} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
      }
    }
  }
  console.error(`✗ Failed to download ${filename} after ${retries} attempts`);
  return false;
}

async function scrapeBandcampReleases() {
  try {
    console.log("Scraping Format416 music page...");
    const response = await axios.get("https://format416.bandcamp.com/music");
    const $ = load(response.data);

    const releases = [];

    // Find all music items in the grid
    $("li[data-item-id]").each((index, element) => {
      const $item = $(element);

      // The entire li content is inside an <a> tag
      const $link = $item.find("a").first();
      const relativeUrl = $link.attr("href");

      // Extract the full text and parse it
      const fullText = $link.text().trim();

      // The text format appears to be "Title\n\n\nArtist"
      const lines = fullText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line);
      const title = lines[0] || "";
      const artist = lines[lines.length - 1] || "";

      // Get artwork
      const artworkImg = $item.find("img").first();
      const artworkUrl = artworkImg.attr("src");

      // Build full URL
      const fullUrl = relativeUrl
        ? `https://format416.bandcamp.com${relativeUrl}`
        : null;

      // Extract item ID
      const itemId = $item.attr("data-item-id");

      // Get release type from URL or title
      let type = "album";
      if (relativeUrl && relativeUrl.includes("/track/")) {
        type = "ep"; // Map "single" to "ep" to match TypeScript type
      } else if (title.toLowerCase().includes("ep")) {
        type = "ep";
      }

      // Only add if we have valid data
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
    return null;
  }
}

function findNewReleases(scrapedReleases, existingReleases) {
  // Create a set of existing URLs and IDs for quick lookup
  const existingUrls = new Set(existingReleases.map((r) => r.url));
  const existingIds = new Set(existingReleases.map((r) => r.id));

  const newReleases = scrapedReleases.filter((release) => {
    // Check if release is new by URL or ID
    return !existingUrls.has(release.url) && !existingIds.has(release.id);
  });

  return newReleases;
}

async function downloadArtworkForReleases(releases) {
  console.log(`\nDownloading artwork for ${releases.length} new release(s)...`);

  let successCount = 0;

  for (let i = 0; i < releases.length; i++) {
    const release = releases[i];
    let artworkUrl = release.cover;

    // Skip if no artwork URL or if it's a placeholder
    if (
      !artworkUrl ||
      artworkUrl.includes("blank.gif") ||
      artworkUrl.includes("/img/0.gif")
    ) {
      console.log(`⚠️  Skipping ${release.title} - no valid artwork URL`);
      continue;
    }

    // Convert to higher resolution if needed
    artworkUrl = artworkUrl
      .replace("_10.jpg", "_2.jpg")
      .replace("_16.jpg", "_2.jpg");

    const filename = `${release.id}.jpg`;
    const success = await downloadImage(artworkUrl, filename);

    if (success) {
      release.cover = `/artwork/${filename}`;
      successCount++;
    } else {
      // Keep original URL as fallback
      console.log(`Using original URL as fallback for ${release.title}`);
    }

    // Throttle between downloads - be very respectful
    if (i < releases.length - 1) {
      console.log("Waiting 3 seconds before next download...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  console.log(
    `\n✓ Successfully downloaded ${successCount}/${releases.length} artworks`
  );
  return releases;
}

async function main() {
  // Read existing catalog
  const catalogPath = path.join(__dirname, "../src/data/bandcamp.json");
  let existingReleases = [];
  
  try {
    const catalogData = fs.readFileSync(catalogPath, "utf8");
    existingReleases = JSON.parse(catalogData);
    console.log(`Loaded ${existingReleases.length} existing releases from catalog`);
  } catch (error) {
    console.log("No existing catalog found, will create new one");
  }

  // Scrape Bandcamp page
  const scrapedReleases = await scrapeBandcampReleases();

  if (!scrapedReleases) {
    console.log("Failed to scrape releases!");
    return;
  }

  // Find new releases
  const newReleases = findNewReleases(scrapedReleases, existingReleases);

  if (newReleases.length === 0) {
    console.log("\n✓ No new releases found. Catalog is up to date!");
    return;
  }

  console.log(`\nFound ${newReleases.length} new release(s):`);
  newReleases.forEach((release, idx) => {
    console.log(`  ${idx + 1}. ${release.artist} - ${release.title} (${release.type})`);
  });

  // Download artwork for new releases
  const releasesWithArtwork = await downloadArtworkForReleases(newReleases);

  // Merge new releases into existing catalog
  const updatedReleases = [...existingReleases, ...releasesWithArtwork];

  // Write updated catalog
  fs.writeFileSync(catalogPath, JSON.stringify(updatedReleases, null, 2));

  console.log(
    `\n✓ Successfully updated catalog with ${releasesWithArtwork.length} new release(s)`
  );
  console.log(`Total releases in catalog: ${updatedReleases.length}`);

  // Show summary
  console.log("\nNew releases added:");
  releasesWithArtwork.forEach((release, idx) => {
    const hasLocalArt = release.cover.startsWith("/artwork/");
    console.log(
      `  ${idx + 1}. ${release.artist} - ${release.title} ${
        hasLocalArt ? "✓" : "⚠️"
      }`
    );
  });
}

main().catch(console.error);

