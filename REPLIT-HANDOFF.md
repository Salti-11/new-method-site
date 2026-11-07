# Replit handoff: Method Endurance site (v5, 7 Nov 2026)

Goal: spin up a shareable preview that Chris can review. Code only. Do not touch the existing Athlete Hub app, its database or its API.

## Run
- Entry: `npm start` (runs `node server.js`, serves `public/`). Use `$PORT`. Node 18+. No dependencies, no build step.
- Keep `server.js`'s routing: clean URLs, 301s from `.html`, 404 page.

## The one thing to build: the free assessment form
`public/free-assessment.html` posts JSON to `POST /api/assessment`. `server.js` currently returns 501, and the page then shows "That didn't send" with Chris's email and phone, so nothing fails silently.

Replace the stub in `server.js`. Body fields: `experience`, `challenge`, `goal`, `name`, `email`, `phone`, `heard` (optional).
- Email the answers to **chris@methodendurance.com.au**. Return HTTP 200 on success, any non-2xx on failure.
- **Notify Chris only. Never send an automated email to the person who filled it in.** The page tells them a person replies within 4 hours, between 7am and 8pm.
- Validate server-side (name, email, phone required). Rate-limit the route. Don't log phone numbers or emails to public logs.

## Preview link vs launch
- The pages are indexable and canonicals point at `https://www.methodendurance.com.au`. A Replit preview URL will therefore be a duplicate of the live domain. For the review period, add `X-Robots-Tag: noindex` to every response on the Replit URL (one line in `server.js`'s `headers`). Remove it on the production domain.
- Launch is 1 January 2027. GPC redirects belong on the old GPC hosts, not here. See `redirect map - 2026-10-30.csv` in the working folder; v5 slugs are `/chris`, `/first-triathlon`, `/free-assessment`, `/athletes`, `/journal`, not the older names in that map.

## Still open before launch (not Replit's job)
- `/privacy-policy` and `/terms-of-service` are linked from the footer but are not in this repo. Bring them across, with the Pty Ltd wording checked.
- Real publish dates for the two 2023 journal posts (Nice, Lahti). The schema omits the date until Chris supplies it.
- Chris to read: the beginner race distances and "8 to 12 weeks" on `/first-triathlon`, and the "Ballarat Marathon" photo caption on `/chris`.
- Bike fit and sweat testing: no prices on the site by design (they depend on group size). The booking link for Performance athletes isn't live on the site yet.
- Run Google's Rich Results Test and check on a real phone. Submit `sitemap.xml` in Search Console and Bing on launch day.
