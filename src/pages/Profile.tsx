import "../css/profile.css";
import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { apiJson, apiFetch } from '@/lib/api';
import { toast } from "sonner";
import { ArrowLeft, Star, MapPin, Calendar, Briefcase, MoreHorizontal } from "lucide-react";
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

  const reviews = [
    { author: "João Silva", rating: 5, comment: "Excelente profissional! Muito dedicada e pontual.", date: "Há 2 dias" },
  ];

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
  useEffect(() => {
    if (!viewedUserId) return;
    apiJson(`/api/auth/user?id=${viewedUserId}`)
      .then((data) => setViewedUser(data))
      .catch((err) => console.error('Erro ao buscar usuário visualizado', err));
  }, [viewedUserId]);

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
                    <span className="text-lg font-semibold text-darker-gray">4.8</span>
                    <span className="text-sm text-muted-foreground">(24 avaliações)</span>
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
                  <Calendar className="h-4 w-4" />
                  <span>{profileToShow?.nascimento ? `Nascimento: ${profileToShow.nascimento}` : 'Nascimento não informado'}</span>
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
                    <h4 className="font-semibold mb-2">A fazer</h4>
                    {servicos.asContratado.length === 0 ? (
                      <Card className="p-4">Nenhum serviço em andamento.</Card>
                    ) : servicos.asContratado.filter((s:any)=>s.status === 'fazendo').map((s:any) => (
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
                            <Button variant="outline" onClick={async () => {
                              try {
                                const res = await apiFetch(`/api/servicos/${s.id}/feito`, { method: 'POST' });
                                if (!res.ok) throw new Error('Falha');
                                const updated = await res.json();
                                setServicos((prev:any)=>({ ...prev, asContratado: prev.asContratado.map((x:any)=>x.id===updated.id?updated:x) }));
                                setReviewModal({ open: true, servicoId: updated.id, toUserId: updated.contratanteId });
                              } catch (e) { console.error(e); alert('Erro ao marcar como feito'); }
                            }}>Marcar como feito</Button>
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
                        } catch (e) { console.error(e); alert('Erro ao enviar avaliação'); }
                      }}>Enviar avaliação</Button>
                    </div>
                  </div>
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
              {reviews.map((review, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-secondary text-darker-gray">
                          {review.author[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">{review.author}</p>
                        <p className="text-xs text-muted-foreground">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </Card>
              ))}
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
                      <span className="text-sm font-medium text-darker-gray">5.0</span>
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
