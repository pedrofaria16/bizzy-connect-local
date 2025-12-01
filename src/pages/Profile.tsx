import "../css/profile.css";
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Carregar usuário do localStorage
  const raw = typeof window !== 'undefined' ? localStorage.getItem('bizzy_user') : null;
  let storedUser: any = null;
  try {
    storedUser = raw ? JSON.parse(raw) : null;
  } catch (e) { storedUser = null; }
  
  const backendBase = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '';

  const [publicReviewsData, setPublicReviewsData] = useState<{ reviews: any[]; avg: number; count: number }>({ 
    reviews: [], 
    avg: 0, 
    count: 0 
  });

  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [deletingIds, setDeletingIds] = useState<number[]>([]);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const viewedUserId = params.get('userId');
  const storedUserId = storedUser?.id ? String(storedUser.id) : null;
  const isOwnProfile = !viewedUserId || (storedUserId && viewedUserId === String(storedUserId));

  // Estados para dados do perfil
  const [viewedUser, setViewedUser] = useState<any | null>(null);
  const [servicos, setServicos] = useState<any>({ asContratado: [], asContratante: [] });
  const [loadingServicos, setLoadingServicos] = useState(false);
  const [reviewModal, setReviewModal] = useState<{ open: boolean; servicoId?: number; toUserId?: number }>({ open: false });
  const [reviewForm, setReviewForm] = useState<{ rating: number; comment: string }>({ rating: 5, comment: '' });
  const [servicoDetail, setServicoDetail] = useState<any | null>(null);
  const [reviewsByServico, setReviewsByServico] = useState<Record<string, any[]>>({});

  // Buscar serviços
  useEffect(() => {
    const idToFetch = isOwnProfile ? storedUserId : viewedUserId;
    if (!idToFetch) return;
    setLoadingServicos(true);
    apiJson('/api/servicos')
      .then(data => setServicos(data || { asContratado: [], asContratante: [] }))
      .catch(console.error)
      .finally(() => setLoadingServicos(false));
  }, [isOwnProfile, storedUserId, viewedUserId]);
  
  // Buscar avaliações
  useEffect(() => {
    const idToFetch = isOwnProfile ? storedUserId : viewedUserId;
    if (!idToFetch) return;
    apiJson(`/api/reviews?userId=${idToFetch}`)
      .then((r: any) => {
        if (r && typeof r === 'object' && Array.isArray(r.reviews)) {
          setPublicReviewsData({ reviews: r.reviews, avg: r.avg || 0, count: r.count || 0 });
        } else if (Array.isArray(r)) {
          const count = r.length;
          const avg = count === 0 ? 0 : r.reduce((s: any, it: any) => s + (it.rating || 0), 0) / count;
          setPublicReviewsData({ reviews: r, avg: Number(avg.toFixed(2)), count });
        } else {
          setPublicReviewsData({ reviews: [], avg: 0, count: 0 });
        }
      })
      .catch((e) => { 
        console.error(t('Erro ao buscar avaliações'), e); 
        setPublicReviewsData({ reviews: [], avg: 0, count: 0 }); 
      });
  }, [isOwnProfile, storedUserId, viewedUserId, t]);

  // Buscar usuário público quando visualizando perfil de outro usuário
  useEffect(() => {
    if (isOwnProfile) return;
    if (!viewedUserId) return;
    apiJson(`/api/auth/user?id=${viewedUserId}`)
      .then((u: any) => {
        if (u && typeof u === 'object') setViewedUser(u);
      })
      .catch((e) => { 
        console.error(t('Erro ao buscar usuário público'), e); 
        setViewedUser(null); 
      });
  }, [isOwnProfile, viewedUserId, t]);

  // Função para recarregar serviços
  const refetchServicos = async () => {
    try {
      const data = await apiJson('/api/servicos');
      setServicos(data || { asContratado: [], asContratante: [] });
      
      // Buscar reviews para cada serviço
      try {
        const all = [...(data.asContratado || []), ...(data.asContratante || [])];
        for (const s of all) {
          if (!s || !s.id) continue;
          if (reviewsByServico[s.id]) continue;
          (async (servId) => {
            try {
              const r = await apiJson(`/api/reviews/servico/${servId}`);
              setReviewsByServico(prev => ({ ...prev, [servId]: Array.isArray(r) ? r : [] }));
            } catch (e) { /* ignorar erros */ }
          })(s.id);
        }
      } catch (e) { 
        console.error(t('Erro ao carregar reviews por serviço'), e); 
      }
    } catch (e) {
      console.error(t('Erro ao recarregar serviços'), e);
    }
  };

  // Recarregar serviços periodicamente
  useEffect(() => {
    if (!isOwnProfile) return;
    const interval = setInterval(refetchServicos, 3000);
    return () => clearInterval(interval);
  }, [isOwnProfile, t]);

  // Definir qual perfil mostrar
  const profileToShow = isOwnProfile ? storedUser : (viewedUser || null);
  const fotoSrc = profileToShow?.foto ? 
    (profileToShow.foto.startsWith('http') ? profileToShow.foto : `${backendBase}${profileToShow.foto}`) : 
    undefined;

  // Helper functions
  const extractCity = (endereco?: string, cidade?: string) => {
    if (cidade) return cidade;
    if (!endereco) return t('Cidade não informada');
    const parts = endereco.split(',').map((s: string) => s.trim()).filter(Boolean);
    if (parts.length >= 2) return parts[parts.length - 2] || parts[parts.length - 1];
    return parts[parts.length - 1] || t('Cidade não informada');
  };

  const extractNeighborhoodCity = (endereco?: string, cidade?: string) => {
    if (!endereco && !cidade) return '';
    if (endereco) {
      const parts = endereco.split(',').map((s: string) => s.trim()).filter(Boolean);
      if (parts.length >= 3) {
        const bairro = parts[parts.length - 3];
        const cidadeVal = parts[parts.length - 2] || cidade;
        if (bairro && cidadeVal) return `${bairro}, ${cidadeVal}`;
        if (cidadeVal) return cidadeVal;
      }
      if (cidade) return cidade;
      const last = parts[parts.length - 1];
      return last || '';
    }
    return cidade || '';
  };

  const calculateAge = (nascimento?: string | null) => {
    if (!nascimento) return null;
    let d = new Date(String(nascimento));
    if (isNaN(d.getTime())) {
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

  // Buscar posts do usuário
  useEffect(() => {
    if (!isOwnProfile || !storedUserId) return;
    setLoadingPosts(true);
    apiJson(`/api/posts?userId=${storedUserId}`)
      .then((data) => {
        setPosts(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error(t('Erro ao buscar posts do usuário'), err);
      })
      .finally(() => setLoadingPosts(false));
  }, [isOwnProfile, storedUserId, t]);

  // Função para excluir post
  const handleDeletePost = async (postId: number) => {
    try {
      setDeletingIds((s) => [...s, postId]);
      const res = await apiFetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(t('Falha ao excluir post'));
      setPosts((p) => p.filter((x) => x.id !== postId));
      toast.success(t('Post excluído'));
    } catch (err) {
      console.error(err);
      toast.error(t('Erro ao excluir post'));
    } finally {
      setDeletingIds((s) => s.filter((id) => id !== postId));
    }
  };

  // Função para enviar avaliação
  const handleSubmitReview = async () => {
    try {
      const stored = localStorage.getItem('bizzy_user');
      const user = stored ? JSON.parse(stored) : null;
      if (!user) {
        alert(t('Faça login para avaliar'));
        return;
      }

      const res = await apiFetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servicoId: reviewModal.servicoId,
          fromUserId: user.id,
          toUserId: reviewModal.toUserId,
          rating: reviewForm.rating,
          comment: reviewForm.comment
        })
      });

      if (!res.ok) throw new Error(t('Erro ao enviar avaliação'));
      
      alert(t('Avaliação enviada. Obrigado!'));
      setReviewModal({ open: false });
      setReviewForm({ rating: 5, comment: '' });

      // Recarregar avaliações
      try {
        const idForRefresh = profileToShow?.id || reviewModal.toUserId;
        if (idForRefresh) {
          const r: any = await apiJson(`/api/reviews?userId=${idForRefresh}`);
          if (r && typeof r === 'object' && Array.isArray(r.reviews)) {
            setPublicReviewsData({ reviews: r.reviews, avg: r.avg || 0, count: r.count || 0 });
          } else if (Array.isArray(r)) {
            const count = r.length;
            const avg = count === 0 ? 0 : r.reduce((s: any, it: any) => s + (it.rating || 0), 0) / count;
            setPublicReviewsData({ reviews: r, avg: Number(avg.toFixed(2)), count });
          }
        }
      } catch (e) {
        console.error(t('Erro ao recarregar avaliações'), e);
      }
    } catch (e) {
      console.error(e);
      alert(t('Erro ao enviar avaliação'));
    }
  };

  return (
    <div className="min-h-screen bg-background profile-page">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-secondary profile-icon-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <button
            className="sobrenos-back-btn profile-back-btn"
            onClick={() => navigate(-1)}
            aria-label={t('Voltar')}
          >
            ← {t('Voltar')}
          </button>
          <h1 className="text-xl font-bold text-foreground">{t('Perfil')}</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-6">
        {/* Cabeçalho do Perfil */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex-shrink-0 w-full sm:w-40 flex items-center sm:items-start justify-center sm:justify-start sm:mr-6">
              <div className="rounded-full p-1 ring-1 ring-border card-avatar-wrapper" style={{ marginRight: 12 }}>
                <Avatar className="h-32 w-32 sm:h-40 sm:w-40">
                  {fotoSrc ? (
                    <AvatarImage src={fotoSrc} />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                      {profileToShow && profileToShow.name ? 
                        profileToShow.name.split(' ').map((s: string) => s[0]).slice(0, 2).join('').toUpperCase() : 
                        t('U')}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4 profile-header">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {profileToShow?.name ?? t('Usuário')}
                  </h2>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-5 w-5 fill-primary text-primary" />
                    <span className="text-lg font-semibold text-darker-gray">
                      {(publicReviewsData.avg || 0).toFixed(1)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({publicReviewsData.count} {t('avaliações')})
                    </span>
                  </div>
                </div>
                {isOwnProfile && (
                  <div className="profile-actions flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button aria-label={t('Mais opções')} className="p-2 rounded-md hover:bg-secondary">
                          <MoreHorizontal className="h-5 w-5 text-darker-gray" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="bottom" className="profile-dropdown">
                        <DropdownMenuItem 
                          className="dropdown-item" 
                          onSelect={() => navigate('/edit-profile')}
                        >
                          {t('Editar Perfil')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="dropdown-item" 
                          onSelect={() => { 
                            localStorage.removeItem('bizzy_user'); 
                            navigate('/feed'); 
                          }}
                        >
                          {t('Sair')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {extractNeighborhoodCity(profileToShow?.endereco, profileToShow?.cidade) || 
                    (isOwnProfile ? 
                      (profileToShow?.endereco ?? t('Endereço não informado')) : 
                      extractCity(profileToShow?.endereco, profileToShow?.cidade))}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>
                    {profileToShow?.nascimento ? 
                      (calculateAge(profileToShow.nascimento) != null ? 
                        `${t('Idade')}: ${calculateAge(profileToShow.nascimento)} ${t('anos')}` : 
                        t('Idade não informada')) : 
                      t('Idade não informada')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span>
                    {profileToShow?.servicos ? 
                      `${(profileToShow.servicos as string).split(',').length} ${t('serviços')}` : 
                      t('Serviços não informados')}
                  </span>
                </div>
              </div>

              <p className="text-muted-foreground mb-4">
                {profileToShow?.description ?? t('Sem descrição')}
              </p>

              <div className="flex flex-wrap gap-2 profile-categories">
                {(
                  profileToShow?.servicos 
                    ? (profileToShow.servicos as string).split(',').map((s: string) => s.trim()).filter(Boolean) 
                    : [t('Sem serviços')]
                ).map((s: string, idx: number) => (
                  <Badge 
                    key={idx} 
                    className="cursor-pointer shrink-0 px-4 py-2 text-sm transition-all hover:bg-secondary border-border text-darker-gray"
                  >
                    {t(s)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Conteúdo Principal - Tabs */}
        {isOwnProfile ? (
          <>
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="posts">{t('Meus Posts')}</TabsTrigger>
                <TabsTrigger value="jobs">{t('Trabalhos')}</TabsTrigger>
              </TabsList>

              {/* Tab: Meus Posts */}
              <TabsContent value="posts" className="space-y-4 mt-6">
                {loadingPosts ? (
                  <Card className="p-4">{t('Carregando posts...')}</Card>
                ) : posts.length === 0 ? (
                  <Card className="p-4">{t('Você ainda não publicou nenhum post.')}</Card>
                ) : (
                  posts.map((post) => (
                    <Card key={post.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">{post.titulo}</h4>
                          <div className="flex items-center gap-2 post-meta">
                            <Badge variant="outline" className="text-xs border-primary/30">
                              {t(post.categoria)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {post.data ? new Date(post.data).toLocaleDateString() : ''}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 profile-card-actions">
                          <Button 
                            variant="outline" 
                            onClick={() => navigate(`/post/${post.id}`)}
                          >
                            {t('Ver')}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button className="bg-primary hover:bg-primary/90">
                                {t('Excluir')}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('Excluir post')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.')}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('Cancelar')}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeletePost(post.id)}>
                                  {deletingIds.includes(post.id) ? t('Excluindo...') : t('Confirmar Exclusão')}
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

              {/* Tab: Trabalhos */}
              <TabsContent value="jobs" className="space-y-4 mt-6">
                {loadingServicos ? (
                  <Card className="p-4">{t('Carregando serviços...')}</Card>
                ) : (
                  <>
                    {/* Serviços como Contratado */}
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">{t('A fazer')}</h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={refetchServicos}
                        className="text-xs"
                      >
                        {t('Atualizar')}
                      </Button>
                    </div>

                    {servicos.asContratado.filter((s: any) => s.status === 'fazendo').length === 0 ? (
                      <Card className="p-4">{t('Nenhum serviço em andamento.')}</Card>
                    ) : (
                      servicos.asContratado.filter((s: any) => s.status === 'fazendo').map((s: any) => (
                        <ServiceCard 
                          key={s.id} 
                          service={s} 
                          isOwnProfile={isOwnProfile}
                          onViewDetails={() => setServicoDetail(s)}
                          reviewsByServico={reviewsByServico}
                          storedUser={storedUser}
                          onMarkAsDone={async () => {
                            try {
                              const res = await apiFetch(`/api/servicos/${s.id}/feito`, { method: 'POST' });
                              if (!res.ok) throw new Error(t('Falha'));
                              const updated = await res.json();
                              const serv = updated.serv || updated;
                              setServicos((prev: any) => ({
                                ...prev,
                                asContratado: prev.asContratado.map((x: any) => x.id === serv.id ? serv : x)
                              }));
                              setReviewModal({ open: true, servicoId: serv.id, toUserId: serv.contratanteId });
                            } catch (e) {
                              console.error(e);
                              alert(e?.message || t('Erro ao marcar como feito'));
                            }
                          }}
                          t={t}
                        />
                      ))
                    )}

                    {/* Serviços como Contratante */}
                    <h4 className="font-semibold mt-6 mb-2">{t('Como contratante - A fazer')}</h4>
                    {servicos.asContratante.filter((s: any) => s.status === 'fazendo').length === 0 ? (
                      <Card className="p-4">{t('Nenhum serviço em andamento como contratante.')}</Card>
                    ) : (
                      servicos.asContratante.filter((s: any) => s.status === 'fazendo').map((s: any) => (
                        <ServiceCard 
                          key={s.id} 
                          service={s} 
                          isOwnProfile={isOwnProfile}
                          onViewDetails={() => setServicoDetail(s)}
                          onMarkAsDone={async () => {
                            try {
                              const res = await apiFetch(`/api/servicos/${s.id}/feito`, { method: 'POST' });
                              if (!res.ok) throw new Error(t('Falha'));
                              const updated = await res.json();
                              const serv = updated.serv || updated;
                              setServicos((prev: any) => ({
                                ...prev,
                                asContratante: prev.asContratante.map((x: any) => x.id === serv.id ? serv : x)
                              }));
                              setReviewModal({ open: true, servicoId: serv.id, toUserId: serv.contratadoId });
                            } catch (e) {
                              console.error(e);
                              alert(e?.message || t('Erro ao marcar como feito'));
                            }
                          }}
                          t={t}
                        />
                      ))
                    )}

                    {/* Serviços Concluídos */}
                    <h4 className="font-semibold mt-6 mb-2">{t('Feitos')}</h4>
                    {servicos.asContratado.filter((s: any) => s.status === 'feito').length === 0 ? (
                      <Card className="p-4">{t('Nenhum serviço finalizado.')}</Card>
                    ) : (
                      servicos.asContratado.filter((s: any) => s.status === 'feito').map((s: any) => (
                        <CompletedServiceCard key={s.id} service={s} t={t} />
                      ))
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>

            {/* Modal de Avaliação */}
            <ReviewModal
              isOpen={reviewModal.open}
              onClose={() => setReviewModal({ open: false })}
              reviewForm={reviewForm}
              onReviewFormChange={setReviewForm}
              onSubmitReview={handleSubmitReview}
              t={t}
            />

            {/* Modal de Detalhes do Serviço */}
            <ServiceDetailModal
              service={servicoDetail}
              isOpen={!!servicoDetail}
              onClose={() => setServicoDetail(null)}
              t={t}
            />
          </>
        ) : (
          // Visualização de perfil de outros usuários
          <OtherUserProfile 
            publicReviewsData={publicReviewsData}
            backendBase={backendBase}
            t={t}
          />
        )}
      </main>
    </div>
  );
};

// Componente para cartão de serviço
const ServiceCard = ({ 
  service, 
  isOwnProfile, 
  onViewDetails, 
  reviewsByServico, 
  storedUser, 
  onMarkAsDone,
  t 
}: any) => {
  const extractNeighborhoodCity = (endereco?: string, cidade?: string) => {
    if (!endereco && !cidade) return '';
    if (endereco) {
      const parts = endereco.split(',').map((s: string) => s.trim()).filter(Boolean);
      if (parts.length >= 3) {
        const bairro = parts[parts.length - 3];
        const cidadeVal = parts[parts.length - 2] || cidade;
        if (bairro && cidadeVal) return `${bairro}, ${cidadeVal}`;
        if (cidadeVal) return cidadeVal;
      }
      if (cidade) return cidade;
      const last = parts[parts.length - 1];
      return last || '';
    }
    return cidade || '';
  };

  const currentUserId = storedUser?.id;
  const isContratado = currentUserId && Number(currentUserId) === Number(service.contratadoId);
  const contratanteConfirmed = !!service.contratanteConfirmou;
  const contratanteReviewed = Array.isArray(reviewsByServico[service.id] || []) && 
    (reviewsByServico[service.id] || []).some((r: any) => Number(r.fromUserId) === Number(service.contratanteId));
  const trabalhadorReviewed = Array.isArray(reviewsByServico[service.id] || []) && 
    (reviewsByServico[service.id] || []).some((r: any) => Number(r.fromUserId) === Number(service.contratadoId));

  let buttonText = t('Marcar como feito');
  let buttonDisabled = false;
  let buttonTitle = '';

  if (isContratado && trabalhadorReviewed && !contratanteConfirmed) {
    buttonText = t('Esperando contratante confirmar');
    buttonDisabled = true;
  } else if (isContratado && (!contratanteConfirmed || !contratanteReviewed)) {
    buttonText = !contratanteConfirmed ? t('Aguardando confirmação do contratante') : t('Aguardando avaliação do contratante');
    buttonDisabled = true;
    buttonTitle = buttonText;
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-foreground mb-1">{service.titulo}</h4>
          <div className="flex items-center gap-2 mb-2 post-meta">
            <Badge variant="outline" className="text-xs border-primary/30">
              {t('Serviço')}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {t('Valor')}: R$ {service.valor ?? '—'}
            </span>
          </div>
          {service.endereco && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="truncate">
                {extractNeighborhoodCity(service.endereco, service.cidade)}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 profile-card-actions">
          <Button variant="outline" size="sm" onClick={onViewDetails}>
            {t('Ver Detalhes')}
          </Button>
          <Button 
            size="sm" 
            onClick={onMarkAsDone}
            disabled={buttonDisabled}
            title={buttonTitle}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Componente para serviço concluído
const CompletedServiceCard = ({ service, t }: any) => (
  <Card className="p-4">
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-semibold text-foreground mb-1">{service.titulo}</h4>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs border-primary/30">
            {t('Serviço')}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {t('Valor')}: R$ {service.valor ?? '—'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{t('Concluído')}</span>
      </div>
    </div>
  </Card>
);

// Componente para modal de avaliação
const ReviewModal = ({ isOpen, onClose, reviewForm, onReviewFormChange, onSubmitReview, t }: any) => {
  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('Deixar avaliação')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('Por favor, avalie o serviço concluído.')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="p-4">
          <label className="block text-sm">{t('Nota')}</label>
          <select 
            className="w-full p-2 mb-3 border rounded" 
            value={reviewForm.rating} 
            onChange={(e) => onReviewFormChange({ ...reviewForm, rating: Number(e.target.value) })}
          >
            {[5, 4, 3, 2, 1].map(n => (
              <option key={n} value={n}>
                {n} {t('estrelas')}
              </option>
            ))}
          </select>
          <label className="block text-sm">{t('Comentário')}</label>
          <textarea 
            className="w-full p-2 mb-3 border rounded" 
            value={reviewForm.comment} 
            onChange={(e) => onReviewFormChange({ ...reviewForm, comment: e.target.value })}
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              {t('Cancelar')}
            </Button>
            <Button className="bg-primary" onClick={onSubmitReview}>
              {t('Enviar avaliação')}
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Componente para modal de detalhes do serviço
const ServiceDetailModal = ({ service, isOpen, onClose, t }: any) => {
  if (!isOpen || !service) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{service.titulo}</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">{t('Descrição')}</p>
            <p className="text-foreground mt-1">{service.descricao || t('Sem descrição')}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">{t('Valor')}</p>
              <p className="text-foreground mt-1">R$ {service.valor?.toFixed(2) || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">{t('Status')}</p>
              <p className="text-foreground mt-1">
                {service.status === 'fazendo' ? t('Em andamento') : 
                 service.status === 'feito' ? t('Concluído') : t('Pendente')}
              </p>
            </div>
          </div>

          {service.endereco && (
            <div>
              <p className="text-sm font-semibold text-muted-foreground">{t('Endereço Completo')}</p>
              <div className="flex items-start gap-2 mt-1">
                <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <p className="text-foreground">{service.endereco}</p>
              </div>
            </div>
          )}

          {service.telefone && (
            <div>
              <p className="text-sm font-semibold text-muted-foreground">{t('Telefone')}</p>
              <p className="text-foreground mt-1">{service.telefone}</p>
            </div>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>{t('Fechar')}</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Componente para perfil de outros usuários
const OtherUserProfile = ({ publicReviewsData, backendBase, t }: any) => (
  <Tabs defaultValue="reviews" className="w-full">
    <TabsList className="grid w-full grid-cols-2">
      <TabsTrigger value="reviews">{t('Avaliações')}</TabsTrigger>
      <TabsTrigger value="jobs">{t('Trabalhos')}</TabsTrigger>
    </TabsList>

    <TabsContent value="reviews" className="space-y-4 mt-6">
      {publicReviewsData.reviews.length === 0 ? (
        <Card className="p-4">{t('Nenhuma avaliação encontrada.')}</Card>
      ) : (
        publicReviewsData.reviews.map((review: any, index: number) => (
          <Card key={index} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10">
                  {review.fromUser && review.fromUser.foto ? (
                    <AvatarImage 
                      src={review.fromUser.foto.startsWith('http') ? 
                        review.fromUser.foto : 
                        `${backendBase}${review.fromUser.foto}`} 
                    />
                  ) : (
                    <AvatarFallback className="bg-secondary text-darker-gray">
                      {(review.fromUser?.name || t('U'))[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">
                    {review.fromUser ? 
                      review.fromUser.name : 
                      (review.fromUserId ? `${t('Usuário')} ${review.fromUserId}` : t('Usuário'))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                  </p>
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
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-foreground mb-1">{t('Limpeza Residencial')}</h4>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-primary/30">
                {t('Limpeza')}
              </Badge>
              <span className="text-xs text-muted-foreground">15/03/2024</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm font-medium text-darker-gray">
              {(publicReviewsData.avg || 0).toFixed(1)}
            </span>
          </div>
        </div>
      </Card>
    </TabsContent>
  </Tabs>
);

export default Profile;