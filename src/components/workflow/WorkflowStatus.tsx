import React from 'react';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';

interface WorkflowStatusProps {
  companyId: string;
}

export const WorkflowStatus = ({ companyId }: WorkflowStatusProps) => {
  const steps = [
    { id: 'period', label: 'Period Selection', status: 'current' },
    { id: 'transactions', label: 'Transaction Upload', status: 'upcoming' },
    { id: 'validation', label: 'Data Validation', status: 'upcoming' },
    { id: 'statements', label: 'Statement Generation', status: 'upcoming' }
  ];

  const getIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'current':
        return <Circle className="h-5 w-5 text-blue-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          {getIcon(step.status)}
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{step.label}</p>
            <p className="text-sm text-gray-500">
              {step.status === 'complete' ? 'Completed' : 
               step.status === 'current' ? 'In Progress' : 
               'Not Started'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};