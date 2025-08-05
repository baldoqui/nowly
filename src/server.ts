import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


import { i18n } from './utils/i18n.js';
import { getContentUrl, processSources } from './utils/contentProcessor.js';

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  const lang = req.headers['accept-language']?.startsWith('pt') ? 'pt' : 'en';
  res.redirect(`/${lang}`);
});

app.get('/:lang', async (req, res) => {
  const lang = req.params.lang === 'pt' ? 'pt' : 'en';
  let contentHtml = '';
  try {
    const contentUrl = getContentUrl(lang);
    const response = await fetch(contentUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const markdownContent = await response.text();
    contentHtml = await processSources(markdownContent);
  } catch (error) {
    console.error('Failed to load or process content:', error);
    contentHtml = `<p>${i18n[lang].error}</p>`;
  }
  res.render('pages/index', { ...i18n[lang], lang, contentHtml });
});


app.get('/:lang/about', (req, res) => {
  const lang = req.params.lang === 'pt' ? 'pt' : 'en';
  res.render('pages/about', { ...i18n[lang], lang });
});

app.get('/:lang/contact', (req, res) => {
  const lang = req.params.lang === 'pt' ? 'pt' : 'en';
  res.render('pages/contact', { ...i18n[lang], lang });
});

app.get('/:lang/privacy', (req, res) => {
  const lang = req.params.lang === 'pt' ? 'pt' : 'en';
  res.render('pages/privacy', { ...i18n[lang], lang });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});