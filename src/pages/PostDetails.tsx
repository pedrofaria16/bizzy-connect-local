import "../css/postdetails.css";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiJson, apiFetch, getStoredUserId } from '@/lib/api';
import { ArrowLeft, MapPin, Star, Clock, DollarSign, MessageCircle, Briefcase, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const PostDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiJson(`/api/posts/${id}`)
      .then((data) => {
        setPost(data);
        // Carregar candidatos do post
        return apiJson(`/api/posts/${id}/candidaturas`);
      })
      .then((cands) => {
        setCandidatos(cands || []);
        // Verificar se o usuário atual já se candidatou
        const userId = getStoredUserId();
        if (userId && cands) {
          const alreadyApplied = cands.some((c: any) => c.userId === Number(userId));
          setHasApplied(alreadyApplied);
        }
      })
      .catch((err) => setError(err.message || 'Erro ao carregar'))
      .finally(() => setLoading(false));
  }, [id]);

  // If author data is incomplete (no name/description), try to fetch public user data
  useEffect(() => {
    const authorId = post?.User?.id || post?.userId;
    if (!authorId) return;
    const author = post?.User;
    const needsFetch = !author || !author.name || author.name === 'Usuário' || (!author.description && !author.servicos && !author.telefone);
    if (!needsFetch) return;
    apiJson(`/api/auth/user?id=${authorId}`)
      .then((u:any) => {
        if (u && typeof u === 'object') setPost((p:any)=>({ ...p, User: { ...(p.User||{}), ...u } }));
      })
      .catch((e) => { console.error('Erro ao buscar author publico', e); });
  }, [post]);

  // determine if the current logged-in user is the owner/author of the post
  const getCurrentUserId = () => {
    try {
      const raw = typeof window !== 'undefined' ? (localStorage.getItem('bizzy_user') || localStorage.getItem('user')) : null;
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed?.id ?? parsed;
    } catch (e) { return null; }
  };
  const currentUserId = getCurrentUserId();
  const isOwner = post && (post.userId || post.User?.id || post.authorId) ? Number(currentUserId) === Number(post.userId || post.User?.id || post.authorId) : false;

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-destructive">{error}</div>;

  const author = post.User || post.user || post.userId ? (post.User || { name: 'Usuário' }) : { name: 'Usuário' };
  const isOffer = (post.tipo === 'offer') || (post.type === 'offer') || Number(post.valor) === 0;
  const badgeLabel = isOffer ? 'Oferece' : 'Solicita';
  const priceNum = Number(post.valor || 0);
  const priceLabel = priceNum > 0 ? `R$ ${priceNum.toFixed(2)}` : 'valor a combinar';

  const extractNeighborhoodCity = (endereco?: string, cidade?: string) => {
    if (!endereco && !cidade) return '';
    if (endereco) {
      const parts = endereco.split(',').map((s: string) => s.trim()).filter(Boolean);
      if (parts.length >= 3) {
        const bairro = parts[parts.length - 3];
        const cidadeVal = parts[parts.length - 2] || cidade;
        if (bairro && cidadeVal) return `${bairro} • ${cidadeVal}`;
        if (cidadeVal) return cidadeVal;
      }
      if (cidade) return cidade;
      const last = parts[parts.length - 1];
      return last || '';
    }
    return cidade || '';
  };

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
          <h1 className="text-xl font-bold text-foreground">Detalhes do Serviço</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-6">
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <Avatar className="h-16 w-16" onClick={() => navigate("/profile?userId=" + (author.id || post.userId))}>
              {author.foto ? <AvatarImage src={author.foto} /> : null}
              <AvatarFallback className="bg-primary text-primary-foreground text-xl cursor-pointer">
                {(author.name || 'U').split(' ').map((s:string)=>s[0]).slice(0,2).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 
                    className="font-semibold text-lg text-foreground cursor-pointer hover:text-primary"
                    onClick={() => navigate(`/profile?userId=${author.id || post.userId}`)}
                  >
                    {author.name || 'Usuário'}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="font-medium text-darker-gray">{(author && (author.ratingAvg || author.ratingAvg === 0)) ? Number((author.ratingAvg || 0)).toFixed(1) : '—'}</span>
                    {author && author.ratingCount ? <span className="text-xs text-muted-foreground">({author.ratingCount} avaliações)</span> : null}
                  </div>
                </div>
                <Badge className={isOffer ? 'bg-primary' : 'bg-darker-gray text-primary-foreground'}>{badgeLabel}</Badge>
              </div>

              {!isOffer && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{post.data ? `${new Date(post.data).toLocaleDateString()} ${new Date(post.data).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : (post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Publicado')}</span>
                </div>
              )}
            </div>
          </div>

          <Badge variant="outline" className="mb-4 border-primary/30">
            {post.categoria}
          </Badge>

          <h2 className="text-2xl font-bold text-foreground mb-4">{post.titulo}</h2>

          <p className="text-muted-foreground mb-6">{post.descricao}</p>

          <div className="grid gap-4 sm:grid-cols-2 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Preço</p>
                <p className="font-semibold text-darker-gray">{priceLabel}</p>
              </div>
            </div>

            {!isOffer && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Localização</p>
                  <p className="font-semibold text-darker-gray">{extractNeighborhoodCity(post.endereco, post.cidade)}</p>
                </div>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {!isOwner && (
            <div className="flex gap-3">
              <Button 
                className="flex-1 bg-primary hover:bg-primary-light"
                onClick={async () => {
                  try {
                    const id = getStoredUserId();
                    if (!id) return alert('Faça login para enviar mensagem');
                    const otherId = author.id || post.userId;
                    const conv = await apiJson('/api/chat/conversation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userAId: Number(id), userBId: otherId }) });
                    navigate(`/chat?conversationId=${conv.id}&toUserId=${otherId}`);
                  } catch (e) { console.error(e); alert(e.message || 'Erro ao iniciar conversa'); }
                }}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Enviar Mensagem
              </Button>

              {/* Candidatar / Contratar flow with confirmation dialogs */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-border"
                    disabled={!isOffer && hasApplied}
                  >
                    {!isOffer && hasApplied ? 'Já se candidatou' : isOffer ? 'Contratar' : 'Candidatar-se'}
                  </Button>
                </AlertDialogTrigger>
                {!isOffer && hasApplied ? null : (
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {isOffer ? 'Confirmar contratação' : 'Confirmar candidatura'}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {isOffer ? 'Tem certeza que deseja contratar este profissional para o serviço?' : 'Tem certeza que deseja se candidatar a este serviço?'}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Button
                          className="bg-primary"
                          onClick={async () => {
                            try {
                                if (isOffer) {
                                // contratar -> chamar novo endpoint /contratar
                                const userId = getStoredUserId();
                                if (!userId) return alert('Faça login para contratar.');
                                const res = await apiFetch(`/api/posts/${post.id}/contratar`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ contratanteId: Number(userId) })
                                });
                                const payload = await res.json().catch(() => ({}));
                                if (!res.ok) return alert(payload.error || payload.message || 'Erro ao contratar');
                                alert('Profissional contratado — notificação enviada.');
                                // recarregar feed/página para atualizar listagem
                                try { window.location.reload(); } catch (e) { navigate('/feed'); }
                              } else {
                                // candidatar
                                const userId = getStoredUserId();
                                if (!userId) return alert('Faça login para se candidatar.');
                                      const res = await apiFetch(`/api/posts/${post.id}/candidatar`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ userId: Number(userId) }),
                                });
                                const payload = await res.json().catch(() => ({}));
                                if (!res.ok) return alert(payload.error || payload.message || 'Erro ao candidatar');
                                alert('Candidatura enviada. O autor recebeu uma notificação.');
                                setHasApplied(true);
                              }
                            } catch (e) {
                              console.error(e);
                              alert(e.message || 'Erro na ação');
                            }
                          }}
                        >
                          Confirmar
                        </Button>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                )}
              </AlertDialog>
            </div>
          )}
        </Card>

        {isOwner && candidatos.length > 0 && (
          <Card className="p-6 mb-6">
            <h3 className="font-semibold text-lg mb-4 text-foreground">Candidatos ({candidatos.length})</h3>
            <div className="space-y-3">
              {candidatos.map((cand: any) => {
                const user = cand.User;
                const isSelected = post.selecionadoId === user?.id;
                
                return (
                  <div key={cand.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        {user?.foto ? <AvatarImage src={user.foto} /> : null}
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user?.name ? user.name.split(' ').map((s:string)=>s[0]).slice(0,2).join('').toUpperCase() : 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{user?.name || 'Usuário'}</p>
                        <p className="text-xs text-muted-foreground">
                          {cand.status === 'aceito' ? '✓ Contratado' : cand.status === 'recusado' ? '✗ Recusado' : 'Pendente'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!isSelected && cand.status === 'pendente' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" className="bg-primary hover:bg-primary-light">
                              Contratar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar contratação</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja contratar {user?.name}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction asChild>
                                <Button
                                  className="bg-primary"
                                  onClick={async () => {
                                    try {
                                      const res = await apiFetch(`/api/posts/${post.id}/aceitar`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ candidaturaId: cand.id })
                                      });
                                      const payload = await res.json().catch(() => ({}));
                                      if (!res.ok) return alert(payload.error || payload.message || 'Erro ao contratar');
                                      alert('Candidato contratado com sucesso!');
                                      // Atualizar estado local
                                      setCandidatos(prev => 
                                        prev.map(c => c.id === cand.id ? { ...c, status: 'aceito' } : c)
                                      );
                                      setPost((p: any) => ({ ...p, selecionadoId: user?.id, status: 'em andamento' }));
                                    } catch (e) {
                                      console.error(e);
                                      alert(e.message || 'Erro ao contratar');
                                    }
                                  }}
                                >
                                  Confirmar
                                </Button>
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      {isSelected && (
                        <Badge className="bg-primary">Selecionado</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 text-foreground">Sobre o(a) profissional</h3>
          <p className="text-muted-foreground mb-4">{(author && (author.description || author.description === '') ) ? (author.description || 'Sem descrição fornecida.') : (post.User && post.User.description) || 'Sem descrição fornecida.'}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <Briefcase className="h-4 w-4 mt-1" />
              <div>
                <div className="font-medium text-foreground">Serviços</div>
                <div>{(author && author.servicos) || (post.User && post.User.servicos) || 'Não informado'}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Star className="h-4 w-4 mt-1" />
              <div>
                <div className="font-medium text-foreground">Avaliações</div>
                <div>{(author && author.ratingCount) ? `${Number((author.ratingAvg||0)).toFixed(1)} (${author.ratingCount} avaliações)` : 'Sem avaliações'}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 mt-1" />
              <div>
                <div className="font-medium text-foreground">Contato</div>
                <div>{(author && author.telefone) || (post.User && post.User.telefone) || 'Telefone não informado'}</div>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default PostDetails;
