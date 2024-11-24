import React, { useState } from 'react';
import { TransactionList } from '../components/transactions/TransactionList';
import { LedgerImport } from '../components/transactions/LedgerImport';
import { TransactionMapping } from '../components/transactions/TransactionMapping';
import { MappingPreview } from '../components/transactions/MappingPreview';
import { Upload } from 'lucide-react';
import { useCompanyStore } from '../store/companyStore';

type WorkflowStep = 'list' | 'import' | 'mapping' | 'preview';

export const Transactions = () => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('list');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const companies = useCompanyStore(state => state.companies);

  const handleImportComplete = () => {
    setCurrentStep('mapping');
  };

  const handleMappingComplete = () => {
    setCurrentStep('preview');
  };

  const handlePreviewComplete = () => {
    setCurrentStep('list');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'import':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Import Transactions</h2>
              <button
                onClick={() => setCurrentStep('list')}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <LedgerImport 
              companyId={selectedCompany} 
              onImportComplete={handleImportComplete}
            />
          </div>
        );
      case 'mapping':
        return (
          <TransactionMapping 
            companyId={selectedCompany}
            onComplete={handleMappingComplete}
          />
        );
      case 'preview':
        return (
          <MappingPreview
            companyId={selectedCompany}
            onApprove={handlePreviewComplete}
            onEdit={() => setCurrentStep('mapping')}
          />
        );
      default:
        return <TransactionList companyId={selectedCompany} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage transactions
          </p>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={selectedCompany || ''}
            onChange={(e) => setSelectedCompany(e.target.value || null)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select Company</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>

          {currentStep === 'list' && (
            <button
              onClick={() => setCurrentStep('import')}
              disabled={!selectedCompany}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Transactions
            </button>
          )}
        </div>
      </div>

      {/* Workflow Progress */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`flex items-center ${currentStep === 'list' ? 'text-indigo-600' : 'text-gray-500'}`}>
              <span className="h-8 w-8 rounded-full border-2 flex items-center justify-center font-medium">
                1
              </span>
              <span className="ml-2">View Transactions</span>
            </div>
            <div className="h-0.5 w-12 bg-gray-200 mx-4" />
            <div className={`flex items-center ${currentStep === 'import' ? 'text-indigo-600' : 'text-gray-500'}`}>
              <span className="h-8 w-8 rounded-full border-2 flex items-center justify-center font-medium">
                2
              </span>
              <span className="ml-2">Import Data</span>
            </div>
            <div className="h-0.5 w-12 bg-gray-200 mx-4" />
            <div className={`flex items-center ${currentStep === 'mapping' ? 'text-indigo-600' : 'text-gray-500'}`}>
              <span className="h-8 w-8 rounded-full border-2 flex items-center justify-center font-medium">
                3
              </span>
              <span className="ml-2">Map Accounts</span>
            </div>
            <div className="h-0.5 w-12 bg-gray-200 mx-4" />
            <div className={`flex items-center ${currentStep === 'preview' ? 'text-indigo-600' : 'text-gray-500'}`}>
              <span className="h-8 w-8 rounded-full border-2 flex items-center justify-center font-medium">
                4
              </span>
              <span className="ml-2">Review & Approve</span>
            </div>
          </div>
        </div>
      </div>

      {renderStepContent()}
    </div>
  );
};