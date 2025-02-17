
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';

export const useContractGeneration = () => {
  const [loading, setLoading] = useState(false);

  const generateContract = async (templateId: string, documentId: string, title: string) => {
    setLoading(true);
    try {
      // Buscar o template e o documento
      const [templateResult, documentResult] = await Promise.all([
        supabase
          .from('contract_templates')
          .select('*')
          .eq('id', templateId)
          .single(),
        supabase
          .from('processed_documents')
          .select('*')
          .eq('id', documentId)
          .single()
      ]);

      if (templateResult.error) throw new Error('Erro ao buscar template');
      if (documentResult.error) throw new Error('Erro ao buscar documento');

      const template = templateResult.data;
      const document = documentResult.data;

      // Preparar os dados extraídos do documento
      let documentData = {};
      try {
        documentData = typeof document.extracted_data === 'string' 
          ? JSON.parse(document.extracted_data) 
          : document.extracted_data;
      } catch (error) {
        console.error('Erro ao processar dados do documento:', error);
        toast.error('Erro ao processar dados do documento');
        return;
      }

      // Criar uma nova instância do Docxtemplater
      const doc = new Docxtemplater();
      
      // Configurar o template com os dados
      doc.loadData(documentData);
      doc.render();

      // Gerar o conteúdo processado
      const processedContent = doc.getFullText();

      // Criar o contrato no banco de dados
      const { data: contract, error } = await supabase.functions.invoke('generate-contract', {
        body: { 
          templateId, 
          documentId, 
          title,
          content: processedContent
        }
      });

      if (error) throw error;

      if (!contract?.contract) {
        throw new Error('Erro ao gerar contrato');
      }

      toast.success('Contrato gerado com sucesso!');
      return contract.contract;
    } catch (error) {
      console.error('Error generating contract:', error);
      toast.error('Erro ao gerar contrato');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    generateContract
  };
};
