
import { useState } from 'react';
import { toast } from 'sonner';
import { fetchTemplate, fetchDocument, generateContract } from '@/services/contractService';

export const useContractGeneration = () => {
  const [loading, setLoading] = useState(false);

  const generateContractFromTemplate = async (templateId: string, documentId: string, title: string) => {
    setLoading(true);
    try {
      if (!templateId?.trim() || !documentId?.trim()) {
        throw new Error('ID do template ou documento inválido');
      }

      const template = await fetchTemplate(templateId);
      const document = await fetchDocument(documentId);
      const contract = await generateContract(templateId, documentId, title, template, document);

      toast.success('Contrato gerado com sucesso!');
      return contract;

    } catch (error: any) {
      console.error('Erro ao gerar contrato:', error);
      toast.error('Erro ao gerar contrato: ' + (error.message || 'Erro desconhecido'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    generateContract: generateContractFromTemplate
  };
};
