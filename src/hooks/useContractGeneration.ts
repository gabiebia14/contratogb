
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
    // Remove todos os prefixos possíveis e retorna todas as variantes
    const prefixes = ['locador_', 'locadora_', 'locatario_', 'locataria_', 'fiador_', 'fiadora_'];
    let withoutPrefix = varName;
    
    for (const prefix of prefixes) {
      if (varName.startsWith(prefix)) {
        withoutPrefix = varName.replace(prefix, '');
        break;
      }
    }

    // Gera todas as variantes possíveis
    return [
      varName,                          // Original
      withoutPrefix,                    // Sem prefixo
      `locador_${withoutPrefix}`,      // Com prefixo locador
      `locadora_${withoutPrefix}`,     // Com prefixo locadora
      `locatario_${withoutPrefix}`,    // Com prefixo locatário
      `locataria_${withoutPrefix}`,    // Com prefixo locatária
      `fiador_${withoutPrefix}`,       // Com prefixo fiador
      `fiadora_${withoutPrefix}`,      // Com prefixo fiadora
    ];
  };

  const processTemplate = (template: string, variables: Record<string, any>) => {
    let processedContent = template;
    console.log('Template original:', template);
    console.log('Variáveis disponíveis:', variables);

    // Encontra todas as variáveis no template
    const matches = template.match(/{[^}]+}/g) || [];
    const variablesToReplace = new Set(matches.map(match => match.slice(1, -1)));
    
    console.log('Variáveis encontradas no template:', Array.from(variablesToReplace));

    // Substitui todas as variáveis encontradas
    variablesToReplace.forEach(varName => {
      const variants = normalizeVariableName(varName);
      let value = '';
      
      // Procura o primeiro valor disponível entre as variantes
      for (const variant of variants) {
        if (variables[variant] !== undefined && variables[variant] !== null) {
          value = variables[variant];
          console.log(`Encontrou valor para ${varName} usando variante ${variant}:`, value);
          break;
        }
      }

      const regex = new RegExp(`{${varName}}`, 'g');
      processedContent = processedContent.replace(regex, value || '______');
      
      if (!value) {
        console.log(`Nenhum valor encontrado para ${varName}. Tentou variantes:`, variants);
      }
    });

    return processedContent;
  };

  const mapDocumentFields = (rawData: any, prefix: string) => {
    const fields = [
      'nome', 'nome_completo', 'cpf', 'rg', 'nacionalidade', 
      'estado_civil', 'profissao', 'endereco', 'bairro', 
      'cidade', 'estado', 'cep', 'email', 'telefone'
    ];

    const mappedData: Record<string, string> = {};

    fields.forEach(field => {
      // Tenta encontrar o valor com diferentes combinações de prefixo
      const possibleKeys = [
        `${prefix}${field}`,
        field,
        `${prefix}${field.toLowerCase()}`,
        field.toLowerCase(),
      ];

      for (const key of possibleKeys) {
        if (rawData[key] !== undefined && rawData[key] !== null) {
          // Salva com o prefixo específico
          mappedData[`${prefix}${field}`] = String(rawData[key]);
          
          // Salva também sem prefixo se ainda não existir
          if (!mappedData[field]) {
            mappedData[field] = String(rawData[key]);
          }
          break;
        }
      }
    });

    return mappedData;
  };

  const generateContract = async (templateId: string, parties: ContractParty[], title: string) => {
    setLoading(true);
    try {
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
        if (!document) continue;

        const rawData = typeof document.extracted_data === 'string'
          ? JSON.parse(document.extracted_data)
          : document.extracted_data;

        // Define o prefixo baseado no papel
        let prefix = '';
        if (party.role.startsWith('locador')) {
          prefix = party.role.endsWith('a') ? 'locadora_' : 'locador_';
        } else if (party.role.startsWith('locatari')) {
          prefix = party.role.endsWith('a') ? 'locataria_' : 'locatario_';
        } else if (party.role.startsWith('fiador')) {
          prefix = party.role.endsWith('a') ? 'fiadora_' : 'fiador_';
        }

        console.log(`Processando documento para ${party.role} com prefixo ${prefix}`);
        
        // Mapeia os campos do documento
        const mappedData = mapDocumentFields(rawData, prefix);
        console.log('Dados mapeados:', mappedData);

        // Adiciona os dados mapeados às variáveis
        variables = { ...variables, ...mappedData };
      }

      console.log('Todas as variáveis coletadas:', variables);
      
      // Processa o template substituindo as variáveis
      const processedContent = processTemplate(template.content, variables);
      
      // Cria o contrato com o conteúdo processado
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
