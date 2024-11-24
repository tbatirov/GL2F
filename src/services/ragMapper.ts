import { Account, AccountingStandard } from '../types/accounting';
import { Transaction } from '../types/ledger';
import { mappingLogger } from './mappingLogger';
import { textProcessor } from './textProcessing';
import { similarityCalculator } from './similarityCalculator';
import { transactionFeatureExtractor } from './transactionFeatureExtractor';

interface RAGResult {
  debitAccount?: Account;
  creditAccount?: Account;
  confidence: number;
}

export class RAGMapper {
  private accounts: Account[] = [];
  private standard: AccountingStandard | null = null;
  private accountEmbeddings: Map<string, number[]> = new Map();
  private vocabulary: Set<string> = new Set();

  async initialize(accounts: Account[], standard: AccountingStandard) {
    const startTime = performance.now();
    
    try {
      this.accounts = accounts;
      this.standard = standard;
      this.accountEmbeddings.clear();
      
      // Build vocabulary from account descriptions
      this.buildVocabulary(accounts);
      
      // Create embeddings for each account
      await this.createAccountEmbeddings(accounts);

      const duration = performance.now() - startTime;
      mappingLogger.log('info', 'RAG mapper initialized', {
        accountCount: accounts.length,
        vocabularySize: this.vocabulary.size,
        duration: `${duration.toFixed(2)}ms`
      });
    } catch (error) {
      mappingLogger.log('error', 'Failed to initialize RAG mapper', { error });
      throw error;
    }
  }

  async mapTransaction(transaction: Transaction): Promise<RAGResult> {
    const startTime = performance.now();
    
    try {
      // Extract features from transaction
      const features = transactionFeatureExtractor.extractFeatures(transaction);
      
      // Create transaction embedding
      const transactionEmbedding = await this.createTransactionEmbedding(transaction, features);
      
      // Find best matching accounts
      const matches = this.findBestMatches(transactionEmbedding, transaction);
      
      const duration = performance.now() - startTime;
      mappingLogger.log('info', 'RAG mapping completed', {
        transactionId: transaction.id,
        confidence: matches.confidence,
        duration: `${duration.toFixed(2)}ms`
      });

      return matches;

    } catch (error) {
      mappingLogger.log('error', 'RAG mapping failed', {
        transactionId: transaction.id,
        error
      });
      return { confidence: 0 };
    }
  }

  private buildVocabulary(accounts: Account[]) {
    const texts = accounts.map(account => 
      `${account.name} ${account.description || ''} ${account.type} ${account.subtype}`
    );
    this.vocabulary = textProcessor.buildVocabulary(texts);
  }

  private async createAccountEmbeddings(accounts: Account[]) {
    for (const account of accounts) {
      const text = `${account.name} ${account.description || ''} ${account.type} ${account.subtype}`;
      const embedding = textProcessor.createVector(text, this.vocabulary);
      this.accountEmbeddings.set(account.id!, embedding);
    }
  }

  private async createTransactionEmbedding(
    transaction: Transaction,
    features: any[]
  ): Promise<number[]> {
    // Combine transaction description and features
    const text = [
      transaction.description,
      transaction.customerName || '',
      ...features.map(f => `${f.type}:${f.value}`)
    ].join(' ');

    return textProcessor.createVector(text, this.vocabulary);
  }

  private findBestMatches(
    transactionEmbedding: number[],
    transaction: Transaction
  ): RAGResult {
    const debitEntry = transaction.entries.find(e => e.type === 'debit');
    const creditEntry = transaction.entries.find(e => e.type === 'credit');

    if (!debitEntry || !creditEntry) {
      return { confidence: 0 };
    }

    // Calculate similarity scores for all accounts
    const scores = Array.from(this.accountEmbeddings.entries())
      .map(([accountId, embedding]) => {
        const similarity = similarityCalculator.calculateSimilarity(
          transactionEmbedding,
          embedding
        );

        const account = this.accounts.find(a => a.id === accountId);
        if (!account || !this.standard) return { account, similarity: 0 };

        // Apply sign convention boost
        const signConvention = this.standard.signConventions[account.type];
        if (signConvention) {
          const boost = this.getSignConventionBoost(
            signConvention.normalBalance,
            parseFloat(debitEntry.amount)
          );
          return { account, similarity: similarity * boost };
        }

        return { account, similarity };
      })
      .sort((a, b) => b.similarity - a.similarity);

    // Get best matches for debit and credit
    const bestDebit = scores.find(s => 
      this.isValidDebitAccount(s.account, debitEntry.amount)
    );
    
    const bestCredit = scores.find(s => 
      s.account !== bestDebit?.account && 
      this.isValidCreditAccount(s.account, creditEntry.amount)
    );

    if (!bestDebit || !bestCredit) {
      return { confidence: 0 };
    }

    return {
      debitAccount: bestDebit.account,
      creditAccount: bestCredit.account,
      confidence: Math.min(bestDebit.similarity, bestCredit.similarity)
    };
  }

  private isValidDebitAccount(account: Account, amount: string): boolean {
    if (!this.standard || !account) return false;
    
    const signConvention = this.standard.signConventions[account.type];
    if (!signConvention) return false;

    return signConvention.normalBalance === 'debit';
  }

  private isValidCreditAccount(account: Account, amount: string): boolean {
    if (!this.standard || !account) return false;
    
    const signConvention = this.standard.signConventions[account.type];
    if (!signConvention) return false;

    return signConvention.normalBalance === 'credit';
  }

  private getSignConventionBoost(normalBalance: string, amount: number): number {
    // Boost score if amount sign matches normal balance
    if ((amount > 0 && normalBalance === 'debit') ||
        (amount < 0 && normalBalance === 'credit')) {
      return 1.2;
    }
    return 0.8;
  }
}

export const ragMapper = new RAGMapper();