import { Transaction } from '../types/ledger';
import { Account } from '../types/accounting';
import { mappingLogger } from './mappingLogger';
import { transactionFeatureExtractor } from './transactionFeatureExtractor';
import { similarityCalculator } from './similarityCalculator';

interface PatternMatchResult {
  accountId: string;
  confidence: number;
  features: string[];
}

export class PatternMatcher {
  private patterns: Map<string, Set<string>> = new Map();
  private accountFeatures: Map<string, Set<string>> = new Map();
  private featureWeights: Map<string, number> = new Map();

  initialize(accounts: Account[]) {
    const startTime = performance.now();
    
    try {
      this.initializeFeatureWeights();
      this.buildAccountFeatures(accounts);
      
      const duration = performance.now() - startTime;
      mappingLogger.log('info', 'Pattern matcher initialized', {
        accountCount: accounts.length,
        patternCount: this.patterns.size,
        duration: `${duration.toFixed(2)}ms`
      });
    } catch (error) {
      mappingLogger.log('error', 'Failed to initialize pattern matcher', { error });
      throw error;
    }
  }

  findMatches(transaction: Transaction): PatternMatchResult[] {
    const startTime = performance.now();
    const matches: PatternMatchResult[] = [];

    try {
      // Extract features from transaction
      const features = transactionFeatureExtractor.extractFeatures(transaction);
      const featureSet = new Set(features.map(f => `${f.type}:${f.value}`));

      // Calculate match scores for each account
      for (const [accountId, accountFeatures] of this.accountFeatures) {
        const score = this.calculateMatchScore(featureSet, accountFeatures);
        if (score > 0) {
          matches.push({
            accountId,
            confidence: score,
            features: Array.from(featureSet)
          });
        }
      }

      // Sort matches by confidence
      matches.sort((a, b) => b.confidence - a.confidence);

      const duration = performance.now() - startTime;
      mappingLogger.log('info', 'Found pattern matches', {
        transactionId: transaction.id,
        matchCount: matches.length,
        topConfidence: matches[0]?.confidence,
        duration: `${duration.toFixed(2)}ms`
      });

      return matches;

    } catch (error) {
      mappingLogger.log('error', 'Error finding pattern matches', {
        transactionId: transaction.id,
        error
      });
      return [];
    }
  }

  learnFromMatch(transaction: Transaction, accountId: string) {
    const startTime = performance.now();

    try {
      const features = transactionFeatureExtractor.extractFeatures(transaction);
      const accountFeatures = this.accountFeatures.get(accountId) || new Set();

      // Add new features to account patterns
      features.forEach(feature => {
        const featureKey = `${feature.type}:${feature.value}`;
        accountFeatures.add(featureKey);
      });

      this.accountFeatures.set(accountId, accountFeatures);

      const duration = performance.now() - startTime;
      mappingLogger.log('info', 'Learned from match', {
        transactionId: transaction.id,
        accountId,
        newFeaturesCount: features.length,
        duration: `${duration.toFixed(2)}ms`
      });

    } catch (error) {
      mappingLogger.log('error', 'Error learning from match', {
        transactionId: transaction.id,
        accountId,
        error
      });
    }
  }

  private initializeFeatureWeights() {
    this.featureWeights.set('description_word', 0.3);
    this.featureWeights.set('description_word_pair', 0.4);
    this.featureWeights.set('amount_range', 0.2);
    this.featureWeights.set('amount_type', 0.15);
    this.featureWeights.set('vendor', 0.25);
    this.featureWeights.set('vendor_type', 0.2);
    this.featureWeights.set('day_of_week', 0.1);
    this.featureWeights.set('day_of_month', 0.1);
    this.featureWeights.set('date_type', 0.15);
    this.featureWeights.set('transaction_type', 0.25);
  }

  private buildAccountFeatures(accounts: Account[]) {
    accounts.forEach(account => {
      const features = new Set<string>();

      // Add account code features
      features.add(`code:${account.code}`);
      
      // Add account type features
      features.add(`type:${account.type}`);
      features.add(`subtype:${account.subtype}`);

      // Add name features
      const nameWords = account.name.toLowerCase().split(/\s+/);
      nameWords.forEach(word => features.add(`name_word:${word}`));

      // Add description features if available
      if (account.description) {
        const descWords = account.description.toLowerCase().split(/\s+/);
        descWords.forEach(word => features.add(`description_word:${word}`));
      }

      this.accountFeatures.set(account.id!, features);
    });
  }

  private calculateMatchScore(
    transactionFeatures: Set<string>,
    accountFeatures: Set<string>
  ): number {
    let totalScore = 0;
    let totalWeight = 0;

    for (const feature of transactionFeatures) {
      const [featureType] = feature.split(':');
      const weight = this.featureWeights.get(featureType) || 0.1;

      if (accountFeatures.has(feature)) {
        totalScore += weight;
      }

      totalWeight += weight;
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }
}

export const patternMatcher = new PatternMatcher();