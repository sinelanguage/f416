import { load } from "cheerio";
import axios from "axios";

async function debugScrape() {
  try {
    console.log("Fetching Format416 music page...");
    const response = await axios.get("https://format416.bandcamp.com/music");
    const $ = load(response.data);

    console.log("Page title:", $("title").text());

    // Look for various possible selectors
    const selectors = [
      "li[data-item-id]",
      ".music-grid li",
      ".music-grid-item",
      ".item-container",
      ".track",
      ".album",
      "li.music-grid-item",
      "ol li",
      "ul li",
      ".discography li",
      "[data-item-id]",
    ];

    selectors.forEach((selector) => {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(
          `\nFound ${elements.length} elements with selector: ${selector}`
        );
        elements.slice(0, 3).each((i, el) => {
          const $el = $(el);
          console.log(`  Item ${i + 1}:`);
          console.log(`    HTML: ${$el.html()?.substring(0, 200)}...`);
        });
      }
    });

    // Look for any images that might be album artwork
    const images = $("img");
    console.log(`\nFound ${images.length} images total`);
    images.slice(0, 10).each((i, img) => {
      const $img = $(img);
      const src = $img.attr("src");
      const alt = $img.attr("alt");
      if (src && (src.includes("bcbits") || src.includes("bandcamp"))) {
        console.log(`  Image ${i + 1}: ${src} (alt: ${alt})`);
      }
    });

    // Look for links that might be to tracks/albums
    const links = $('a[href*="/album/"], a[href*="/track/"]');
    console.log(`\nFound ${links.length} music links`);
    links.slice(0, 10).each((i, link) => {
      const $link = $(link);
      const href = $link.attr("href");
      const text = $link.text().trim();
      console.log(`  Link ${i + 1}: ${href} (text: ${text})`);
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
}

debugScrape();
