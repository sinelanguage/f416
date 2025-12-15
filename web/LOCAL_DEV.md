# Local Development Setup

## Quick Start

Your media files are already in place. Just run:

```bash
npm run dev
```

Then open <http://localhost:5173>

## How It Works

**Without CDN URL configured**, the app uses local paths:

1. `getAssetUrl('/artwork/album-123.jpg')` → `/artwork/album-123.jpg`
2. Vite's dev server serves from `public/` directory
3. Browser requests: `http://localhost:5173/artwork/album-123.jpg`
4. Vite serves: `public/artwork/album-123.jpg`

**With CDN URL configured**, the app uses CDN:

1. `getAssetUrl('/artwork/album-123.jpg')` → `https://cdn.format416.com/artwork/album-123.jpg`
2. Browser requests from your CDN
3. Vite dev server not involved

## Current Setup

✅ **Media files present:**

- `public/artwork/` - 15 album/track covers
- `public/audio/` - 83 audio files

✅ **Config ready:**

- No `VITE_CDN_URL` set → uses local paths
- `src/config.ts` handles path resolution

✅ **Vite configured:**

- Dev server serves `public/` directory
- Production build excludes `public/` (for CDN deployment)

## Testing Local Development

1. **Start dev server:**

   ```bash
   npm run dev
   ```

2. **Open browser:**
   - Visit <http://localhost:5173>
   - Open DevTools → Network tab
   - Play a track
   - You should see requests to:
     - `localhost:5173/artwork/album-*.jpg`
     - `localhost:5173/audio/*.mp3`

3. **Verify playback:**
   - Click any album → should play first track
   - Check banner player shows track info
   - Bottom player shows track title

## Troubleshooting

**Problem: Images not loading**

- Check `public/artwork/` has `.jpg` files
- Check browser console for 404 errors
- Verify `VITE_CDN_URL` is NOT set in `.env`

**Problem: Audio not playing**

- Check `public/audio/` has `.mp3` files
- Check browser console for CORS errors (shouldn't happen locally)
- Try different browser (Chrome works best)

**Problem: 404 on media files**

- Restart dev server (`npm run dev`)
- Clear browser cache
- Check file paths match catalog (`src/data/bandcamp.json`)

## File Structure

```
web/
├── public/              ← Served by Vite dev server
│   ├── artwork/         ← Album covers load from here
│   │   ├── album-2947447909.jpg
│   │   └── ...
│   └── audio/           ← Audio files load from here
│       ├── 1827335907-virtual-isolation.mp3
│       └── ...
├── src/
│   ├── config.ts        ← Path resolution logic
│   └── data/
│       └── bandcamp.json ← References /artwork/... and /audio/...
└── vite.config.ts       ← Serves public/ in dev mode
```

## Next Steps

Once local dev works, see `DEPLOYMENT.md` for CDN setup instructions.
