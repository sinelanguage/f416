import { load } from "cheerio";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bandcampData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../src/data/bandcamp.json"), "utf8")
);

async function downloadImage(url, filename) {
  try {
    const response = await axios({
      method: "GET",
      url: url,
      responseType: "stream",
    });

    const writer = fs.createWriteStream(
      path.join(__dirname, "../public/artwork", filename)
    );
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  } catch (error) {
    console.error(`Failed to download ${url}:`, error.message);
  }
}

async function scrapeArtwork(albumUrl, albumId) {
  try {
    console.log(`Scraping artwork for: ${albumUrl}`);
    const response = await axios.get(albumUrl);
    const $ = load(response.data);

    // Look for album artwork - Bandcamp uses various selectors
    let artworkUrl = null;

    // Try different selectors for album artwork
    const selectors = [
      "#tralbumArt img",
      ".popupImage img",
      ".art img",
      'img[src*="bcbits.com"]',
    ];

    for (const selector of selectors) {
      const img = $(selector).first();
      if (img.length) {
        artworkUrl = img.attr("src");
        if (artworkUrl) break;
      }
    }

    if (artworkUrl) {
      // Convert to higher resolution if possible
      artworkUrl = artworkUrl
        .replace("_10.jpg", "_2.jpg")
        .replace("_16.jpg", "_2.jpg");

      const filename = `${albumId}.jpg`;
      await downloadImage(artworkUrl, filename);
      console.log(`✓ Downloaded: ${filename}`);
      return `/artwork/${filename}`;
    } else {
      console.log(`✗ No artwork found for: ${albumUrl}`);
      return null;
    }
  } catch (error) {
    console.error(`Error scraping ${albumUrl}:`, error.message);
    return null;
  }
}

async function main() {
  console.log("Starting artwork download...");

  for (const release of bandcampData) {
    const localPath = await scrapeArtwork(release.url, release.id);
    if (localPath) {
      release.cover = localPath;
    }

    // Add delay to be respectful
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Write updated JSON
  fs.writeFileSync(
    path.join(__dirname, "../src/data/bandcamp.json"),
    JSON.stringify(bandcampData, null, 2)
  );

  console.log("Artwork download complete!");
}

main().catch(console.error);
