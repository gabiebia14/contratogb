export interface ExtractedField {
  field: string;
  value: string;
  confidence: number;
}

export type DocumentField = 
  | "Nome completo"
  | "Nacionalidade"
  | "Data de nascimento"
  | "RG"
  | "CPF"
  | "Profissão"
  | "Endereço"
  | "Bairro"
  | "CEP"
  | "Cidade"
  | "Estado"
  | "Telefone";