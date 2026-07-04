# NovAI Announcer

A small, self-contained widget that displays a "chat message" from a robot
persona called **NovAI**. Post a new announcement by editing one JSON file —
no server, no build step, no backend.

It's meant to be hosted on its own (e.g. GitHub Pages) and embedded into your
main website with an `<iframe>`.

---

## How it works

- `announcements.json` holds the **current** announcement.
- `index.html` / `style.css` / `app.js` render it as a NovAI chat bubble with
  a typewriter effect and a pulsing "online" bot avatar.
- `app.js` polls `announcements.json` every 30 seconds. When the `id` field
  changes, it plays the typing animation and flashes a "NEW" badge.
  If the `id` hasn't changed, it just quietly updates the "x min ago" timestamp.

This means: once it's deployed, **you never touch the HTML/CSS/JS again.**
You only ever edit `announcements.json`.

---

## 1. Set up the repo

1. Create a new GitHub repo (e.g. `novai-announcer`).
2. Add these 4 files to it: `index.html`, `style.css`, `app.js`, `announcements.json`.
3. Commit and push.

## 2. Turn on GitHub Pages

1. In the repo: **Settings → Pages**.
2. Under "Build and deployment", set **Source** to `Deploy from a branch`.
3. Branch: `main` (or whichever you used), folder: `/ (root)`.
4. Save. GitHub will give you a URL like:
   `https://yourusername.github.io/novai-announcer/`
5. It usually takes 30–60 seconds to go live after the first push.

## 3. Embed it in your website

Drop this into your site's HTML wherever you want NovAI to appear:

```html
<iframe
  src="https://yourusername.github.io/novai-announcer/"
  style="width: 100%; max-width: 540px; height: 160px; border: none;"
  title="NovAI announcements"
></iframe>
```

Adjust `height`/`max-width` to taste. The card is responsive and will shrink
to fit narrower iframes.

## 4. Post a new announcement

Edit `announcements.json`:

```json
{
  "id": 2,
  "title": "New Announcement!",
  "message": "The website will be updated in a day.",
  "timestamp": "2026-07-03T18:30:00Z"
}
```

**Important:** every time you post a new message, **increment `id`** (2, 3, 4...).
That's the only way the widget knows it's a genuinely new message and should
re-play the animation/NEW badge — if you only change the text but leave the
`id` the same, it'll update silently without the "ta-da" effect.

`timestamp` should be an ISO 8601 UTC timestamp (`YYYY-MM-DDTHH:MM:SSZ`).
It's used to show "just now" / "5 min ago" / etc.

Commit and push that one file. GitHub Pages will redeploy automatically
(usually within a minute), and every page currently displaying the iframe
will pick up the new message on its next 30-second poll — **no reload needed.**

---

## Customizing

- **Poll interval:** change `POLL_INTERVAL_MS` in `app.js` (currently 30000 = 30s).
- **Typing speed:** change `TYPE_SPEED_MS` in `app.js` (currently 22ms/character).
- **Colors:** all defined as CSS variables at the top of `style.css` (`:root`).
- **Bot name:** change the `.bot-name` text in `index.html`.

## Optional next steps (not built yet, just ideas)

- **History / log of past announcements** instead of a single current one —
  would mean changing `announcements.json` to an array and rendering a small
  scrollable feed.
- **A tiny admin form** to edit the JSON without touching GitHub directly
  (would need a small backend or a service like GitHub's API + a token).

Happy to build either of those next if you want them.
