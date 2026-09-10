# API Assets

A polished, dependency-free GitHub Pages library for public files used in API and Postman testing. It reads a generated `assets.json` index and turns every repository folder into a browsable category.

For local, double-click use, the generated `assets-data.js` file provides the same index as a browser-safe fallback. Keep it beside `index.html`; the workflow regenerates it together with `assets.json`.

## Add assets

Folders are categories and nested folders become subcategories. For example:

```text
images/
  products/
    product-01.jpg
documents/
  examples/
    sample.pdf
```

Add any folder name you need (`avatars/`, `contracts/`, `excel/`, and so on), add files inside it, then push:

```bash
git add .
git commit -m "Add test assets"
git push
```

The workflow in `.github/workflows/generate-assets.yml` runs on each push to `main`. It scans every non-system folder, recognizes common image, video, audio, document, JSON, XML, and other files, writes their hierarchy and sizes to `assets.json`, and commits that index only if it changed. This is the static-hosting-friendly alternative to trying to scan a server filesystem from browser JavaScript.

### Category covers

To give a category its own visual cover, place one of these files directly inside that category: `image.png`, `image.jpg`, `image.jpeg`, `image.svg`, `image.webp`. `cover.*` and `thumbnail.*` are also supported. Cover files are reserved for category visuals and are hidden from normal asset cards.

## Enable GitHub Pages

1. Push this repository to GitHub.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**, then choose `main` and the repository root.
4. Save and wait for deployment.

The site works both at a custom domain and at project addresses such as `https://username.github.io/repository-name/`. Each card's **Copy URL** button creates a correctly scoped public URL automatically.

## Use an asset in Postman

Open the asset library, find a file, and press **Copy URL**. Paste it into a request body, environment, or mock response:

```json
{
  "imageUrl": "https://username.github.io/repository-name/images/products/product-01.jpg"
}
```

The browser UI includes previews, search, breadcrumbs, file-type filters, grid/list views, name/type/recent sorting, direct-URL and relative-path copying, downloads, and light/dark themes. The preview dialog supports keyboard focus trapping and Escape-to-close. It has no frameworks, build tooling, packages, or external icon dependencies.

## Metadata

The generated index records a file’s size and modified date. For SVG images it also records dimensions; for audio/video it records duration when `ffprobe` is available on the GitHub Actions runner. The included `images/examples` and `documents/examples` files provide a ready-to-browse starter library and can be replaced with your own assets.
