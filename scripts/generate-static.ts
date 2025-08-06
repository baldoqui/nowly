import * as ejs from 'ejs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'node:fs/promises';
import { i18n } from '../src/utils/i18n.js';
import { getContentUrl, processSources } from '../src/utils/contentProcessor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viewsPath = path.join(__dirname, '../../views/pages');
const publicPath = path.join(__dirname, '../../public');
const docsPath = path.join(__dirname, '../../docs');

async function generateStaticPages() {
  // Ensure docs directory is clean
  await fs.rm(docsPath, { recursive: true, force: true });
  await fs.mkdir(docsPath, { recursive: true });

  // Copy public assets
  await fs.cp(publicPath, docsPath, { recursive: true });

  const pageTemplates = await fs.readdir(viewsPath);

  for (const lang of Object.keys(i18n)) {
    const langDocsPath = path.join(docsPath, lang);
    await fs.mkdir(langDocsPath, { recursive: true });

    for (const templateFile of pageTemplates) {
      if (templateFile.endsWith('.ejs')) {
        const templateName = path.basename(templateFile, '.ejs');
        const templateFilePath = path.join(viewsPath, templateFile);
        const outputFilePath = path.join(langDocsPath, `${templateName}.html`);

        try {
          let contentHtml = '';
          if (templateName === 'index') {
            const contentUrl = getContentUrl(lang);
            const response = await fetch(contentUrl);
            const markdownContent = await response.text();
            contentHtml = await processSources(markdownContent);
          }

          const html = (await ejs.renderFile(templateFilePath, {
            ...(i18n as any)[lang],
            lang: lang,
            i18n: i18n, // Pass the full i18n object
            contentHtml: contentHtml,
          })) as string;
          await fs.writeFile(outputFilePath, html);
          console.log(`Generated ${outputFilePath}`);
        } catch (error) {
          console.error(`Error generating ${templateFile} for ${lang}:`, error);
        }
      }
    }
  }

  // Generate index.html at the root of docs that redirects to /en or /pt based on browser language
  const rootIndexHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>nowly</title>
    <script>
        const userLang = navigator.language || navigator.userLanguage;
        if (userLang.startsWith('pt')) {
            window.location.replace('/pt/index.html');
        } else {
            window.location.replace('/en/index.html');
        }
    </script>
</head>
<body>
    Redirecting...
</body>
</html>`;
  await fs.writeFile(path.join(docsPath, 'index.html'), rootIndexHtmlContent);
  console.log('Generated root index.html for language redirection.');
}

generateStaticPages().catch(console.error);
