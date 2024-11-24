import { Account, AccountingStandard } from '../types/accounting';
import { Transaction, TransactionEntry } from '../types/ledger';
import { mappingLogger } from './mappingLogger';
import { similarityCalculator } from './similarityCalculator';
import { textProcessor } from './textProcessing';

export class AccountMatcher {
  private accounts: Account[] = [];
  private standard: AccountingStandard | null = null;
  private accountPatterns: Map<string, string[]> = new Map();

  initialize(accounts: Account[], standard: AccountingStandard) {
    const startTime = performance.now();
    
    this.accounts = accounts;
    this.standard = standard;
    this.accountPatterns.clear();

    // Pre-compute patterns for each account
    accounts.forEach(account => {
      this.accountPatterns.set(
        account.id!,
        this.extractAccountPatterns(account)
      );
    });

    const duration = performance.now() - startTime;
    mappingLogger.log('info', 'Account matcher initialized', {
      accountsCount: accounts.length,
      standardName: standard.name,
      duration
    });
  }

  private extractAccountPatterns(account: Account): string[] {
    const patterns = new Set<string>();
    
    // Add account code and name tokens
    patterns.add(account.code.toLowerCase());
    account.name.toLowerCase().split(/[\s-_]+/).forEach(token => 
      patterns.add(token)
    );
    
    // Add description tokens if available
    if (account.description) {
      account.description.toLowerCase().split(/[\s-_]+/).forEach(token => 
        patterns.add(token)
      );
    }

    // Add type and subtype
    patterns.add(account.type);
    patterns.add(account.subtype);

    return Array.from(patterns);
  }

  findMatchingAccount(
    entry: TransactionEntry,
    transaction: Transaction
  ): Account | undefined {
    const startTime = performance.now();
    
    mappingLogger.log('info', `Finding match for entry ${entry.id}`, {
      accountNumber: entry.accountNumber,
      description: transaction.description
    });

    try {
      // 1. Try exact account code match
      const exactMatch = this.findExactMatch(entry.accountNumber);
      if (exactMatch) {
        const duration = performance.now() - startTime;
        mappingLogger.log('info', `Found exact match: ${exactMatch.code} - ${exactMatch.name}`, {
          duration
        });
        return this.validateAccountMatch(exactMatch, entry) ? exactMatch : undefined;
      }

      // 2. Try fuzzy account code match
      const fuzzyMatch = this.findFuzzyCodeMatch(entry.accountNumber);
      if (fuzzyMatch) {
        const duration = performance.now() - startTime;
        mappingLogger.log('info', `Found fuzzy match: ${fuzzyMatch.code} - ${fuzzyMatch.name}`, {
          duration
        });
        return this.validateAccountMatch(fuzzyMatch, entry) ? fuzzyMatch : undefined;
      }

      // 3. Try description-based match
      const descriptionMatch = this.findDescriptionMatch(
        transaction.description,
        entry.type,
        parseFloat(entry.amount)
      );
      
      if (descriptionMatch) {
        const duration = performance.now() - startTime;
        mappingLogger.log('info', `Found description match: ${descriptionMatch.code} - ${descriptionMatch.name}`, {
          duration
        });
        return this.validateAccountMatch(descriptionMatch, entry) ? descriptionMatch : undefined;
      }

      const duration = performance.now() - startTime;
      mappingLogger.log('warning', 'No matching account found', {
        accountNumber: entry.accountNumber,
        description: transaction.description,
        duration
      });

      return undefined;

    } catch (error) {
      const duration = performance.now() - startTime;
      mappingLogger.log('error', 'Error finding matching account', {
        error,
        duration
      });
      return undefined;
    }
  }

  private findExactMatch(accountNumber: string): Account | undefined {
    return this.accounts.find(account => 
      account.code === accountNumber && account.isActive
    );
  }

  private findFuzzyCodeMatch(accountNumber: string): Account | undefined {
    // Remove all non-numeric characters and leading zeros
    const normalizedInput = accountNumber.replace(/\D/g, '').replace(/^0+/, '');
    
    return this.accounts.find(account => {
      const normalizedCode = account.code.replace(/\D/g, '').replace(/^0+/, '');
      return normalizedCode === normalizedInput && account.isActive;
    });
  }

  private findDescriptionMatch(
    description: string,
    entryType: 'debit' | 'credit',
    amount: number
  ): Account | undefined {
    const processedDescription = textProcessor.processText(description);
    
    // Score each account based on multiple factors
    const scores = this.accounts
      .filter(account => account.isActive)
      .map(account => {
        let score = 0;

        // 1. Pattern matching (40%)
        const patterns = this.accountPatterns.get(account.id!) || [];
        const matchingPatterns = patterns.filter(pattern =>
          processedDescription.includes(pattern)
        );
        score += (matchingPatterns.length / patterns.length) * 0.4;

        // 2. Text similarity (30%)
        const similarity = similarityCalculator.calculateSimilarity(
          description,
          `${account.name} ${account.description || ''}`
        );
        score += similarity * 0.3;

        // 3. Sign convention (20%)
        if (this.standard) {
          const signConvention = this.standard.signConventions[account.type];
          if (signConvention && signConvention.normalBalance === entryType) {
            score += 0.2;
          }
        }

        // 4. Amount range (10%)
        score += this.getAmountRangeScore(amount, account.type) * 0.1;

        return { account, score };
      })
      .sort((a, b) => b.score - a.score);

    return scores[0]?.score > 0.6 ? scores[0].account : undefined;
  }

  private getAmountRangeScore(amount: number, accountType: string): number {
    // Define typical amount ranges for different account types
    const ranges = {
      asset: { small: 1000, medium: 10000, large: 100000 },
      liability: { small: 1000, medium: 10000, large: 100000 },
      expense: { small: 100, medium: 1000, large: 10000 },
      revenue: { small: 100, medium: 1000, large: 10000 }
    };

    const range = ranges[accountType as keyof typeof ranges];
    if (!range) return 0.5; // Default score for unknown types

    if (amount <= range.small) return 1;
    if (amount <= range.medium) return 0.8;
    if (amount <= range.large) return 0.6;
    return 0.4;
  }

  private validateAccountMatch(account: Account, entry: TransactionEntry): boolean {
    if (!this.standard) return true;

    const signConvention = this.standard.signConventions[account.type];
    if (!signConvention) {
      mappingLogger.log('warning', `No sign convention found for account type: ${account.type}`);
      return false;
    }

    // Validate entry type matches account's normal balance
    const isValid = entry.type === signConvention.normalBalance;
    
    if (!isValid) {
      mappingLogger.log('warning', 'Sign convention mismatch', {
        accountType: account.type,
        entryType: entry.type,
        expectedType: signConvention.normalBalance
      });
    }

    return isValid;
  }
}

export const accountMatcher = new AccountMatcher();