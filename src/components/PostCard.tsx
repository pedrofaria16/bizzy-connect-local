import { MapPin, Star, Clock, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch, getStoredUserId, apiJson } from '@/lib/api';
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

interface PostCardProps {
  id: number;
  type: "offer" | "request";
  username: string;
  avatar?: string;
  rating: number;
  category: string;
  title: string;
  description: string;
  price?: string;
  location: string;
  distance: string;
  time: string;
  authorId?: number;
}

const PostCard = ({
  id,
  type,
  username,
  avatar,
  rating,
  category,
  title,
  description,
  price,
  location,
  distance,
  time,
  authorId,
}: PostCardProps) => {
  const navigate = useNavigate();
  const [hasApplied, setHasApplied] = useState(false);
  
  useEffect(() => {
    // Verificar se o usuário já se candidatou
    const checkIfApplied = async () => {
      try {
        const userId = getStoredUserId();
        if (!userId) return;
        const candidaturas = await apiJson(`/api/candidaturas?userId=${userId}`);
        const alreadyApplied = candidaturas.some((c: any) => c.postId === id);
        setHasApplied(alreadyApplied);
      } catch (e) {
        console.warn('Erro ao verificar candidaturas:', e);
      }
    };
    checkIfApplied();
  }, [id]);
  // Extract only neighborhood (bairro) and city (cidade) from a full address string.
  const extractNeighborhoodCity = (endereco?: string, cidade?: string) => {
    if (!endereco && !cidade) return 'Local não informado';
    if (endereco) {
      const parts = endereco.split(',').map(s => s.trim()).filter(Boolean);
      if (parts.length >= 3) {
        const bairro = parts[parts.length - 3];
        const cidadeVal = parts[parts.length - 2] || cidade;
        if (bairro && cidadeVal) return `${bairro} • ${cidadeVal}`;
        if (cidadeVal) return cidadeVal;
      }
      // fallback to cidade param or last segment of endereco
      if (cidade) return cidade;
      const last = parts[parts.length - 1];
      return last || 'Local não informado';
    }
    return cidade || 'Local não informado';
  };
  // Determine offer vs request robustly: prefer explicit prop, otherwise infer from price string.
  const inferIsOffer = (() => {
    if (type === 'offer') return true;
    if (type === 'request') return false;
    if (!price) return true; // no price -> likely offering without price
    // price may be like 'R$ 120' or '120' or '120,00'
    const numeric = Number(String(price).replace(/[^0-9.,-]/g, '').replace(',', '.'));
    if (isNaN(numeric)) return false;
    return numeric === 0; // zero -> offer, otherwise request
  })();

  const badgeLabel = inferIsOffer ? 'Oferece' : 'Solicita';
  const badgeClasses = inferIsOffer ? 'bg-primary hover:bg-primary-light' : 'bg-darker-gray text-primary-foreground';

  return (
    <Card 
      className="p-6 hover:shadow-lg transition-all duration-300 border-border bg-card cursor-pointer"
    onClick={() => navigate(`/post/${id}`)}
    >
      <div className="flex items-start gap-4">
          <Avatar 
          className="h-12 w-12 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            if (authorId) navigate(`/profile?userId=${authorId}`);
            else navigate("/profile");
          }}
        >
          <AvatarImage src={avatar} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
                <h3 
                className="font-semibold text-foreground cursor-pointer hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  if (authorId) navigate(`/profile?userId=${authorId}`);
                  else navigate("/profile");
                }}
              >
                {username}
              </h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-medium text-darker-gray">{rating.toFixed(1)}</span>
              </div>
            </div>
              <Badge
                variant={inferIsOffer ? 'default' : 'outline'}
                className={badgeClasses}
              >
                {badgeLabel}
              </Badge>
          </div>
          
          <Badge variant="outline" className="mb-3 text-xs border-primary/30 text-darker-gray">
            {category}
          </Badge>
          
          <h4 className="font-semibold text-lg mb-2 text-foreground">{title}</h4>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {description}
          </p>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
            {price && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="font-medium text-darker-gray">{price}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{extractNeighborhoodCity(location)}{distance ? ` • ${distance}` : ''}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{time}</span>
            </div>
          </div>
          
          {/* If the current user is the author of the post, don't render action buttons */}
          {(() => {
            try {
              const raw = typeof window !== 'undefined' ? (localStorage.getItem('bizzy_user') || localStorage.getItem('user')) : null;
              const current = raw ? JSON.parse(raw) : null;
              const currentId = current?.id ?? current;
              if (authorId && currentId && Number(currentId) === Number(authorId)) {
                return (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 border-border hover:bg-secondary"
                      onClick={(e) => { e.stopPropagation(); if (authorId) navigate(`/profile?userId=${authorId}`); else navigate("/profile"); }}
                    >
                      Ver Perfil
                    </Button>
                  </div>
                );
              }
            } catch (e) { /* ignore parse errors and show buttons */ }
            return (
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="flex-1 bg-primary hover:bg-primary-light"
                      onClick={(e) => { e.stopPropagation(); }}
                      disabled={!inferIsOffer && hasApplied}
                    >
                      {!inferIsOffer && hasApplied ? "Já se candidatou" : inferIsOffer ? "Contratar" : "Candidatar-se"}
                    </Button>
                  </AlertDialogTrigger>
                  {!inferIsOffer && hasApplied ? null : (
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {inferIsOffer ? 'Confirmar contratação' : 'Confirmar candidatura'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {inferIsOffer ? 'Tem certeza que deseja contratar este profissional para o serviço?' : 'Tem certeza que deseja se candidatar a este serviço?'}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction asChild>
                          <Button
                            className="bg-primary"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                if (inferIsOffer) {
                                  const idUser = getStoredUserId();
                                  if (!idUser) return alert('Faça login para contratar.');
                                  const res = await apiFetch(`/api/posts/${id}/contratar`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ contratanteId: Number(idUser) })
                                  });
                                  const payload = await res.json().catch(() => ({}));
                                  if (!res.ok) return alert(payload.error || payload.message || 'Erro ao contratar');
                                  alert('Profissional contratado — notificação enviada.');
                                  // refresh feed so the contracted post disappears
                                  try { window.location.reload(); } catch (e) { navigate('/feed'); }
                                } else {
                                  const idUser = getStoredUserId();
                                  if (!idUser) return alert('Faça login para se candidatar.');
                                  const res = await apiFetch(`/api/posts/${id}/candidatar`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ userId: Number(idUser) })
                                  });
                                  const payload = await res.json().catch(() => ({}));
                                  if (!res.ok) return alert(payload.error || payload.message || 'Erro ao candidatar');
                                  alert('Candidatura enviada. O autor recebeu uma notificação.');
                                  setHasApplied(true);
                                }
                              } catch (err: any) {
                                console.error(err);
                                alert(err?.message || 'Erro na ação');
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

                <Button 
                  variant="outline" 
                  className="flex-1 border-border hover:bg-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (authorId) navigate(`/profile?userId=${authorId}`);
                    else navigate("/profile");
                  }}
                >
                  Ver Perfil
                </Button>
              </div>
            );
          })()}
        </div>
      </div>
    </Card>
  );
};

export default PostCard;
