# Format416 Web App

A music catalog and player for Format416 records.

## Development

```bash
npm install
npm run dev
```

## Building for Production

The app is designed to serve all media (audio and artwork) from a CDN. The build process excludes the `public/` directory to keep the bundle size small.

### Environment Variables

Create a `.env.production` file:

```env
VITE_CDN_URL=https://your-cdn-domain.com
```

### Build

```bash
npm run build
```

The `dist/` folder will contain only the app code (HTML, CSS, JS), without media files.

### CDN Setup

Upload the contents of `public/artwork/` and `public/audio/` to your CDN, maintaining the directory structure:

```
CDN_ROOT/
├── artwork/
│   ├── album-*.jpg
│   └── track-*.jpg
└── audio/
    └── *.mp3
```

The app will automatically request media from:

- `${VITE_CDN_URL}/artwork/album-*.jpg`
- `${VITE_CDN_URL}/audio/*.mp3`

### Local Development

For local development without a CDN, leave `VITE_CDN_URL` empty. The app will load media from the local `public/` directory via Vite's dev server.

## Updating the Catalog

### Add New Releases

```bash
# Scrape new releases from Bandcamp, download artwork and audio
node scripts/update-catalog.js

# Or download audio for all existing releases
node scripts/download-all-audio.js

# Update catalog with track information
node scripts/update-catalog-with-tracks.js
```

### Manual Update

1. Add release entry to `src/data/bandcamp.json`
2. Download artwork to `public/artwork/`
3. Download audio to `public/audio/`
4. Run `node scripts/update-catalog-with-tracks.js` to populate track data

## Project Structure

```
web/
├── src/
│   ├── App.tsx          # Main app component
│   ├── config.ts        # CDN configuration
│   └── data/
│       └── bandcamp.json # Catalog data
├── public/
│   ├── artwork/         # Album/track artwork (not included in build)
│   └── audio/          # Audio files (not included in build)
└── scripts/            # Catalog management scripts
```
