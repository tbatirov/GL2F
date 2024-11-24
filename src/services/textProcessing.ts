import stringSimilarity from 'string-similarity';

export class TextProcessor {
  private stopWords: Set<string>;

  constructor() {
    this.stopWords = new Set([
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for',
      'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on',
      'that', 'the', 'to', 'was', 'were', 'will', 'with'
    ]);
  }

  processText(text: string): string[] {
    // Convert to lowercase and split into words
    const words = text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0);
    
    // Remove stop words
    return words.filter(word => !this.stopWords.has(word));
  }

  createVector(text: string, vocabulary: Set<string>): number[] {
    const words = this.processText(text);
    const vector = Array(vocabulary.size).fill(0);
    
    // Convert vocabulary to array for consistent indexing
    const vocabularyArray = Array.from(vocabulary);
    
    words.forEach(word => {
      const index = vocabularyArray.indexOf(word);
      if (index !== -1) {
        vector[index]++;
      }
    });
    
    return vector;
  }

  calculateSimilarity(text1: string, text2: string): number {
    return stringSimilarity.compareTwoStrings(
      text1.toLowerCase(),
      text2.toLowerCase()
    );
  }

  buildVocabulary(texts: string[]): Set<string> {
    const vocabulary = new Set<string>();
    
    texts.forEach(text => {
      const words = this.processText(text);
      words.forEach(word => vocabulary.add(word));
    });
    
    return vocabulary;
  }

  extractKeyPhrases(text: string): string[] {
    const words = this.processText(text);
    const frequencies = new Map<string, number>();
    
    // Count word frequencies
    words.forEach(word => {
      frequencies.set(word, (frequencies.get(word) || 0) + 1);
    });
    
    // Sort by frequency and get top 5
    return Array.from(frequencies.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  findAmountPattern(amount: number): string {
    if (amount === 0) return 'zero';
    if (amount % 1000 === 0) return 'thousand_multiple';
    if (amount % 100 === 0) return 'hundred_multiple';
    if (amount % 1 === 0) return 'whole_number';
    return 'decimal';
  }

  findDatePattern(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    
    if (day === 1) return 'month_start';
    if (day === new Date(date.getFullYear(), month, 0).getDate()) return 'month_end';
    if (day <= 5) return 'month_beginning';
    if (day >= 25) return 'month_ending';
    return 'mid_month';
  }
}

export const textProcessor = new TextProcessor();