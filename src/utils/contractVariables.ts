
export const normalizeVariableName = (varName: string): string[] => {
  const prefixes = [
    'locador_', 'locadora_', 
    'locatario_', 'locataria_', 
    'fiador_', 'fiadora_',
    'arrendador_', 'arrendadora_',
    'arrendatario_', 'arrendataria_'
  ];
  
  let withoutPrefix = varName;
  let foundPrefix = '';
  
  for (const prefix of prefixes) {
    if (varName.toLowerCase().startsWith(prefix)) {
      withoutPrefix = varName.slice(prefix.length);
      foundPrefix = prefix;
      break;
    }
  }

  // Se encontrou um prefixo específico, prioriza as variantes com esse prefixo
  if (foundPrefix) {
    return [
      varName,                    // Original
      withoutPrefix,              // Sem prefixo
      `${foundPrefix}${withoutPrefix}`, // Com o mesmo prefixo
      // Adiciona variantes com prefixos relacionados
      ...(foundPrefix.includes('arrendador') ? [`locador_${withoutPrefix}`, `locadora_${withoutPrefix}`] : []),
      ...(foundPrefix.includes('locador') ? [`arrendador_${withoutPrefix}`, `arrendadora_${withoutPrefix}`] : []),
      ...(foundPrefix.includes('arrendatario') ? [`locatario_${withoutPrefix}`, `locataria_${withoutPrefix}`] : []),
      ...(foundPrefix.includes('locatario') ? [`arrendatario_${withoutPrefix}`, `arrendataria_${withoutPrefix}`] : [])
    ];
  }

  // Se não encontrou prefixo, retorna todas as variantes possíveis
  return [
    varName,
    withoutPrefix,
    `locador_${withoutPrefix}`,
    `locadora_${withoutPrefix}`,
    `locatario_${withoutPrefix}`,
    `locataria_${withoutPrefix}`,
    `fiador_${withoutPrefix}`,
    `fiadora_${withoutPrefix}`,
    `arrendador_${withoutPrefix}`,
    `arrendadora_${withoutPrefix}`,
    `arrendatario_${withoutPrefix}`,
    `arrendataria_${withoutPrefix}`
  ];
};

export const processTemplate = (template: string, variables: Record<string, any>) => {
  let processedContent = template;
  console.log('Processando template com variáveis:', variables);

  const matches = template.match(/{[^}]+}/g) || [];
  const variablesToReplace = new Set(matches.map(match => match.slice(1, -1)));
  
  console.log('Variáveis encontradas no template:', Array.from(variablesToReplace));

  variablesToReplace.forEach(varName => {
    const variants = normalizeVariableName(varName);
    let value = '';
    let usedVariant = '';
    
    for (const variant of variants) {
      if (variables[variant.toLowerCase()] !== undefined) {
        value = variables[variant.toLowerCase()];
        usedVariant = variant;
        break;
      }
      if (variables[variant] !== undefined) {
        value = variables[variant];
        usedVariant = variant;
        break;
      }
    }

    if (value) {
      console.log(`Substituindo ${varName} com valor "${value}" usando variante "${usedVariant}"`);
    } else {
      console.log(`Nenhum valor encontrado para ${varName}. Variantes tentadas:`, variants);
    }

    const regex = new RegExp(`{${varName}}`, 'g');
    processedContent = processedContent.replace(regex, value || '______');
  });

  return processedContent;
};
