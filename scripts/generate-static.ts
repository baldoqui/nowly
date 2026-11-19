import * as ejs from 'ejs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'node:fs/promises';
import { i18n } from '../src/utils/i18n.js';
import { closeDatabase } from '../src/utils/articles.js';
import { articlePage, indexPage } from '../src/utils/site.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://www.now-ly.com';
const viewsPath = path.join(__dirname, '../../views/pages');
const publicPath = path.join(__dirname, '../../public');
const docsPath = path.join(__dirname, '../../docs');

async function render(template: string, data: object, outputFile: string) {
  const html = await ejs.renderFile(path.join(viewsPath, `${template}.ejs`), data);
  await fs.mkdir(path.dirname(path.join(docsPath, outputFile)), { recursive: true });
  await fs.writeFile(path.join(docsPath, outputFile), html);
}

async function generateStaticPages() {
  await fs.rm(docsPath, { recursive: true, force: true });
  await fs.mkdir(docsPath, { recursive: true });
  await fs.cp(publicPath, docsPath, { recursive: true });

  const urls: string[] = [];

  for (const lang of Object.keys(i18n) as (keyof typeof i18n)[]) {
    const page = await indexPage(lang);
    await render('index', page, `${lang}/index.html`);
    urls.push(`/${lang}/`);

    // GitHub Pages serves /en/page/2 from en/page/2.html.
    for (let number = 2; number <= page.totalPages; number++) {
      await render('index', await indexPage(lang, number), `${lang}/page/${number}.html`);
      urls.push(`/${lang}/page/${number}`);
    }

    for (const name of ['about', 'privacy', 'contact']) {
      await render(name, { ...i18n[lang], lang, i18n }, `${lang}/${name}.html`);
      urls.push(`/${lang}/${name}`);
    }

    // GitHub Pages serves /en/<slug> from en/<slug>.html.
    for (const article of page.articles) {
      await render('article', articlePage(lang, article), `${lang}/${article.slug}.html`);
      urls.push(`/${lang}/${encodeURIComponent(article.slug)}`);
    }

    console.log(`Generated ${page.articles.length} articles for ${lang}`);
  }

  await fs.writeFile(
    path.join(docsPath, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${SITE_URL}${url}</loc></url>`).join('\n')}
</urlset>
`,
  );

  // Redirects / to /en or /pt based on the browser language.
  await fs.writeFile(
    path.join(docsPath, 'index.html'),
    `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>nowly</title>
    <script>
        const userLang = navigator.language || navigator.userLanguage;
        window.location.replace(userLang.startsWith('pt') ? '/pt/' : '/en/');
    </script>
</head>
<body>
    <a href="/en/">nowly</a>
</body>
</html>`,
  );

  // Serve files as they are, without Jekyll processing.
  await fs.writeFile(path.join(docsPath, '.nojekyll'), '');
}

generateStaticPages()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDatabase);
