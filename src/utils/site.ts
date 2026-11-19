import { i18n } from './i18n.js';
import { type Article, listArticles } from './articles.js';

type Lang = keyof typeof i18n;

const LOCALES: Record<Lang, string> = { en: 'en-US', pt: 'pt-BR' };
// Times are shown in São Paulo time for Portuguese readers and in UTC otherwise.
const TIME_ZONES: Record<Lang, string> = { en: 'UTC', pt: 'America/Sao_Paulo' };

export interface DayGroup {
  label: string;
  articles: Article[];
}

// Formatting helpers the templates use, in the page's language.
export function helpers(lang: Lang) {
  const strings = i18n[lang];
  const locale = LOCALES[lang];
  const timeZone = TIME_ZONES[lang];

  const dayLabel = (date: Date) => {
    const label = date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone });
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  const time = (date: Date) => {
    const label = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone });
    return timeZone === 'UTC' ? `${label} UTC` : label;
  };

  // GDELT names places as "City, State, Country"; only the city is shown, and
  // nothing when the place is a whole country.
  const city = (article: Article) =>
    article.placeName?.includes(',') ? article.placeName.split(',')[0]!.trim() : null;

  return {
    dayLabel,
    time,
    city,
    categoryName: (article: Article) => (article.category ? strings.categories[article.category] ?? article.category : null),
    sourcesCount: (article: Article) => (article.sources && article.sources.length > 0 ? strings.sources_count(article.sources.length) : null),
    paragraphs: (text: string) => text.split(/\n+/).map((p) => p.trim()).filter(Boolean),
    dateTime: (date: Date) => `${dayLabel(date)}, ${time(date)}`,
  };
}

function groupByDay(articles: Article[], label: (date: Date) => string): DayGroup[] {
  const groups: DayGroup[] = [];

  for (const article of articles) {
    const day = label(article.publishedAt);
    const last = groups.at(-1);

    if (last && last.label === day) {
      last.articles.push(article);
    } else {
      groups.push({ label: day, articles: [article] });
    }
  }

  return groups;
}

export const PAGE_SIZE = 16;

export function pagePath(lang: Lang, page: number) {
  return page === 1 ? `/${lang}/` : `/${lang}/page/${page}`;
}

export async function indexPage(lang: Lang, page = 1) {
  const articles = await listArticles(lang);
  const pageHelpers = helpers(lang);
  const totalPages = Math.max(1, Math.ceil(articles.length / PAGE_SIZE));
  const pageArticles = articles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return {
    ...i18n[lang],
    ...pageHelpers,
    lang,
    i18n,
    articles,
    page,
    totalPages,
    newerPath: page > 1 ? pagePath(lang, page - 1) : null,
    olderPath: page < totalPages ? pagePath(lang, page + 1) : null,
    groups: groupByDay(pageArticles, pageHelpers.dayLabel),
  };
}

export function articlePage(lang: Lang, article: Article) {
  return {
    ...i18n[lang],
    ...helpers(lang),
    lang,
    i18n,
    article,
    title: `${article.title} · nowly`,
    description: article.lead,
  };
}
