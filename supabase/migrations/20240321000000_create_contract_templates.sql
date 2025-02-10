
CREATE TABLE IF NOT EXISTS contract_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Geral',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  template_variables JSONB
);

-- Add RLS policies
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON contract_templates
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON contract_templates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON contract_templates
  FOR UPDATE USING (auth.role() = 'authenticated');
