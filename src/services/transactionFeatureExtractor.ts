import { Transaction } from '../types/ledger';
import { mappingLogger } from './mappingLogger';
import { textProcessor } from './textProcessing';

interface TransactionFeature {
  type: string;
  value: string | number;
  weight: number;
}

export class TransactionFeatureExtractor {
  private static readonly AMOUNT_THRESHOLDS = {
    verySmall: 100,
    small: 1000,
    medium: 10000,
    large: 100000
  };

  extractFeatures(transaction: Transaction): TransactionFeature[] {
    const startTime = performance.now();
    const features: TransactionFeature[] = [];

    try {
      // 1. Description features (weight: 0.35)
      const descriptionFeatures = this.extractDescriptionFeatures(transaction.description);
      features.push(...descriptionFeatures.map(f => ({ ...f, weight: 0.35 })));

      // 2. Amount features (weight: 0.25)
      const amountFeatures = this.extractAmountFeatures(transaction);
      features.push(...amountFeatures.map(f => ({ ...f, weight: 0.25 })));

      // 3. Customer/vendor features (weight: 0.20)
      if (transaction.customerName) {
        const vendorFeatures = this.extractVendorFeatures(transaction.customerName);
        features.push(...vendorFeatures.map(f => ({ ...f, weight: 0.20 })));
      }

      // 4. Date/time features (weight: 0.15)
      const dateFeatures = this.extractDateFeatures(transaction.date);
      features.push(...dateFeatures.map(f => ({ ...f, weight: 0.15 })));

      // 5. Transaction type features (weight: 0.05)
      features.push({
        type: 'transaction_type',
        value: transaction.entries[0]?.type || 'unknown',
        weight: 0.05
      });

      const duration = performance.now() - startTime;
      mappingLogger.log('info', 'Features extracted', {
        transactionId: transaction.id,
        featureCount: features.length,
        duration: `${duration.toFixed(2)}ms`
      });

      return features;

    } catch (error) {
      mappingLogger.log('error', 'Error extracting features', {
        transactionId: transaction.id,
        error
      });
      return features;
    }
  }

  private extractDescriptionFeatures(description: string): TransactionFeature[] {
    const features: TransactionFeature[] = [];
    const words = textProcessor.processText(description);

    // Add individual word features
    words.forEach(word => {
      features.push({
        type: 'description_word',
        value: word,
        weight: 1
      });
    });

    // Add word pair features for adjacent words
    for (let i = 0; i < words.length - 1; i++) {
      features.push({
        type: 'description_word_pair',
        value: `${words[i]}_${words[i + 1]}`,
        weight: 1.2
      });
    }

    return features;
  }

  private extractAmountFeatures(transaction: Transaction): TransactionFeature[] {
    const features: TransactionFeature[] = [];
    const debitEntry = transaction.entries.find(e => e.type === 'debit');
    const amount = debitEntry ? parseFloat(debitEntry.amount) : 0;

    // Add amount range feature
    features.push({
      type: 'amount_range',
      value: this.getAmountRange(amount),
      weight: 1
    });

    // Add round number feature
    if (amount % 1 === 0) {
      features.push({
        type: 'amount_type',
        value: 'whole_number',
        weight: 1.2
      });
    }

    // Add common amount feature
    if (this.isCommonAmount(amount)) {
      features.push({
        type: 'amount_type',
        value: 'common_amount',
        weight: 1.5
      });
    }

    return features;
  }

  private extractVendorFeatures(vendor: string): TransactionFeature[] {
    const features: TransactionFeature[] = [];
    const normalizedVendor = vendor.toLowerCase().trim();

    features.push({
      type: 'vendor',
      value: normalizedVendor,
      weight: 1
    });

    // Add vendor type features based on common keywords
    const vendorTypes = this.detectVendorTypes(normalizedVendor);
    vendorTypes.forEach(type => {
      features.push({
        type: 'vendor_type',
        value: type,
        weight: 1.2
      });
    });

    return features;
  }

  private extractDateFeatures(date: string): TransactionFeature[] {
    const features: TransactionFeature[] = [];
    const dateObj = new Date(date);

    // Add day of week feature
    features.push({
      type: 'day_of_week',
      value: dateObj.getDay(),
      weight: 1
    });

    // Add day of month feature
    features.push({
      type: 'day_of_month',
      value: dateObj.getDate(),
      weight: 1
    });

    // Add special date features
    if (this.isMonthBoundary(dateObj)) {
      features.push({
        type: 'date_type',
        value: 'month_boundary',
        weight: 1.5
      });
    }

    if (this.isWeekend(dateObj)) {
      features.push({
        type: 'date_type',
        value: 'weekend',
        weight: 1.2
      });
    }

    return features;
  }

  private getAmountRange(amount: number): string {
    if (amount <= TransactionFeatureExtractor.AMOUNT_THRESHOLDS.verySmall) return 'very_small';
    if (amount <= TransactionFeatureExtractor.AMOUNT_THRESHOLDS.small) return 'small';
    if (amount <= TransactionFeatureExtractor.AMOUNT_THRESHOLDS.medium) return 'medium';
    if (amount <= TransactionFeatureExtractor.AMOUNT_THRESHOLDS.large) return 'large';
    return 'very_large';
  }

  private isCommonAmount(amount: number): boolean {
    const commonAmounts = [10, 20, 50, 100, 500, 1000];
    return commonAmounts.includes(amount) || amount % 100 === 0;
  }

  private detectVendorTypes(vendor: string): string[] {
    const types: string[] = [];
    const vendorPatterns = [
      { pattern: /(inc|corp|ltd|llc)$/i, type: 'company' },
      { pattern: /(store|shop|mart|market)$/i, type: 'retail' },
      { pattern: /(bank|credit union|financial)/i, type: 'financial' },
      { pattern: /(restaurant|cafe|diner)/i, type: 'food_service' },
      { pattern: /(service|consulting|professional)/i, type: 'service' }
    ];

    vendorPatterns.forEach(({ pattern, type }) => {
      if (pattern.test(vendor)) {
        types.push(type);
      }
    });

    return types;
  }

  private isMonthBoundary(date: Date): boolean {
    const day = date.getDate();
    return day === 1 || day === new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  private isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }
}

export const transactionFeatureExtractor = new TransactionFeatureExtractor();