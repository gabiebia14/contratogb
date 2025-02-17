
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ContractParty {
  role: string;
  documentId: string;
}

export const useContractGeneration = () => {
  const [loading, setLoading] = useState(false);

  const processTemplate = (template: string, variables: Record<string, any>) => {
    let processedContent = template;

    // Substitui todas as variáveis encontradas no template
    Object.entries(variables).forEach(([key, value]) => {
      // Remove as chaves ao redor da variável
      const variableName = key.replace(/[{}]/g, '');
      // Cria um regex que busca a variável com as chaves
      const regex = new RegExp(`{${variableName}}`, 'g');
      // Substitui todas as ocorrências pela string do valor
      processedContent = processedContent.replace(regex, value ? String(value) : '');
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
        .select('extracted_data, id')
        .in('id', parties.map(p => p.documentId));

      if (!documents || documents.length === 0) {
        throw new Error('Documentos não encontrados');
      }

      // Inicializa o objeto de variáveis com valores vazios
      let variables: Record<string, string> = {
        // Dados básicos padrão vazios
        nome_completo: '', cpf: '', rg: '', nacionalidade: '', estado_civil: '', profissao: '',
        // Locador
        locador_nome: '', locador_cpf: '', locador_rg: '', locador_nacionalidade: '',
        locador_estado_civil: '', locador_profissao: '', locador_endereco: '',
        locador_bairro: '', locador_cidade: '', locador_estado: '', locador_cep: '',
        // Locatário
        locatario_nome: '', locatario_cpf: '', locatario_rg: '', locatario_nacionalidade: '',
        locatario_estado_civil: '', locatario_profissao: '', locatario_endereco: '',
        locatario_bairro: '', locatario_cidade: '', locatario_estado: '', locatario_cep: '',
        // Fiador
        fiador_nome: '', fiador_cpf: '', fiador_rg: '', fiador_nacionalidade: '',
        fiador_estado_civil: '', fiador_profissao: '', fiador_endereco: '',
        fiador_bairro: '', fiador_cidade: '', fiador_estado: '', fiador_cep: '',
        // Outros
        cnpj: '', razao_social: '', email: '', telefone: ''
      };

      // Processa cada documento baseado em seu papel no contrato
      parties.forEach(party => {
        const document = documents.find(d => d.id === party.documentId);
        if (!document) return;

        const rawData = typeof document.extracted_data === 'string'
          ? JSON.parse(document.extracted_data)
          : document.extracted_data;

        // Define o prefixo baseado no papel (role) do documento
        let prefix = '';
        if (party.role.startsWith('locador')) prefix = 'locador_';
        else if (party.role.startsWith('locatario')) prefix = 'locatario_';
        else if (party.role.startsWith('fiador')) prefix = 'fiador_';

        // Se temos um prefixo, copiamos os dados com o prefixo correto
        if (prefix) {
          const fieldsToMap = ['nome', 'cpf', 'rg', 'nacionalidade', 'estado_civil', 'profissao', 
                             'endereco', 'bairro', 'cidade', 'estado', 'cep'];
          
          fieldsToMap.forEach(field => {
            // Tenta primeiro buscar o campo já com prefixo
            const prefixedValue = rawData[`${prefix}${field}`];
            if (prefixedValue) {
              variables[`${prefix}${field}`] = String(prefixedValue);
            } 
            // Se não encontrar, tenta buscar o campo sem prefixo
            else if (rawData[field]) {
              variables[`${prefix}${field}`] = String(rawData[field]);
            }
            // Se encontrar o campo no formato nome_completo, usa para o campo nome
            else if (field === 'nome' && rawData.nome_completo) {
              variables[`${prefix}${field}`] = String(rawData.nome_completo);
            }
          });
        }

        // Também mantém os dados básicos do primeiro documento
        if (parties.indexOf(party) === 0) {
          variables.nome_completo = rawData.nome_completo || '';
          variables.cpf = rawData.cpf || '';
          variables.rg = rawData.rg || '';
          variables.nacionalidade = rawData.nacionalidade || '';
          variables.estado_civil = rawData.estado_civil || '';
          variables.profissao = rawData.profissao || '';
        }
      });

      console.log('Template original:', template.content);
      console.log('Variáveis para substituição:', variables);
      
      // Processa o template substituindo as variáveis
      const processedContent = processTemplate(template.content, variables);
      
      console.log('Conteúdo processado:', processedContent);

      // Cria o contrato com o conteúdo processado
      const { data: contract, error } = await supabase
        .from('contracts')
        .insert({
          title,
          content: processedContent,
          template_id: templateId,
          document_id: parties[0].documentId, // Mantém o primeiro documento como principal
          variables: variables,
          status: 'draft',
          metadata: {
            source: 'web-interface',
            timestamp: new Date().toISOString(),
            parties: parties // Armazena todas as partes nos metadados
          }
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
