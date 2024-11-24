import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface FinancialMetricsProps {
  companyId: string;
  period: {
    year: number;
    month: number;
  };
}

export const FinancialMetrics = ({ companyId, period }: FinancialMetricsProps) => {
  const metrics = [
    {
      label: 'Current Ratio',
      value: '1.5',
      change: '+0.2',
      trend: 'up'
    },
    {
      label: 'Quick Ratio',
      value: '1.2',
      change: '-0.1',
      trend: 'down'
    },
    {
      label: 'Debt to Equity',
      value: '0.8',
      change: '-0.05',
      trend: 'up'
    },
    {
      label: 'Profit Margin',
      value: '15%',
      change: '+2%',
      trend: 'up'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Key Financial Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-gray-500">{metric.label}</p>
              {metric.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{metric.value}</p>
            <p className={`mt-1 text-sm ${
              metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {metric.change}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};