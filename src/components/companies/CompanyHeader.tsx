import React from 'react';
import { Company } from '../../types/company';
import { Building2, Calendar, Globe } from 'lucide-react';

interface CompanyHeaderProps {
  company: Company;
}

export const CompanyHeader = ({ company }: CompanyHeaderProps) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-100 rounded-lg p-3">
              <Building2 className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{company.name}</h1>
              <p className="text-sm text-gray-500">Code: {company.code}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Globe className="h-4 w-4 mr-1" />
              <span>{company.industry}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Fiscal Year Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};