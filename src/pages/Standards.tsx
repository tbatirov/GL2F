import React, { useState } from 'react';
import { StandardList } from '../components/standards/StandardList';
import { StandardForm } from '../components/standards/StandardForm';
import { useStandardStore } from '../store/standardStore';
import { AccountingStandard } from '../types/accounting';
import { Plus } from 'lucide-react';

export const Standards = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStandard, setEditingStandard] = useState<AccountingStandard | null>(null);
  const addStandard = useStandardStore((state) => state.addStandard);
  const updateStandard = useStandardStore((state) => state.updateStandard);

  const handleSubmit = (data: Omit<AccountingStandard, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingStandard) {
      updateStandard(editingStandard.id!, data);
    } else {
      addStandard(data);
    }
    setIsFormOpen(false);
    setEditingStandard(null);
  };

  const handleEdit = (standard: AccountingStandard) => {
    setEditingStandard(standard);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Accounting Standards</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage accounting standards and their rules
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Standard
        </button>
      </div>

      <StandardList onEdit={handleEdit} />

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingStandard ? 'Edit Standard' : 'Add Accounting Standard'}
              </h2>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingStandard(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <StandardForm 
              onSubmit={handleSubmit} 
              initialData={editingStandard || undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
};