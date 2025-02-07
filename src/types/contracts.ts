
export interface Template {
  id: string;
  name: string;
  category: string;
  lastModified: string;
  downloads: number;
  content: string;
  template_variables?: Record<string, string>;
}

export interface Contract {
  id: string;
  title: string;
  content: string;
  template_id?: string;
  document_id?: string;
  status?: string;
  variables?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}
