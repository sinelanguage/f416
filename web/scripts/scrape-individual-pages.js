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

async function getArtworkFromPage(url) {
  try {
    console.log(`Visiting individual page: ${url}`);
    const response = await axios.get(url);
    const $ = load(response.data);

    // Look for the main album artwork
    const selectors = [
      "#tralbumArt img",
      ".popupImage img",
      ".art img",
      'img[src*="bcbits.com"]',
      ".albumart img",
    ];

    for (const selector of selectors) {
      const img = $(selector).first();
      if (img.length) {
        const src = img.attr("src");
        if (
          src &&
          src.includes("bcbits.com") &&
          !src.includes("blank.gif") &&
          !src.includes("0.gif")
        ) {
          // Convert to higher resolution
          const highResSrc = src
            .replace("_10.jpg", "_2.jpg")
            .replace("_16.jpg", "_2.jpg");
          console.log(`Found artwork: ${highResSrc}`);
          return highResSrc;
        }
      }
    }

    console.log(`No artwork found on page: ${url}`);
    return null;
  } catch (error) {
    console.error(`Error visiting ${url}:`, error.message);
    return null;
  }
}

async function scrapeAllReleasesAndArtwork() {
  try {
    console.log("Scraping Format416 music page...");
    const response = await axios.get("https://format416.bandcamp.com/music");
    const $ = load(response.data);

    const releases = [];

    // First, get all the release info
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

      if (title && artist && fullUrl) {
        releases.push({
          id: itemId || title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          title: title,
          artist: artist,
          releaseDate: "TBD",
          cover: "", // Will be filled in
          url: fullUrl,
          duration: "TBD",
          type: type,
        });
      }
    });

    console.log(`Found ${releases.length} releases`);

    if (releases.length !== 14) {
      console.error(`Expected 14 releases but found ${releases.length}!`);
      return null;
    }

    // Now visit each page to get the artwork
    for (let i = 0; i < releases.length; i++) {
      const release = releases[i];
      console.log(`\n${i + 1}/14: ${release.artist} - ${release.title}`);

      const artworkUrl = await getArtworkFromPage(release.url);

      if (artworkUrl) {
        const filename = `${release.id}.jpg`;
        const success = await downloadImage(artworkUrl, filename);

        if (success) {
          release.cover = `/artwork/${filename}`;
        } else {
          release.cover = artworkUrl; // Keep original URL as fallback
        }
      } else {
        console.log(`⚠️ No artwork found for ${release.title}`);
        release.cover = "https://picsum.photos/seed/" + release.id + "/400/400";
      }

      // Be very respectful with requests
      if (i < releases.length - 1) {
        console.log("Waiting 4 seconds before next page...");
        await new Promise((resolve) => setTimeout(resolve, 4000));
      }
    }

    return releases;
  } catch (error) {
    console.error("Error:", error.message);
    return null;
  }
}

async function main() {
  const releases = await scrapeAllReleasesAndArtwork();

  if (!releases) {
    console.log("Failed to scrape releases!");
    return;
  }

  // Write to bandcamp.json
  const outputPath = path.join(__dirname, "../src/data/bandcamp.json");
  fs.writeFileSync(outputPath, JSON.stringify(releases, null, 2));

  console.log(
    `\n✓ Successfully saved ${releases.length} releases to bandcamp.json`
  );

  // Show final summary
  console.log("\nFinal Summary:");
  releases.forEach((release, idx) => {
    const hasLocalArt = release.cover.startsWith("/artwork/");
    const hasRealArt = release.cover.includes("bcbits.com");
    const status = hasLocalArt
      ? "✓ Local"
      : hasRealArt
      ? "✓ URL"
      : "⚠️ Placeholder";
    console.log(`${idx + 1}. ${release.artist} - ${release.title} ${status}`);
  });
}

main().catch(console.error);
