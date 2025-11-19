import "../css/notifications.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import { apiJson, apiFetch } from '@/lib/api';
import { ArrowLeft, MessageCircle, Star, Briefcase, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiJson('/api/notifications');
        setNotifications(data || []);
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
            return (
              <Card
                key={notification.id}
                className={`p-4 cursor-pointer ${notification.read ? '' : 'border-l-4 border-l-primary'}`}
                onClick={() => {
                  markRead(notification.id);
                  if (type === 'message') navigate('/chat');
                  if (type === 'candidatura' || type === 'contratado') navigate('/notifications');
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={''} />
                      <AvatarFallback className="bg-secondary text-darker-gray">N</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                      <MessageCircle className="h-3 w-3 text-primary-foreground" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">Notificação</span>{' '}
                      {notification.type}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
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
