
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { ContractParty } from '@/types/contract-generation';
import { processTemplate } from '@/utils/contractVariables';
import { mapDocumentFields, getPartyPrefix } from '@/services/documentMapper';

export const useContractGeneration = () => {
  const [loading, setLoading] = useState(false);

  const generateContract = async (templateId: string, parties: ContractParty[], title: string) => {
    setLoading(true);
    try {
      console.log('Iniciando geração de contrato com partes:', parties);

      const { data: template } = await supabase
        .from('contract_templates')
        .select('content')
        .eq('id', templateId)
        .single();

      if (!template) {
        throw new Error('Template não encontrado');
      }

      const { data: documents } = await supabase
        .from('processed_documents')
        .select('extracted_data, id, document_role')
        .in('id', parties.map(p => p.documentId));

      if (!documents || documents.length === 0) {
        throw new Error('Documentos não encontrados');
      }

      let variables: Record<string, string> = {};

      // Processa cada documento baseado em seu papel no contrato
      for (const party of parties) {
        const document = documents.find(d => d.id === party.documentId);
        if (!document) {
          console.warn(`Documento não encontrado para a parte: ${party.role}`);
          continue;
        }

        const rawData = typeof document.extracted_data === 'string'
          ? JSON.parse(document.extracted_data)
          : document.extracted_data;

        const prefix = getPartyPrefix(party.role);
        console.log(`Processando documento para ${party.role} com prefixo ${prefix}`);
        console.log('Dados extraídos:', rawData);
        
        const mappedData = mapDocumentFields(rawData, prefix);
        console.log('Dados mapeados:', mappedData);

        // Armazena os dados com o prefixo correto
        Object.entries(mappedData).forEach(([key, value]) => {
          variables[key.toLowerCase()] = value; // Normaliza as chaves para lowercase
        });
      }

      console.log('Variáveis finais para processamento:', variables);
      
      const processedContent = processTemplate(template.content, variables);
      
      const { data: contract, error } = await supabase
        .from('contracts')
        .insert({
          title,
          content: processedContent,
          template_id: templateId,
          variables: variables as Json,
          status: 'draft',
          metadata: {
            source: 'web-interface',
            timestamp: new Date().toISOString(),
            parties: parties.map(party => ({
              role: party.role,
              document_id: party.documentId
            }))
          } as Json
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Contrato gerado com sucesso!');
      return contract;
    } catch (error) {
      console.error('Erro ao gerar contrato:', error);
      toast.error('Erro ao gerar contrato: ' + (error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { loading, generateContract };
};
