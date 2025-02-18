
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

interface ContractParty {
  role: string;
  documentId: string;
}

export const useContractGeneration = () => {
  const [loading, setLoading] = useState(false);

  const processTemplate = (template: string, variables: Record<string, any>) => {
    let processedContent = template;
    console.log('Variáveis disponíveis para substituição:', variables);

    // Cria um mapa de todas as variáveis que precisam ser substituídas
    const matches = template.match(/{[^}]+}/g) || [];
    const variablesToReplace = new Set(matches.map(match => match.slice(1, -1)));
    
    console.log('Variáveis encontradas no template:', Array.from(variablesToReplace));

    // Substitui todas as variáveis encontradas no template
    variablesToReplace.forEach(varName => {
      const value = variables[varName] || '';
      const regex = new RegExp(`{${varName}}`, 'g');
      processedContent = processedContent.replace(regex, value);
      
      if (!variables[varName]) {
        console.log(`Variável não encontrada: ${varName}`);
      }
    });

    return processedContent;
  };

  const generateContract = async (templateId: string, parties: ContractParty[], title: string) => {
    setLoading(true);
    try {
      // Busca o template
      const { data: template } = await supabase
        .from('contract_templates')
        .select('content')
        .eq('id', templateId)
        .single();

      if (!template) {
        throw new Error('Template não encontrado');
      }

      // Busca todos os documentos selecionados
      const { data: documents } = await supabase
        .from('processed_documents')
        .select('extracted_data, id, document_role')
        .in('id', parties.map(p => p.documentId));

      if (!documents || documents.length === 0) {
        throw new Error('Documentos não encontrados');
      }

      // Inicializa o objeto de variáveis
      let variables: Record<string, string> = {};

      // Processa cada documento baseado em seu papel no contrato
      for (const party of parties) {
        const document = documents.find(d => d.id === party.documentId);
        if (!document) continue;

        const rawData = typeof document.extracted_data === 'string'
          ? JSON.parse(document.extracted_data)
          : document.extracted_data;

        // Define o prefixo baseado no papel (role) do documento
        let prefix = '';
        if (party.role.startsWith('locador')) prefix = 'locador_';
        else if (party.role.startsWith('locataria')) prefix = 'locataria_';
        else if (party.role.startsWith('locatario')) prefix = 'locatario_';
        else if (party.role.startsWith('fiador')) prefix = 'fiador_';

        console.log(`Processando documento com role ${party.role}, usando prefixo ${prefix}`);

        // Define os campos que queremos mapear
        const fieldsToMap = [
          'nome', 'cpf', 'rg', 'nacionalidade', 'estado_civil', 'profissao',
          'endereco', 'bairro', 'cidade', 'estado', 'cep'
        ];

        // Mapeia os campos com e sem prefixo
        fieldsToMap.forEach(field => {
          // Tenta pegar o valor com prefixo primeiro
          let value = rawData[`${prefix}${field}`];
          
          // Se não encontrou com prefixo, tenta sem prefixo
          if (!value) {
            value = rawData[field];
          }

          // Se encontrou algum valor, salva tanto com prefixo quanto sem
          if (value) {
            variables[`${prefix}${field}`] = String(value);
            // Também salva sem prefixo se ainda não existir
            if (!variables[field]) {
              variables[field] = String(value);
            }
          }

          // Caso especial para o nome_completo
          if (field === 'nome' && rawData.nome_completo) {
            variables[`${prefix}${field}`] = String(rawData.nome_completo);
            if (!variables[field]) {
              variables[field] = String(rawData.nome_completo);
            }
          }
        });

        console.log(`Dados processados para ${party.role}:`, 
          Object.entries(variables)
            .filter(([key]) => key.startsWith(prefix))
            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})
        );
      }

      console.log('Template original:', template.content);
      console.log('Variáveis para substituição:', variables);
      
      // Processa o template substituindo as variáveis
      const processedContent = processTemplate(template.content, variables);
      
      console.log('Conteúdo processado:', processedContent);

      // Converte as parties para um formato compatível com Json
      const partiesJson = parties.map(party => ({
        role: party.role,
        document_id: party.documentId
      }));

      // Cria o contrato com o conteúdo processado
      const { data: contract, error } = await supabase
        .from('contracts')
        .insert({
          title,
          content: processedContent,
          template_id: templateId,
          document_id: parties[0].documentId, // Mantém o primeiro documento como principal
          variables: variables as Json,
          status: 'draft',
          metadata: {
            source: 'web-interface',
            timestamp: new Date().toISOString(),
            parties: partiesJson
          } as Json
        })
        .select()
        .single();

      if (error) throw error;

      return contract;
    } catch (error) {
      console.error('Erro ao gerar contrato:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { loading, generateContract };
};
