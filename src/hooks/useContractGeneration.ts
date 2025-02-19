
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { ContractParty } from '@/types/contract-generation';
import { processTemplate, validateTemplate } from '@/utils/templateUtils';

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

      // Valida o template antes de processar
      const validation = validateTemplate(template.content);
      if (!validation.isValid) {
        throw new Error(`Template inválido: ${validation.errors.join(', ')}`);
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

        const extractedData = typeof document.extracted_data === 'string'
          ? JSON.parse(document.extracted_data)
          : document.extracted_data;

        console.log(`Processando documento para papel ${party.role}:`, extractedData);

        // Adiciona campos com prefixo do papel
        Object.entries(extractedData).forEach(([key, value]) => {
          if (value) {
            // Adiciona versão com prefixo
            const varKey = `${party.role.toLowerCase()}_${key}`.toLowerCase();
            variables[varKey] = String(value);
            console.log(`Mapeando ${key} para ${varKey} com valor ${value}`);

            // Se for a primeira parte, adiciona também sem prefixo
            if (parties.indexOf(party) === 0) {
              variables[key.toLowerCase()] = String(value);
              console.log(`Mapeando versão sem prefixo ${key} com valor ${value}`);
            }
          }
        });

        // Adiciona variáveis específicas baseadas no papel
        if (party.role.toLowerCase().includes('locador')) {
          variables[`parte_locadora`] = extractedData.nome_completo || extractedData.nome || '';
          variables[`qualificacao_locador`] = `${extractedData.nacionalidade || 'brasileiro(a)'}, ${extractedData.estado_civil || 'solteiro(a)'}, ${extractedData.profissao || 'empresário(a)'}`;
        } else if (party.role.toLowerCase().includes('locatario')) {
          variables[`parte_locataria`] = extractedData.nome_completo || extractedData.nome || '';
          variables[`qualificacao_locatario`] = `${extractedData.nacionalidade || 'brasileiro(a)'}, ${extractedData.estado_civil || 'solteiro(a)'}, ${extractedData.profissao || 'empresário(a)'}`;
        }
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
