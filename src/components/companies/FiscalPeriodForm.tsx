import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiscalPeriod, fiscalPeriodSchema } from '../../types/company';

interface FiscalPeriodFormProps {
  onSubmit: (data: Omit<FiscalPeriod, 'id' | 'createdAt' | 'updatedAt'>) => void;
  companyId: string;
  initialData?: Partial<FiscalPeriod>;
}

export const FiscalPeriodForm = ({ onSubmit, companyId, initialData }: FiscalPeriodFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FiscalPeriod>({
    resolver: zodResolver(fiscalPeriodSchema),
    defaultValues: {
      ...initialData,
      companyId,
      year: initialData?.year || new Date().getFullYear(),
      startMonth: initialData?.startMonth || 1,
      endMonth: initialData?.endMonth || 12,
      isActive: initialData?.isActive || false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Year</label>
          <input
            type="number"
            {...register('year', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.year && (
            <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Start Month</label>
          <select
            {...register('startMonth', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          {errors.startMonth && (
            <p className="mt-1 text-sm text-red-600">{errors.startMonth.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">End Month</label>
          <select
            {...register('endMonth', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          {errors.endMonth && (
            <p className="mt-1 text-sm text-red-600">{errors.endMonth.message}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('isActive')}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Set as Active Period
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Fiscal Period
        </button>
      </div>
    </form>
  );
};