
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types/properties';
import { toast } from 'sonner';

export function useProperties() {
  const { data: properties, isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error('Erro ao carregar imóveis');
      }

      return data as Property[];
    },
    meta: {
      onError: (error: Error) => {
        console.error('Erro ao carregar imóveis:', error);
        toast.error('Erro ao carregar os imóveis');
      }
    }
  });

  const propertyStats = {
    total: properties?.length ?? 0,
    byType: properties?.reduce((acc, property) => {
      acc[property.type] = (acc[property.type] || 0) + property.quantity;
      return acc;
    }, {} as Record<string, number>),
    occupied: properties?.filter(p => p.tenant)?.length ?? 0,
    vacant: properties?.filter(p => !p.tenant)?.length ?? 0,
    totalIncome: properties?.reduce((sum, property) => sum + (property.income || 0), 0) ?? 0,
  };

  const incomeByProperty = properties?.map(property => ({
    imovel: `${property.type} - ${property.address.split(',')[0]}`,
    receita: property.income || 0
  })) ?? [];

  return {
    properties,
    isLoading,
    error,
    stats: propertyStats,
    incomeByProperty
  };
}
