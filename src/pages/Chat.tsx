import "../css/chat.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiJson, apiFetch, getStoredUserId } from '@/lib/api';

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const conversationId = params.get('conversationId');
  const toUserId = params.get('toUserId');

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [otherUser, setOtherUser] = useState<any | null>(null);
  const backendBase = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '';

  useEffect(() => {
    if (!conversationId) return;
    apiJson(`/api/chat/messages/${conversationId}`)
      .then((msgs: any[]) => {
        const myId = getStoredUserId();
        const normalized = (msgs || []).map(m => ({
          id: m.id,
          content: m.text ?? m.content,
          isOwn: Number(m.fromUserId) === Number(myId),
          time: m.createdAt ? new Date(m.createdAt).toLocaleString() : ''
        }));
        setMessages(normalized);
      })
      .catch(console.error);
  }, [conversationId]);

  // load other user's profile (prefer toUserId param, fallback to conversation lookup)
  useEffect(() => {
    (async () => {
      try {
        if (toUserId) {
          const u = await apiJson(`/api/auth/user?id=${toUserId}`);
          setOtherUser(u);
          return;
        }
        if (conversationId) {
          // fetch conversations and find this one
          const convs = await apiJson('/api/chat/conversations');
          const found = (convs || []).find((c: any) => Number(c.conversation.id) === Number(conversationId));
          if (found) setOtherUser(found.otherUser);
        }
      } catch (e) {
        console.error('Erro ao buscar usuário da conversa', e);
      }
    })();
  }, [toUserId, conversationId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    (async () => {
      try {
        if (!conversationId || !toUserId) return alert('Conversa inválida');
        // debug: what id will be used
        const debugId = getStoredUserId();
        console.debug('[chat] sending message, detected user id =', debugId, 'conversationId=', conversationId, 'toUserId=', toUserId);
        const res = await apiFetch('/api/chat/messages', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId: Number(conversationId), toUserId: Number(toUserId), text: message })
        });
        console.debug('[chat] send response status:', res.status);
        if (res.status === 401 || res.status === 403) return alert('Faça login para enviar mensagem');
        const saved = await res.json();
        if (!res.ok) throw new Error(saved?.message || saved?.error || 'Erro ao enviar');
        const myId = getStoredUserId();
        const normalized = {
          id: saved.id,
          content: saved.text ?? saved.content,
          isOwn: Number(saved.fromUserId) === Number(myId),
          time: saved.createdAt ? new Date(saved.createdAt).toLocaleString() : ''
        };
        setMessages(prev => [...prev, normalized]);
        setMessage('');
      } catch (e) { console.error(e); alert('Erro ao enviar mensagem'); }
    })();
  };

  return (
    <div className="flex flex-col h-screen bg-background">
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
          <div 
            className="flex items-center gap-3 flex-1 cursor-pointer"
            onClick={() => otherUser ? navigate(`/profile?userId=${otherUser.id}`) : null}
          >
            <Avatar className="h-10 w-10">
              {otherUser && otherUser.foto ? <AvatarImage src={otherUser.foto.startsWith('http') ? otherUser.foto : `${backendBase}${otherUser.foto}`} /> : null}
              <AvatarFallback className="bg-primary text-primary-foreground">
                {otherUser && otherUser.name ? otherUser.name.split(' ').map((s:string)=>s[0]).slice(0,2).join('').toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-foreground">{otherUser?.name ?? 'Usuário'}</h2>
            </div>
          </div>
        </div>
      </header>

      <ScrollArea className="flex-1 p-4">
        <div className="container mx-auto max-w-4xl space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
            >
              <Card
                className={`max-w-[70%] p-3 ${
                  msg.isOwn
                    ? "bg-primary text-primary-foreground"
                    : "bg-card"
                }`}
              >
                <p className="text-sm mb-1">{msg.content}</p>
                <p
                  className={`text-xs ${
                    msg.isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {msg.time}
                </p>
              </Card>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t border-border bg-card p-4">
        <form
          onSubmit={handleSendMessage}
          className="container mx-auto max-w-4xl flex gap-2"
        >
          <Input
            placeholder="Digite sua mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            className="bg-primary hover:bg-primary-light shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
