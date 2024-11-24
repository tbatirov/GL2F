import React from 'react';
import { useTransactionStore } from '../../store/transactionStore';
import { useStandardStore } from '../../store/standardStore';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

interface TransactionListProps {
  companyId: string | null;
}

const columnHelper = createColumnHelper<any>();

const columns = [
  columnHelper.accessor('date', {
    header: 'Date',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('description', {
    header: 'Description',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('entries', {
    header: 'Debit Account',
    cell: (info) => {
      const debitEntry = info.getValue().find((e: any) => e.type === 'debit');
      return debitEntry?.accountNumber || '-';
    },
  }),
  columnHelper.accessor('entries', {
    id: 'creditAccount',
    header: 'Credit Account',
    cell: (info) => {
      const creditEntry = info.getValue().find((e: any) => e.type === 'credit');
      return creditEntry?.accountNumber || '-';
    },
  }),
  columnHelper.accessor('entries', {
    id: 'amount',
    header: 'Amount',
    cell: (info) => {
      const entry = info.getValue()[0];
      return entry ? `$${entry.amount}` : '-';
    },
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        info.getValue() === 'approved' 
          ? 'bg-green-100 text-green-800'
          : info.getValue() === 'mapped'
          ? 'bg-blue-100 text-blue-800'
          : 'bg-gray-100 text-gray-800'
      }`}>
        {info.getValue().charAt(0).toUpperCase() + info.getValue().slice(1)}
      </span>
    ),
  }),
];

export const TransactionList = ({ companyId }: TransactionListProps) => {
  const transactions = useTransactionStore((state) => 
    state.transactions.filter(t => t.companyId === companyId)
  );

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!companyId) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow">
        <p className="text-gray-500">Please select a company to view transactions.</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow">
        <p className="text-gray-500">No transactions found. Import transactions to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};