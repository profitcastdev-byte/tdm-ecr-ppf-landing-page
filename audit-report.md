# Pre-launch audit — TDM ECR PPF landing page

**Date:** 17 September 2026 (second full pass)
**Page:** `index.html` + `assets/css/style.css`, `assets/js/main.js`, `assets/img/`
**Type:** static HTML / CSS / vanilla JS, no build step
**Traffic:** Google Ads, PPF-only
**Deploy artifact:** `TDM-ECR-PPF-Landing-Page-deploy.zip` (17 files, 1,004 KB)

## Verdict: **deploy-ready — yes**

No blocking issues. This pass found and fixed three more things; four items can
only be confirmed once the page is live.

---

## Fixed in this pass

| # | Issue | Severity | Fix |
| --- | --- | --- | --- |
| 1 | **Google tag loaded 19th in `<head>`**, below every meta and share tag. On paid traffic a fast bounce can leave before a low-placed tag registers the page view. | Medium — tracking | Moved to directly after `charset` and `viewport`, now 3rd in the head. It is `async`, so this costs nothing in render time. |
| 2 | **Meta description was 173 characters.** Google cuts off around 160, so the "Get a free PPF quote" call to action was being chopped off in search results. | Low — SEO | Tightened to **157** characters; the call to action is intact. |
| 3 | **Carousel dots broke 8 + 1 on phones under ~350px**, leaving the ninth dot stranded on its own row. Stopping the wrap then exposed a second bug: the row spilled 7px past the content column. | Medium — mobile | Dots stay on one line and shrink slightly only when they would not fit, capped at the column width. Unchanged at 360px and up. |

**Why fix #3 matters:** this is the same "lone item on the last row" problem
flagged earlier on the keyword pills. The previous pass only tested down to
375px; the reference checklist calls for **320px**, which is where it showed.

## Fixed in the first pass (still verified)

- The sticky Call/WhatsApp bar now shows from first paint on mobile. The hero
  button pair had been removed, and the bar used to wait for 300px of scroll, so
  the first screen had no way to call.
- Carousel dot tap target raised from 4px to 44px tall.
- Footer phone link tap target raised from 28px to 44px.
- Heading hierarchy no longer skips h2 → h4.
- Images converted to WebP (full page 1.39 MB → 844 KB).

---

## Rendered checks — 320, 360, 375, 768 and 1440px

| Check | Result |
| --- | --- |
| Horizontal overflow | none at any width |
| Elements past the right edge (320px) | none |
| Sticky bar on first mobile paint | pinned exactly to the viewport bottom |
| Sticky bar buttons (320px) | 143 × 52px each, labels do not wrap |
| Hero image on mobile | visible below the copy |
| Hero CTA pair | hidden on mobile, shown on tablet/desktop |
| Text under 12px | none |
| Carousel per view | 3 / 2 / 1, dots 3 / 5 / 9, one row at every width |
| Carousel dots at 320px | 22.9px wide × 44px tall, 30.9px apart |
| Images | 13 of 13 load, all WebP, all with alt text and dimensions |
| Console errors | none |

**Tap targets.** The only targets under 44 × 44px are the carousel dots at
320–350px (≥ 22.9 × 44px) and the "Profitcast Growth Marketing" credit link
(41px tall). Nine dots cannot each be 44px wide on a 320px screen. Their
centres sit 30.9px apart, which passes the WCAG 2.5.8 AA spacing rule
(targets under 24px are acceptable when 24px circles around them don't
overlap). The credit link is a courtesy link, not a conversion path.

---

## Conversion tracking — verified

| Check | Result |
| --- | --- |
| GA4 `G-4Q3YJM42GR` configured | yes |
| Google Ads `AW-10990978713` configured | yes |
| gtag.js loaders on the page | exactly 1 (no double-counting) |
| Tag position in `<head>` | 3rd, after charset and viewport |
| Placeholder IDs left behind | none |
| `tel:` links firing the phone label `T8MzCIy3obEcEJmN9Pgo` | **8 of 8** |
| `wa.me` links firing the WhatsApp label `Sf9YCMPEobEcEJmN9Pgo` | **5 of 5** |
| Conversion fires on page load | no — only inside the click handler |
| Non-tracked links (Get Directions) | fire nothing |
| Ctrl/cmd/middle click | ignored (no double count on new-tab opens) |
| gtag blocked (ad blocker, offline) | nothing throws, links still navigate |
| Duplicate `gtag_report_conversion` global | none |
| Half-installed Meta / TikTok / LinkedIn pixels | none |

> **Do not paste Google's per-conversion snippets into the page.** Each defines
> the same `gtag_report_conversion` function; the second silently overwrites the
> first and every phone call would report as a WhatsApp click. The labels live
> as data in the `ADS` block in `main.js` and fire through one function.

---

## Speed

| | Weight |
| --- | --- |
| **Initial load** | **263 KB** (html 34 + css 40 + js 20 + above-fold images 169) |
| Lazy-loaded on scroll | 582 KB across 10 images |
| Total page | 845 KB |

- Hero image eager with `fetchpriority="high"`, and the preload points at the
  WebP file the page actually loads.
- Everything below the fold is lazy-loaded.
- Every `<img>` has `width`/`height`, so nothing jumps as images arrive (no CLS).
- Webfont uses `display=swap`, with preconnects to both Google Fonts origins.
- First-party JS sits at the end of `<body>`; gtag is `async`. No blocking
  third-party script.
- `prefers-reduced-motion` is honoured in both CSS and JS.

---

## SEO & meta

`lang="en"`, one `h1`, canonical, meta description (157 chars), `theme-color`,
favicon and apple-touch-icon, full Open Graph set. `og:image` is deliberately
JPEG because WhatsApp and Facebook previews don't reliably render WebP. All
`target="_blank"` links carry `rel="noopener"`. No `http://` mixed-content
references. Phone and WhatsApp links are correctly formatted (+91 plus 10
digits).

---

## Scanner warnings deliberately left

The automated scanner reads `index.html` only, so it misses the stylesheet:

1. **"No CSS media queries found"** — false positive. There are **9**, in
   `style.css`.
2. **"No global responsive-image rule"** — false positive.
   `img{ max-width:100%; height:auto }` is in `style.css`.
3. **"2 images without lazy-loading"** — intentional: the hero (the largest
   above-the-fold image, which must load first) and the header logo, both
   above the fold.
4. **WebP note on `hero-banner.jpg` and `tdm-ecr-logo.png`** — intentional. The
   first is the `og:image`; the second is the unused brand master. Neither is
   fetched by the page.

**Title is 69 characters**, over the ~60 Google shows. I left it: the keywords
come first ("Paint Protection Film (PPF) in ECR, Chennai"), so only the brand
suffix truncates in search results, which is acceptable.

---

## What this audit could not verify

These can't be proven from the files; none is marked as passing.

1. **One real test click from a phone.** Confirm it lands in Google Ads →
   Goals → Conversions. Tag Assistant shows the tag firing; only the Ads
   dashboard confirms attribution. (The preview browser used for this audit
   strips `<head>` scripts, so conversion routing was verified against a
   stand-in `gtag`, not a live request to Google.)
2. **Real Core Web Vitals.** Run **PageSpeed Insights on the live URL**. The
   figures above are measured over localhost with no CDN, compression or
   caching. Node is installed on this machine, but Lighthouse and Playwright
   are not; running them would mean downloading them, which I didn't do
   without asking. Enable gzip/brotli and long cache headers on `/assets/` at
   your host.
3. **Set the real domain before upload.** `canonical`, `og:url` and `og:image`
   still point at `ppf.thedetailingmafiaecr.com`. Open Graph needs absolute URLs
   or WhatsApp link previews break.
4. **Consent.** There is no cookie banner. That's fine for Chennai-local traffic,
   but if this ever runs to EU/UK audiences, the GA4 and Ads tags fire before
   consent and would need gating.

---

## Cache buster

CSS and JS are linked with `?v=20260917c`. **Bump it whenever either file
changes**, otherwise returning visitors keep the old copy. That already caused
trouble once during the build: a stale cached `main.js` left the conversion
labels empty, so clicks recorded nothing.
