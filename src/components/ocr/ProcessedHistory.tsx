import React, { useState } from 'react';
import { Clock, Edit2, Save, X, Trash2 } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fieldTranslations } from './ExtractedDataDisplay';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProcessedHistoryProps {
  processedDocuments: any[];
  onDelete?: (docId: string) => void;
}

const ProcessedHistory = ({ processedDocuments, onDelete }: ProcessedHistoryProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<Record<string, string>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

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
      const jsonData = typeof extractedData === 'string' ? JSON.parse(extractedData) : extractedData;
      
      return Object.entries(jsonData)
        .filter(([_, value]) => value !== null && value !== '')
        .map(([key, value]) => ({
          field: key,
          value: String(value)
        }));
    } catch (error) {
      console.error('Erro ao processar dados:', error);
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
      const { data, error } = await supabase
        .from('processed_documents')
        .update({ extracted_data: editedData })
        .eq('id', docId);

      if (error) throw error;

      toast.success('Dados atualizados com sucesso!');
      setEditingId(null);
      setEditedData({});
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast.error('Erro ao salvar as alterações');
    }
  };

  const handleDelete = async (docId: string) => {
    setDocumentToDelete(docId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;

    try {
      const { error } = await supabase
        .from('processed_documents')
        .delete()
        .eq('id', documentToDelete);

      if (error) throw error;

      toast.success('Documento excluído com sucesso!');
      onDelete?.(documentToDelete);
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      toast.error('Erro ao excluir o documento');
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
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
            <div className="flex gap-2">
              {editingId !== doc.id ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(doc.id, doc.extracted_data)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProcessedHistory;
