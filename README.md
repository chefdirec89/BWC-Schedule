# Bandung World Cinema 2026: schedule planner

Pick screenings for Bandung World Cinema (CGV Paris Van Java, 14 to 21 November 2026), see clashes, and send each pick to Google Calendar. Online screenings run on KlikFilm from 31 October to 21 November 2026.

Nuxt 4 · Tailwind CSS 4 · TypeScript. Plans live in the visitor's browser (localStorage); nothing is sent to a server.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production bundle in .output/
node .output/server/index.mjs
```

## Where things are

```
app/
  assets/css/        main.css (Hallmark stamp, components), tokens.css (Tailwind @theme), base.css
  components/        SiteBand (date strip), DaySchedule + ScreeningSlot (timeline / agenda),
                     ScheduleFilters, PickToggle, CalendarLink, FilmPoster, SiteMasthead, SiteFooter
  composables/       usePlan (picks + clashes), useScheduleFilters (URL state), useFilmMedia (TMDB)
  pages/             / (schedule), /plan, /films, /films/[id]
  plugins/           plan.client.ts loads the plan from localStorage after hydration
server/
  api/films/[id]/media.get.ts   TMDB poster/backdrop/overview, key stays server-side
  utils/tmdb.ts                 lookup + 24h cache
shared/              code used by both app and server (auto-imported)
  data/festival.json            generated: 107 films, 171 screenings
  utils/                        festival constants, time maths, clash detection, Google Calendar + .ics
scripts/build-schedule.mjs      CSV -> shared/data/festival.json
```

## The schedule data

`npm run data` rebuilds `shared/data/festival.json` from `Jakarta World Cinema 2026 Schedule - @cinephileintern.xlsx - JWC.csv`.

- **Dates:** Jakarta runs Sat 31 Oct to Sat 7 Nov; Bandung runs Sat 14 Nov to Sat 21 Nov. Every screening moves exactly 14 days and keeps its weekday and start time.
- **End times** are computed as start + 10 min of pre-show ads + runtime. The sheet's own end time for *Queen at Sea* (row 131) is wrong (14:24; it should be 14:51); the script prints a note.
- **Not shown as Bandung facts:** CGV Grand Indonesia hall numbers, Jakarta Q&A guests and giveaways. They stay in each screening's `source` field. When PVJ halls are known, add a `hall` field in the script.
- **Repaired:** one title in the CSV (*Aquí*) was saved through the wrong encoding; the script fixes it without touching the CSV.
- Two screenings of the closing film *Inherit* start at the same minute in different halls; both are kept, so the count stays at 171.

When the festival publishes its own Bandung times, change the CSV (or `DAY_OFFSET` in the script) and run `npm run data`. Also drop the footer line saying times follow the Jakarta grid.

## TMDB

The integration is wired and idle until a key exists:

1. Copy `.env.example` to `.env` and set `NUXT_TMDB_READ_TOKEN` (v4 read access token, preferred) or `NUXT_TMDB_API_KEY` (v3). On a host, set the same variables in its environment.
2. Restart. `GET /api/films/<id>/media` then searches TMDB by title and year (retrying without the year), caches each answer for 24 hours and never caches failures.
3. If TMDB picks the wrong film, set `tmdbId` for that film in `shared/data/festival.json` (or teach `build-schedule.mjs` a lookup table) to pin it.

Without a key the endpoint answers `{ "status": "unconfigured" }` and film pages use the CSV synopsis with no poster column. The poster is resolved during server rendering, so the layout is settled before the page paints. The footer already carries TMDB's required notice; TMDB also asks for its logo on an about or credits page, which still needs adding.

## Calendar

- **Per screening:** a Google Calendar "create event" link (UTC times, `ctz=Asia/Jakarta`, location *CGV Paris Van Java, Bandung*).
- **Whole plan:** `/plan` downloads one `.ics` file (RFC 5545) for Google Calendar import, Apple Calendar or Outlook.
- **Online window:** an all-day event from 31 Oct to 21 Nov.

Set `NUXT_PUBLIC_SITE_URL` in production so event descriptions link back to the live film pages.

## Design system

Built with [Hallmark](https://github.com/Nutlope/hallmark) (installed in `.claude/skills/hallmark`) on its custom route. The decisions, waivers and the critique are recorded in the stamp at the top of `app/assets/css/main.css`. In short:

- The ground runs from `#EC2B7A` to `#CEFF32` in OKLCH, so it passes through orange and yellow rather than grey. The pink holds for the first 16rem (`--ground-hold`) and the grain sits between the gradient and the content.
- **White type only passes contrast on the pink end** (about 4:1 at #EC2B7A, about 1.2:1 at #CEFF32). White is used for the page titles in the pink hold; everything lower is ink, which passes at least 4.7:1 anywhere on the gradient.
- Archivo, one family: 125% width at weight 900 for display, 100% width at 400 and 600 for text.
- Ink inversion is the only signal: the current day, a pick and the primary action turn solid ink. A dashed frame means a clash.

Check the UI against Hallmark's gates:

```bash
node .claude/skills/hallmark/scripts/sloplint.mjs app --genre editorial --scope app --render --url http://localhost:3000/
```

The render tier needs `puppeteer-core` and Chrome. Set `HALLMARK_PUPPETEER` to a folder holding `puppeteer-core` and `CHROME_PATH` if Chrome is not found.
