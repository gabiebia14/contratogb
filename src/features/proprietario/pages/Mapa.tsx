
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Card } from "@/components/ui/card";
import { useProperties } from "../hooks/useProperties";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import 'mapbox-gl/dist/mapbox-gl.css';

export default function Mapa() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState('');
  const [mapInitialized, setMapInitialized] = useState(false);
  const { properties, loading } = useProperties();

  const initializeMap = async () => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-49.2729, -25.4295], // Coordenadas iniciais (Curitiba)
        zoom: 12
      });

      // Adiciona controles de navegação
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Adiciona marcadores para cada imóvel
      await addPropertyMarkers();
      
      setMapInitialized(true);
    } catch (error) {
      console.error('Erro ao inicializar o mapa:', error);
      toast.error('Erro ao inicializar o mapa. Verifique o token do Mapbox.');
    }
  };

  const addPropertyMarkers = async () => {
    if (!map.current) return;

    // Limpa marcadores existentes
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Coordenadas para ajustar o zoom do mapa
    const bounds = new mapboxgl.LngLatBounds();
    let markersAdded = 0;

    for (const property of properties) {
      try {
        // Geocodifica o endereço
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            `${property.address}, ${property.city}`
          )}.json?access_token=${mapboxToken}`
        );
        
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          
          // Cria um elemento personalizado para o marcador
          const el = document.createElement('div');
          el.className = 'marker';
          el.style.backgroundColor = '#2563eb';
          el.style.width = '20px';
          el.style.height = '20px';
          el.style.borderRadius = '50%';
          el.style.border = '2px solid white';
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

          // Adiciona o marcador ao mapa
          const marker = new mapboxgl.Marker(el)
            .setLngLat([lng, lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML(
                  `<strong>${property.type}</strong><br>${property.address}<br>${property.city}`
                )
            )
            .addTo(map.current);

          markers.current.push(marker);
          bounds.extend([lng, lat]);
          markersAdded++;
        }
      } catch (error) {
        console.error('Erro ao geocodificar endereço:', error);
      }
    }

    // Ajusta o zoom do mapa para mostrar todos os marcadores
    if (markersAdded > 0) {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }
  };

  useEffect(() => {
    if (mapInitialized && map.current) {
      addPropertyMarkers();
    }
  }, [properties, mapInitialized]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mapa de Imóveis</h1>
      
      {!mapInitialized && (
        <Card className="p-6">
          <p className="mb-4">Para visualizar o mapa, insira seu token público do Mapbox:</p>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Cole seu token público do Mapbox aqui"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
            <Button onClick={initializeMap} disabled={!mapboxToken}>
              Inicializar Mapa
            </Button>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Obtenha seu token gratuito em{' '}
            <a 
              href="https://www.mapbox.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Mapbox.com
            </a>
          </p>
        </Card>
      )}

      <Card className={`overflow-hidden ${mapInitialized ? 'h-[600px]' : 'p-6'}`}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p>Carregando imóveis...</p>
          </div>
        ) : (
          <div ref={mapContainer} className="w-full h-full" />
        )}
      </Card>
    </div>
  );
}
