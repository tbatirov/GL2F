import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCompanyStore } from '../../store/companyStore';
import { PeriodSelector } from '../../components/companies/PeriodSelector';
import { CompanyHeader } from '../../components/companies/CompanyHeader';
import { WorkflowStatus } from '../../components/workflow/WorkflowStatus';
import { TransactionUpload } from '../../components/transactions/TransactionUpload';
import { StatementGenerator } from '../../components/reports/StatementGenerator';
import { FinancialMetrics } from '../../components/reports/FinancialMetrics';

export const CompanyDashboard = () => {
  const { id } = useParams();
  const company = useCompanyStore(state => state.companies.find(c => c.id === id));
  const [selectedPeriod, setSelectedPeriod] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });
  
  if (!company) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Company not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CompanyHeader company={company} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Period Selection</h2>
          <PeriodSelector 
            companyId={company.id!} 
            onPeriodChange={setSelectedPeriod}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Workflow Status</h2>
          <WorkflowStatus companyId={company.id!} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">Transaction Management</h2>
        <TransactionUpload />
      </div>

      <FinancialMetrics 
        companyId={company.id!}
        period={selectedPeriod}
      />

      <div className="bg-white rounded-lg shadow p-6">
        <StatementGenerator 
          companyId={company.id!}
          period={selectedPeriod}
        />
      </div>
    </div>
  );
};