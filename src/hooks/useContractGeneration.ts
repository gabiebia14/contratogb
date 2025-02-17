
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

        console.log('Dados extraídos do documento:', documentData);
      } catch (error) {
        console.error('Erro ao processar dados do documento:', error);
        toast.error('Erro ao processar dados do documento');
        return;
      }

      // Criar uma nova instância do Docxtemplater com o template
      const zip = new PizZip(template.content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true
      });
      
      console.log('Template carregado, aplicando dados...');
      
      // Configurar o template com os dados
      doc.setData(documentData);

      console.log('Renderizando documento...');
      
      try {
        // Renderizar o documento
        doc.render();
      } catch (error) {
        console.error('Erro ao renderizar documento:', error);
        if (error.properties && error.properties.errors) {
          console.log('Erros detalhados:', error.properties.errors);
        }
        throw new Error('Erro ao renderizar documento com os dados fornecidos');
      }

      // Gerar o conteúdo processado
      const processedContent = doc.getZip().generate({
        type: 'string',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      console.log('Documento processado, salvando contrato...');

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
