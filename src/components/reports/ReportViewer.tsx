import React from 'react';
import { FinancialReport } from '../../types/reports';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ReportViewerProps {
  report: FinancialReport;
}

export const ReportViewer = ({ report }: ReportViewerProps) => {
  const formatCurrency = (value: number) =>
    value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });

  const chartData = report.data.sections.flatMap(section =>
    section.items.map(item => ({
      name: item.accountName,
      amount: item.amount,
      section: section.title,
    }))
  );

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{report.name}</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Generated on {report.createdAt.toLocaleDateString()}
          </p>
        </div>

        <div className="border-t border-gray-200">
          {report.data.sections.map((section, index) => (
            <div key={section.title} className={index > 0 ? 'border-t border-gray-200' : ''}>
              <div className="bg-gray-50 px-4 py-5 sm:px-6">
                <h4 className="text-base font-medium text-gray-900">{section.title}</h4>
                <p className="mt-1 text-sm text-gray-500">
                  Total: {formatCurrency(section.total)}
                </p>
              </div>
              <div className="divide-y divide-gray-200">
                {section.items.map((item) => (
                  <div key={item.accountId} className="px-4 py-4 sm:px-6">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {item.accountName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                    {item.percentage && (
                      <div className="mt-1">
                        <div className="relative pt-1">
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                            <div
                              style={{ width: `${item.percentage}%` }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-t border-gray-200">
          <h4 className="text-base font-medium text-gray-900">Summary</h4>
          {Object.entries(report.data.totals).map(([key, value]) => (
            <div key={key} className="mt-2 flex justify-between">
              <span className="text-sm text-gray-500">
                {key.split(/(?=[A-Z])/).join(' ')}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h4 className="text-base font-medium text-gray-900 mb-4">Visual Representation</h4>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="amount" fill="#4f46e5" name="Amount" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};