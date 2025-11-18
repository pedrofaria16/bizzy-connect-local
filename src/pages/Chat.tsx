import "../css/chat.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const Chat = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Maria Silva",
      content: "Olá! Vi seu interesse no meu serviço. Como posso ajudar?",
      time: "10:30",
      isOwn: false,
    },
    {
      id: 2,
      sender: "Você",
      content: "Oi! Gostaria de saber mais sobre seus horários disponíveis.",
      time: "10:32",
      isOwn: true,
    },
    {
      id: 3,
      sender: "Maria Silva",
      content: "Tenho disponibilidade de segunda a sexta, das 8h às 17h. Finais de semana também é possível com agendamento prévio.",
      time: "10:33",
      isOwn: false,
    },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: "Você",
      content: message,
      time: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isOwn: true,
    };

    setMessages([...messages, newMessage]);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-screen bg-background">
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
          <div 
            className="flex items-center gap-3 flex-1 cursor-pointer"
            onClick={() => navigate("/profile")}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                MS
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-foreground">Maria Silva</h2>
              <p className="text-xs text-muted-foreground">Online</p>
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
