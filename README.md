# nowly

Static site for [www.now-ly.com](https://www.now-ly.com), served by GitHub Pages from `docs/` on `main`.

## Data

Articles come from the `news_articles` table in the Postgres database written by
[nowly_core](https://github.com/baldoqui/nowly_core). That table is the contract between the
two projects: nowly_core owns its schema (migrations) and content, and this site only reads
published articles (`src/utils/articles.ts` lists the columns it uses).

Set `DATABASE_URL` in `.env` (see `.env.example`).

## Commands

```bash
npm run dev            # local server on http://localhost:3000, reading Postgres live
npm run build:static   # render every page from Postgres into docs/
```

To publish, run `npm run build:static` on `main`, commit `docs/` and push.
