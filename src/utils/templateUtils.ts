
import { ContractVariables, TemplateValidationResult } from '@/types/contract-generation';
import Handlebars from 'handlebars';

const COMMON_FIELDS = [
  'nome', 'nome_completo',
  'nacionalidade', 'estado_civil', 'profissao',
  'cpf', 'rg', 'rg_orgao_emissor',
  'endereco', 'numero', 'complemento',
  'bairro', 'cidade', 'estado', 'cep',
  'email', 'telefone'
];

const DEFAULT_VALUES: Record<string, string> = {
  nacionalidade: 'brasileiro(a)',
  estado_civil: 'solteiro(a)',
  profissao: 'empresário(a)',
};

const GENDER_NORMALIZATIONS: Record<string, string[]> = {
  'locador': ['locadora'],
  'locatario': ['locataria'],
  'fiador': ['fiadora'],
  'arrendador': ['arrendadora'],
  'arrendatario': ['arrendataria']
};

export const normalizeVariableName = (varName: string): string[] => {
  // Remove {{ }} ou { } da variável
  const cleanName = varName.replace(/[{}]/g, '').trim();
  const variants: string[] = [cleanName];
  
  // Procura por prefixos conhecidos
  for (const [male, females] of Object.entries(GENDER_NORMALIZATIONS)) {
    if (cleanName.startsWith(male + '_')) {
      const baseName = cleanName.slice(male.length + 1);
      females.forEach(female => {
        variants.push(`${female}_${baseName}`);
      });
    }
  }

  console.log(`Variantes normalizadas para ${varName}:`, variants);
  return variants;
};

export const validateTemplate = (content: string): TemplateValidationResult => {
  const result: TemplateValidationResult = {
    isValid: true,
    errors: [],
    variables: []
  };

  try {
    // Testa compilação com Handlebars
    Handlebars.compile(content);

    // Extrai variáveis nos dois formatos
    const matches = content.match(/{{[^}]+}}|\{[^}]+\}/g) || [];
    result.variables = matches.map(match => match.replace(/[{}]/g, '').trim());

    console.log('Template validado com sucesso. Variáveis encontradas:', result.variables);
  } catch (error) {
    result.isValid = false;
    result.errors.push(`Erro de sintaxe: ${(error as Error).message}`);
    console.error('Erro ao validar template:', error);
  }

  return result;
};

export const processTemplate = (template: string, variables: ContractVariables): string => {
  console.log('Iniciando processamento de template');
  console.log('Variáveis disponíveis:', variables);

  let processedContent = template;

  // Primeiro passo: processa variáveis com prefixos específicos
  const matches = template.match(/{{[^}]+}}|\{[^}]+\}/g) || [];
  console.log('Variáveis encontradas no template:', matches);

  matches.forEach(match => {
    const originalVar = match.replace(/[{}]/g, '').trim();
    const variants = normalizeVariableName(originalVar);
    let value: string | undefined;

    // Primeiro tenta encontrar valores com prefixos
    for (const variant of variants) {
      if (variables[variant.toLowerCase()]) {
        value = variables[variant.toLowerCase()];
        console.log(`Valor encontrado para ${variant}: ${value}`);
        break;
      }
    }

    // Se não encontrou com prefixo, tenta sem prefixo
    if (!value && COMMON_FIELDS.includes(originalVar)) {
      value = variables[originalVar] || DEFAULT_VALUES[originalVar];
      console.log(`Usando valor sem prefixo ou padrão para ${originalVar}: ${value}`);
    }

    // Aplica a substituição
    if (value) {
      const regex = new RegExp(match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      processedContent = processedContent.replace(regex, value);
    } else {
      console.log(`Nenhum valor encontrado para ${originalVar}, mantendo original`);
    }
  });

  console.log('Processamento de template concluído');
  return processedContent;
};

export const getVariableDescription = (variable: string): string => {
  const cleanVar = variable.replace(/[{}]/g, '').trim().toLowerCase();
  const descriptions: Record<string, string> = {
    'nome': 'Nome da parte',
    'nome_completo': 'Nome completo da parte',
    'nacionalidade': 'Nacionalidade da parte',
    'estado_civil': 'Estado civil da parte',
    'profissao': 'Profissão ou ocupação',
    'cpf': 'Número do CPF',
    'rg': 'Número do RG',
    'rg_orgao_emissor': 'Órgão emissor do RG',
    'endereco': 'Endereço completo',
    'numero': 'Número do endereço',
    'complemento': 'Complemento do endereço',
    'bairro': 'Bairro',
    'cidade': 'Cidade',
    'estado': 'Estado/UF',
    'cep': 'CEP',
    'email': 'Endereço de e-mail',
    'telefone': 'Número de telefone'
  };

  return descriptions[cleanVar] || 'Campo do documento';
};

export const previewTemplate = (content: string): string => {
  const dummyData: Record<string, string> = {};
  const matches = content.match(/{{[^}]+}}|\{[^}]+\}/g) || [];
  
  matches.forEach(match => {
    const variable = match.replace(/[{}]/g, '').trim();
    dummyData[variable] = `[${getVariableDescription(variable)}]`;
  });

  return processTemplate(content, dummyData);
};
