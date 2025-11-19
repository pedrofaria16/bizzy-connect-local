import "../css/notifications.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import { apiJson, apiFetch } from '@/lib/api';
import { ArrowLeft, MessageCircle, Star, Briefcase, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const getStoredUserId = () => {
  try {
    const raw = typeof window !== 'undefined' ? (localStorage.getItem('bizzy_user') || localStorage.getItem('user')) : null;
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.id ?? parsed;
  } catch (e) { return null; }
};

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiJson('/api/notifications');
        const arr = data || [];
        // for message notifications, fetch sender info and attach as `fromUser` for display
        const enriched = await Promise.all(arr.map(async (n: any) => {
          try {
            if ((n.type === 'message' || n.type === 'candidatura' || n.type === 'contratado') && n.data && n.data.fromUserId) {
              const u = await apiJson(`/api/auth/user?id=${n.data.fromUserId}`);
              return { ...n, fromUser: u };
            }
          } catch (e) { console.warn('Erro ao buscar remetente da notificação', e); }
          return n;
        }));
        setNotifications(enriched);
      } catch (e) { console.error(e); }
    })();
  }, []);

  async function markRead(id: number) {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) { console.error(e); }
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
          <h1 className="text-xl font-bold text-foreground">Notificações</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-6">
        <div className="space-y-3">
          {notifications.map((notification) => {
            const type = notification.type;
            const fromUserId = notification.data?.fromUserId;
            
            const handleOpenMessage = async (e: React.MouseEvent) => {
              e.stopPropagation();
              markRead(notification.id);
              try {
                const convId = notification.data?.conversationId;
                if (convId) {
                  navigate(`/chat?conversationId=${convId}&toUserId=${fromUserId}`);
                } else if (fromUserId) {
                  try {
                    const conv = await apiJson('/api/chat/conversation', { 
                      method: 'POST', 
                      headers: { 'Content-Type': 'application/json' }, 
                      body: JSON.stringify({ userAId: Number(getStoredUserId()), userBId: Number(fromUserId) }) 
                    });
                    navigate(`/chat?conversationId=${conv.id}&toUserId=${fromUserId}`);
                  } catch (e) {
                    console.warn('Erro criando/recuperando conversa:', e);
                    navigate(`/chat?toUserId=${fromUserId}`);
                  }
                } else {
                  navigate('/chat');
                }
              } catch (e) {
                console.error('Erro ao abrir chat:', e);
                navigate('/chat');
              }
            };
            
            return (
              <Card
                key={notification.id}
                className={`p-4 cursor-pointer ${notification.read ? '' : 'border-l-4 border-l-primary'}`}
                onClick={async () => {
                    markRead(notification.id);
                    if (type === 'message') {
                      try {
                        const convId = notification.data?.conversationId;
                        if (convId) {
                          navigate(`/chat?conversationId=${convId}&toUserId=${fromUserId}`);
                        } else if (fromUserId) {
                          try {
                            const conv = await apiJson('/api/chat/conversation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userAId: Number(getStoredUserId()), userBId: Number(fromUserId) }) });
                            navigate(`/chat?conversationId=${conv.id}&toUserId=${fromUserId}`);
                          } catch (e) {
                            console.warn('Erro criando/recuperando conversa:', e);
                            navigate(`/chat?toUserId=${fromUserId}`);
                          }
                        } else {
                          navigate('/chat');
                        }
                      } catch (e) {
                        console.error('Erro ao abrir notificação de mensagem:', e);
                        navigate('/chat');
                      }
                    }
                    if (type === 'candidatura' || type === 'contratado') navigate('/notifications');
                  }}
              >
                <div className="flex items-start gap-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        {notification.fromUser && notification.fromUser.foto ? (
                          <AvatarImage src={notification.fromUser.foto} />
                        ) : null}
                        <AvatarFallback className="bg-secondary text-darker-gray">
                          {notification.fromUser && notification.fromUser.name ? notification.fromUser.name.split(' ').map((s:string)=>s[0]).slice(0,2).join('').toUpperCase() : 'N'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                        <MessageCircle className="h-3 w-3 text-primary-foreground" />
                      </div>
                    </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      {notification.type === 'message' ? (
                        <>
                          <span className="font-semibold">{notification.fromUser?.name || 'Usuário'}</span>{' '}
                          <span>enviou uma mensagem</span>
                        </>
                      ) : notification.type === 'candidatura' ? (
                        <>
                          <span className="font-semibold">{notification.fromUser?.name || 'Usuário'}</span>{' '}
                          <span>se candidatou para seu serviço</span>
                        </>
                      ) : notification.type === 'contratado' ? (
                        <>
                          <span className="font-semibold">{notification.fromUser?.name || 'Usuário'}</span>{' '}
                          <span>te selecionou para o serviço</span>
                        </>
                      ) : (
                        <><span className="font-semibold">Notificação</span>{' '}{notification.type}</>
                      )}
                    </p>
                    {notification.type === 'message' && notification.data?.text ? (
                      <p className="text-sm mt-1">"{notification.data.text}"</p>
                    ) : null}
                    <p className="text-xs text-muted-foreground mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                    
                    {(notification.type === 'candidatura' || notification.type === 'contratado') && fromUserId && (
                      <div className="mt-3 flex gap-2">
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={handleOpenMessage}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Enviar Mensagem
                        </Button>
                      </div>
                    )}
                  </div>

                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Notifications;
