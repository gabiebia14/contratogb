
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

  const normalizeVariableName = (varName: string): string[] => {
    // Remove o prefixo (se existir) e retorna todas as variantes possíveis
    const withoutPrefix = varName.replace(/^(locador|locatario|locataria|fiador|fiadora)_/, '');
    return [
      varName, // Original
      varName.replace('locatario_', 'locataria_'), // Variante feminina
      varName.replace('locataria_', 'locatario_'), // Variante masculina
      withoutPrefix // Sem prefixo
    ];
  };

  const processTemplate = (template: string, variables: Record<string, any>) => {
    let processedContent = template;
    console.log('Variáveis disponíveis para substituição:', variables);

    // Cria um mapa de todas as variáveis que precisam ser substituídas
    const matches = template.match(/{[^}]+}/g) || [];
    const variablesToReplace = new Set(matches.map(match => match.slice(1, -1)));
    
    console.log('Variáveis encontradas no template:', Array.from(variablesToReplace));

    // Substitui todas as variáveis encontradas no template
    variablesToReplace.forEach(varName => {
      // Tenta todas as variantes possíveis da variável
      const variants = normalizeVariableName(varName);
      let value = '';
      
      // Procura o primeiro valor disponível entre as variantes
      for (const variant of variants) {
        if (variables[variant]) {
          value = variables[variant];
          break;
        }
      }

      const regex = new RegExp(`{${varName}}`, 'g');
      processedContent = processedContent.replace(regex, value);
      
      if (!value) {
        console.log(`Nenhuma variante encontrada para: ${varName}. Tentou: ${variants.join(', ')}`);
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
        let alternativePrefix = '';
        if (party.role.startsWith('locador')) {
          prefix = 'locador_';
        } else if (party.role.startsWith('locataria')) {
          prefix = 'locataria_';
          alternativePrefix = 'locatario_'; // Adiciona prefixo alternativo
        } else if (party.role.startsWith('locatario')) {
          prefix = 'locatario_';
          alternativePrefix = 'locataria_'; // Adiciona prefixo alternativo
        } else if (party.role.startsWith('fiador')) {
          prefix = 'fiador_';
        }

        console.log(`Processando documento com role ${party.role}, usando prefixo ${prefix} e alternativo ${alternativePrefix}`);

        // Define os campos que queremos mapear
        const fieldsToMap = [
          'nome', 'cpf', 'rg', 'nacionalidade', 'estado_civil', 'profissao',
          'endereco', 'bairro', 'cidade', 'estado', 'cep'
        ];

        // Mapeia os campos com todos os prefixos possíveis
        fieldsToMap.forEach(field => {
          let value = rawData[`${prefix}${field}`] || rawData[field];

          if (value) {
            // Salva com o prefixo principal
            variables[`${prefix}${field}`] = String(value);
            
            // Salva com o prefixo alternativo (se existir)
            if (alternativePrefix) {
              variables[`${alternativePrefix}${field}`] = String(value);
            }
            
            // Salva sem prefixo se ainda não existir
            if (!variables[field]) {
              variables[field] = String(value);
            }
          }

          // Caso especial para o nome_completo
          if (field === 'nome' && rawData.nome_completo) {
            const nomeValue = String(rawData.nome_completo);
            variables[`${prefix}${field}`] = nomeValue;
            if (alternativePrefix) {
              variables[`${alternativePrefix}${field}`] = nomeValue;
            }
            if (!variables[field]) {
              variables[field] = nomeValue;
            }
          }
        });

        console.log(`Dados processados para ${party.role}:`, 
          Object.entries(variables)
            .filter(([key]) => key.startsWith(prefix) || (alternativePrefix && key.startsWith(alternativePrefix)))
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
          document_id: parties[0].documentId,
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
