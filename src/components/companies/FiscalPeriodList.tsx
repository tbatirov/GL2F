import React from 'react';
import { useCompanyStore } from '../../store/companyStore';
import { FiscalPeriod } from '../../types/company';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';

const columnHelper = createColumnHelper<FiscalPeriod>();

const columns = [
  columnHelper.accessor('year', {
    header: 'Year',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('startMonth', {
    header: 'Start Month',
    cell: (info) => new Date(2000, info.getValue() - 1).toLocaleString('default', { month: 'long' }),
  }),
  columnHelper.accessor('endMonth', {
    header: 'End Month',
    cell: (info) => new Date(2000, info.getValue() - 1).toLocaleString('default', { month: 'long' }),
  }),
  columnHelper.accessor('isActive', {
    header: 'Status',
    cell: (info) => (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        info.getValue()
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-800'
      }`}>
        {info.getValue() ? 'Active' : 'Inactive'}
      </span>
    ),
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: (info) => (
      <div className="flex gap-2">
        <button
          onClick={() => info.table.options.meta?.onEdit?.(info.row.original)}
          className="p-1 text-blue-600 hover:text-blue-800"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={() => info.table.options.meta?.onDelete?.(info.row.original.id!)}
          className="p-1 text-red-600 hover:text-red-800"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    ),
  }),
];

interface FiscalPeriodListProps {
  companyId: string;
  onEdit: (period: FiscalPeriod) => void;
}

export const FiscalPeriodList = ({ companyId, onEdit }: FiscalPeriodListProps) => {
  const { getCompanyFiscalPeriods, deleteFiscalPeriod } = useCompanyStore();
  const periods = getCompanyFiscalPeriods(companyId);

  const table = useReactTable({
    data: periods,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      onEdit,
      onDelete: deleteFiscalPeriod,
    },
  });

  if (periods.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow">
        <p className="text-gray-500">No fiscal periods found. Add a period to get started.</p>
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