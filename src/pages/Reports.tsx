import React, { useState } from 'react';
import { ReportGenerator } from '../components/reports/ReportGenerator';
import { ReportViewer } from '../components/reports/ReportViewer';
import { useReportStore } from '../store/reportStore';
import { FinancialReport } from '../types/reports';

export const Reports = () => {
  const [currentReport, setCurrentReport] = useState<FinancialReport | null>(null);
  const generateReport = useReportStore((state) => state.generateReport);

  const handleGenerateReport = (
    type: FinancialReport['type'],
    period: { start: Date; end: Date }
  ) => {
    const report = generateReport(type, period);
    setCurrentReport(report);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Financial Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate and view financial statements and analysis
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Generate Report</h2>
        <ReportGenerator onGenerate={handleGenerateReport} />
      </div>

      {currentReport && (
        <ReportViewer report={currentReport} />
      )}
    </div>
  );
};