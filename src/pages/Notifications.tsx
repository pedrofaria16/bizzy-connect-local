import "../css/notifications.css";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Star, Briefcase, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Notifications = () => {
  const navigate = useNavigate();

  const notifications = [
    {
      id: 1,
      type: "message",
      icon: MessageCircle,
      user: "João Santos",
      action: "enviou uma mensagem",
      time: "5 min atrás",
      unread: true,
    },
    {
      id: 2,
      type: "review",
      icon: Star,
      user: "Ana Costa",
      action: "avaliou seu serviço",
      time: "1 hora atrás",
      unread: true,
    },
    {
      id: 3,
      type: "job",
      icon: Briefcase,
      user: "Carlos Oliveira",
      action: "se interessou pelo seu serviço",
      time: "2 horas atrás",
      unread: false,
    },
    {
      id: 4,
      type: "follow",
      icon: UserPlus,
      user: "Paula Mendes",
      action: "começou a seguir você",
      time: "1 dia atrás",
      unread: false,
    },
    {
      id: 5,
      type: "message",
      icon: MessageCircle,
      user: "Roberto Lima",
      action: "enviou uma mensagem",
      time: "2 dias atrás",
      unread: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
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
            const Icon = notification.icon;
            return (
              <Card
                key={notification.id}
                className={`p-4 cursor-pointer transition-colors hover:bg-secondary/50 ${
                  notification.unread ? "border-l-4 border-l-primary" : ""
                }`}
                onClick={() => {
                  if (notification.type === "message") {
                    navigate("/chat");
                  } else if (notification.type === "review" || notification.type === "follow") {
                    navigate("/profile");
                  }
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-secondary text-darker-gray">
                        {notification.user[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                      <Icon className="h-3 w-3 text-primary-foreground" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">{notification.user}</span>{" "}
                      {notification.action}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.time}
                    </p>
                  </div>

                  {notification.unread && (
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
