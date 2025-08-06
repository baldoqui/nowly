import { marked } from 'marked';
import * as cheerio from 'cheerio';

export function getContentUrl(lang: string): string {
  if (lang === "pt") return "https://content.now-ly.com/lasthour-pt.txt";
  else return "https://content.now-ly.com/lasthour-en.txt";
}

export async function processSources(markdownContent: string): Promise<string> {
  const htmlContent = await marked.parse(markdownContent);

  const $ = cheerio.load(htmlContent);
  const contentDiv = $('<div>').html(htmlContent); // Create a temporary div to hold content

  let currentH2Wrapper: any | null = null;
  let sectionLinks: { href: string; text: string }[] = [];

  const createSourceContainer = (links: { href: string; text: string }[], targetWrapper: any) => {
    if (links.length === 0) return;

    const sourceIndicatorContainer = $('<div class="source-indicator-container">');

    links.forEach(linkData => {
      const sourceItem = $('<div class="source-item">');
      const faviconImg = $(`<img class="source-favicon" src="https://www.google.com/s2/favicons?domain=${new URL(linkData.href).hostname}" alt="Favicon for ${new URL(linkData.href).hostname}">`);
      sourceItem.append(faviconImg);
      sourceIndicatorContainer.append(sourceItem);

      // Add a data attribute for the link, to be handled by client-side JS
      sourceItem.attr('data-href', linkData.href);
    });

    targetWrapper.append(sourceIndicatorContainer);
  };

  contentDiv.children().each((_idx, el) => {
    const child = $(el);
    if (child.is("h2")) {
      if (currentH2Wrapper && sectionLinks.length > 0) {
        createSourceContainer(sectionLinks, currentH2Wrapper);
      }
      const h2Wrapper = $('<div class="h2-section-wrapper">');
      child.before(h2Wrapper);
      h2Wrapper.append(child);
      currentH2Wrapper = h2Wrapper;
      sectionLinks = [];
    } else if (child.is("p")) {
      const links = child.find("a");
      if (links.length > 0) {
        links.each((_linkIdx, linkEl) => {
          const link = $(linkEl);
          sectionLinks.push({ href: link.attr('href') || '', text: link.text() });
        });
        child.remove(); // Remove the paragraph if it contained links
      }
    }
  });

  if (sectionLinks.length > 0) {
    if (currentH2Wrapper) {
      createSourceContainer(sectionLinks, currentH2Wrapper);
    } else {
      const h2Wrapper = $('<div class="h2-section-wrapper">');
      contentDiv.prepend(h2Wrapper);
      createSourceContainer(sectionLinks, h2Wrapper);
    }
  }
  return contentDiv.html() || '';
}