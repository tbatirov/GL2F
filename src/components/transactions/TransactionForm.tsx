import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAccountStore } from '../../store/accountStore';
import { Plus, Minus } from 'lucide-react';

const transactionEntrySchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  debit: z.number().min(0),
  credit: z.number().min(0),
  description: z.string().optional(),
});

const transactionSchema = z.object({
  date: z.string(),
  description: z.string().min(3, 'Description is required'),
  entries: z.array(transactionEntrySchema)
    .min(2, 'At least two entries are required')
    .refine(
      (entries) => {
        const totalDebits = entries.reduce((sum, entry) => sum + entry.debit, 0);
        const totalCredits = entries.reduce((sum, entry) => sum + entry.credit, 0);
        return Math.abs(totalDebits - totalCredits) < 0.01;
      },
      { message: 'Debits must equal credits' }
    ),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => void;
}

export const TransactionForm = ({ onSubmit }: TransactionFormProps) => {
  const accounts = useAccountStore((state) => state.accounts);
  
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      entries: [
        { accountId: '', debit: 0, credit: 0 },
        { accountId: '', debit: 0, credit: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'entries',
  });

  const entries = watch('entries');
  const totalDebits = entries?.reduce((sum, entry) => sum + (entry.debit || 0), 0) || 0;
  const totalCredits = entries?.reduce((sum, entry) => sum + (entry.credit || 0), 0) || 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            {...register('date')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <input
            type="text"
            {...register('description')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Entries</h3>
          <button
            type="button"
            onClick={() => append({ accountId: '', debit: 0, credit: 0 })}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Entry
          </button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-12 gap-4 items-start">
            <div className="col-span-4">
              <select
                {...register(`entries.${index}.accountId`)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select Account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.code} - {account.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-3">
              <input
                type="number"
                step="0.01"
                placeholder="Debit"
                {...register(`entries.${index}.debit`, { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="col-span-3">
              <input
                type="number"
                step="0.01"
                placeholder="Credit"
                {...register(`entries.${index}.credit`, { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="col-span-2">
              {index >= 2 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mt-1 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-600 bg-red-100 hover:bg-red-200"
                >
                  <Minus className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        <div className="flex justify-end space-x-4 text-sm">
          <div>Total Debits: ${totalDebits.toFixed(2)}</div>
          <div>Total Credits: ${totalCredits.toFixed(2)}</div>
          <div>Difference: ${Math.abs(totalDebits - totalCredits).toFixed(2)}</div>
        </div>

        {errors.entries && (
          <p className="mt-1 text-sm text-red-600">{errors.entries.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Transaction
        </button>
      </div>
    </form>
  );
};