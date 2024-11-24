import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Account, accountSchema } from '../../types/accounting';
import { useStandardStore } from '../../store/standardStore';

interface AccountFormProps {
  onSubmit: (data: Account) => void;
  initialData?: Partial<Account>;
}

export const AccountForm = ({ onSubmit, initialData }: AccountFormProps) => {
  const { getActiveStandard } = useStandardStore();
  const activeStandard = getActiveStandard();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Account>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      ...initialData,
      standardId: activeStandard?.id || '',
    },
  });

  if (!activeStandard) {
    return (
      <div className="text-center py-4">
        <p className="text-red-600">Please select an active accounting standard first.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Standard
        </label>
        <input
          type="text"
          value={activeStandard.name}
          disabled
          className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Account Code
        </label>
        <input
          type="text"
          {...register('code')}
          placeholder={activeStandard.accountCodeFormat.example}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.code && (
          <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Account Name
        </label>
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
        <label className="block text-sm font-medium text-gray-700">
          Account Type
        </label>
        <select
          {...register('type')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Select Type</option>
          {Object.entries(activeStandard.signConventions).map(([type]) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
        {errors.type && (
          <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Account Subtype
        </label>
        <select
          {...register('subtype')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Select Subtype</option>
          <option value="current-asset">Current Asset</option>
          <option value="non-current-asset">Non-Current Asset</option>
          <option value="current-liability">Current Liability</option>
          <option value="non-current-liability">Non-Current Liability</option>
          <option value="contributed-capital">Contributed Capital</option>
          <option value="retained-earnings">Retained Earnings</option>
          <option value="operating-revenue">Operating Revenue</option>
          <option value="other-revenue">Other Revenue</option>
          <option value="operating-expense">Operating Expense</option>
          <option value="other-expense">Other Expense</option>
        </select>
        {errors.subtype && (
          <p className="mt-1 text-sm text-red-600">{errors.subtype.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          {...register('isActive')}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label className="ml-2 block text-sm text-gray-900">
          Active Account
        </label>
      </div>

      <button
        type="submit"
        className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Save Account
      </button>
    </form>
  );
};