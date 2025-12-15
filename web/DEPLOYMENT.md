# Deployment Guide

## Local Development (No CDN)

For local development, media files are served directly from the `public/` directory by Vite's dev server.

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Access the app:**
   - Open http://localhost:5173
   - Media loads from `public/artwork/` and `public/audio/`
   - No CDN configuration needed

The app automatically uses local paths when `VITE_CDN_URL` is not set.

---

## Production Deployment with CDN

### Step 1: Choose a CDN Provider

Recommended options:

**Option A: Cloudflare R2 (Recommended - S3-compatible, free tier)**
- Free: 10GB storage, 10 million reads/month
- Fast global edge network
- No egress fees

**Option B: AWS S3 + CloudFront**
- Industry standard
- Pay-as-you-go pricing
- Good for high traffic

**Option C: Vercel Blob Storage**
- Simple if already using Vercel
- Integrated with Vercel deployments

**Option D: BunnyCDN**
- Very affordable
- Good performance
- Easy setup

---

### Step 2: Set Up Your CDN

#### Option A: Cloudflare R2 (Detailed)

1. **Create R2 Bucket:**
   ```
   - Go to Cloudflare Dashboard → R2
   - Click "Create bucket"
   - Name: format416-media
   - Location: Automatic
   ```

2. **Enable Public Access:**
   ```
   - Go to bucket Settings
   - Under "Public access" → Click "Allow Access"
   - Or connect a custom domain via R2.dev subdomain
   ```

3. **Upload Media:**
   ```bash
   # Install Wrangler CLI
   npm install -g wrangler
   
   # Login to Cloudflare
   wrangler login
   
   # Upload artwork
   wrangler r2 object put format416-media/artwork/album-2947447909.jpg \
     --file=public/artwork/album-2947447909.jpg
   
   # Or use rclone for batch upload (recommended)
   # Configure rclone for Cloudflare R2, then:
   rclone copy public/artwork/ r2:format416-media/artwork/
   rclone copy public/audio/ r2:format416-media/audio/
   ```

4. **Get Your CDN URL:**
   - Your R2 public URL will be: `https://pub-xxxxx.r2.dev`
   - Or use custom domain: `https://cdn.format416.com`

#### Option B: AWS S3 + CloudFront

1. **Create S3 Bucket:**
   ```bash
   aws s3 mb s3://format416-media
   aws s3 sync public/artwork/ s3://format416-media/artwork/
   aws s3 sync public/audio/ s3://format416-media/audio/
   ```

2. **Set Bucket Policy (public read):**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Sid": "PublicReadGetObject",
       "Effect": "Allow",
       "Principal": "*",
       "Action": "s3:GetObject",
       "Resource": "arn:aws:s3:::format416-media/*"
     }]
   }
   ```

3. **Create CloudFront Distribution:**
   - Origin: Your S3 bucket
   - Cache policy: CachingOptimized
   - Get CloudFront URL: `https://dxxxxx.cloudfront.net`

#### Option C: Vercel Blob

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Upload files:**
   ```bash
   # Upload via Vercel Blob upload API or dashboard
   # See: https://vercel.com/docs/storage/vercel-blob
   ```

---

### Step 3: Configure Your App

1. **Create `.env.production` file:**
   ```env
   VITE_CDN_URL=https://pub-xxxxx.r2.dev
   ```
   Replace with your actual CDN URL.

2. **Build for production:**
   ```bash
   npm run build
   ```

3. **Verify build size:**
   ```bash
   du -sh dist/
   # Should be ~300KB (without media)
   ```

---

### Step 4: Deploy Your App

#### Deploy to Vercel:
```bash
vercel --prod
```

#### Deploy to Netlify:
```bash
# Via Netlify CLI
netlify deploy --prod --dir=dist

# Or connect GitHub repo in Netlify dashboard
# Build command: npm run build
# Publish directory: dist
# Environment variables: VITE_CDN_URL=https://your-cdn-url
```

#### Deploy to Any Static Host:
Just upload the `dist/` folder contents. Make sure to set the `VITE_CDN_URL` environment variable during build.

---

### Step 5: Verify Everything Works

1. **Test CDN URLs:**
   ```bash
   # Test artwork
   curl -I https://your-cdn-url/artwork/album-2947447909.jpg
   
   # Test audio
   curl -I https://your-cdn-url/audio/1827335907-virtual-isolation.mp3
   ```

2. **Test your deployed app:**
   - Open your deployed URL
   - Check browser DevTools Network tab
   - Verify images and audio load from CDN
   - Play a track to confirm audio works

---

## Updating Media Files

When you add new releases:

1. **Update locally:**
   ```bash
   node scripts/update-catalog.js
   ```

2. **Upload new media to CDN:**
   ```bash
   # Cloudflare R2 example
   rclone sync public/artwork/ r2:format416-media/artwork/
   rclone sync public/audio/ r2:format416-media/audio/
   ```

3. **Deploy new build:**
   ```bash
   npm run build
   vercel --prod  # or your deployment method
   ```

---

## CDN Configuration Tips

### Cache Headers
Set long cache times for media (immutable):
```
Cache-Control: public, max-age=31536000, immutable
```

### CORS Headers
If CDN is on different domain:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET
```

### Compression
Enable gzip/brotli compression for faster downloads (most CDNs do this automatically).

### File Structure on CDN
Maintain the exact structure:
```
CDN_ROOT/
├── artwork/
│   ├── album-*.jpg
│   └── track-*.jpg
└── audio/
    └── *.mp3
```

---

## Cost Estimates

For ~440MB of media with moderate traffic (1000 plays/month):

- **Cloudflare R2**: FREE (well within free tier)
- **AWS S3 + CloudFront**: ~$5-10/month
- **BunnyCDN**: ~$1-2/month
- **Vercel Blob**: $0.15/GB (~$0.07/month)

Cloudflare R2 is the best option for most use cases.

