import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { UploadCloud, AlertCircle } from 'lucide-react';
import { useTransactionStore } from '../../store/transactionStore';
import { useStandardStore } from '../../store/standardStore';
import { TransactionPreview } from './TransactionPreview';
import { TransactionMapping } from './TransactionMapping';

type UploadStep = 'upload' | 'mapping' | 'preview';

export const TransactionUpload = () => {
  const { id: companyId } = useParams();
  const [currentStep, setCurrentStep] = useState<UploadStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const importTransactions = useTransactionStore(state => state.importTransactions);
  const { getActiveStandard } = useStandardStore();
  const activeStandard = getActiveStandard();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsValidating(true);
    setValidationErrors([]);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Detect delimiter (tab or comma)
        const firstLine = lines[0];
        const delimiter = firstLine.includes('\t') ? '\t' : ',';
        
        // Clean headers (remove BOM, quotes, and trim)
        const headers = firstLine
          .replace(/^\uFEFF/, '') // Remove BOM if present
          .split(delimiter)
          .map(h => h.trim().replace(/^["']|["']$/g, '')); // Remove quotes and trim
        
        // Define required headers
        const requiredHeaders = [
          'Transaction_ID',
          'Date',
          'Time',
          'Description',
          'Account_Number',
          'Customer_Name',
          'Transaction_Type',
          'Amount'
        ];

        // Case-insensitive header validation
        const normalizedHeaders = headers.map(h => h.toLowerCase());
        const missingHeaders = requiredHeaders.filter(required => 
          !normalizedHeaders.includes(required.toLowerCase())
        );
        
        if (missingHeaders.length > 0) {
          setValidationErrors([`Missing required headers: ${missingHeaders.join(', ')}`]);
          setPreview([]);
        } else {
          // Parse and show preview of first 5 rows
          const previewData = lines
            .slice(1, 6)
            .map(line => {
              const values = line.split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ''));
              return headers.reduce((obj, header, index) => {
                obj[header] = values[index] || '';
                return obj;
              }, {} as any);
            });
          setPreview(previewData);
          setCurrentStep('mapping');
        }
      };
      reader.readAsText(selectedFile);
    } catch (error) {
      setValidationErrors(['Failed to parse file']);
      setPreview([]);
    }

    setIsValidating(false);
  };

  const handleMappingComplete = () => {
    setCurrentStep('preview');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'mapping':
        return (
          <TransactionMapping 
            companyId={companyId || null}
            onComplete={handleMappingComplete}
          />
        );
      case 'preview':
        return (
          <TransactionPreview
            companyId={companyId || null}
            onApprove={() => setCurrentStep('upload')}
            onEdit={() => setCurrentStep('mapping')}
          />
        );
      default:
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Upload Transaction File
                  </span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept=".csv,.tsv,.txt"
                    className="sr-only"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">CSV or TSV file up to 10MB</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Validation Errors</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {renderStep()}

      {currentStep === 'upload' && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900">Required CSV Headers</h4>
          <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
            <li>Transaction_ID</li>
            <li>Date</li>
            <li>Time</li>
            <li>Description</li>
            <li>Account_Number</li>
            <li>Customer_Name</li>
            <li>Transaction_Type</li>
            <li>Amount</li>
          </ul>
        </div>
      )}
    </div>
  );
};