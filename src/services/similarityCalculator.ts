import { textProcessor } from './textProcessing';
import { mappingLogger } from './mappingLogger';
import computeCosineSimilarity from 'compute-cosine-similarity';

export class SimilarityCalculator {
  private cache: Map<string, number> = new Map();

  calculateSimilarity(vector1: number[], vector2: number[]): number {
    if (vector1.length !== vector2.length) {
      throw new Error('Vectors must have the same length');
    }

    return computeCosineSimilarity(vector1, vector2);
  }

  calculateTextSimilarity(text1: string, text2: string): number {
    const key = this.getCacheKey(text1, text2);
    
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const startTime = performance.now();
    const similarity = textProcessor.calculateSimilarity(text1, text2);
    const duration = performance.now() - startTime;

    this.cache.set(key, similarity);

    mappingLogger.log('info', 'Calculated text similarity', {
      similarity,
      duration,
      textLength1: text1.length,
      textLength2: text2.length
    });

    return similarity;
  }

  private getCacheKey(text1: string, text2: string): string {
    // Ensure consistent cache key regardless of text order
    const sortedTexts = [text1, text2].sort();
    return `${sortedTexts[0]}|${sortedTexts[1]}`;
  }

  clearCache() {
    this.cache.clear();
    mappingLogger.log('info', 'Similarity cache cleared');
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

export const similarityCalculator = new SimilarityCalculator();