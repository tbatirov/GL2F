import React from 'react';
import { useCompanyStore } from '../../store/companyStore';
import { Company, Industry } from '../../types/company';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';

const columnHelper = createColumnHelper<Company>();

const INDUSTRY_LABELS: Record<Industry, string> = {
  agriculture: 'Agriculture',
  construction: 'Construction',
  education: 'Education',
  financial_services: 'Financial Services',
  healthcare: 'Healthcare',
  hospitality: 'Hospitality',
  information_technology: 'Information Technology',
  manufacturing: 'Manufacturing',
  mining: 'Mining',
  real_estate: 'Real Estate',
  retail: 'Retail',
  telecommunications: 'Telecommunications',
  transportation: 'Transportation',
  utilities: 'Utilities',
  other: 'Other'
};

interface CompanyListProps {
  onEdit: (company: Company) => void;
  onRowClick: (company: Company) => void;
}

export const CompanyList = ({ onEdit, onRowClick }: CompanyListProps) => {
  const { companies, deleteCompany } = useCompanyStore();

  const columns = [
    columnHelper.accessor('name', {
      header: 'Company Name',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('code', {
      header: 'Code',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('industry', {
      header: 'Industry',
      cell: (info) => INDUSTRY_LABELS[info.getValue()],
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('phone', {
      header: 'Phone',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(info.row.original);
            }}
            className="p-1 text-blue-600 hover:text-blue-800"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteCompany(info.row.original.id!);
            }}
            className="p-1 text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: companies,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (companies.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow">
        <p className="text-gray-500">No companies found. Add a company to get started.</p>
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
            <tr 
              key={row.id} 
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onRowClick(row.original)}
            >
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