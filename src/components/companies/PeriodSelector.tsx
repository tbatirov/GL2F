import React from 'react';
import { useCompanyStore } from '../../store/companyStore';

interface PeriodSelectorProps {
  companyId: string;
  onPeriodChange: (period: { year: number; month: number }) => void;
}

export const PeriodSelector = ({ companyId, onPeriodChange }: PeriodSelectorProps) => {
  const { fiscalPeriods, getCompanyFiscalPeriods, updateFiscalPeriod } = useCompanyStore();
  const periods = getCompanyFiscalPeriods(companyId);
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i).toLocaleString('default', { month: 'long' })
  }));

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onPeriodChange({
      year: parseInt(e.target.value),
      month: new Date().getMonth() + 1
    });
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onPeriodChange({
      year: new Date().getFullYear(),
      month: parseInt(e.target.value)
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Fiscal Year</label>
        <select
          onChange={handleYearChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Month</label>
        <select
          onChange={handleMonthChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {months.map(month => (
            <option key={month.value} value={month.value}>{month.label}</option>
          ))}
        </select>
      </div>

      <div className="pt-4">
        <button
          type="button"
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Set Active Period
        </button>
      </div>
    </div>
  );
};