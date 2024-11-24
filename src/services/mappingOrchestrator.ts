import { Account, AccountingStandard } from '../types/accounting';
import { Transaction } from '../types/ledger';
import { mappingLogger } from './mappingLogger';
import { ragMapper } from './ragMapper';
import { accountMatcher } from './accountMatcher';
import { transactionPatternMatcher } from './transactionPatternMatcher';
import { transactionAnalyzer } from './transactionAnalyzer';
import { accountPatternBuilder } from './accountPatternBuilder';

interface MappingResult {
  debitAccount?: Account;
  creditAccount?: Account;
  confidence: number;
}

export class MappingOrchestrator {
  private initialized = false;

  async initialize(accounts: Account[], standard: AccountingStandard) {
    const startTime = performance.now();
    
    try {
      // Initialize all mapping components
      await ragMapper.initialize(accounts, standard);
      accountMatcher.initialize(accounts, standard);
      transactionPatternMatcher.initialize();
      accountPatternBuilder.buildPatterns(accounts);

      this.initialized = true;
      
      const duration = performance.now() - startTime;
      mappingLogger.log('info', 'Mapping orchestrator initialized', {
        accountCount: accounts.length,
        standardName: standard.name,
        duration: `${duration.toFixed(2)}ms`
      });
    } catch (error) {
      mappingLogger.log('error', 'Failed to initialize mapping orchestrator', { error });
      throw error;
    }
  }

  async mapTransaction(transaction: Transaction, accounts: Account[]): Promise<MappingResult> {
    if (!this.initialized) {
      throw new Error('Mapping orchestrator not initialized');
    }

    mappingLogger.startAttempt(transaction.id!);
    const startTime = performance.now();

    try {
      // 1. Try RAG mapping first (highest confidence)
      const ragResult = await ragMapper.mapTransaction(transaction);
      
      if (ragResult.confidence > 0.8) {
        const duration = mappingLogger.endAttempt(transaction.id!, true);
        mappingLogger.log('info', 'RAG mapping successful', {
          transactionId: transaction.id,
          confidence: ragResult.confidence,
          duration
        });
        return ragResult;
      }

      // 2. Try pattern matching (medium confidence)
      const patternResult = await this.tryPatternMatching(transaction);
      
      if (patternResult.confidence > 0.7) {
        const duration = mappingLogger.endAttempt(transaction.id!, true);
        mappingLogger.log('info', 'Pattern matching successful', {
          transactionId: transaction.id,
          confidence: patternResult.confidence,
          duration
        });
        return patternResult;
      }

      // 3. Fallback to traditional account matching (lowest confidence)
      const matchResult = await this.tryAccountMatching(transaction);
      
      if (matchResult.confidence > 0) {
        const duration = mappingLogger.endAttempt(transaction.id!, true);
        mappingLogger.log('info', 'Account matching successful', {
          transactionId: transaction.id,
          confidence: matchResult.confidence,
          duration
        });
        return matchResult;
      }

      // No successful match found
      const duration = mappingLogger.endAttempt(transaction.id!, false);
      mappingLogger.log('warning', 'No successful mapping found', {
        transactionId: transaction.id,
        duration
      });

      return { confidence: 0 };

    } catch (error) {
      const duration = performance.now() - startTime;
      mappingLogger.log('error', 'Error mapping transaction', {
        transactionId: transaction.id,
        error,
        duration
      });
      mappingLogger.endAttempt(transaction.id!, false);
      return { confidence: 0 };
    }
  }

  private async tryPatternMatching(transaction: Transaction): Promise<MappingResult> {
    const startTime = performance.now();

    try {
      const matches = transactionPatternMatcher.findMatches(transaction);
      
      if (matches.debitMatches.length > 0 && matches.creditMatches.length > 0) {
        const bestDebit = matches.debitMatches[0];
        const bestCredit = matches.creditMatches[0];
        
        return {
          debitAccount: { id: bestDebit.accountId } as Account,
          creditAccount: { id: bestCredit.accountId } as Account,
          confidence: Math.min(bestDebit.confidence, bestCredit.confidence)
        };
      }

      return { confidence: 0 };

    } catch (error) {
      mappingLogger.log('error', 'Pattern matching failed', {
        transactionId: transaction.id,
        error,
        duration: performance.now() - startTime
      });
      return { confidence: 0 };
    }
  }

  private async tryAccountMatching(transaction: Transaction): Promise<MappingResult> {
    const startTime = performance.now();

    try {
      const debitEntry = transaction.entries.find(e => e.type === 'debit');
      const creditEntry = transaction.entries.find(e => e.type === 'credit');

      if (!debitEntry || !creditEntry) {
        throw new Error('Transaction must have both debit and credit entries');
      }

      const debitAccount = accountMatcher.findMatchingAccount(debitEntry, transaction);
      const creditAccount = accountMatcher.findMatchingAccount(creditEntry, transaction);

      if (debitAccount && creditAccount) {
        return {
          debitAccount,
          creditAccount,
          confidence: 0.6 // Base confidence for traditional matching
        };
      }

      return { confidence: 0 };

    } catch (error) {
      mappingLogger.log('error', 'Account matching failed', {
        transactionId: transaction.id,
        error,
        duration: performance.now() - startTime
      });
      return { confidence: 0 };
    }
  }
}

export const mappingOrchestrator = new MappingOrchestrator();