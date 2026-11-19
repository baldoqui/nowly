import 'dotenv/config';
import pg from 'pg';

// Articles are written by nowly_core into the news_articles table, which is the
// contract between the two projects. Only published articles are read.
export interface Article {
  slug: string;
  locale: string;
  title: string;
  lead: string;
  body: string;
  background: string;
  category: string | null;
  sourceLanguage: string | null;
  placeName: string | null;
  country: string | null;
  sources: { name: string; url: string }[] | null;
  publishedAt: Date;
}

// Site language -> article locales shown under it.
const LOCALES: Record<string, string[]> = {
  en: ['en'],
  pt: ['pt-BR', 'pt-PT', 'pt'],
};

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export async function listArticles(lang: string): Promise<Article[]> {
  const { rows } = await pool.query(
    `
      SELECT
        slug, locale, title, lead, body, background, category,
        source_language AS "sourceLanguage",
        place_name AS "placeName",
        country, sources,
        published_at AS "publishedAt"
      FROM news_articles
      WHERE published_at IS NOT NULL
        AND locale = ANY($1)
      ORDER BY published_at DESC, id DESC
    `,
    [LOCALES[lang] ?? []],
  );

  return rows;
}

export async function closeDatabase(): Promise<void> {
  await pool.end();
}
