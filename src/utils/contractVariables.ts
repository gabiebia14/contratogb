
export const normalizeVariableName = (varName: string): string[] => {
  const prefixes = ['locador_', 'locadora_', 'locatario_', 'locataria_', 'fiador_', 'fiadora_'];
  let withoutPrefix = varName;
  
  for (const prefix of prefixes) {
    if (varName.startsWith(prefix)) {
      withoutPrefix = varName.replace(prefix, '');
      break;
    }
  }

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

export const processTemplate = (template: string, variables: Record<string, any>) => {
  let processedContent = template;
  console.log('Template original:', template);
  console.log('Variáveis disponíveis:', variables);

  const matches = template.match(/{[^}]+}/g) || [];
  const variablesToReplace = new Set(matches.map(match => match.slice(1, -1)));
  
  console.log('Variáveis encontradas no template:', Array.from(variablesToReplace));

  variablesToReplace.forEach(varName => {
    const variants = normalizeVariableName(varName);
    let value = '';
    
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
