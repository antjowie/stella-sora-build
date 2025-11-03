# Deployment Guide for GitHub Pages
> Wow Claude kinda op o.o

## Overview

This SvelteKit application is configured for static site generation (SSG) and deployment to GitHub Pages. The database is fetched once during build time and baked into the static HTML files.

## Build Configuration

### Adapter
- **adapter-static** is configured in `svelte.config.js`
- Outputs to `build/` directory
- Pre-renders all pages at build time
- Includes a `404.html` fallback for client-side routing

### Pre-rendering
- `+layout.ts` loads the database once during build
- `+page.ts` in `database/[name]/` generates routes for all characters
- Database is fetched from external URLs only during build time
- No client-side fetches needed on first load

## Benefits

✅ **Better SEO** - Pages are fully rendered with content
✅ **Faster Load Times** - No waiting for API calls
✅ **Reduced API Calls** - Data fetched once during build, not per user
✅ **Offline Friendly** - All content is static
✅ **Free Hosting** - GitHub Pages is free for public repos

## Building for Production

```bash
npm run build
```

This will:
1. Fetch database from external sources
2. Generate static HTML for all pages
3. Output to `build/` directory

## Local Preview

```bash
npm run preview
```

Preview the production build locally at `http://localhost:4173`

## Deploying to GitHub Pages

### Option 1: GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ['main']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: webapp/package-lock.json

      - name: Install dependencies
        working-directory: ./webapp
        run: npm ci

      - name: Build
        working-directory: ./webapp
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: webapp/build

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Option 2: Manual Deployment

1. Build the site:
   ```bash
   npm run build
   ```

2. Deploy the `build/` directory to GitHub Pages using `gh-pages` branch:
   ```bash
   npm install -g gh-pages
   gh-pages -d build
   ```

### GitHub Repository Settings

1. Go to your repository **Settings** → **Pages**
2. Set **Source** to:
   - **GitHub Actions** (for Option 1)
   - **Deploy from branch** → `gh-pages` (for Option 2)
3. Save and wait for deployment

## Base Path Configuration

If your repo is **NOT** at `username.github.io` but at `username.github.io/repo-name`, update `svelte.config.js`:

```js
kit: {
  adapter: adapter({
    pages: "build",
    assets: "build",
    fallback: "404.html",
    precompress: false,
    strict: true,
  }),
  paths: {
    base: process.env.NODE_ENV === 'production' ? '/repo-name' : '',
  },
}
```

## Updating Content

To update the database content:

1. Make changes (if needed)
2. Run `npm run build` - this fetches fresh data
3. Commit and push to trigger deployment
4. GitHub Actions will automatically rebuild and deploy

## Cache Strategy

- **Build Time**: Database fetched from external sources
- **Runtime**: No external fetches needed
- **localStorage**: Still used for client-side caching if users navigate after initial load
- **Cache Duration**: 1 hour (configurable in `database.svelte.ts`)

## File Structure

```
build/
├── index.html              # Home page (pre-rendered)
├── database/
│   ├── index.html          # Database list (pre-rendered)
│   └── [character]/
│       └── index.html      # Character pages (pre-rendered)
├── _app/                   # SvelteKit assets
└── .nojekyll               # Disable Jekyll processing
```

## Troubleshooting

### Build Fails with "localStorage is not defined"
- Fixed: `localStorage` access is wrapped in `typeof window !== "undefined"` checks

### Pages not loading correctly
- Ensure `.nojekyll` exists in `static/` directory
- Check that `fallback: "404.html"` is set in adapter config

### Database not updating
- Delete `node_modules/.cache` and rebuild
- Ensure external URLs are accessible during build

### 404 on page refresh
- GitHub Pages is configured correctly with fallback
- Base path is set correctly (if using subdirectory deployment)

## Performance Notes

- Initial build fetches ~6 external JSON files
- Total build time: ~5-10 seconds
- Generated static files are highly optimized
- Gzip compression reduces bundle sizes by ~70%

## Development vs Production

### Development (`npm run dev`)
- Database loaded client-side on mount
- localStorage caching active
- Hot module replacement enabled

### Production (`npm run build` + deploy)
- Database pre-fetched at build time
- All pages statically generated
- No runtime API calls needed
