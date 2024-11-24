import { Account, AccountType } from '../types/accounting';
import { textProcessor } from './textProcessing';
import { mappingLogger } from './mappingLogger';

interface AccountPattern {
  code: string;
  type: AccountType;
  keywords: string[];
  description: string;
  vector: number[];
}

export class AccountPatternBuilder {
  private patterns: Map<string, AccountPattern> = new Map();
  private vocabulary: Set<string> = new Set();

  buildPatterns(accounts: Account[]) {
    mappingLogger.log('info', 'Building account patterns', { accountCount: accounts.length });
    const startTime = performance.now();

    // Build vocabulary first
    this.buildVocabulary(accounts);

    // Create patterns for each account
    accounts.forEach(account => {
      const pattern = this.createPattern(account);
      this.patterns.set(account.id!, pattern);
    });

    const duration = performance.now() - startTime;
    mappingLogger.log('info', 'Account patterns built', { 
      patternCount: this.patterns.size,
      vocabularySize: this.vocabulary.size,
      duration: `${duration.toFixed(2)}ms`
    });
  }

  private buildVocabulary(accounts: Account[]) {
    const texts = accounts.map(account => 
      `${account.name} ${account.description || ''} ${account.type} ${account.subtype}`
    );
    this.vocabulary = textProcessor.buildVocabulary(texts);
  }

  private createPattern(account: Account): AccountPattern {
    // Combine account information for text processing
    const text = `${account.name} ${account.description || ''} ${account.type} ${account.subtype}`;
    
    // Extract keywords using TF-IDF
    const keywords = textProcessor.extractKeyPhrases(text);
    
    // Create vector representation
    const vector = textProcessor.createVector(text, this.vocabulary);

    return {
      code: account.code,
      type: account.type,
      keywords,
      description: text,
      vector
    };
  }

  findSimilarAccounts(text: string, type?: AccountType, limit = 5): Array<{ accountId: string; similarity: number }> {
    // Create vector for input text
    const inputVector = textProcessor.createVector(text, this.vocabulary);
    
    // Calculate similarities with all patterns
    const similarities = Array.from(this.patterns.entries())
      .filter(([_, pattern]) => !type || pattern.type === type)
      .map(([accountId, pattern]) => ({
        accountId,
        similarity: textProcessor.calculateSimilarity(inputVector, pattern.vector)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    mappingLogger.log('info', 'Found similar accounts', { 
      inputText: text,
      type,
      matches: similarities.length
    });

    return similarities;
  }

  getPattern(accountId: string): AccountPattern | undefined {
    return this.patterns.get(accountId);
  }

  getVocabularySize(): number {
    return this.vocabulary.size;
  }
}

export const accountPatternBuilder = new AccountPatternBuilder();