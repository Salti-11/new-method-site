# Method Endurance website

Triathlon coaching in Ballarat and online, by Chris Chatham. Static HTML, CSS and a little vanilla JavaScript in `public/`, served by a zero-dependency Node server.

## Run it
```
npm start            # http://localhost:3000   (PORT=4000 npm start to change it)
```
Needs Node 18 or newer. There is nothing to install.

## What is here
| Path | What |
|---|---|
| `public/` | The site: 8 main pages, the journal (index and 7 posts), `404.html`, `sitemap.xml`, `robots.txt`, `llms.txt`, `styles.css`, `main.js`, `assets/` |
| `server.js` | Clean URLs (`/chris` serves `chris.html`), 301s from `.html` and trailing slashes, a branded 404, gzip, video range requests, and a stub for `POST /api/assessment` |
| `REPLIT-HANDOFF.md` | What Replit needs to do to take it live |

## Rules for edits
- Pages are generated. The source (`build.py`, copy overrides, athlete data) lives in the Method Endurance working folder, not in this repo. For a small fix, edit the HTML in `public/` and tell Emily, so the source stays in step.
- Prices are $55, $70 and $100 per week, GST included. They appear on several pages and in the JSON-LD and `llms.txt`. Change them everywhere or nowhere.
- Journal posts are Chris's own words. Don't rewrite them.
