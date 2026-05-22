# Golden Captures — Landing Page

Plain HTML / CSS / JS homepage for [golden-captures.com](https://golden-captures.com/).

## Preview locally

```bash
cd "/Users/friend/Golden Captures"
python3 -m http.server 8080
```

Open http://localhost:8080

## Structure

- `index.html` — all 11 sections, SEO meta, JSON-LD schema
- `css/styles.css` — Client-First utilities + components (single file)
- `js/main.js` — mobile nav, form placeholder, gallery loop, sticky CTA
- `images/` — optimized assets from client materials

## Before launch

- [ ] Replace placeholder form `action` with HoneyBook or backend endpoint
- [ ] Set Spring Special end date in promo strip / footer
- [ ] Update Instagram / TikTok URLs in footer
- [ ] Configure `_redirects` on hosting (Netlify, Cloudflare, etc.)
- [ ] Run PageSpeed Insights on mobile (target 80+)
- [ ] Submit `sitemap.xml` in Google Search Console

## Deploy

Connect this repo to [Netlify](https://www.netlify.com) or [Cloudflare Pages](https://pages.cloudflare.com): no build step, publish directory `.` (root). Push to `main` to update the live preview.
