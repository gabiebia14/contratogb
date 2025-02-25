
import { useState } from "react";
import { Property, PropertyType, RawPropertyData } from "@/types/properties";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { normalizePropertyType } from "../utils/propertyUtils";
import { parseCsvLine, parseRenda } from "../utils/csvParser";

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQptFGMW8iN8o7XTx2JmufTOyNhQGshbjQj79uj7F6xp7otPGGHocLuGYxaWfsl9AK-AWieURS2ccCm/pub?gid=0&single=true&output=csv";

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const normalizedProperties = (data as RawPropertyData[]).map(property => ({
        ...property,
        type: normalizePropertyType(property.type)
      }));

      setProperties(normalizedProperties);
    } catch (error) {
      console.error('Erro ao carregar imóveis:', error);
      toast.error('Erro ao carregar os imóveis');
    } finally {
      setLoading(false);
    }
  };

  const syncProperties = async () => {
    try {
      setSyncing(true);
      console.log('Iniciando sincronização...');

      const response = await fetch(SHEET_URL);
      if (!response.ok) {
        throw new Error('Falha ao buscar dados da planilha');
      }

      const csvText = await response.text();
      const rows = csvText.split('\n');
      const headers = parseCsvLine(rows[0]);
      
      console.log('Headers:', headers);
      
      const propertiesToInsert = rows.slice(1)
        .filter(row => row.trim())
        .map(row => {
          const values = parseCsvLine(row);
          const propertyData: Record<string, string> = {};
          
          headers.forEach((header, index) => {
            propertyData[header.trim()] = values[index] || '';
          });

          return {
            type: normalizePropertyType(propertyData['TIPO DE IMÓVEL']),
            quantity: parseInt(propertyData['QUANTIDADE']) || 1,
            address: propertyData['ENDEREÇO'],
            income_type: propertyData['TIPO DE RENDA'] || null,
            observations: propertyData['OBSERVAÇÕES'] || null,
            income1_value: parseRenda(propertyData['RENDA 1 (VALOR)']),
            income1_tenant: propertyData['RENDA 1 (INQUILINO)'] || null,
            income2_value: parseRenda(propertyData['RENDA 2 (VALOR)']),
            income2_tenant: propertyData['RENDA 2 (INQUILINO)'] || null,
            income3_value: parseRenda(propertyData['RENDA3(VALOR)']),
            income3_tenant: propertyData['RENDA3 (INQUILINO)'] || null,
            city: propertyData['CIDADE']
          };
        });

      const { error: deleteError } = await supabase
        .from('properties')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deleteError) {
        throw deleteError;
      }

      const { error: insertError } = await supabase
        .from('properties')
        .insert(propertiesToInsert);

      if (insertError) {
        throw insertError;
      }

      await loadProperties();
      toast.success('Dados sincronizados com sucesso!');
    } catch (error) {
      console.error('Erro ao sincronizar dados:', error);
      toast.error('Erro ao sincronizar dados da planilha');
    } finally {
      setSyncing(false);
    }
  };

  return {
    properties,
    loading,
    syncing,
    loadProperties,
    syncProperties
  };
};
