export interface TemplateVariables {
  locador_nome?: string;
  locador_nacionalidade?: string;
  locador_estado_civil?: string;
  locador_profissao?: string;
  locador_rg?: string;
  locador_cpf?: string;
  locador_endereco?: string;
  locador_bairro?: string;
  locador_cep?: string;
  locador_cidade?: string;
  locador_estado?: string;
  
  locatario_nome?: string;
  locatario_nacionalidade?: string;
  locatario_estado_civil?: string;
  locatario_profissao?: string;
  locatario_rg?: string;
  locatario_cpf?: string;
  locatario_endereco?: string;
  locatario_bairro?: string;
  locatario_cep?: string;
  locatario_cidade?: string;
  locatario_estado?: string;
  locatario_telefone?: string;
  locatario_email?: string;

  locataria_nome?: string;
  locataria_nacionalidade?: string;
  locataria_estado_civil?: string;
  locataria_profissao?: string;
  locataria_rg?: string;
  locataria_cpf?: string;
  locataria_endereco?: string;
  locataria_bairro?: string;
  locataria_cep?: string;
  locataria_cidade?: string;
  locataria_estado?: string;
  locataria_telefone?: string;
  locataria_email?: string;

  fiador_nome?: string;
  fiador_nacionalidade?: string;
  fiador_estado_civil?: string;
  fiador_profissao?: string;
  fiador_rg?: string;
  fiador_cpf?: string;
  fiador_endereco?: string;
  fiador_bairro?: string;
  fiador_cep?: string;
  fiador_cidade?: string;
  fiador_estado?: string;
  fiador_telefone?: string;
  fiador_email?: string;

  fiadora_nome?: string;
  fiadora_nacionalidade?: string;
  fiadora_estado_civil?: string;
  fiadora_profissao?: string;
  fiadora_rg?: string;
  fiadora_cpf?: string;
  fiadora_endereco?: string;
  fiadora_bairro?: string;
  fiadora_cep?: string;
  fiadora_cidade?: string;
  fiadora_estado?: string;
  fiadora_telefone?: string;
  fiadora_email?: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  lastModified: string;
  downloads: number;
  content: string;
  template_variables?: TemplateVariables;
}
