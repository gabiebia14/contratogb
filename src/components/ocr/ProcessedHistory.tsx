
import React, { useState } from 'react';
import { Clock, Edit2, Save, X } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fieldTranslations } from './ExtractedDataDisplay';
import { toast } from 'sonner';

interface ProcessedHistoryProps {
  processedDocuments: any[];
}

const ProcessedHistory = ({ processedDocuments }: ProcessedHistoryProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Record<string, string>>({});

  if (!processedDocuments.length) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Data não disponível';
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Data inválida';
    return format(date, "dd/MM/yyyy HH:mm");
  };

  const getValidFields = (extractedData: any) => {
    if (!extractedData || typeof extractedData !== 'object') return [];
    
    try {
      // If extractedData is already an object with key-value pairs, use it directly
      const jsonData = typeof extractedData === 'string' ? JSON.parse(extractedData) : extractedData;
      
      return Object.entries(jsonData)
        .filter(([_, value]) => value !== null && value !== '')
        .map(([key, value]) => ({
          field: key,
          value: value as string
        }));
    } catch (error) {
      console.error('Error parsing data:', error);
      return [];
    }
  };

  const handleEdit = (docId: string, data: any) => {
    const fields = getValidFields(data);
    const initialData = Object.fromEntries(
      fields.map(({ field, value }) => [field, value])
    );
    setEditedData(initialData);
    setEditingId(docId);
  };

  const handleSave = async (docId: string) => {
    try {
      // TODO: Implement the save functionality with your backend
      console.log('Saving edited data:', editedData);
      toast.success('Dados atualizados com sucesso!');
      setEditingId(null);
      setEditedData({});
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Erro ao salvar as alterações');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedData({});
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="text-gray-500" />
        <h3 className="text-lg font-medium">Histórico de Extrações</h3>
      </div>
      
      {processedDocuments.map((doc) => (
        <Card key={doc.id} className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {formatDate(doc.processed_at)}
            </CardTitle>
            {editingId !== doc.id ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(doc.id, doc.extracted_data)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSave(doc.id)}
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="pt-2">
            {getValidFields(doc.extracted_data).map((item, index) => (
              <div key={index} className="flex justify-between items-center border-b py-2">
                <span className="font-medium text-gray-700">
                  {fieldTranslations[item.field] || item.field}:
                </span>
                {editingId === doc.id ? (
                  <Input
                    value={editedData[item.field] || ''}
                    onChange={(e) => setEditedData({
                      ...editedData,
                      [item.field]: e.target.value
                    })}
                    className="max-w-[250px]"
                  />
                ) : (
                  <span className="text-gray-900">{item.value}</span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProcessedHistory;
