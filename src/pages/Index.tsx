import "../css/index.css";
import Header from "@/components/Header";
import FilterBar from "@/components/FilterBar";
import PostCard from "@/components/PostCard";
import CreatePostButton from "@/components/CreatePostButton";

import { useEffect, useState } from "react";

interface BackendPost {
  id: number;
  userId: number;
  titulo: string;
  descricao: string;
  categoria: string;
  valor: number;
  data: string;
  foto?: string;
  telefone?: string;
  endereco?: string;
  lat?: number | null;
  lon?: number | null;
  User?: { name?: string, foto?: string };
}

const Index = () => {
  const [posts, setPosts] = useState<BackendPost[] | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => { console.error('Erro ao buscar posts', err); setPosts([]); });
  }, []);

  useEffect(() => {
    if (!navigator || !navigator.geolocation) return;
    const onSuccess = (pos: GeolocationPosition) => {
      setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
    };
    const onError = (err: GeolocationPositionError) => {
      console.warn('Geolocalização não disponível:', err.message);
    };
    navigator.geolocation.getCurrentPosition(onSuccess, onError, { timeout: 5000 });
  }, []);

  function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // km
  }

  function formatDistance(km: number) {
    if (isNaN(km)) return '--';
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <FilterBar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {posts === null ? (
            <div className="text-center text-muted-foreground">Carregando posts...</div>
          ) : posts.length === 0 ? (
            <div className="text-center text-muted-foreground">Nenhum post encontrado.</div>
          ) : (
            posts.map((p) => {
              let distanceStr = '--';
              if (coords && p.lat != null && p.lon != null) {
                const km = haversine(coords.lat, coords.lon, Number(p.lat), Number(p.lon));
                distanceStr = formatDistance(km);
              }
              return (
                <PostCard
                  key={p.id}
                  type={p.valor && p.valor > 0 ? "offer" : "request"}
                  username={p.User?.name || 'Anônimo'}
                  avatar={p.User?.foto || p.foto || undefined}
                  rating={4.5}
                  category={p.categoria}
                  title={p.titulo}
                  description={p.descricao}
                  price={p.valor ? `R$ ${p.valor}` : undefined}
                  location={p.endereco || ''}
                  distance={distanceStr}
                  time={new Date(p.data).toLocaleString()}
                />
              );
            })
          )}
        </div>
      </main>
      
      <CreatePostButton />
    </div>
  );
};

export default Index;
