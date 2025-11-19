import "../css/chat.css";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { apiJson } from '@/lib/api';

const Contacts = () => {
  const navigate = useNavigate();
  const [convs, setConvs] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiJson('/api/chat/conversations');
        setConvs(data || []);
      } catch (e) { console.error(e); }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/feed')} className="hover:bg-secondary">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">Conversas</h1>
        </div>
      </header>
      <main className="container mx-auto max-w-3xl px-4 py-6">
        <div className="space-y-3">
          {convs.length === 0 ? (
            <Card className="p-4">Nenhuma conversa encontrada.</Card>
          ) : convs.map((c: any) => (
            <Card key={c.conversation.id} className="p-3 cursor-pointer" onClick={() => navigate(`/chat?conversationId=${c.conversation.id}&toUserId=${c.otherUser?.id}`)}>
              <div className="flex items-center gap-3">
                <Avatar>
                  {c.otherUser?.foto ? <AvatarImage src={c.otherUser.foto} /> : null}
                  <AvatarFallback>{(c.otherUser?.name || 'U')[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{c.otherUser?.name || 'Usuário'}</div>
                  <div className="text-sm text-muted-foreground">{c.otherUser?.telefone || ''}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Contacts;
