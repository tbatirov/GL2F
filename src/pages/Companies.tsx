import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanyList } from '../components/companies/CompanyList';
import { CompanyForm } from '../components/companies/CompanyForm';
import { useCompanyStore } from '../store/companyStore';
import { Company } from '../types/company';
import { Plus } from 'lucide-react';

export const Companies = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const navigate = useNavigate();
  const { addCompany, updateCompany } = useCompanyStore();

  const handleSubmit = (data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingCompany) {
      updateCompany(editingCompany.id!, data);
    } else {
      const company = addCompany(data);
      // Navigate to company dashboard after creation
      navigate(`/companies/${company.id}`);
    }
    setIsFormOpen(false);
    setEditingCompany(null);
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setIsFormOpen(true);
  };

  const handleRowClick = (company: Company) => {
    navigate(`/companies/${company.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Companies</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your companies and start financial reporting
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Company
        </button>
      </div>

      <CompanyList 
        onEdit={handleEdit}
        onRowClick={handleRowClick}
      />

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingCompany ? 'Edit Company' : 'Add Company'}
              </h2>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingCompany(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <CompanyForm 
              onSubmit={handleSubmit} 
              initialData={editingCompany || undefined} 
            />
          </div>
        </div>
      )}
    </div>
  );
};