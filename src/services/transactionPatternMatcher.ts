import { Transaction } from '../types/ledger';
import { Account } from '../types/accounting';
import { mappingLogger } from './mappingLogger';
import { textProcessor } from './textProcessing';
import { similarityCalculator } from './similarityCalculator';

interface PatternMatch {
  accountId: string;
  confidence: number;
  reason: string;
}

export class TransactionPatternMatcher {
  private historicalPatterns: Map<string, { debit: string; credit: string }> = new Map();
  private vendorPatterns: Map<string, { debit: string; credit: string }> = new Map();
  private accountUsageFrequency: Map<string, number> = new Map();

  initialize() {
    this.historicalPatterns.clear();
    this.vendorPatterns.clear();
    this.accountUsageFrequency.clear();
    mappingLogger.log('info', 'Transaction pattern matcher initialized');
  }

  learnFromTransaction(transaction: Transaction, debitAccountId: string, creditAccountId: string) {
    const startTime = performance.now();

    // Learn from description
    const normalizedDesc = this.normalizeText(transaction.description);
    this.historicalPatterns.set(normalizedDesc, { debit: debitAccountId, credit: creditAccountId });

    // Learn from vendor
    if (transaction.customerName) {
      const normalizedVendor = this.normalizeText(transaction.customerName);
      this.vendorPatterns.set(normalizedVendor, { debit: debitAccountId, credit: creditAccountId });
    }

    // Update account usage frequency
    this.incrementAccountUsage(debitAccountId);
    this.incrementAccountUsage(creditAccountId);

    const duration = performance.now() - startTime;
    mappingLogger.log('info', 'Learned from transaction', {
      transactionId: transaction.id,
      duration,
      patternsCount: this.historicalPatterns.size,
      vendorPatternsCount: this.vendorPatterns.size
    });
  }

  findMatches(transaction: Transaction, accounts: Account[]): {
    debitMatches: PatternMatch[];
    creditMatches: PatternMatch[];
  } {
    const startTime = performance.now();
    const results = {
      debitMatches: [] as PatternMatch[],
      creditMatches: [] as PatternMatch[]
    };

    try {
      // 1. Check exact historical matches
      const historicalMatch = this.findHistoricalMatch(transaction);
      if (historicalMatch) {
        results.debitMatches.push({
          accountId: historicalMatch.debit,
          confidence: 0.95,
          reason: 'Historical pattern match'
        });
        results.creditMatches.push({
          accountId: historicalMatch.credit,
          confidence: 0.95,
          reason: 'Historical pattern match'
        });
      }

      // 2. Check vendor patterns
      const vendorMatch = this.findVendorMatch(transaction);
      if (vendorMatch) {
        results.debitMatches.push({
          accountId: vendorMatch.debit,
          confidence: 0.9,
          reason: 'Vendor pattern match'
        });
        results.creditMatches.push({
          accountId: vendorMatch.credit,
          confidence: 0.9,
          reason: 'Vendor pattern match'
        });
      }

      // 3. Find similar descriptions
      const similarMatches = this.findSimilarDescriptionMatches(transaction);
      results.debitMatches.push(...similarMatches.debitMatches);
      results.creditMatches.push(...similarMatches.creditMatches);

      // 4. Add frequency-based suggestions
      const frequencyMatches = this.getFrequencyBasedMatches(accounts);
      results.debitMatches.push(...frequencyMatches);
      results.creditMatches.push(...frequencyMatches);

      const duration = performance.now() - startTime;
      mappingLogger.log('info', 'Found pattern matches', {
        transactionId: transaction.id,
        debitMatchesCount: results.debitMatches.length,
        creditMatchesCount: results.creditMatches.length,
        duration
      });

      return results;

    } catch (error) {
      mappingLogger.log('error', 'Error finding pattern matches', { error });
      return results;
    }
  }

  private normalizeText(text: string): string {
    return text.toLowerCase().trim();
  }

  private incrementAccountUsage(accountId: string) {
    this.accountUsageFrequency.set(
      accountId,
      (this.accountUsageFrequency.get(accountId) || 0) + 1
    );
  }

  private findHistoricalMatch(transaction: Transaction) {
    const normalizedDesc = this.normalizeText(transaction.description);
    return this.historicalPatterns.get(normalizedDesc);
  }

  private findVendorMatch(transaction: Transaction) {
    if (!transaction.customerName) return null;
    const normalizedVendor = this.normalizeText(transaction.customerName);
    return this.vendorPatterns.get(normalizedVendor);
  }

  private findSimilarDescriptionMatches(transaction: Transaction) {
    const results = {
      debitMatches: [] as PatternMatch[],
      creditMatches: [] as PatternMatch[]
    };

    // Find similar descriptions
    for (const [desc, pattern] of this.historicalPatterns.entries()) {
      const similarity = similarityCalculator.calculateSimilarity(
        transaction.description,
        desc
      );

      if (similarity > 0.7) {
        results.debitMatches.push({
          accountId: pattern.debit,
          confidence: similarity * 0.85,
          reason: 'Similar description match'
        });
        results.creditMatches.push({
          accountId: pattern.credit,
          confidence: similarity * 0.85,
          reason: 'Similar description match'
        });
      }
    }

    return results;
  }

  private getFrequencyBasedMatches(accounts: Account[]): PatternMatch[] {
    // Sort accounts by usage frequency
    const sortedAccounts = Array.from(this.accountUsageFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return sortedAccounts.map(([accountId, frequency]) => ({
      accountId,
      confidence: 0.5 + (frequency / (this.historicalPatterns.size * 2)),
      reason: 'Frequently used account'
    }));
  }

  getPatternStats() {
    return {
      historicalPatterns: this.historicalPatterns.size,
      vendorPatterns: this.vendorPatterns.size,
      accountsWithUsage: this.accountUsageFrequency.size
    };
  }
}

export const transactionPatternMatcher = new TransactionPatternMatcher();