import { load } from "cheerio";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function scrapeMusicPage() {
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

      // Try to extract additional metadata
      const itemId = $item.attr("data-item-id");

      // Get release type from URL or title
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
          releaseDate: "TBD", // Will try to get this from individual pages
          cover: artworkUrl,
          url: fullUrl || "https://format416.bandcamp.com/",
          duration: "TBD",
          type: type,
        });
      }
    });

    console.log(`Found ${releases.length} releases`);
    releases.forEach((release, idx) => {
      console.log(
        `${idx + 1}. ${release.artist} - ${release.title} (${release.type})`
      );
    });

    return releases;
  } catch (error) {
    console.error("Error scraping music page:", error.message);
    return [];
  }
}

async function downloadAllArtwork(releases) {
  console.log("Downloading artwork...");

  for (let i = 0; i < releases.length; i++) {
    const release = releases[i];
    try {
      // Convert artwork URL to higher resolution
      let artworkUrl = release.cover;
      if (artworkUrl) {
        // Convert to higher res
        artworkUrl = artworkUrl
          .replace("_10.jpg", "_2.jpg")
          .replace("_16.jpg", "_2.jpg");

        const filename = `${release.id}.jpg`;
        await downloadImage(artworkUrl, filename);
        console.log(`✓ Downloaded: ${filename}`);

        // Update the release to use local path
        release.cover = `/artwork/${filename}`;
      }
    } catch (error) {
      console.error(
        `Failed to download artwork for ${release.title}:`,
        error.message
      );
    }

    // Be respectful with requests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

async function main() {
  const releases = await scrapeMusicPage();

  if (releases.length > 0) {
    await downloadAllArtwork(releases);

    // Write to bandcamp.json
    const outputPath = path.join(__dirname, "../src/data/bandcamp.json");
    fs.writeFileSync(outputPath, JSON.stringify(releases, null, 2));

    console.log(
      `\n✓ Successfully scraped ${releases.length} releases and saved to bandcamp.json`
    );
  } else {
    console.log("No releases found!");
  }
}

main().catch(console.error);
