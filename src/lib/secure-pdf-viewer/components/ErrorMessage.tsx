
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string | null;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="flex flex-col items-center justify-center p-8 bg-black bg-opacity-50 rounded-lg">
    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
    <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading PDF</h2>
    <p className="text-gray-300 text-center">{message}</p>
  </div>
);

export default ErrorMessage;
