# Pre-launch audit — TDM ECR PPF landing page

**Date:** 16 September 2026
**Page:** `index.html` (+ `assets/css/style.css`, `assets/js/main.js`)
**Type:** static HTML / CSS / vanilla JS, no build step
**Traffic:** Google Ads, PPF-only

## Verdict: **deploy-ready — yes**

No blocking issues. Five things were fixed during this audit; four remain for
you to confirm once it is live.

---

## What was fixed in this pass

| # | Issue | Severity | Fix |
| --- | --- | --- | --- |
| 1 | **No CTA on the first mobile screen.** The hero's Call/WhatsApp pair was removed for the new phone layout, but the sticky bottom bar only appeared after 300px of scroll. A visitor landing from an ad would have seen no way to call without scrolling. | **High — conversion** | The bar now shows from first paint on mobile and only steps aside once the footer (which carries the number) is in view. The floating buttons still wait for a scroll. |
| 2 | **Carousel dots were a 4px-tall tap target.** Effectively unhittable on a phone. | Medium — mobile UX | The button is now 44px tall with the 4px bar drawn inside it. Nothing changed visually. |
| 3 | **Footer phone number was a 28px-tall tap target.** It is a primary conversion link. | Medium — conversion | Padded to 44px. Column rhythm unchanged (margin reduced by the same amount). |
| 4 | **Heading hierarchy skipped h2 → h4** at the footer. | Low — SEO / a11y | Footer "Reach Us" is now an `h3`. Sequence is clean: `1,2,2,2,3,3,3,2,2,3,3,2,3`. |
| 5 | **Images were JPEG/PNG**, costing 548 KB more than needed on a paid-traffic page. | Medium — speed / Quality Score | Converted to WebP. Initial load 371 → **262 KB**, full page 1.39 MB → **844 KB**. |

Also in this pass: the footer logo is now lazy-loaded, and the hero banner
carries real alt text (it became visible content on mobile rather than a
decorative background).

---

## Conversion tracking — verified working

GA4 `G-4Q3YJM42GR` and Google Ads `AW-10990978713` load from one gtag.js call in
`<head>`, with a `config` line for each.

I simulated a click on **every** tracked link and captured the gtag calls:

| Link type | Links on page | Fired | Correct label |
| --- | --- | --- | --- |
| `tel:` | 8 | 8 | `AW-10990978713/T8MzCIy3obEcEJmN9Pgo` |
| `wa.me` | 5 | 5 | `AW-10990978713/Sf9YCMPEobEcEJmN9Pgo` |

Payload carries `value: 1.0, currency: 'INR'`. Non-tracked links (Get Directions)
fire nothing. Ctrl/cmd/middle clicks are ignored, so opening in a new tab does
not double-count. With gtag blocked (ad blocker, offline) nothing throws and
every link still navigates — tracking never sits between a visitor and a call.

> **One thing to keep in mind.** The two snippets Google gave you each define a
> function called `gtag_report_conversion`. Pasting both into the HTML would
> have made the second silently overwrite the first, and *every* phone call
> would have reported as a WhatsApp click with no error to reveal it. The labels
> are kept as data in the `ADS` block in `main.js` and fired through one
> function instead. **Do not paste those snippets into the page.**

---

## Mobile — verified at 375px, 768px, 1440px

- No horizontal overflow at any width (`scrollWidth === clientWidth`).
- The phone hero was restructured this session: the banner is no longer a
  scrimmed background (where the car was nearly invisible behind the text) but a
  visible block beneath the copy. Headline → photo → sticky call bar.
- Header is the logo alone, centred to the pixel.
- Sticky bar pins to the viewport bottom; the floating Call/WhatsApp buttons
  clear it and clear the footer credit line by 14px at the very bottom.
- Carousel adapts 3 → 2 → 1 per view, with the dot count rebuilding to match
  (3 / 5 / 9) and again on resize or rotation.
- All 13 images carry alt text. One `h1`. No dead in-page anchors. No console
  errors.

---

## Loading speed

| | Before WebP | **After WebP** |
| --- | --- | --- |
| **Initial load** | 371 KB | **262 KB** |
| Lazy-loaded on scroll | 1,020 KB | **582 KB** |
| Total page | 1,391 KB | **844 KB** |

The hero banner is `fetchpriority="high"` and eager (it is the LCP element);
everything below the fold is lazy. Every `<img>` carries explicit `width`/
`height`, so there is no layout shift as images arrive. Fonts preconnect to
Google Fonts. No render-blocking third-party JS — gtag is `async`.

**Done: images converted to WebP.** Measured on your actual files, at visually
identical quality:

```
hero-banner.jpg   200 KB -> 120 KB   (-40%)
intro-ppf.jpg     190 KB -> 109 KB   (-42%)
logo-white.png     77 KB ->  47 KB   (-39%)
9 gallery shots   826 KB -> 468 KB   (-43%)
------------------------------------------------
TOTAL           1,298 KB -> 749 KB   (-42%, saves 548 KB)
```

This cut the initial load from 371 KB to **262 KB** and the full page from
1.39 MB to **844 KB**, which helps LCP and therefore Quality Score.

`hero-banner.jpg` is deliberately kept alongside the WebP: it is the `og:image`,
and WhatsApp and Facebook link previews do not reliably render WebP. The page
itself never fetches it. `favicon.png` stays PNG for icon compatibility.

---

## Three scanner warnings I am deliberately leaving

The automated scanner only parses `index.html`, so two of its three warnings are
false positives:

1. **"No CSS media queries found"** — there are **9**, across 5 breakpoints
   (1080 / 980 / 900 / 640 / 420px) plus `prefers-reduced-motion` and `print`.
   They live in `assets/css/style.css`, which the scanner does not read.
2. **"No global responsive-image rule"** — `img{ max-width:100%; height:auto;
   display:block }` is at line 91 of the same stylesheet.
3. **"2 images without lazy-loading"** — correct and intentional: the hero
   banner (the LCP image, must be eager) and the header logo (above the fold).
   The footer logo was the one real miss and is now lazy.

The scanner's WebP note has been actioned — see Loading speed above.

Carousel dots remain 26px wide (44px tall). Nine of them cannot each be 44px
wide inside a 375px screen; 26×44 clears the WCAG 2.5.8 AA target of 24×24
comfortably.

---

## Still to confirm once it is live

These cannot be verified from the files, and I have not marked them as passing.

1. **Fire one real test click** from a phone and confirm the conversion lands in
   Google Ads → Tools → Conversions. Tag Assistant will show the tag firing;
   only the Ads dashboard confirms attribution.
2. **Run PageSpeed Insights on the live URL.** My weight figures are measured
   over localhost with no CDN, no compression and no caching — real-world LCP
   depends on your host. Enable gzip/brotli and set far-future cache headers on
   `/assets/`.
3. **Set the real domain before deploying.** Three places in `index.html` still
   point at `ppf.thedetailingmafiaecr.com`: `<link rel="canonical">`, `og:url`
   and `og:image`. Open Graph needs absolute URLs or WhatsApp and Facebook link
   previews break — which matters here, since WhatsApp is a primary channel.
4. **Consent.** There is no cookie banner. Traffic is Chennai-local so GDPR is
   not in play, but if you ever run this to EU/UK traffic the GA4 and Ads tags
   fire before any consent is given and would need gating.

## Note on the cache buster

`style.css` and `main.js` are linked with `?v=20260916f`. **Bump that string
whenever you edit either file** or returning visitors keep the old copy. This
already bit us once during the build — a stale `main.js` meant the conversion
labels silently did nothing, and a normal reload did not clear it.
