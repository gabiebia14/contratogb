
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

      // Verificar se o template tem conteúdo
      if (!template.content) {
        throw new Error('Template não possui conteúdo');
      }

      // Preparar os dados extraídos do documento
      let documentData = {};
      try {
        documentData = typeof document.extracted_data === 'string' 
          ? JSON.parse(document.extracted_data) 
          : document.extracted_data;

        // Garantir que todos os campos necessários estejam presentes
        const formattedData = {
          // Dados do locatário/locatária
          locatario_nome: documentData.locatario_nome || '',
          locatario_nacionalidade: documentData.locatario_nacionalidade || '',
          locatario_estado_civil: documentData.locatario_estado_civil || '',
          locatario_profissao: documentData.locatario_profissao || '',
          locatario_rg: documentData.locatario_rg || '',
          locatario_cpf: documentData.locatario_cpf || '',
          locatario_endereco: documentData.locatario_endereco || '',
          locatario_cidade: documentData.locatario_cidade || '',
          locatario_estado: documentData.locatario_estado || '',

          locataria_nome: documentData.locataria_nome || '',
          locataria_nacionalidade: documentData.locataria_nacionalidade || '',
          locataria_estado_civil: documentData.locataria_estado_civil || '',
          locataria_profissao: documentData.locataria_profissao || '',
          locataria_rg: documentData.locataria_rg || '',
          locataria_cpf: documentData.locataria_cpf || '',
          locataria_endereco: documentData.locataria_endereco || '',
          locataria_cidade: documentData.locataria_cidade || '',
          locataria_estado: documentData.locataria_estado || '',

          // Dados do locador/locadora
          locador_nome: documentData.locador_nome || '',
          locador_nacionalidade: documentData.locador_nacionalidade || '',
          locador_estado_civil: documentData.locador_estado_civil || '',
          locador_profissao: documentData.locador_profissao || '',
          locador_rg: documentData.locador_rg || '',
          locador_cpf: documentData.locador_cpf || '',
          locador_endereco: documentData.locador_endereco || '',
          locador_cidade: documentData.locador_cidade || '',
          locador_estado: documentData.locador_estado || '',

          locadora_nome: documentData.locadora_nome || '',
          locadora_nacionalidade: documentData.locadora_nacionalidade || '',
          locadora_estado_civil: documentData.locadora_estado_civil || '',
          locadora_profissao: documentData.locadora_profissao || '',
          locadora_rg: documentData.locadora_rg || '',
          locadora_cpf: documentData.locadora_cpf || '',
          locadora_endereco: documentData.locadora_endereco || '',
          locadora_cidade: documentData.locadora_cidade || '',
          locadora_estado: documentData.locadora_estado || '',
        };

        console.log('Dados formatados para o template:', formattedData);
        documentData = formattedData;
      } catch (error) {
        console.error('Erro ao processar dados do documento:', error);
        toast.error('Erro ao processar dados do documento');
        return;
      }

      // Decodificar o conteúdo do template que está em base64
      const templateContent = atob(template.content);
      
      // Criar uma nova instância do Docxtemplater com o template
      const zip = new PizZip(templateContent);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '{{', end: '}}' }
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
          console.log('Tags não resolvidas:', error.properties.paragraphParts);
        }
        throw new Error('Erro ao renderizar documento com os dados fornecidos');
      }

      // Gerar o conteúdo processado
      const processedContent = doc.getZip().generate({
        type: 'base64',
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
