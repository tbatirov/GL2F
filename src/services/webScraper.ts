import { load } from 'cheerio';
import { mappingLogger } from './mappingLogger';

interface ScrapedPattern {
  code: string;
  description: string;
  keywords: string[];
  source: string;
}

export class WebScraper {
  private readonly sources = {
    lex: 'https://lex.uz/acts/417624',
    mf: 'https://www.mf.uz/accounting-standards.html',
    nalog: 'https://www.nalog.uz/accounting/'
  };

  private async fetchPage(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      mappingLogger.log('error', `Failed to fetch ${url}`, error);
      return null;
    }
  }

  private extractPatterns(html: string, source: string): ScrapedPattern[] {
    const $ = load(html);
    const patterns: ScrapedPattern[] = [];

    // Extract accounting patterns based on the source
    switch (source) {
      case 'lex':
        // Extract from NAS documentation
        $('.accounting-standard').each((_, element) => {
          const code = $(element).find('.code').text().trim();
          const description = $(element).find('.description').text().trim();
          const keywords = $(element)
            .find('.keywords')
            .text()
            .split(',')
            .map(k => k.trim());

          if (code && description) {
            patterns.push({
              code,
              description,
              keywords,
              source: 'NAS Documentation'
            });
          }
        });
        break;

      case 'mf':
        // Extract from Ministry of Finance guidelines
        $('.accounting-guideline').each((_, element) => {
          const code = $(element).find('.account-code').text().trim();
          const description = $(element).find('.guideline-text').text().trim();
          const keywords = $(element)
            .find('.related-terms')
            .text()
            .split(',')
            .map(k => k.trim());

          if (code && description) {
            patterns.push({
              code,
              description,
              keywords,
              source: 'Ministry of Finance'
            });
          }
        });
        break;

      case 'nalog':
        // Extract from Tax Committee examples
        $('.account-example').each((_, element) => {
          const code = $(element).find('.account').text().trim();
          const description = $(element).find('.example-text').text().trim();
          const keywords = $(element)
            .find('.tags')
            .text()
            .split(',')
            .map(k => k.trim());

          if (code && description) {
            patterns.push({
              code,
              description,
              keywords,
              source: 'Tax Committee'
            });
          }
        });
        break;
    }

    return patterns;
  }

  public async updatePatterns(): Promise<ScrapedPattern[]> {
    const allPatterns: ScrapedPattern[] = [];
    
    mappingLogger.log('info', 'Starting pattern update from official sources');

    for (const [source, url] of Object.entries(this.sources)) {
      mappingLogger.log('info', `Fetching patterns from ${source}`);
      
      const html = await this.fetchPage(url);
      if (html) {
        const patterns = this.extractPatterns(html, source);
        allPatterns.push(...patterns);
        
        mappingLogger.log('info', `Found ${patterns.length} patterns from ${source}`);
      }
    }

    mappingLogger.log('info', `Pattern update completed. Total patterns: ${allPatterns.length}`);
    return allPatterns;
  }
}

export const webScraper = new WebScraper();