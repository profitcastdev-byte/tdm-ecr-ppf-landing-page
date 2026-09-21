# The Detailing Mafia ECR | PPF Landing Page

A single-page, dependency-free landing page for Paint Protection Film at the
ECR studio, Chennai. Static HTML, CSS and vanilla JS. No build step, no
framework, nothing to install: open `index.html` or drop the folder on any
static host.

Design reference: <https://ppf.tdmhyderabad.in/>
Copy source: `content/content-brief.txt` (verbatim from the ECR LP Content PDF)

---

## The one block you will actually edit

Everything client-specific lives at the top of `assets/js/main.js`, in the
`CLIENT` object. Change it there and every phone link, WhatsApp link, map
link, address and embedded map on the page updates at once (header, hero,
intro, visit card, footer, floating buttons and mobile bar.

```js
const CLIENT = {
  phone:        '918925737773',
  phoneDisplay: '+91 89257 37773',
  whatsapp:        '918925737773',
  whatsappMessage: "Hi, I'd like a free PPF quote ...",
  address: '2/632, SH 49 (ECR), opposite Goyal Marble, Neelankarai, ...',
  mapShortLink: 'https://maps.app.goo.gl/Qhip5VcUf94nmhKdA'
};
```

Do not hand-edit the `tel:` / `wa.me` hrefs in `index.html`. They are there so
the page still works with JS disabled, but `main.js` rewrites them all on load
from `CLIENT`.

### Opening hours

Seven near-identical rows read as a wall of repetition, so the hours are stated
once instead: the block of days that share the times, the one day that does
not, and a live **Open now / Closed now** line.

The days and times are plain markup in `index.html` (section 6), which is what
a crawler and a JS-less visitor read. `main.js` only adds the status line, so
if the script never runs the hours are still correct and complete. To change
the times, edit the markup and the matching `HOURS` constant in `main.js`:

```js
const HOURS = { open: 10, close: 20, closedDays: [1] };   // 1 = Monday
```

---

## Conversion tracking

**Live.** GA4 `G-4Q3YJM42GR` and Google Ads `AW-10990978713` are both wired.

The gtag.js base tag sits in the `<head>` of `index.html` and configures both
properties off one script load. The two conversion labels live in the `ADS`
block at the top of `assets/js/main.js`:

```js
const ADS = {
  id: 'AW-10990978713',
  conversions: {
    phone:    { send_to: 'AW-10990978713/T8MzCIy3obEcEJmN9Pgo', ... }, // Phone Call Click
    whatsapp: { send_to: 'AW-10990978713/Sf9YCMPEobEcEJmN9Pgo', ... }  // WhatsApp Click
  }
};
```

A delegated click listener classifies every link by its href, so all 8 `tel:`
links fire the phone label and all 5 `wa.me` links fire the WhatsApp label.
Links added later are covered automatically, with no inline `onclick` to keep
in sync. Ctrl/cmd/middle clicks are left alone so opening in a new tab does not
double count.

> **Do not paste Google's per-conversion snippets into the HTML.** Google gives
> you the same function name, `gtag_report_conversion`, in every one. Pasting
> both means the second definition silently overwrites the first and *every*
> conversion reports as whichever loaded last, which is why the labels are kept
> as data here and fired through one function. This page defines no global by
> that name, so there is nothing to collide with.

If gtag never loads (ad blocker, offline), `reportConversion` returns early:
no error is thrown and every link still navigates normally. Tracking never
stands between a visitor and a phone call.

### Images are WebP

Every image the page renders is WebP, which cut the initial load from 371 KB to
262 KB and the full page from 1.39 MB to 844 KB at visually identical quality.

Two files stay in their original format on purpose:

- **`hero-banner.jpg`** is kept solely for `og:image`. WhatsApp and Facebook
  link previews do not reliably render WebP, and WhatsApp is a primary channel
  here. It is never fetched by the page itself.
- **`favicon.png`** stays PNG for icon compatibility.

If you replace a photo, export it as WebP at quality 82 (86 if it has
transparency) and keep the same filename.

### Cache busting

`style.css` and `main.js` are linked with a `?v=` query. **Bump it whenever you
edit either file**, otherwise returning visitors keep serving the old copy from
cache until it expires. Nothing else needs changing.

---

## Structure

```
index.html
assets/
  css/style.css
  js/main.js
  img/            WebP: hero banner, 9 gallery shots, logo
                  plus hero-banner.jpg (og:image only) and favicon.png
content/
  content-brief.txt
deploy/
  deploy-kvm.sh   upload to the Profitcast KVM (deploy, --check, --rollback)
  nginx/          the site's nginx vhost, as written before certbot
deploy-kvm.cmd    runs deploy-kvm.sh from PowerShell or cmd
DEPLOYMENT.md
```

Sections, in order, matching the brief:

1. Hero: eyebrow, H1, sub-headline, 3 bullets, Call and WhatsApp CTAs
   (on mobile the CTAs drop out and the banner moves below the copy)
2. Trust strip (drifting marquee)
3. Intro: Ultimate Paint Protection With PPF In ECR, Chennai, plus Call Now
4. Work In Action: carousel of 9 real PPF installs
5. Why ECR Car Owners Choose Us For PPF: three cards
6. FAQ: five questions, accordion
7. Location: address, opening hours, Get Directions, Call Now, embedded map
8. Final CTA banner
9. On-page SEO keyword cluster, as a pill cloud on a light band
10. Footer: brand and description, then Reach Us with phone and a
    clickable address that opens the studio's Google Maps pin

The Reach Us column is an explicit flex column. Its items were inline-blocks
that only stacked because the phone number happened to be wide enough to force
a wrap; when the number was set smaller they fitted side by side and overflowed
the column, so the stacking is now declared rather than incidental.

---

## Design notes

**Palette** is sampled from the supplied logo and is only three values:
`#FF0000`, `#000000`, `#FFFFFF`. WhatsApp green (`#25D366`) is the one addition,
used only on WhatsApp controls so the affordance is recognisable.

**Surfaces.** The page alternates dark and light bands. The dark surface is the
default; any section given `class="surface-light"` re-declares the surface
tokens and everything inside it re-colours automatically. Never hardcode a text
or border colour, reach for a token. Note `--red-ink`: pure `#FF0000` does not
clear 4.5:1 on white, so the light surface swaps in `#C40000` for body-size red
text.

**Type** is Manrope throughout (400 to 800), loaded from Google Fonts.

**Call and WhatsApp buttons** are pinned bottom-left and bottom-right on
desktop, both with a pulsing halo and a periodic nudge, staggered so the two
sides do not beat in lockstep. They expand to show a label on hover. Below
640px they shrink and lift above a persistent two-button bar pinned to the
bottom of the screen.

**On mobile the hero restructures.** Below 640px the banner stops being a
scrimmed background and becomes a visible block underneath the copy: headline,
then the photo, then the sticky call bar. As a background at phone width the
car was almost invisible behind the text, which wasted the only photo above the
fold. The hero's own CTA pair is hidden there because the sticky bar already
carries both actions.

Because of that, **the sticky bar shows from first paint on mobile** rather than
waiting for a scroll: with no CTA pair in the hero, a scroll-gated bar would
leave no way to call on the first screen. The floating buttons still wait until
the visitor has scrolled 300px.

**On mobile** the header is the logo alone, centred, and the call and WhatsApp
CTAs are the sticky bottom bar. The footer carries extra bottom padding for a
specific reason: at the very end of the page the bar has hidden itself but the
two floating buttons have not, and they occupy 86px to 136px above the viewport
edge, so the footer clears that band rather than letting them sit on the credit
line.

**The header and footer lockups render at exactly the same height** (64px, 52px
below 900px) so the brand reads identically top and bottom.

**Section 3 is a nine-shot carousel.** The images are the real installs from
the main ECR site's "Our Detailing Expertise In Action" gallery, ordered to
lead with the PPF-specific and luxury cars as the brief asks. Three show per
view on desktop, two on tablet, one on a phone, and the dot count rebuilds to
match.

**The carousel code drives every `.carousel` on the page**, finding its
viewport, dots and arrows within itself rather than by id, so a second carousel
needs no JavaScript change.

**The keyword cluster** is a centred cloud of pills on a light grey band. The
pills are white, so the band deliberately uses the light surface's alt tone
rather than its plain white, otherwise they would disappear into it. The list
is capped at 1000px rather than the full 1200px container: at full width the
21 terms wrap 7/6/7/1 and strand a single pill on the last row, whereas 1000px
lands them 6/5/5/5. If you add or remove keywords, re-check that cap.

---

## Verified

Checked at 1440px, 768px and 375px:

- No horizontal overflow at any width (`scrollWidth === clientWidth`)
- Logo centred in the mobile header to the pixel; sticky CTA bar pinned to the
  bottom, floating buttons clearing it
- Carousel pages correctly across all three views, arrows disable at both ends,
  dots track the scroll position including swipe, and the dot count rebuilds on
  resize (3 at desktop, 5 at tablet, 9 at phone width)
- FAQ accordion opens one at a time with `aria-expanded` in sync
- Map height matches the info column beside it exactly, with no dead space
- Header and footer logos measure identical at every breakpoint
- Keyword pills wrap 6/5/5/5 on desktop and 4/4/3/3/4/3 on tablet with no
  stranded last row, and every pill sits inside the viewport at 375px
- The footer address is a link to the studio's map pin and changes colour on
  hover; Reach Us stacks left-aligned at every width
- No dead in-page anchors
- All images load and carry alt text, one `h1`, no console errors
- Every `tel:` link fires the phone conversion label and every `wa.me` link
  fires the WhatsApp label, with modified clicks and non-tracked links ignored

Two accessibility details worth keeping if you edit: every icon is
`aria-hidden` with the meaning carried by adjacent text, and the carousel is a
labelled scroll region reachable by keyboard with arrow keys.

---

## Deploying

The page is hosted on the **Profitcast KVM**. `DEPLOYMENT.md` covers where it
lives, the one DNS record the live address still needs, and how the server was
set up.

Review link: <https://tdmecr-ppf-preview.187.127.149.216.nip.io>

Day to day, from the project root in PowerShell or cmd:

```powershell
.\deploy-kvm.cmd              # upload, swap in, verify
.\deploy-kvm.cmd --check      # is the KVM running exactly this page? (changes nothing)
.\deploy-kvm.cmd --rollback   # put the previous release back
```

Quick local preview: `python -m http.server 5178`.

The page names its own address in three places in `index.html`:
`<link rel="canonical">`, `og:url` and `og:image`. They must match the address
it is served on (Open Graph needs absolute URLs, or WhatsApp and Facebook
previews break), and the deploy script refuses to upload if they don't.
