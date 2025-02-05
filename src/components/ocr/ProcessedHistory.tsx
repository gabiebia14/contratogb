import React from 'react';
import { Clock } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import ExtractedDataDisplay from './ExtractedDataDisplay';

interface ProcessedHistoryProps {
  processedDocuments: any[];
}

const ProcessedHistory = ({ processedDocuments }: ProcessedHistoryProps) => {
  if (!processedDocuments.length) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Data não disponível';
    
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Data inválida';
    
    return format(date, "dd/MM/yyyy HH:mm");
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="text-gray-500" />
        <h3 className="text-lg font-medium">Histórico de Documentos</h3>
      </div>
      
      <div className="space-y-4">
        {processedDocuments.map((doc) => (
          <div 
            key={doc.id}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{doc.file_name}</h4>
              <span className="text-sm text-gray-500">
                {formatDate(doc.processed_at)}
              </span>
            </div>
            <ExtractedDataDisplay data={doc.extracted_data} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessedHistory;