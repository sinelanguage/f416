import { load } from "cheerio";
import axios from "axios";

async function detailedDebug() {
  try {
    console.log("Fetching Format416 music page...");
    const response = await axios.get("https://format416.bandcamp.com/music");
    const $ = load(response.data);

    console.log("=== ANALYZING ALL 14 RELEASES ===\n");

    $("li[data-item-id]").each((index, element) => {
      const $item = $(element);

      console.log(`--- RELEASE ${index + 1} ---`);

      // Get basic info
      const $link = $item.find("a").first();
      const relativeUrl = $link.attr("href");
      const fullText = $link.text().trim();
      const lines = fullText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line);
      const title = lines[0] || "";
      const artist = lines[lines.length - 1] || "";

      console.log(`Title: ${title}`);
      console.log(`Artist: ${artist}`);
      console.log(`URL: ${relativeUrl}`);

      // Look for ALL images in this item
      const images = $item.find("img");
      console.log(`Found ${images.length} images:`);

      images.each((imgIndex, img) => {
        const $img = $(img);
        const src = $img.attr("src");
        const alt = $img.attr("alt");
        const className = $img.attr("class");
        const style = $img.attr("style");
        const dataSrc = $img.attr("data-src");
        const dataBg = $img.attr("data-bg");

        console.log(`  Image ${imgIndex + 1}:`);
        console.log(`    src: ${src}`);
        console.log(`    alt: ${alt}`);
        console.log(`    class: ${className}`);
        console.log(`    style: ${style}`);
        console.log(`    data-src: ${dataSrc}`);
        console.log(`    data-bg: ${dataBg}`);
      });

      // Look for any data attributes that might contain artwork URLs
      const itemDataAttrs = element.attribs;
      console.log("Item data attributes:");
      Object.keys(itemDataAttrs).forEach((attr) => {
        if (attr.startsWith("data-")) {
          console.log(`  ${attr}: ${itemDataAttrs[attr]}`);
        }
      });

      // Look for any background-image styles
      const artDiv = $item.find(".art").first();
      if (artDiv.length) {
        const artStyle = artDiv.attr("style");
        const artClass = artDiv.attr("class");
        const artDataAttrs = artDiv.get(0).attribs;

        console.log("Art div attributes:");
        console.log(`  style: ${artStyle}`);
        console.log(`  class: ${artClass}`);
        Object.keys(artDataAttrs).forEach((attr) => {
          if (attr.startsWith("data-")) {
            console.log(`  ${attr}: ${artDataAttrs[attr]}`);
          }
        });
      }

      console.log("\n");
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
}

detailedDebug();
