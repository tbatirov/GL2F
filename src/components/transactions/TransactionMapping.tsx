import React, { useState, useEffect } from 'react';
import { useTransactionStore } from '../../store/transactionStore';
import { useStandardStore } from '../../store/standardStore';
import { TransactionMappingStatus } from './TransactionMappingStatus';
import { TransactionMappingTable } from './TransactionMappingTable';
import { MappingDebugPanel } from './MappingDebugPanel';
import { mappingLogger } from '../../services/mappingLogger';
import { ragMapper } from '../../services/ragMapper';
import { accountPatternBuilder } from '../../services/accountPatternBuilder';
import { transactionAnalyzer } from '../../services/transactionAnalyzer';
import { AlertCircle } from 'lucide-react';

interface TransactionMappingProps {
  companyId: string | null;
  onComplete: () => void;
}

export const TransactionMapping: React.FC<TransactionMappingProps> = ({
  companyId,
  onComplete
}) => {
  const [isAutoMapping, setIsAutoMapping] = useState(false);
  const [mappingErrors, setMappingErrors] = useState<Record<string, string>>({});
  const [autoMapError, setAutoMapError] = useState<string | null>(null);
  const [mappingProgress, setMappingProgress] = useState(0);
  const { transactions, autoMapTransactions, updateTransactionMapping } = useTransactionStore();
  const { getActiveStandard, getAccounts } = useStandardStore();
  const activeStandard = getActiveStandard();

  const companyTransactions = transactions.filter(t => t.companyId === companyId);

  const handleAutoMap = async () => {
    if (!companyId || !activeStandard) {
      setAutoMapError('No active accounting standard found');
      return;
    }

    const accounts = getAccounts(activeStandard.id!);
    if (!accounts.length) {
      setAutoMapError('No accounts found in chart of accounts');
      return;
    }
    
    setIsAutoMapping(true);
    setAutoMapError(null);
    setMappingProgress(0);
    mappingLogger.clear();
    
    try {
      // Initialize pattern builders and analyzers
      accountPatternBuilder.buildPatterns(accounts);
      const features = transactionAnalyzer.analyzeTransactions(companyTransactions);
      
      // Initialize RAG mapper
      await ragMapper.initialize(accounts, activeStandard);

      // Process transactions in batches to show progress
      const batchSize = 10;
      const totalBatches = Math.ceil(companyTransactions.length / batchSize);
      
      for (let i = 0; i < companyTransactions.length; i += batchSize) {
        const batch = companyTransactions.slice(i, i + batchSize);
        await Promise.all(batch.map(async transaction => {
          try {
            const result = await ragMapper.mapTransaction(transaction);
            if (result.debitAccount && result.creditAccount) {
              updateTransactionMapping(
                transaction.id!,
                result.debitAccount.id!,
                result.creditAccount.id!
              );
            }
          } catch (error) {
            mappingLogger.log('error', `Failed to map transaction ${transaction.id}`, error);
            setMappingErrors(prev => ({
              ...prev,
              [transaction.id!]: 'Failed to map transaction'
            }));
          }
        }));

        // Update progress
        setMappingProgress(((i + batch.length) / companyTransactions.length) * 100);
        
        // Small delay to prevent UI blocking
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Auto-mapping failed';
      setAutoMapError(errorMessage);
      mappingLogger.log('error', 'Auto-mapping failed', error);
    } finally {
      setIsAutoMapping(false);
      setMappingProgress(100);
    }
  };

  const handleAccountSelect = (transactionId: string, entryType: 'debit' | 'credit', accountId: string) => {
    updateTransactionMapping(transactionId, entryType === 'debit' ? accountId : '', entryType === 'credit' ? accountId : '');
  };

  // Start auto-mapping when component mounts
  useEffect(() => {
    if (companyId && activeStandard && companyTransactions.length > 0) {
      handleAutoMap();
    }
  }, [companyId, activeStandard?.id]);

  if (!companyId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Company Required</h3>
            <p className="mt-2 text-sm text-yellow-700">
              Please select a company to start mapping transactions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!activeStandard) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Standard Required</h3>
            <p className="mt-2 text-sm text-yellow-700">
              Please set an active accounting standard before mapping transactions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {autoMapError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Auto-mapping Error</h3>
              <p className="mt-2 text-sm text-red-700">{autoMapError}</p>
            </div>
          </div>
        </div>
      )}

      <TransactionMappingStatus
        companyId={companyId}
        onAutoMap={handleAutoMap}
        onComplete={onComplete}
        isAutoMapping={isAutoMapping}
        progress={mappingProgress}
        hasErrors={Object.keys(mappingErrors).length > 0}
      />

      <TransactionMappingTable
        transactions={companyTransactions}
        onAccountSelect={handleAccountSelect}
        errors={mappingErrors}
      />

      <MappingDebugPanel />
    </div>
  );
};