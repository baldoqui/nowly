import { i18n } from './i18n.js';
import { type Article, listArticles } from './articles.js';

type Lang = keyof typeof i18n;

const DATE_LOCALES: Record<Lang, string> = { en: 'en-US', pt: 'pt-BR' };

function unique(values: (string | null)[]): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))].sort();
}

// Formatting helpers the templates use, in the page's language.
export function helpers(lang: Lang) {
  const languageNames = new Intl.DisplayNames([DATE_LOCALES[lang]], { type: 'language' });
  const strings = i18n[lang];

  const languageName = (code: string) => {
    try {
      return languageNames.of(code) ?? code;
    } catch {
      return code;
    }
  };

  return {
    languageName,
    paragraphs: (text: string) => text.split(/\n+/).map((p) => p.trim()).filter(Boolean),
    articleMeta: (article: Article) =>
      [
        article.publishedAt.toLocaleDateString(DATE_LOCALES[lang], { dateStyle: 'long', timeZone: 'UTC' }),
        article.category && (strings.categories[article.category] ?? article.category),
        article.placeName,
        article.sourceLanguage && strings.source_language_label(languageName(article.sourceLanguage)),
      ]
        .filter(Boolean)
        .join(' · '),
  };
}

export async function indexPage(lang: Lang) {
  const articles = await listArticles(lang);

  return {
    ...i18n[lang],
    ...helpers(lang),
    lang,
    i18n,
    articles,
    sourceLanguages: unique(articles.map((article) => article.sourceLanguage)),
    countries: unique(articles.map((article) => article.country)),
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
