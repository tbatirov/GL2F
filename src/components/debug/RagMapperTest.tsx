import React, { useState } from 'react';
import { useStandardStore } from '../../store/standardStore';
import { ragMapper } from '../../services/ragMapper';
import { mappingLogger } from '../../services/mappingLogger';
import { Transaction } from '../../types/ledger';
import { Play, FileText, AlertCircle } from 'lucide-react';

interface TestResult {
  transaction: Transaction;
  mapping: {
    debitAccount?: any;
    creditAccount?: any;
    confidence: number;
  };
  duration: number;
  logs: any[];
}

const sampleTransaction: Transaction = {
  id: crypto.randomUUID(),
  transactionId: 'TEST-001',
  date: '2024-02-28',
  time: '10:00:00',
  description: 'Payment for office supplies',
  customerName: 'Office Depot',
  companyId: 'test-company',
  entries: [
    {
      id: crypto.randomUUID(),
      transactionId: 'TEST-001',
      accountNumber: '5200',
      type: 'debit',
      amount: '500.00',
      status: 'pending'
    },
    {
      id: crypto.randomUUID(),
      transactionId: 'TEST-001',
      accountNumber: '1000',
      type: 'credit',
      amount: '500.00',
      status: 'pending'
    }
  ],
  status: 'pending'
};

export const RagMapperTest: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [testData, setTestData] = useState<Transaction[]>([sampleTransaction]);
  const { getActiveStandard, getAccounts } = useStandardStore();

  const runTest = async () => {
    try {
      const activeStandard = getActiveStandard();
      if (!activeStandard) {
        throw new Error('No active accounting standard found');
      }

      const accounts = getAccounts(activeStandard.id!);
      if (!accounts.length) {
        throw new Error('No accounts found in chart of accounts');
      }

      setIsProcessing(true);
      setResults([]);
      mappingLogger.clear();

      // Initialize RAG mapper
      await ragMapper.initialize(accounts, activeStandard);

      // Process each transaction
      const testResults = [];
      for (const transaction of testData) {
        const startTime = Date.now();
        const result = await ragMapper.mapTransaction(transaction);
        const duration = Date.now() - startTime;

        testResults.push({
          transaction,
          mapping: result,
          duration,
          logs: mappingLogger.getLogs().filter(log => 
            log.message.includes(transaction.id!)
          )
        });
      }

      setResults(testResults);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Test failed';
      console.error('Test failed:', error);
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const transactions = JSON.parse(content);
        setTestData(transactions);
      } catch (error) {
        alert('Failed to parse test data file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-medium">RAG Mapper Test</h2>
            <p className="mt-1 text-sm text-gray-500">
              Test and debug the RAG mapping system
            </p>
          </div>
          <div className="flex gap-4">
            <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
              <FileText className="h-4 w-4 mr-2" />
              Load Test Data
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="sr-only"
              />
            </label>
            <button
              onClick={runTest}
              disabled={isProcessing}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              <Play className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Run Test'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Test Data</h3>
            <pre className="text-xs text-gray-600 overflow-auto max-h-40">
              {JSON.stringify(testData, null, 2)}
            </pre>
          </div>

          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Results</h3>
              {results.map((result, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-sm font-medium">
                        Transaction: {result.transaction.transactionId}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Duration: {result.duration}ms | Confidence: {(result.mapping.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                    {result.mapping.confidence < 0.7 && (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs">
                      <span className="font-medium">Description: </span>
                      {result.transaction.description}
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">Debit Account: </span>
                      {result.mapping.debitAccount 
                        ? `${result.mapping.debitAccount.code} - ${result.mapping.debitAccount.name}`
                        : 'Not mapped'}
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">Credit Account: </span>
                      {result.mapping.creditAccount
                        ? `${result.mapping.creditAccount.code} - ${result.mapping.creditAccount.name}`
                        : 'Not mapped'}
                    </div>
                  </div>

                  <div className="mt-2">
                    <h5 className="text-xs font-medium mb-1">Logs:</h5>
                    <div className="text-xs text-gray-600 bg-white rounded p-2 max-h-32 overflow-auto">
                      {result.logs.map((log, i) => (
                        <div key={i} className={`${
                          log.level === 'error' 
                            ? 'text-red-600' 
                            : log.level === 'warning'
                            ? 'text-yellow-600'
                            : 'text-gray-600'
                        }`}>
                          [{log.level.toUpperCase()}] {log.message}
                          {log.data && (
                            <pre className="text-xs text-gray-500 ml-4">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};