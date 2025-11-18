import "../css/postdetails.css";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Star, Clock, DollarSign, MessageCircle, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const PostDetails = () => {
  const navigate = useNavigate();

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
          <h1 className="text-xl font-bold text-foreground">Detalhes do Serviço</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-6">
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <Avatar className="h-16 w-16" onClick={() => navigate("/profile")}>
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl cursor-pointer">
                MS
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 
                    className="font-semibold text-lg text-foreground cursor-pointer hover:text-primary"
                    onClick={() => navigate("/profile")}
                  >
                    Maria Silva
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="font-medium text-darker-gray">4.8</span>
                  </div>
                </div>
                <Badge className="bg-primary">Oferece</Badge>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Publicado há 2 horas</span>
              </div>
            </div>
          </div>

          <Badge variant="outline" className="mb-4 border-primary/30">
            Limpeza
          </Badge>

          <h2 className="text-2xl font-bold text-foreground mb-4">
            Serviços de Limpeza Residencial
          </h2>

          <p className="text-muted-foreground mb-6">
            Ofereço serviços completos de limpeza residencial com experiência de 5 anos. 
            Trabalho com produtos de qualidade e garanto sua satisfação. Serviços incluem:
            limpeza de cômodos, banheiros, cozinha, janelas e muito mais. Disponibilidade 
            para trabalhos pontuais ou contratos mensais.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Preço</p>
                <p className="font-semibold text-darker-gray">R$ 120/dia</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Localização</p>
                <p className="font-semibold text-darker-gray">Centro • 1.2 km</p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex gap-3">
            <Button 
              className="flex-1 bg-primary hover:bg-primary-light"
              onClick={() => navigate("/chat")}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Enviar Mensagem
            </Button>
            <Button variant="outline" className="flex-1 border-border">
              Contratar
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 text-foreground">
            Sobre Maria Silva
          </h3>
          <p className="text-muted-foreground mb-4">
            Profissional experiente e dedicada. Trabalho com limpeza há mais de 5 anos 
            e tenho orgulho do meu trabalho. Pontualidade e qualidade são minhas prioridades.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>32 trabalhos concluídos</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>24 avaliações</span>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default PostDetails;
