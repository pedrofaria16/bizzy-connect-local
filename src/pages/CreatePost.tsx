import "../css/createpost.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, DollarSign, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const categories = [
  "Limpeza",
  "Construção",
  "Tecnologia",
  "Beleza",
  "Eventos",
  "Educação",
  "Transporte",
  "Jardinagem",
];

const CreatePost = () => {
  const navigate = useNavigate();
  const [postType, setPostType] = useState<"offer" | "request">("offer");
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    price: "",
    location: "",
    date: "",
    time: "",
  });

  const [addrOpen, setAddrOpen] = useState(false);
  const [addrDraft, setAddrDraft] = useState({ cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function buscarCepToDraft(rawCep: string) {
    // do nothing when not in 'request' mode
    if (postType !== 'request') return;
    const onlyDigits = rawCep.replace(/\D/g, '');
    if (onlyDigits.length !== 8) {
      if (onlyDigits.length === 0) {
        setAddrDraft(d => ({ ...d, rua: '', bairro: '', cidade: '', estado: '' }));
      }
      return;
    }
    try {
      const res = await fetch(`https://viacep.com.br/ws/${onlyDigits}/json/`);
      const data = await res.json();
      if (!data || data.erro) return;
      setAddrDraft(d => ({ ...d, rua: data.logradouro ?? '', bairro: data.bairro ?? '', cidade: data.localidade ?? '', estado: data.uf ?? '' }));
    } catch (err) {
      console.error('Erro ViaCEP', err);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Require CEP for backend geocoding only for requests (who need location)
    if (postType === 'request') {
      if (!addrDraft.cep || addrDraft.cep.replace(/\D/g, '').length !== 8) {
        toast.error('Por favor, informe um CEP válido no endereço.');
        return;
      }
    }

    const stored = localStorage.getItem('bizzy_user');
    const user = stored ? JSON.parse(stored) : null;

    // Build payload according to postType semantics:
    // - 'offer' = provider offering a service: only category + description required. We'll send valor=0, titulo defaulted.
    // - 'request' = seeker requesting service: must include title, price, date.
    let valorNum = 0;
    let titulo = formData.title;
    let dataCampo = formData.date;

    if (postType === 'request') {
      // require title and price for requests
      if (!formData.title || !formData.price) {
        toast.error('Para solicitar um serviço, preencha título e preço.');
        setIsSubmitting(false);
        return;
      }
      valorNum = parseFloat(formData.price.replace(/[^0-9,\.]/g, '').replace(',', '.')) || 0;
      if (valorNum <= 0) {
        toast.error('Informe um preço válido para solicitar um serviço.');
        setIsSubmitting(false);
        return;
      }
      // ensure date present
      if (!dataCampo) dataCampo = new Date().toISOString();
      // if user provided a date string (YYYY-MM-DD) and optional time (HH:MM), combine them
      if (formData.date) {
        const datePart = formData.date; // YYYY-MM-DD
        const timePart = formData.time || '';
        if (timePart) {
          dataCampo = new Date(`${datePart}T${timePart}`).toISOString();
        } else {
          // no time provided, default to start of day in local timezone
          dataCampo = new Date(`${datePart}T00:00:00`).toISOString();
        }
      }
    } else {
      // provider offering service: price is optional but allowed
      if (formData.price) {
        valorNum = parseFloat(formData.price.replace(/[^0-9,\.]/g, '').replace(',', '.')) || 0;
      } else {
        valorNum = 0;
      }
      if (!titulo) {
        titulo = formData.category ? `Serviço: ${formData.category}` : 'Serviço oferecido';
      }
      if (!dataCampo) dataCampo = new Date().toISOString();
    }

    const payload: any = {
      userId: user?.id,
      titulo: titulo,
      descricao: formData.description,
      categoria: formData.category,
      valor: valorNum,
      data: dataCampo,
      telefone: user?.telefone || '',
      type: postType,
    };

    // Include address fields only when present / when request
    if (postType === 'request') {
      payload.endereco = formData.location;
      payload.cep = addrDraft.cep;
      payload.cidade = addrDraft.cidade || '';
    }

    setIsSubmitting(true);

    fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Erro ao criar post');
        }
        return res.json();
      })
      .then((created) => {
        toast.success('Post criado com sucesso!');
        navigate('/feed');
      })
      .catch((err) => {
        console.error('Erro criando post', err);
        toast.error(err.message || 'Erro ao criar post');
      })
      .finally(() => setIsSubmitting(false));
  };

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
          <h1 className="text-xl font-bold text-foreground">Criar Post</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-6">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Tipo de Post</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={postType === "offer" ? "default" : "outline"}
                  className={postType === "offer" ? "bg-primary" : ""}
                  onClick={() => setPostType("offer")}
                >
                  Oferecer Serviço
                </Button>
                <Button
                  type="button"
                  variant={postType === "request" ? "default" : "outline"}
                  className={postType === "request" ? "bg-primary" : ""}
                  onClick={() => setPostType("request")}
                >
                  Solicitar Serviço
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder={postType === 'request' ? 'Ex: Preciso de limpeza residencial' : 'Ex: Limpeza doméstica'}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva o serviço em detalhes..."
                rows={5}
                className="createpost-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value.slice(0, 800) })
                }
                required
                maxLength={800}
              />
              <div className="text-sm text-muted-foreground">{formData.description.length}/800</div>
            </div>

            {postType === 'request' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price"
                      placeholder="R$ 120/dia"
                      className="pl-10"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Localização</Label>
                  <Dialog open={addrOpen} onOpenChange={(open)=>{ if(open){ setAddrDraft({ cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: '' }); } setAddrOpen(open); }}>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <DialogTrigger asChild>
                        <Input id="location" value={formData.location} placeholder="Localização" className="pl-10 cursor-pointer" readOnly />
                      </DialogTrigger>
                    </div>

                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Endereço</DialogTitle>
                        <DialogDescription>Digite o CEP ou preencha o endereço manualmente.</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-3">
                        <div>
                          <Label>CEP</Label>
                          <Input value={addrDraft.cep} disabled={postType !== 'request'} onChange={(e)=>{ const v=e.target.value; setAddrDraft(d=>({...d, cep: v })); const digits = v.replace(/\D/g,''); if(digits.length===8) buscarCepToDraft(digits); if(digits.length===0) setAddrDraft(d=>({...d, rua:'',bairro:'',cidade:'',estado:''})); }} placeholder="CEP" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div>
                            <Label>Estado</Label>
                            <Input value={addrDraft.estado} onChange={e=>setAddrDraft(d=>({...d, estado: e.target.value }))} />
                          </div>
                          <div>
                            <Label>Cidade</Label>
                            <Input value={addrDraft.cidade} onChange={e=>setAddrDraft(d=>({...d, cidade: e.target.value }))} />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: 12 }}>
                          <div>
                            <Label>Rua</Label>
                            <Input value={addrDraft.rua} onChange={e=>setAddrDraft(d=>({...d, rua: e.target.value }))} />
                          </div>
                          <div>
                            <Label>Nº</Label>
                            <Input value={addrDraft.numero} onChange={e=>setAddrDraft(d=>({...d, numero: e.target.value }))} />
                          </div>
                          <div>
                            <Label>Bairro</Label>
                            <Input value={addrDraft.bairro} onChange={e=>setAddrDraft(d=>({...d, bairro: e.target.value }))} />
                          </div>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="ghost" onClick={()=>setAddrOpen(false)}>Cancelar</Button>
                        <Button onClick={()=>{ setFormData(prev=>({ ...prev, location: `${addrDraft.rua}${addrDraft.numero? ', ' + addrDraft.numero : ''}${addrDraft.bairro? ', ' + addrDraft.bairro : ''}${addrDraft.cidade? ', ' + addrDraft.cidade : ''}${addrDraft.estado? ', ' + addrDraft.estado : ''}` })); setAddrOpen(false); }}>Salvar</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="price">Preço</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="price"
                    placeholder="R$ 120/dia"
                    className="pl-10 w-full"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required={false}
                  />
                </div>
              </div>
            )}

            {postType === 'request' && (
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <div className="relative">
                  <Calendar className="createpost-calendar-icon h-4 w-4" />
                  <div className="flex gap-2">
                    <Input
                      id="date"
                      type="date"
                      className="pl-10 h-12 createpost-date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                    <Input
                      id="time"
                      type="time"
                      className="pl-10 h-12 w-36"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full bg-primary hover:bg-primary-light transition-all duration-200" disabled={isSubmitting}>
              {isSubmitting ? 'Publicando...' : 'Publicar'}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default CreatePost;
