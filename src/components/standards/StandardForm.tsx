import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AccountingStandard, accountingStandardSchema, AccountType } from '../../types/accounting';
import { Plus, Minus } from 'lucide-react';

interface StandardFormProps {
  onSubmit: (data: Omit<AccountingStandard, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Partial<AccountingStandard>;
}

export const StandardForm = ({ onSubmit, initialData }: StandardFormProps) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountingStandard>({
    resolver: zodResolver(accountingStandardSchema),
    defaultValues: {
      ...initialData,
      effectiveDate: initialData?.effectiveDate 
        ? new Date(initialData.effectiveDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      isActive: initialData?.isActive ?? true,
      signConventions: initialData?.signConventions ?? {
        asset: { normalBalance: 'debit', increaseBy: 'debit' },
        liability: { normalBalance: 'credit', increaseBy: 'credit' },
        equity: { normalBalance: 'credit', increaseBy: 'credit' },
        revenue: { normalBalance: 'credit', increaseBy: 'credit' },
        expense: { normalBalance: 'debit', increaseBy: 'debit' }
      },
      rules: initialData?.rules ?? []
    },
  });

  const { fields: ruleFields, append: appendRule, remove: removeRule } = useFieldArray({
    control,
    name: 'rules',
  });

  const accountTypes: AccountType[] = ['asset', 'liability', 'equity', 'revenue', 'expense'];

  const handleFormSubmit = (data: any) => {
    // Convert the date string to a Date object before submitting
    const formattedData = {
      ...data,
      effectiveDate: new Date(data.effectiveDate)
    };
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Standard Name</label>
          <input
            type="text"
            {...register('name')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Version</label>
          <input
            type="text"
            {...register('version')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.version && (
            <p className="mt-1 text-sm text-red-600">{errors.version.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          {...register('description')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Effective Date</label>
          <input
            type="date"
            {...register('effectiveDate')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.effectiveDate && (
            <p className="mt-1 text-sm text-red-600">{errors.effectiveDate.message}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('isActive')}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Set as Active Standard
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Account Code Format</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Pattern</label>
            <input
              type="text"
              {...register('accountCodeFormat.pattern')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="^[0-9]{4}$"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              {...register('accountCodeFormat.description')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="4-digit numeric code"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Example</label>
            <input
              type="text"
              {...register('accountCodeFormat.example')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="1000"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Validation Rules</h3>
          <button
            type="button"
            onClick={() => appendRule({
              name: '',
              description: '',
              condition: '',
              errorMessage: '',
              scope: 'account',
            })}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Rule
          </button>
        </div>

        {ruleFields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-12 gap-4 items-start border p-4 rounded-md">
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700">Rule Name</label>
              <input
                type="text"
                {...register(`rules.${index}.name`)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                {...register(`rules.${index}.description`)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700">Condition</label>
              <input
                type="text"
                {...register(`rules.${index}.condition`)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Scope</label>
              <select
                {...register(`rules.${index}.scope`)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="account">Account</option>
                <option value="transaction">Transaction</option>
                <option value="report">Report</option>
              </select>
            </div>
            <div className="col-span-1">
              <button
                type="button"
                onClick={() => removeRule(index)}
                className="mt-6 inline-flex items-center p-2 border border-transparent rounded-md text-red-600 bg-red-100 hover:bg-red-200"
              >
                <Minus className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Sign Conventions</h3>
        <div className="grid grid-cols-1 gap-4">
          {accountTypes.map((type) => (
            <div key={type} className="border p-4 rounded-md">
              <h4 className="text-base font-medium mb-2 capitalize">{type}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Normal Balance</label>
                  <select
                    {...register(`signConventions.${type}.normalBalance`)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="debit">Debit</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Increased By</label>
                  <select
                    {...register(`signConventions.${type}.increaseBy`)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="debit">Debit</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Standard
        </button>
      </div>
    </form>
  );
};