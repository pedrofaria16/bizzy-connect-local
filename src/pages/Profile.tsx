import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Calendar, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Profile = () => {
  const navigate = useNavigate();

  const reviews = [
    {
      author: "João Silva",
      rating: 5,
      comment: "Excelente profissional! Muito dedicada e pontual.",
      date: "Há 2 dias",
    },
    {
      author: "Ana Costa",
      rating: 5,
      comment: "Serviço impecável, super recomendo!",
      date: "Há 1 semana",
    },
    {
      author: "Carlos Mendes",
      rating: 4,
      comment: "Bom trabalho, apenas demorou um pouco mais que o esperado.",
      date: "Há 2 semanas",
    },
  ];

  const completedJobs = [
    { title: "Limpeza Residencial", category: "Limpeza", date: "15/03/2024" },
    { title: "Limpeza Pós-Obra", category: "Limpeza", date: "10/03/2024" },
    { title: "Limpeza de Escritório", category: "Limpeza", date: "05/03/2024" },
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
          <h1 className="text-xl font-bold text-foreground">Perfil</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-6">
        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                MS
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Maria Silva</h2>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-5 w-5 fill-primary text-primary" />
                    <span className="text-lg font-semibold text-darker-gray">4.8</span>
                    <span className="text-sm text-muted-foreground">(24 avaliações)</span>
                  </div>
                </div>
                <Button className="bg-primary hover:bg-primary-dark">
                  Editar Perfil
                </Button>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Centro, São Paulo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Membro desde Mar 2023</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span>32 trabalhos concluídos</span>
                </div>
              </div>

              <p className="text-muted-foreground mb-4">
                Profissional de limpeza com mais de 5 anos de experiência. Trabalho com
                dedicação e garanto a satisfação dos meus clientes. Especializada em
                limpeza residencial e pós-obra.
              </p>

              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary">Limpeza</Badge>
                <Badge variant="outline" className="border-primary/30">Organização</Badge>
                <Badge variant="outline" className="border-primary/30">Pós-Obra</Badge>
              </div>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="reviews" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reviews">Avaliações</TabsTrigger>
            <TabsTrigger value="jobs">Trabalhos</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="space-y-4 mt-6">
            {reviews.map((review, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-secondary text-darker-gray">
                        {review.author[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{review.author}</p>
                      <p className="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground">{review.comment}</p>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4 mt-6">
            {completedJobs.map((job, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{job.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-primary/30">
                        {job.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{job.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="text-sm font-medium text-darker-gray">5.0</span>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;
