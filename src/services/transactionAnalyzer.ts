import { Transaction } from '../types/ledger';
import { textProcessor } from './textProcessing';
import { mappingLogger } from './mappingLogger';

interface TransactionFeatures {
  id: string;
  description: string;
  keywords: string[];
  vector: number[];
  amount: number;
  amountPattern: string;
  datePattern: string;
  customerPattern?: string;
}

export class TransactionAnalyzer {
  private vocabulary: Set<string>;
  private commonVendors: Map<string, number> = new Map();
  private amountRanges: Map<string, { min: number; max: number }> = new Map();

  constructor() {
    this.vocabulary = new Set();
    this.initializeAmountRanges();
  }

  private initializeAmountRanges() {
    this.amountRanges.set('very_small', { min: 0, max: 100 });
    this.amountRanges.set('small', { min: 100, max: 1000 });
    this.amountRanges.set('medium', { min: 1000, max: 10000 });
    this.amountRanges.set('large', { min: 10000, max: 100000 });
    this.amountRanges.set('very_large', { min: 100000, max: Infinity });
  }

  analyzeTransactions(transactions: Transaction[]): Map<string, TransactionFeatures> {
    const startTime = performance.now();
    mappingLogger.log('info', 'Starting transaction analysis', { count: transactions.length });

    // Build vocabulary from all transaction descriptions
    this.buildVocabulary(transactions);

    // Analyze vendor frequencies
    this.analyzeVendors(transactions);

    // Create features for each transaction
    const features = new Map<string, TransactionFeatures>();
    transactions.forEach(transaction => {
      features.set(transaction.id!, this.extractFeatures(transaction));
    });

    const duration = performance.now() - startTime;
    mappingLogger.log('info', 'Transaction analysis completed', {
      transactionCount: transactions.length,
      vocabularySize: this.vocabulary.size,
      vendorCount: this.commonVendors.size,
      duration: `${duration.toFixed(2)}ms`
    });

    return features;
  }

  private buildVocabulary(transactions: Transaction[]) {
    const texts = transactions.map(t => 
      `${t.description} ${t.customerName || ''}`
    );
    this.vocabulary = textProcessor.buildVocabulary(texts);
  }

  private analyzeVendors(transactions: Transaction[]) {
    this.commonVendors.clear();
    transactions.forEach(transaction => {
      if (transaction.customerName) {
        const vendor = transaction.customerName.toLowerCase();
        this.commonVendors.set(
          vendor,
          (this.commonVendors.get(vendor) || 0) + 1
        );
      }
    });
  }

  private extractFeatures(transaction: Transaction): TransactionFeatures {
    const text = `${transaction.description} ${transaction.customerName || ''}`;
    const debitEntry = transaction.entries.find(e => e.type === 'debit');
    const amount = debitEntry ? parseFloat(debitEntry.amount) : 0;

    const features: TransactionFeatures = {
      id: transaction.id!,
      description: transaction.description,
      keywords: textProcessor.extractKeyPhrases(text),
      vector: textProcessor.createVector(text, this.vocabulary),
      amount,
      amountPattern: textProcessor.findAmountPattern(amount),
      datePattern: textProcessor.findDatePattern(transaction.date)
    };

    if (transaction.customerName) {
      const vendorFrequency = this.commonVendors.get(transaction.customerName.toLowerCase()) || 0;
      if (vendorFrequency > 1) {
        features.customerPattern = 'recurring_vendor';
      }
    }

    return features;
  }

  getVocabulary(): Set<string> {
    return this.vocabulary;
  }

  getCommonVendors(): Map<string, number> {
    return this.commonVendors;
  }
}

export const transactionAnalyzer = new TransactionAnalyzer();