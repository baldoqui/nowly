import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { i18n } from './utils/i18n.js';
import { articlePage, indexPage } from './utils/site.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

type Lang = keyof typeof i18n;
const toLang = (value: string): Lang => (value === 'pt' ? 'pt' : 'en');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  const lang = req.headers['accept-language']?.startsWith('pt') ? 'pt' : 'en';
  res.redirect(`/${lang}`);
});

app.get('/:lang', async (req, res) => {
  res.render('pages/index', await indexPage(toLang(req.params.lang)));
});

app.get('/:lang/page/:page', async (req, res) => {
  const page = Number(req.params.page);
  const data = await indexPage(toLang(req.params.lang), Number.isInteger(page) && page > 0 ? page : 1);
  res.render('pages/index', data);
});

for (const name of ['about', 'contact', 'privacy']) {
  app.get(`/:lang/${name}`, (req, res) => {
    const lang = toLang(req.params.lang);
    res.render(`pages/${name}`, { ...i18n[lang], lang, i18n });
  });
}

app.get('/:lang/:slug', async (req, res) => {
  const lang = toLang(req.params.lang);
  const page = await indexPage(lang);
  const article = page.articles.find((item) => item.slug === req.params.slug);

  if (!article) {
    res.status(404).send('Not found');
    return;
  }

  res.render('pages/article', articlePage(lang, article));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
