import "../css/profile.css";
import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { apiJson, apiFetch } from '@/lib/api';
import { toast } from "sonner";
import { ArrowLeft, Star, MapPin, User, Briefcase, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const Profile = () => {
  const navigate = useNavigate();

  // Tenta carregar o usuário do localStorage
  const raw = typeof window !== 'undefined' ? localStorage.getItem('bizzy_user') : null;
  let storedUser: any = null;
  try {
    storedUser = raw ? JSON.parse(raw) : null;
  } catch (e) { storedUser = null; }
  // backend base for static uploads during development
  const backendBase = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '';

  const [publicReviewsData, setPublicReviewsData] = useState<{ reviews: any[]; avg: number; count: number }>({ reviews: [], avg: 0, count: 0 });

  const completedJobs = [ { title: "Limpeza Residencial", category: "Limpeza", date: "15/03/2024" } ];

  // posts for own profile
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [deletingIds, setDeletingIds] = useState<number[]>([]);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const viewedUserId = params.get('userId');
  const storedUserId = storedUser?.id ? String(storedUser.id) : null;
  const isOwnProfile = !viewedUserId || (storedUserId && viewedUserId === String(storedUserId));

  // When viewing someone else's profile, fetch their public data
  const [viewedUser, setViewedUser] = useState<any | null>(null);
  const [servicos, setServicos] = useState<any>({ asContratado: [], asContratante: [] });
  const [loadingServicos, setLoadingServicos] = useState(false);
  const [reviewModal, setReviewModal] = useState<{ open: boolean; servicoId?: number; toUserId?: number }>({ open: false });
  const [reviewForm, setReviewForm] = useState<{ rating: number; comment: string }>({ rating: 5, comment: '' });
  const [servicoDetail, setServicoDetail] = useState<any | null>(null);
  const [reviewsByServico, setReviewsByServico] = useState<Record<string, any[]>>({});
  

  // fetch services for profileToShow
  useEffect(() => {
    const idToFetch = isOwnProfile ? storedUserId : viewedUserId;
    if (!idToFetch) return;
    setLoadingServicos(true);
    apiJson('/api/servicos')
      .then(data => setServicos(data || { asContratado: [], asContratante: [] }))
      .catch(console.error)
      .finally(() => setLoadingServicos(false));
  }, [isOwnProfile, storedUserId, viewedUserId]);
  
  // Também buscar avaliações (média + autores) para o perfil exibido
  useEffect(() => {
    const idToFetch = isOwnProfile ? storedUserId : viewedUserId;
    if (!idToFetch) return;
    apiJson(`/api/reviews?userId=${idToFetch}`)
      .then((r:any) => {
        if (r && typeof r === 'object' && Array.isArray(r.reviews)) {
          setPublicReviewsData({ reviews: r.reviews, avg: r.avg || 0, count: r.count || 0 });
        } else if (Array.isArray(r)) {
          const count = r.length;
          const avg = count === 0 ? 0 : r.reduce((s:any, it:any) => s + (it.rating || 0), 0) / count;
          setPublicReviewsData({ reviews: r, avg: Number(avg.toFixed(2)), count });
        } else {
          setPublicReviewsData({ reviews: [], avg: 0, count: 0 });
        }
      })
      .catch((e) => { console.error('Erro ao buscar avaliações', e); setPublicReviewsData({ reviews: [], avg: 0, count: 0 }); });
  }, [isOwnProfile, storedUserId, viewedUserId]);

  // Quando for perfil de outra pessoa, buscar os dados públicos desse usuário
  useEffect(() => {
    if (isOwnProfile) return;
    if (!viewedUserId) return;
    apiJson(`/api/auth/user?id=${viewedUserId}`)
      .then((u:any) => {
        if (u && typeof u === 'object') setViewedUser(u);
      })
      .catch((e) => { console.error('Erro ao buscar usuário público', e); setViewedUser(null); });
  }, [isOwnProfile, viewedUserId]);

  // Função para refazer o fetch de serviços
  const refetchServicos = async () => {
    try {
      console.log('Refazendo fetch de serviços...');
      const data = await apiJson('/api/servicos');
      console.log('Serviços carregados:', data);
      setServicos(data || { asContratado: [], asContratante: [] });
      // fetch reviews for loaded servicos to determine review state
      try {
        const all = [...(data.asContratado||[]), ...(data.asContratante||[])];
        for (const s of all) {
          if (!s || !s.id) continue;
          if (reviewsByServico[s.id]) continue;
          (async (servId) => {
            try {
              const r = await apiJson(`/api/reviews/servico/${servId}`);
              setReviewsByServico(prev => ({ ...prev, [servId]: Array.isArray(r) ? r : [] }));
            } catch (e) { /* ignore per-serv fetch errors */ }
          })(s.id);
        }
      } catch (e) { console.error('Erro ao carregar reviews por serviço', e); }
    } catch (e) {
      console.error('Erro ao refazer fetch de serviços:', e);
    }
  };

  // Recarregar serviços periodicamente (a cada 3 segundos) enquanto perfil estiver aberto
  useEffect(() => {
    if (!isOwnProfile) return;
    const interval = setInterval(refetchServicos, 3000);
    return () => clearInterval(interval);
  }, [isOwnProfile]);

  // Choose which profile to render: own storedUser or the viewed user's public profile
  const profileToShow = isOwnProfile ? storedUser : (viewedUser || null);
  const fotoSrc = profileToShow?.foto ? (profileToShow.foto.startsWith('http') ? profileToShow.foto : `${backendBase}${profileToShow.foto}`) : undefined;

  // Helper: extract only the city from a full address string
  const extractCity = (endereco?: string, cidade?: string) => {
    if (cidade) return cidade;
    if (!endereco) return 'Cidade não informada';
    const parts = endereco.split(',').map((s:string) => s.trim()).filter(Boolean);
    if (parts.length >= 2) return parts[parts.length - 2] || parts[parts.length - 1];
    return parts[parts.length - 1] || 'Cidade não informada';
  };

  // Helper: calculate age in years from a nascimento string (supports ISO or dd/mm/yyyy)
  const calculateAge = (nascimento?: string | null) => {
    if (!nascimento) return null;
    let d = new Date(String(nascimento));
    if (isNaN(d.getTime())) {
      // try dd/mm/yyyy or d/m/yyyy
      const parts = String(nascimento).split(/[\/\-\.]/).map((s) => s.trim());
      if (parts.length === 3) {
        const day = Number(parts[0]);
        const month = Number(parts[1]);
        let year = Number(parts[2]);
        if (year < 100) year += 1900;
        d = new Date(year, month - 1, day);
      }
    }
    if (isNaN(d.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age;
  };

  // Estado para editar perfil
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({
    name: storedUser?.name ?? '',
    telefone: storedUser?.telefone ?? '',
    endereco: storedUser?.endereco ?? '',
    servicos: storedUser?.servicos ?? '',
    nascimento: storedUser?.nascimento ?? '',
    description: storedUser?.description ?? '',
    sexo: storedUser?.sexo ?? '',
  });
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [msg, setMsg] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((s:any)=>({ ...s, [name]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    try {
      // Se houver foto, usar multipart/form-data e rota /api/auth/upload-foto para upload
      const apiUrl = process.env.NODE_ENV === 'development' ? '/api/auth/editar' : 'http://localhost:5000/api/auth/editar';
      // enviar JSON com id + campos atualizaveis
      const body = { id: storedUser?.id, ...form };
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        setMsg(data.message || 'Erro ao atualizar');
        return;
      }
      // Atualizar localStorage com o user retornado
      localStorage.setItem('bizzy_user', JSON.stringify(data));
      // Se enviou foto, fazer upload via rota /api/auth/upload-foto
      if (fotoFile) {
        const uploadUrl = process.env.NODE_ENV === 'development' ? '/api/auth/upload-foto' : 'http://localhost:5000/api/auth/upload-foto';
        const fd = new FormData();
        fd.append('foto', fotoFile);
        fd.append('userId', String(data.id || storedUser?.id));
        const upRes = await fetch(uploadUrl, { method: 'POST', body: fd });
        const upData = await upRes.json();
        if (upRes.ok && upData.foto) {
          // atualizar foto no objeto guardado
          const updated = { ...data, foto: upData.foto };
          localStorage.setItem('bizzy_user', JSON.stringify(updated));
        }
      }
      setMsg('Perfil atualizado com sucesso');
      // atualizar form e storedUser (reload page state)
      const newRaw = localStorage.getItem('bizzy_user');
      try { storedUser = newRaw ? JSON.parse(newRaw) : storedUser; } catch(e){ }
      setEditing(false);
    } catch (err) {
      console.error(err);
      setMsg('Erro ao conectar com o servidor');
    }
  }

  // Fetch user's posts when viewing own profile
  useEffect(() => {
    if (!isOwnProfile || !storedUserId) return;
    setLoadingPosts(true);
    apiJson(`/api/posts?userId=${storedUserId}`)
      .then((data) => {
        setPosts(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Erro ao buscar posts do usuário', err);
      })
      .finally(() => setLoadingPosts(false));
  }, [isOwnProfile, storedUserId]);

  async function handleDeletePost(postId: number) {
    try {
      setDeletingIds((s) => [...s, postId]);
  const res = await apiFetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir post');
      setPosts((p) => p.filter((x) => x.id !== postId));
      toast.success('Post excluído');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao excluir post');
    } finally {
      setDeletingIds((s) => s.filter((id) => id !== postId));
    }
  }

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFotoFile(f);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/feed")}
            className="hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Perfil</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-6">
        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* left photo column - responsive: stacked on small, left column on sm+ */}
            <div className="flex-shrink-0 w-full sm:w-40 flex items-center sm:items-start justify-center sm:justify-start sm:mr-6">
              <div className="rounded-full p-1 ring-1 ring-border card-avatar-wrapper" style={{ marginRight: 12 }}>
                <Avatar className="h-32 w-32 sm:h-40 sm:w-40">
                  {fotoSrc ? (
                    <AvatarImage src={fotoSrc} />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                      {profileToShow && profileToShow.name ? profileToShow.name.split(' ').map((s:string)=>s[0]).slice(0,2).join('').toUpperCase() : 'U'}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">{profileToShow?.name ?? 'Usuário'}</h2>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-5 w-5 fill-primary text-primary" />
                    <span className="text-lg font-semibold text-darker-gray">{(publicReviewsData.avg || 0).toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">({publicReviewsData.count} avaliações)</span>
                  </div>
                </div>
                {isOwnProfile && (
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button aria-label="Mais opções" className="p-2 rounded-md hover:bg-secondary">
                          <MoreHorizontal className="h-5 w-5 text-darker-gray" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="bottom" className="profile-dropdown">
                        <DropdownMenuItem className="dropdown-item" onSelect={() => navigate('/edit-profile')}>Editar Perfil</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="dropdown-item" onSelect={() => { localStorage.removeItem('bizzy_user'); navigate('/feed'); }}>Sair</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{isOwnProfile ? (profileToShow?.endereco ?? 'Endereço não informado') : extractCity(profileToShow?.endereco, profileToShow?.cidade)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{profileToShow?.nascimento ? (calculateAge(profileToShow.nascimento) != null ? `Idade: ${calculateAge(profileToShow.nascimento)} anos` : 'Idade não informada') : 'Idade não informada'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span>{profileToShow?.servicos ? `${(profileToShow.servicos as string).split(',').length} serviços` : 'Serviços não informados'}</span>
                </div>
              </div>

              <p className="text-muted-foreground mb-4">{profileToShow?.description ?? 'Sem descrição'}</p>

              <div className="flex flex-wrap gap-2 profile-categories">
                {(profileToShow?.servicos ? (profileToShow.servicos as string).split(',').map((s:string)=>s.trim()).filter(Boolean) : ['Sem serviços']).map((s:string, idx:number) => (
                  <Badge key={idx} className={`cursor-pointer shrink-0 px-4 py-2 text-sm transition-all hover:bg-secondary border-border text-darker-gray`}>{s}</Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* inline editing removed in favor of dedicated /edit-profile page */}

        {isOwnProfile ? (
          <>
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="posts">Meus Posts</TabsTrigger>
                <TabsTrigger value="jobs">Trabalhos</TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="space-y-4 mt-6">
                {loadingPosts ? (
                  <Card className="p-4">Carregando posts...</Card>
                ) : posts.length === 0 ? (
                  <Card className="p-4">Você ainda não publicou nenhum post.</Card>
                ) : (
                  posts.map((post) => (
                    <Card key={post.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">{post.titulo}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs border-primary/30">{post.categoria}</Badge>
                            <span className="text-xs text-muted-foreground">{post.data ? new Date(post.data).toLocaleDateString() : ''}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" onClick={() => navigate(`/post/${post.id}`)}>Ver</Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button className="bg-primary hover:bg-primary/90">Excluir</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir post</AlertDialogTitle>
                                <AlertDialogDescription>Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeletePost(post.id)}>
                                  {deletingIds.includes(post.id) ? 'Excluindo...' : 'Confirmar Exclusão'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="jobs" className="space-y-4 mt-6">
                {loadingServicos ? (
                  <Card className="p-4">Carregando serviços...</Card>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">A fazer</h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={refetchServicos}
                        className="text-xs"
                      >
                        Atualizar
                      </Button>
                    </div>
                    {
                      // compute only the services that are actually 'a fazer' (status === 'fazendo')
                      (() => {
                        const fazendo = Array.isArray(servicos.asContratado) ? servicos.asContratado.filter((s:any) => s.status === 'fazendo') : [];
                        if (fazendo.length === 0) {
                          return (<Card className="p-4">Nenhum serviço em andamento.</Card>);
                        }
                        return fazendo.map((s:any) => (
                          <Card key={s.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground mb-1">{s.titulo}</h4>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs border-primary/30">Serviço</Badge>
                              <span className="text-xs text-muted-foreground">Valor: R$ {s.valor ?? '—'}</span>
                            </div>
                            {s.endereco && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{s.endereco}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setServicoDetail(s)}
                            >
                              Ver Detalhes
                            </Button>
                            {
                              // For contratado (worker):
                              // - if the worker already submitted a review for this servico and the contratante hasn't confirmed yet,
                              //   disable the button and show 'Esperando contratante confirmar'.
                              // - otherwise, keep previous behavior (disable until contratante confirmed and reviewed).
                              (() => {
                                const currentUserId = storedUser?.id;
                                const isContratado = currentUserId && Number(currentUserId) === Number(s.contratadoId);
                                const contratanteConfirmed = !!s.contratanteConfirmou;
                                const contratanteReviewed = Array.isArray(reviewsByServico[s.id]||[]) && (reviewsByServico[s.id]||[]).some(r => Number(r.fromUserId) === Number(s.contratanteId));
                                const trabalhadorReviewed = Array.isArray(reviewsByServico[s.id]||[]) && (reviewsByServico[s.id]||[]).some(r => Number(r.fromUserId) === Number(s.contratadoId));

                                if (isContratado && trabalhadorReviewed && !contratanteConfirmed) {
                                  return (<Button size="sm" disabled>Esperando contratante confirmar</Button>);
                                }

                                const disabledForContratado = isContratado && (!contratanteConfirmed || !contratanteReviewed);
                                if (disabledForContratado) {
                                  const msg = !contratanteConfirmed ? 'Aguardando confirmação do contratante' : 'Aguardando avaliação do contratante';
                                  return (<Button size="sm" disabled title={msg}>{msg}</Button>);
                                }

                                return (
                                  <Button 
                                    size="sm"
                                    onClick={async () => {
                                      try {
                                        const res = await apiFetch(`/api/servicos/${s.id}/feito`, { method: 'POST' });
                                        if (!res.ok) throw new Error('Falha');
                                        const updated = await res.json();
                                        const serv = updated.serv || updated;
                                        setServicos((prev:any)=>({ ...prev, asContratado: prev.asContratado.map((x:any)=>x.id===serv.id?serv:x) }));
                                        setReviewModal({ open: true, servicoId: serv.id, toUserId: serv.contratanteId });
                                      } catch (e) { console.error(e); alert(e?.message || 'Erro ao marcar como feito'); }
                                    }}
                                  >
                                    Marcar como feito
                                  </Button>
                                );
                              })()
                            }
                          </div>
                        </div>
                          </Card>
                        ));
                      })()
                    }
                    

                    {/* Como contratante - permitir marcar como feito e avaliar contratado */}
                    <h4 className="font-semibold mt-6 mb-2">Como contratante - A fazer</h4>
                    {servicos.asContratante.filter((s:any)=>s.status === 'fazendo').length === 0 ? (
                      <Card className="p-4">Nenhum serviço em andamento como contratante.</Card>
                    ) : servicos.asContratante.filter((s:any)=>s.status === 'fazendo').map((s:any) => (
                      <Card key={s.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground mb-1">{s.titulo}</h4>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs border-primary/30">Serviço</Badge>
                              <span className="text-xs text-muted-foreground">Valor: R$ {s.valor ?? '—'}</span>
                            </div>
                            {s.endereco && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{s.endereco}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setServicoDetail(s)}
                            >
                              Ver Detalhes
                            </Button>
                            <Button 
                              size="sm"
                              onClick={async () => {
                                try {
                                  const res = await apiFetch(`/api/servicos/${s.id}/feito`, { method: 'POST' });
                                  if (!res.ok) throw new Error('Falha');
                                  const updated = await res.json();
                                  const serv = updated.serv || updated;
                                  setServicos((prev:any)=>({ ...prev, asContratante: prev.asContratante.map((x:any)=>x.id===serv.id?serv:x) }));
                                  // abrir modal para avaliar o contratado
                                  setReviewModal({ open: true, servicoId: serv.id, toUserId: serv.contratadoId });
                                } catch (e) { console.error(e); alert(e?.message || 'Erro ao marcar como feito'); }
                              }}
                            >
                              Marcar como feito
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}

                    <h4 className="font-semibold mt-6 mb-2">Feitos</h4>
                    {servicos.asContratado.filter((s:any)=>s.status === 'feito').length === 0 ? (
                      <Card className="p-4">Nenhum serviço finalizado.</Card>
                    ) : servicos.asContratado.filter((s:any)=>s.status === 'feito').map((s:any) => (
                      <Card key={s.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-foreground mb-1">{s.titulo}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs border-primary/30">Serviço</Badge>
                              <span className="text-xs text-muted-foreground">Valor: R$ {s.valor ?? '—'}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Concluído</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </>
                )}
              </TabsContent>
            </Tabs>

            {/* Review Modal */}
            {reviewModal.open && (
              <AlertDialog open={true} onOpenChange={(open)=>{ if(!open) setReviewModal({ open:false }); }}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Deixar avaliação</AlertDialogTitle>
                    <AlertDialogDescription>Por favor, avalie o serviço concluído.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="p-4">
                    <label className="block text-sm">Nota</label>
                    <select className="w-full p-2 mb-3" value={reviewForm.rating} onChange={(e)=>setReviewForm(s=>({ ...s, rating: Number(e.target.value) }))}>
                      {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} estrelas</option>)}
                    </select>
                    <label className="block text-sm">Comentário</label>
                    <textarea className="w-full p-2 mb-3" value={reviewForm.comment} onChange={(e)=>setReviewForm(s=>({ ...s, comment: e.target.value }))} />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={()=>setReviewModal({ open:false })}>Cancelar</Button>
                      <Button className="bg-primary" onClick={async ()=>{
                        try {
                          const stored = localStorage.getItem('bizzy_user');
                          const user = stored ? JSON.parse(stored) : null;
                          if (!user) return alert('Faça login para avaliar');
                          const res = await apiFetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ servicoId: reviewModal.servicoId, fromUserId: user.id, toUserId: reviewModal.toUserId, rating: reviewForm.rating, comment: reviewForm.comment }) });
                          if (!res.ok) throw new Error('Erro ao enviar avaliação');
                          alert('Avaliação enviada. Obrigado!');
                          setReviewModal({ open: false });
                          // refetch reviews for the profile shown (or for the toUserId)
                          try {
                            const idForRefresh = profileToShow?.id || reviewModal.toUserId;
                            if (idForRefresh) {
                              const r:any = await apiJson(`/api/reviews?userId=${idForRefresh}`);
                              if (r && typeof r === 'object' && Array.isArray(r.reviews)) {
                                setPublicReviewsData({ reviews: r.reviews, avg: r.avg || 0, count: r.count || 0 });
                              } else if (Array.isArray(r)) {
                                const count = r.length;
                                const avg = count === 0 ? 0 : r.reduce((s:any, it:any) => s + (it.rating || 0), 0) / count;
                                setPublicReviewsData({ reviews: r, avg: Number(avg.toFixed(2)), count });
                              }
                              // also refresh per-servico reviews so UI for 'Marcar como feito' updates immediately
                              try {
                                if (reviewModal?.servicoId) {
                                  const svcReviews = await apiJson(`/api/reviews/servico/${reviewModal.servicoId}`);
                                  setReviewsByServico(prev => ({ ...prev, [String(reviewModal.servicoId)]: Array.isArray(svcReviews) ? svcReviews : [] }));
                                }
                              } catch (e) { /* ignore per-serv refresh errors */ }
                            }
                          } catch (e) { console.error('Erro ao recarregar avaliações após envio', e); }
                        } catch (e) { console.error(e); alert('Erro ao enviar avaliação'); }
                      }}>Enviar avaliação</Button>
                    </div>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Serviço Detail Modal */}
            {servicoDetail && (
              <AlertDialog open={true} onOpenChange={(open)=>{ if(!open) setServicoDetail(null); }}>
                <AlertDialogContent className="max-w-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>{servicoDetail.titulo}</AlertDialogTitle>
                  </AlertDialogHeader>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Descrição</p>
                      <p className="text-foreground mt-1">{servicoDetail.descricao || 'Sem descrição'}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground">Valor</p>
                        <p className="text-foreground mt-1">R$ {servicoDetail.valor?.toFixed(2) || '—'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground">Status</p>
                        <p className="text-foreground mt-1">{servicoDetail.status === 'fazendo' ? 'Em andamento' : servicoDetail.status === 'feito' ? 'Concluído' : 'Pendente'}</p>
                      </div>
                    </div>

                    {servicoDetail.endereco && (
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground">Endereço Completo</p>
                        <div className="flex items-start gap-2 mt-1">
                          <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          <p className="text-foreground">{servicoDetail.endereco}</p>
                        </div>
                      </div>
                    )}

                    {servicoDetail.telefone && (
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground">Telefone</p>
                        <p className="text-foreground mt-1">{servicoDetail.telefone}</p>
                      </div>
                    )}
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Fechar</AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </>
        ) : (
          <Tabs defaultValue="reviews" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="reviews">Avaliações</TabsTrigger>
              <TabsTrigger value="jobs">Trabalhos</TabsTrigger>
            </TabsList>

            <TabsContent value="reviews" className="space-y-4 mt-6">
              {publicReviewsData.reviews.length === 0 ? (
                <Card className="p-4">Nenhuma avaliação encontrada.</Card>
              ) : (
                publicReviewsData.reviews.map((review: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10">
                          {review.fromUser && review.fromUser.foto ? (
                            <AvatarImage src={review.fromUser.foto.startsWith('http') ? review.fromUser.foto : `${backendBase}${review.fromUser.foto}`} />
                          ) : (
                            <AvatarFallback className="bg-secondary text-darker-gray">{(review.fromUser?.name || 'U')[0]}</AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">{review.fromUser ? review.fromUser.name : (review.fromUserId ? `Usuário ${review.fromUserId}` : 'Usuário')}</p>
                          <p className="text-xs text-muted-foreground">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating || 0 }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="jobs" className="space-y-4 mt-6">
              {completedJobs.map((job, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{job.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs border-primary/30">
                          {job.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{job.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="text-sm font-medium text-darker-gray">{(publicReviewsData.avg || 0).toFixed(1)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Profile;
