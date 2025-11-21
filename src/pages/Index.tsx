import "../css/index.css";
import Header from "@/components/Header";
import FilterBar from "@/components/FilterBar";
import PostCard from "@/components/PostCard";
import CreatePostButton from "@/components/CreatePostButton";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface BackendPost {
  id: number;
  userId: number;
  titulo: string;
  descricao: string;
  categoria: string;
  valor: number;
  data: string;
  status?: string;
  foto?: string;
  telefone?: string;
  endereco?: string;
  lat?: number | null;
  lon?: number | null;
  User?: { id?: number, name?: string, foto?: string };
}

const Index = () => {
  const [posts, setPosts] = useState<BackendPost[] | null>(null);
  const [ratingsMap, setRatingsMap] = useState<Record<number, { avg: number; count: number }>>({});
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Todos']);
  const [priceSort, setPriceSort] = useState<'asc' | 'desc' | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => { console.error('Erro ao buscar posts', err); setPosts([]); });
  }, []);

  // If some posts lack public `User` info (name/foto), fetch it per-user and merge.
  useEffect(() => {
    try {
      if (!posts || posts.length === 0) return;
      // find ids where we don't have a proper name
      const missingIds = Array.from(new Set(posts
        .map(p => (p.User?.id ?? p.userId))
        .filter(Boolean)
        .filter(id => {
          const match = posts.find(x => (x.User?.id ?? x.userId) === id);
          // if any post with this id has a name, skip fetching
          if (match && match.User && match.User.name) return false;
          return true;
        })
      ));
      if (missingIds.length === 0) return;

      // fetch public user for each missing id in parallel
      Promise.all(missingIds.map(id => fetch(`/api/auth/user?id=${id}`).then(r => r.json()).catch(() => null)))
        .then(usersArr => {
          const usersById: Record<number, any> = {};
          usersArr.forEach(u => { if (u && u.id) usersById[u.id] = u; });
          if (Object.keys(usersById).length === 0) return;
          setPosts(prev => prev ? prev.map(p => {
            const uid = p.User?.id ?? p.userId;
            if (!uid) return p;
            const u = usersById[uid];
            if (!u) return p;
            return { ...p, User: { ...(p.User || {}), ...u } };
          }) : prev);
        })
        .catch(e => console.warn('Erro ao buscar usuários públicos para posts', e));
    } catch (e) { console.error('Erro no efeito de merge de usuários', e); }
  }, [posts]);

  // Quando os posts mudarem, buscar médias de avaliação para os autores
  useEffect(() => {
    try {
      if (!posts || posts.length === 0) return;
      const ids = Array.from(new Set(posts.map(p => (p.User?.id ?? p.userId)).filter(Boolean)));
      if (ids.length === 0) return;
      fetch(`/api/reviews/summary?userIds=${ids.join(',')}`)
        .then(r => r.json())
        .then((map) => setRatingsMap(map || {}))
        .catch(e => console.error('Erro ao buscar summary de avaliações', e));
    } catch (e) { console.error(e); }
  }, [posts]);

  // sync searchQuery from URL param `q`
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const q = params.get('q') || '';
      setSearchQuery(q);
    } catch (e) {
      // ignore
    }
  }, [location.search]);

  // debug: log how many posts match the current query (temporary)
  useEffect(() => {
    try {
      if (!posts) return;
      const q = String(searchQuery || '').trim().toLowerCase();
      if (!q) {
        console.info('[Search debug] query empty');
        return;
      }
      const matches = posts.filter(p => String(p.titulo || '').toLowerCase().includes(q));
      console.info('[Search debug] q="' + q + '" matches=', matches.length, 'of', posts.length);
    } catch (e) {
      console.warn('[Search debug] error', e);
    }
  }, [searchQuery, posts]);

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

  // proximity thresholds in km (kept for potential use)
  const proximityThresholds = { near: 5, medium: 20 };

  // prepare rendered posts (compute outside JSX to avoid parser issues)
  const renderedPosts = (() => {
    try {
      if (posts === null) return <div className="text-center text-muted-foreground">Carregando posts...</div>;
      if (posts.length === 0) return <div className="text-center text-muted-foreground">Nenhum post encontrado.</div>;

      const normalize = (s: string) => {
        try {
          const base = String(s || '');
          if (typeof base.normalize === 'function') {
            // try Unicode normalization + remove diacritics if supported
            return base.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
          }
          return base.toLowerCase();
        } catch (e) {
          return String(s || '').toLowerCase();
        }
      };

      const q = normalize(String(searchQuery || '').trim());

      const items = posts.map((p) => {
      const rawValor = p.valor ?? 0;
      const parsedValor = Number(String(rawValor).replace(',', '.'));
      const isRequest = !isNaN(parsedValor) && parsedValor > 0;
      let km = NaN;
      if (coords && p.lat != null && p.lon != null) km = haversine(coords.lat, coords.lon, Number(p.lat), Number(p.lon));

        const titleNorm = normalize(String(p.titulo || ''));

      let titleScore = 0;
      try {
        if (q) {
          if (titleNorm === q) titleScore = 1000;
          else if (titleNorm.startsWith(q)) titleScore = 500;
          else if (titleNorm.includes(q)) titleScore = 100;

          const tokens = q.split(/\s+/).filter(Boolean);
          for (const t of tokens) {
            if (t.length >= 3 && titleNorm.includes(t)) titleScore += 10;
          }
        }
      } catch (e) {
        titleScore = 0;
      }

      return { p, parsedValor, isRequest, km, titleScore, titleNorm };
    });

    const filteredByCategory = items.filter(({ p }) => {
      // Filtrar posts que não estão abertos
      if (p.status && p.status !== 'aberto') return false;
      
      if (!selectedCategories || selectedCategories.includes('Todos')) return true;
      if (selectedCategories.length === 0) return true;
      if (selectedCategories.includes(p.categoria)) return true;
      return false;
    });

    const matches = q ? filteredByCategory.filter(it => it.titleNorm.includes(q)) : [];
    const nonMatches = q ? filteredByCategory.filter(it => !it.titleNorm.includes(q)) : filteredByCategory;

    const priceComparator = (a: any, b: any) => priceSort === 'asc' ? a.parsedValor - b.parsedValor : b.parsedValor - a.parsedValor;

    matches.sort((a, b) => {
      if (b.titleScore !== a.titleScore) return b.titleScore - a.titleScore;
      if (priceSort) return priceComparator(a, b);
      return 0;
    });

    if (priceSort) nonMatches.sort(priceComparator);

    let finalItems = q ? [...matches, ...nonMatches] : filteredByCategory;

    // when there's no search query, default ordering should be by creation time (newest first)
    if (!q) {
      if (priceSort) {
        // if price sort is active, apply it
        finalItems.sort((a: any, b: any) => priceSort === 'asc' ? a.parsedValor - b.parsedValor : b.parsedValor - a.parsedValor);
      } else {
        // otherwise sort by date (newest first). fallback to 0 when date invalid
        finalItems.sort((a: any, b: any) => {
          const ta = a.p?.data ? new Date(a.p.data).getTime() : 0;
          const tb = b.p?.data ? new Date(b.p.data).getTime() : 0;
          return tb - ta;
        });
      }
    }

      const backendBase = import.meta.env.DEV ? 'http://localhost:5000' : '';
      return finalItems.map(({ p, parsedValor, isRequest, km }) => {
      const distanceStr = isNaN(km) ? '--' : formatDistance(km);
        // Normalize author's foto to a full URL when necessary (dev server serves uploads from backend)
        const userFotoRaw = p.User?.foto;
        const avatarSrc = userFotoRaw && userFotoRaw.startsWith('/uploads') ? `${backendBase}${userFotoRaw}` : userFotoRaw || undefined;

        const avgForUser = (p.User?.id && ratingsMap[p.User.id]) ? (ratingsMap[p.User.id].avg) : 0;
        return (
        <PostCard
          id={p.id}
          key={p.id}
          type={isRequest ? "request" : "offer"}
          username={p.User?.name || 'Anônimo'}
            // Always prefer the author's profile photo (prefix host in dev when needed).
            avatar={avatarSrc}
          rating={avgForUser || 0}
          category={p.categoria}
          title={p.titulo}
          description={p.descricao}
          price={p.valor ? `R$ ${p.valor}` : undefined}
          location={p.endereco || ''}
          distance={distanceStr}
          time={new Date(p.data).toLocaleString()}
          authorId={p.User?.id ?? p.userId}
        />
      );
      });
    } catch (err) {
      console.error('[Feed render error]', err);
      return <div className="text-center text-destructive">Erro ao renderizar posts. Veja o console.</div>;
    }
  })();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <FilterBar
        selectedCategories={selectedCategories}
        onCategoriesChange={(cats) => setSelectedCategories(cats.length === 0 ? ['Todos'] : cats)}
        priceSort={priceSort}
        onPriceSortChange={(p) => setPriceSort(p)}
      />
      
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {renderedPosts}
        </div>
      </main>
      
      <CreatePostButton />
    </div>
  );
};

export default Index;
