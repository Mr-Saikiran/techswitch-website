# techswitch.in

The TechSwitch site: the home page (services, the work, UPI Hub, contact) and the blog at `/blogs`, served as static files from Cloudflare.

```
public/                 everything Cloudflare serves
  index.html            home page
  site.css              page styles (Hallmark stamp in the first lines)
  tokens.css, base.css  design tokens, light and dark
  mode.js               light/dark toggle
  blogs/                generated: index, one folder per post, rss.xml
  upihub/               UPI Hub demo and download page (/upihub/)
  upihub/privacy/       UPI Hub privacy policy (the Play Store listing links here)
  _redirects, 404.html  generated: old Hashnode URLs → /blogs/<slug>/
content/hashnode-rss.xml  snapshot of the Hashnode feed the blog is built from
scripts/build-blog.mjs    builds public/blogs from the feed
scripts/serve.mjs         local preview that honours _redirects
wrangler.jsonc            Cloudflare Worker (static assets only)
```

## Why the blog is built from RSS

Hashnode's GraphQL API now needs a Pro plan for every request, reads included. The RSS feed is free and carries each post's full HTML, so `build-blog.mjs` turns it into static pages under `/blogs`. A snapshot of the feed from 28 Oct 2026 (6 posts) is checked in at `content/hashnode-rss.xml`, so the build never depends on Hashnode being up.

## Run it locally

```bash
npm run build
```

```bash
npm run dev
```

Then open http://localhost:8788.

## Move techswitch.in from Hashnode to Cloudflare

Do these in order. The feed snapshot is already taken, so nothing is lost when Hashnode lets go of the domain.

1. **Hashnode:** blog dashboard → Domain → remove `techswitch.in`. The blog falls back to its `*.hashnode.dev` address; note it down.
2. **Cloudflare DNS** for `techswitch.in`: delete the record that points at Hashnode (usually a CNAME or A record to `hashnode.network`). Leave mail records (MX, SPF, DKIM) alone, so `contact@techswitch.in` keeps working.
3. **Deploy:**

   ```bash
   npm install
   ```

   ```bash
   npx wrangler login
   ```

   ```bash
   npm run deploy
   ```

   `wrangler.jsonc` attaches `techswitch.in` as the Worker's custom domain on deploy. To serve `www.techswitch.in` as well, add a second route with `"pattern": "www.techswitch.in"`.
4. **Check:** `https://techswitch.in/blogs/`, one post, and an old address such as `https://techswitch.in/understanding-memory-leaks-in-java-jvm`, which should 301 to `/blogs/understanding-memory-leaks-in-java-jvm/`.

## Publishing a new post

Keep writing on Hashnode. For each new post, set its canonical URL (post settings → "originally published at") to `https://techswitch.in/blogs/<slug>/`, so search engines credit techswitch.in and not the hashnode.dev copy. Then:

```bash
npm run refresh -- https://<your-blog>.hashnode.dev/rss.xml
```

```bash
npm run deploy
```

`refresh` updates the snapshot, rebuilds `/blogs`, the redirects and the three newest posts on the home page.

## Still to fill in

- **UPI Hub screens:** the three phone screens in the UPI Hub section are built in HTML because the app could not be run here. To swap in real screenshots (1080 × 2160 or similar 1:2 portrait), add this before `</body>` in `public/index.html`:

  ```html
  <script>hallmarkSlots({ 'upihub-scan': '/img/upihub-scan.png', 'upihub-pick': '/img/upihub-pick.png', 'upihub-pay': '/img/upihub-pay.png' })</script>
  ```

## UPI Hub page

`/upihub/` links the APK straight from the UPI Hub GitHub release, so no binary lives in this repo. For a new version, update the version, file name, download URL and SHA-256 in `public/upihub/index.html` (the SHA-256 is in the release's `SHA256SUMS`). The iPhone card says no IPA exists; swap it for an App Store or TestFlight link if an iOS app ships. The nav and footer there are copies of the home page's; the blog build does not refresh them.
