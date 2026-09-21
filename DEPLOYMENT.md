# Deploying to the Profitcast KVM

| | |
| --- | --- |
| Server | Profitcast KVM: Hostinger VPS `root@187.127.149.216` (srv1575430, Ubuntu 24.04, nginx 1.24) |
| Review link | <https://tdmecr-ppf-preview.187.127.149.216.nip.io> (live now, HTTPS, kept out of Google with noindex) |
| Live address | <https://ppf.lp.thedetailingmafiaecr.com> (waiting on one DNS record, see *Going live*) |
| Files | `/var/www/ppf.lp.thedetailingmafiaecr.com`, previous release at `.prev` |
| nginx vhost | `/etc/nginx/sites-available/ppf.lp.thedetailingmafiaecr.com`, source in `deploy/nginx/` |
| Certificate | certbot lineage `ppf.lp.thedetailingmafiaecr.com`, renews automatically |

SSH is key-based from this PC (`~/.ssh/id_ed25519`). Deploying from another
machine needs that machine's public key added to `/root/.ssh/authorized_keys`
on the server first.

---

## Updating the page

From the project root, in PowerShell or cmd:

```powershell
.\deploy-kvm.cmd              # upload, swap in, verify
.\deploy-kvm.cmd --check      # is the KVM running exactly this page? (changes nothing)
.\deploy-kvm.cmd --rollback   # put the previous release back (run again to undo)
```

From Git Bash, macOS or Linux: `bash deploy/deploy-kvm.sh [--check | --rollback]`.

A deploy:

1. Refuses to start if `canonical`, `og:url` or `og:image` in `index.html` do
   not point at `https://ppf.lp.thedetailingmafiaecr.com/`.
2. Uploads only the 17 files the page serves: `index.html` and `assets/`, minus
   the unused logo master. README, the audit report, `content/`, `deploy/` and
   the zip never leave this machine.
3. Unpacks beside the live folder and swaps it in, keeping the previous release
   as `.prev`, so visitors never load a half-uploaded page.
4. Compares a checksum of every file on both ends, then prints the HTTP status
   of both addresses.

It only ever touches the site's files. It never edits nginx, reloads it or
changes certificates.

**Edited `style.css` or `main.js`?** Bump `?v=` on both links in `index.html`
before deploying. The server tells browsers to keep CSS and JS for a day.

**Replaced a photo?** Give the new file a new name and update the reference.
Photos are cached for 30 days, so a file swapped under the same name stays old
for returning visitors.

---

## Going live on ppf.lp.thedetailingmafiaecr.com

The domain's DNS is managed at Hostinger (nameservers `*.dns-parking.com`). The
main website stays exactly where it is, on Hostinger shared hosting. Only names
under `.lp` point at the KVM.

1. **Add one DNS record.** hPanel → Domains → thedetailingmafiaecr.com → DNS /
   Nameservers:

   | Type | Name | Points to | TTL |
   | --- | --- | --- | --- |
   | `A` | `*.lp` | `187.127.149.216` | default |

   A wildcard: it sends every `<name>.lp.thedetailingmafiaecr.com` to the KVM,
   so `ppf.lp` works now and a later landing page needs no new DNS record, only
   its own vhost and certificate on the server. Leave the `@` and `www` records
   alone.

   Side effect: a `.lp` name with no vhost on the KVM (a typo, or a page not set
   up yet) lands on the server's defaults, which is Rentla's site over http and
   a certificate warning over https.

2. **Wait until public DNS returns the KVM:**

   ```powershell
   Resolve-DnsName ppf.lp.thedetailingmafiaecr.com -Server 8.8.8.8
   ```

3. **Add the live name to the certificate**, on the server:

   ```bash
   ssh root@187.127.149.216
   certbot --nginx --non-interactive --redirect --expand --cert-name ppf.lp.thedetailingmafiaecr.com -d tdmecr-ppf-preview.187.127.149.216.nip.io -d ppf.lp.thedetailingmafiaecr.com
   ```

   This fails until step 2 passes. Until it runs, `http://ppf.lp.thedetailingmafiaecr.com`
   answers 404. That is certbot's placeholder, not a fault.

4. **Check:** `.\deploy-kvm.cmd --check` should show 200 for both addresses.

5. **Switch the Google Ads final URLs** to `https://ppf.lp.thedetailingmafiaecr.com/`,
   then make one real Call click and one WhatsApp click from a phone and
   confirm both land in Google Ads → Goals → Conversions.

The same page is also published on Netlify at `tdmecr-ppf.netlify.app`. Its
canonical already names `ppf.lp.thedetailingmafiaecr.com`, so search engines
won't treat the two copies as competitors. Once Ads point at the live address,
retire the Netlify copy anyway, so a later edit can't reach one host and miss
the other.

If an office PC shows **ERR_SSL_PROTOCOL_ERROR** right after the switch while a
phone on mobile data loads the page fine, the office router is serving a cached
DNS answer. The site is fine. Compare
`Resolve-DnsName ppf.lp.thedetailingmafiaecr.com -Server 192.168.1.1` with
`-Server 8.8.8.8`.

---

## How the server was set up (17 September 2026)

Recorded so it can be rebuilt. It does not need running again.

The site first went up under `ppf.thedetailingmafiaecr.com` and moved to
`ppf.lp.thedetailingmafiaecr.com` the same day. The old vhost and folders are
kept in `/root/backups/ppf.thedetailingmafiaecr.com-renamed-20260917/`; the
old name's certificate was deleted.

```bash
# 1. vhost: the HTTP-only source; certbot adds :443 and the redirect itself
ssh root@187.127.149.216 'set -o noclobber; cat > /etc/nginx/sites-available/ppf.lp.thedetailingmafiaecr.com' < deploy/nginx/ppf.lp.thedetailingmafiaecr.com.conf

# 2. on the server: enable, test, reload
ln -s /etc/nginx/sites-available/ppf.lp.thedetailingmafiaecr.com /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 3. from this PC: the files
.\deploy-kvm.cmd

# 4. on the server: HTTPS for the review link (Profitcast's certbot account already exists)
certbot --nginx --non-interactive --redirect --cert-name ppf.lp.thedetailingmafiaecr.com -d tdmecr-ppf-preview.187.127.149.216.nip.io
certbot renew --dry-run --no-random-sleep-on-renew --cert-name ppf.lp.thedetailingmafiaecr.com
```

Verified after setup:

- HTTP redirects to HTTPS; Let's Encrypt certificate valid to 16 December 2026, renewal dry run passes
- `nosniff` and `Referrer-Policy` on every response: page, CSS, JS and images
- gzip on CSS and JS
- Cache: page revalidated on every visit, CSS/JS 1 day, photos 30 days
- `X-Robots-Tag: noindex` on the review link only; the live name sends none
- Dotfiles return 403; README, audit report, `content/`, `deploy/`, the zip and the logo master return 404
- All 16 assets the page references return 200; GA4 and both Ads conversion labels are in the served files
- Deploy, `--check` and `--rollback` all exercised; files owned by `www-data`, 644/755
- Four neighbouring sites (ppf.tdmhyderabad.in, lp.meditarina.in, Hyderabad's review link, the bare IP) returned 200 before and after

**Why this vhost caches with `expires`** when others on the box use
`add_header Cache-Control`: in nginx, a location that declares any `add_header`
silently drops every `add_header` it would inherit from the server block, so
those vhosts have to repeat their security headers in each location, and one
missed copy strips them. `expires` is a different directive, so here the
headers are declared once and reach every response.

---

## Rules for this server

It is shared production: about 55 live client sites.

- **`nginx -t` before every `systemctl reload nginx`.** Reloading a broken
  config takes every site down. If the test fails, remove what you just added
  before anything else.
- `nginx -t` prints three *could not build optimal server_names_hash*
  warnings. They predate this site and are harmless; the last line
  (*test is successful*) is what counts.
- **Never add `default_server`.** `rentla-preview` holds it, and moving it
  changes where every unmatched hostname on the box lands.
- **Scope certbot dry runs** with `--cert-name ppf.lp.thedetailingmafiaecr.com`.
  Without it certbot simulates every certificate on the box, which takes many
  minutes and holds a lock. Add `--no-random-sleep-on-renew` as well: run over
  SSH without a terminal, certbot otherwise sits through a random delay of up
  to 8 minutes before it starts.
- `grep -r` over `sites-enabled/` silently finds nothing, because the entries
  are symlinks. Use `grep -H pattern /etc/nginx/sites-enabled/*`.

### Taking the site offline

```bash
rm /etc/nginx/sites-enabled/ppf.lp.thedetailingmafiaecr.com
nginx -t && systemctl reload nginx
```

Files, vhost and certificate stay in place, so bringing it back is the `ln -s`
line from setup step 2, then `nginx -t` and reload.
