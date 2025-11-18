import "../css/profile.css";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { ArrowLeft, Star, MapPin, Calendar, Briefcase, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Profile = () => {
  const navigate = useNavigate();

  // Tenta carregar o usuário do localStorage
  const raw = typeof window !== 'undefined' ? localStorage.getItem('bizzy_user') : null;
  let storedUser: any = null;
  try {
    storedUser = raw ? JSON.parse(raw) : null;
  } catch (e) { storedUser = null; }
  // backend base for static uploads during development
  const backendBase = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '';
  const fotoSrc = storedUser?.foto ? (storedUser.foto.startsWith('http') ? storedUser.foto : `${backendBase}${storedUser.foto}`) : undefined;

  const reviews = [
    { author: "João Silva", rating: 5, comment: "Excelente profissional! Muito dedicada e pontual.", date: "Há 2 dias" },
  ];

  const completedJobs = [ { title: "Limpeza Residencial", category: "Limpeza", date: "15/03/2024" } ];

  // Estado para editar perfil
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({
    name: storedUser?.name ?? '',
    telefone: storedUser?.telefone ?? '',
    endereco: storedUser?.endereco ?? '',
    servicos: storedUser?.servicos ?? '',
    nascimento: storedUser?.nascimento ?? '',
    description: storedUser?.description ?? '',
    sexo: storedUser?.sexo ?? '',
  });
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [msg, setMsg] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((s:any)=>({ ...s, [name]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    try {
      // Se houver foto, usar multipart/form-data e rota /api/auth/upload-foto para upload
      const apiUrl = process.env.NODE_ENV === 'development' ? '/api/auth/editar' : 'http://localhost:5000/api/auth/editar';
      // enviar JSON com id + campos atualizaveis
      const body = { id: storedUser?.id, ...form };
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        setMsg(data.message || 'Erro ao atualizar');
        return;
      }
      // Atualizar localStorage com o user retornado
      localStorage.setItem('bizzy_user', JSON.stringify(data));
      // Se enviou foto, fazer upload via rota /api/auth/upload-foto
      if (fotoFile) {
        const uploadUrl = process.env.NODE_ENV === 'development' ? '/api/auth/upload-foto' : 'http://localhost:5000/api/auth/upload-foto';
        const fd = new FormData();
        fd.append('foto', fotoFile);
        fd.append('userId', String(data.id || storedUser?.id));
        const upRes = await fetch(uploadUrl, { method: 'POST', body: fd });
        const upData = await upRes.json();
        if (upRes.ok && upData.foto) {
          // atualizar foto no objeto guardado
          const updated = { ...data, foto: upData.foto };
          localStorage.setItem('bizzy_user', JSON.stringify(updated));
        }
      }
      setMsg('Perfil atualizado com sucesso');
      // atualizar form e storedUser (reload page state)
      const newRaw = localStorage.getItem('bizzy_user');
      try { storedUser = newRaw ? JSON.parse(newRaw) : storedUser; } catch(e){ }
      setEditing(false);
    } catch (err) {
      console.error(err);
      setMsg('Erro ao conectar com o servidor');
    }
  }

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFotoFile(f);
  }

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
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* left photo column - responsive: stacked on small, left column on sm+ */}
            <div className="flex-shrink-0 w-full sm:w-40 flex items-center sm:items-start justify-center sm:justify-start sm:mr-6">
              <div className="rounded-full p-1 ring-1 ring-border card-avatar-wrapper" style={{ marginRight: 12 }}>
                <Avatar className="h-32 w-32 sm:h-40 sm:w-40">
                  {fotoSrc ? (
                    <AvatarImage src={fotoSrc} />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                      {storedUser && storedUser.name ? storedUser.name.split(' ').map((s:string)=>s[0]).slice(0,2).join('').toUpperCase() : 'U'}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">{storedUser?.name ?? 'Usuário'}</h2>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-5 w-5 fill-primary text-primary" />
                    <span className="text-lg font-semibold text-darker-gray">4.8</span>
                    <span className="text-sm text-muted-foreground">(24 avaliações)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button aria-label="Mais opções" className="p-2 rounded-md hover:bg-secondary">
                        <MoreHorizontal className="h-5 w-5 text-darker-gray" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" className="profile-dropdown">
                      <DropdownMenuItem className="dropdown-item" onSelect={() => navigate('/edit-profile')}>Editar Perfil</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="dropdown-item" onSelect={() => { localStorage.removeItem('bizzy_user'); navigate('/'); }}>Sair</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{storedUser?.endereco ?? 'Endereço não informado'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{storedUser?.nascimento ? `Nascimento: ${storedUser.nascimento}` : 'Nascimento não informado'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span>{storedUser?.servicos ? `${(storedUser.servicos as string).split(',').length} serviços` : 'Serviços não informados'}</span>
                </div>
              </div>

              <p className="text-muted-foreground mb-4">{storedUser?.description ?? 'Sem descrição'}</p>

              <div className="flex flex-wrap gap-2 profile-categories">
                {(storedUser?.servicos ? (storedUser.servicos as string).split(',').map((s:string)=>s.trim()).filter(Boolean) : ['Sem serviços']).map((s:string, idx:number) => (
                  <Badge key={idx} className={`cursor-pointer shrink-0 px-4 py-2 text-sm transition-all hover:bg-secondary border-border text-darker-gray`}>{s}</Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* inline editing removed in favor of dedicated /edit-profile page */}

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
