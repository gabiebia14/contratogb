
export const parseCsvLine = (line: string) => {
  const values = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (i > 0 && line[i-1] === '"') {
        currentValue = currentValue.slice(0, -1) + '"';
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  values.push(currentValue.trim());
  return values.map(value => value.replace(/^"(.*)"$/, '$1').trim());
};

export const parseRenda = (rendaStr: string): number | null => {
  if (!rendaStr) return null;
  
  const value = rendaStr
    .replace(/R\$\s*/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.')
    .trim();
  
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
};
