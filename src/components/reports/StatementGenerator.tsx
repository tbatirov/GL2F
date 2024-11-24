import React from 'react';
import { FileText, Download } from 'lucide-react';

interface StatementGeneratorProps {
  companyId: string;
  period: {
    year: number;
    month: number;
  };
}

export const StatementGenerator = ({ companyId, period }: StatementGeneratorProps) => {
  const handleGenerateAll = () => {
    // Will implement actual generation logic later
    console.log('Generating all statements');
  };

  const statements = [
    {
      id: 'income',
      title: 'Income Statement',
      description: 'View profit and loss',
      status: 'ready'
    },
    {
      id: 'balance',
      title: 'Balance Sheet',
      description: 'View financial position',
      status: 'ready'
    },
    {
      id: 'cashflow',
      title: 'Cash Flow',
      description: 'View cash movements',
      status: 'ready'
    },
    {
      id: 'equity',
      title: 'Changes in Equity',
      description: 'View equity changes',
      status: 'ready'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Financial Statements</h2>
        <button
          onClick={handleGenerateAll}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <FileText className="h-4 w-4 mr-2" />
          Generate All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statements.map((statement) => (
          <div
            key={statement.id}
            className="bg-white rounded-lg border shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{statement.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{statement.description}</p>
              </div>
              <button
                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};