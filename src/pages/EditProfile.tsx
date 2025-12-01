import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { useTranslation } from 'react-i18next'; // ← ADICIONADO
import i18n from 'i18next'; // ← ADICIONADO
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Image as ImageIcon, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import "../css/cadastro.css";
import "../css/editprofile.css";

// small helpers for formatting (reused from cadastro)
function formatarTelefone(valor: string) {
  valor = valor.replace(/\D/g, "");
  if (valor.length > 11) valor = valor.slice(0, 11);
  if (valor.length > 6) {
    return `(${valor.slice(0,2)}) ${valor.slice(2,7)}-${valor.slice(7)}`;
  } else if (valor.length > 2) {
    return `(${valor.slice(0,2)}) ${valor.slice(2)}`;
  } else if (valor.length > 0) {
    return `(${valor}`;
  }
  return "";
}

function formatarData(valor: string) {
  valor = valor.replace(/\D/g, "");
  if (valor.length > 8) valor = valor.slice(0,8);
  if (valor.length > 4) {
    return `${valor.slice(0,2)}/${valor.slice(2,4)}/${valor.slice(4)}`;
  } else if (valor.length > 2) {
    return `${valor.slice(0,2)}/${valor.slice(2)}`;
  }
  return valor;
}

const EditProfile: React.FC = () => {
  const { t } = useTranslation();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();
  const [cepLocked, setCepLocked] = useState(false);
  const raw = typeof window !== 'undefined' ? localStorage.getItem('bizzy_user') : null;
  let initialUser: any = null;
  try { initialUser = raw ? JSON.parse(raw) : null; } catch(e) { initialUser = null; }

  // address parts
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState('');

  useEffect(() => {
    if (initialUser?.endereco) {
      const parts = (initialUser.endereco as string).split(',').map(s => s.trim());
      setRua(parts[0] ?? '');
      setNumero(parts[1] ?? '');
      setBairro(parts[2] ?? '');
      setCidade(parts[3] ?? '');
      setEstado(parts[4] ?? '');
    }
  }, []);

  const [name, setName] = useState(initialUser?.name ?? '');
  const [telefone, setTelefone] = useState(initialUser?.telefone ?? '');
  const [nascimento, setNascimento] = useState(initialUser?.nascimento ?? '');
  // categorias — mantemos as chaves em português, mas exibimos via t() para tradução
  const servicosOpcoes = [
    "Elétrica", "Pintura", "Jardinagem", "Limpeza", "Aulas", "Transporte", "Tecnologia", "Eventos", "Montagem", "Reformas"
  ];
  const initialServicosArr = initialUser?.servicos ? (initialUser.servicos as string).split(',').map((s:string)=>s.trim()).filter(Boolean) : [];
  const [servicosArr, setServicosArr] = useState<string[]>(initialServicosArr);
  const [description, setDescription] = useState(initialUser?.description ?? '');
  const [sexo, setSexo] = useState(initialUser?.sexo ?? '');
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>(initialUser?.foto ?? '');
  const [saving, setSaving] = useState(false);

  const backendBase = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '';
  const previewSrc = fotoPreview ? (
    (fotoPreview.startsWith('data:') || fotoPreview.startsWith('http')) ? fotoPreview : `${backendBase}${fotoPreview}`
  ) : '';

  function onFotoChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFotoFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onloadend = () => setFotoPreview(reader.result as string);
      reader.readAsDataURL(f);
    }
  }

  async function buscarCep(rawCep: string) {
    const onlyDigits = rawCep.replace(/\D/g, '');
    if (onlyDigits.length !== 8) {
      if (onlyDigits.length === 0) {
        setRua(''); setBairro(''); setCidade(''); setEstado(''); setCepLocked(false);
      }
      return;
    }
    try {
      const res = await fetch(`https://viacep.com.br/ws/${onlyDigits}/json/`);
      const data = await res.json();
      if (!data || data.erro) return;
      setRua(data.logradouro ?? '');
      setBairro(data.bairro ?? '');
      setCidade(data.localidade ?? '');
      setEstado(data.uf ?? '');
      setCepLocked(true);
    } catch (err) {
      console.error(t('Erro ViaCEP'), err);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const endereco = `${rua}, ${numero}, ${bairro}, ${cidade}, ${estado}`;
      const apiUrl = process.env.NODE_ENV === 'development' ? '/api/auth/editar' : 'http://localhost:5000/api/auth/editar';
      const body = { id: initialUser?.id, name, telefone, nascimento, servicos: servicosArr.join(', '), description, sexo, endereco };
      const res = await fetch(apiUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || t('Erro ao atualizar perfil'));
        setSaving(false);
        return;
      }
      let updatedUser = data;
      if (fotoFile) {
        const uploadUrl = process.env.NODE_ENV === 'development' ? '/api/auth/upload-foto' : 'http://localhost:5000/api/auth/upload-foto';
        const fd = new FormData();
        fd.append('foto', fotoFile);
        fd.append('userId', String(data.id || initialUser?.id));
        const upRes = await fetch(uploadUrl, { method: 'POST', body: fd });
        const upData = await upRes.json();
        if (upRes.ok && upData.foto) {
          updatedUser = { ...updatedUser, foto: upData.foto };
        }
      }
      localStorage.setItem('bizzy_user', JSON.stringify(updatedUser));
      toast.success(t('Perfil atualizado com sucesso'));
      navigate('/feed');
    } catch (err) {
      console.error(err);
      toast.error(t('Erro ao conectar com servidor'));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!langMenuRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!langMenuRef.current.contains(e.target)) setLangMenuOpen(false);
    }
    if (langMenuOpen) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [langMenuOpen]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/feed')} className="hover:bg-secondary">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">{t('Editar Perfil')}</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-6">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{t('Nome')}</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder={t('Nome')} />
              </div>
              <div>
                <Label>{t('Telefone')}</Label>
                <Input value={telefone} onChange={e => setTelefone(formatarTelefone(e.target.value))} placeholder={t('(xx) xxxxx-xxxx')} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: 12 }}>
              <div>
                <Label>{t('CEP')}</Label>
                <Input
                  value={cep}
                  onChange={e=>{
                    const val = e.target.value;
                    setCep(val);
                    const digits = val.replace(/\D/g,'');
                    if (digits.length === 0) {
                      setRua(''); setBairro(''); setCidade(''); setEstado(''); setCepLocked(false);
                    }
                    if (digits.length === 8) {
                      buscarCep(digits);
                    }
                  }}
                  placeholder={t('CEP')}
                  onBlur={(e)=>buscarCep(e.target.value)}
                />
              </div>
              <div>
                <Label>{t('Estado')}</Label>
                <Input value={estado} onChange={e=>setEstado(e.target.value)} placeholder={t('Estado')} readOnly={cepLocked} />
              </div>
              <div>
                <Label>{t('Cidade')}</Label>
                <Input value={cidade} onChange={e=>setCidade(e.target.value)} placeholder={t('Cidade')} readOnly={cepLocked} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: 12, marginTop: 12 }}>
              <div>
                <Label>{t('Rua')}</Label>
                <Input value={rua} onChange={e=>setRua(e.target.value)} placeholder={t('Rua')} readOnly={cepLocked} />
              </div>
              <div>
                <Label>{t('Número')}</Label>
                <Input value={numero} onChange={e=>setNumero(e.target.value)} placeholder={t('Número')} />
              </div>
              <div>
                <Label>{t('Bairro')}</Label>
                <Input value={bairro} onChange={e=>setBairro(e.target.value)} placeholder={t('Bairro')} readOnly={cepLocked} />
              </div>
            </div>

            <div>
              <Label>{t('Serviços que trabalha')}</Label>
              <div className="servicos-chips-group mt-2">
                {servicosOpcoes.map((serv) => (
                  <button
                    type="button"
                    key={serv}
                    className={
                      'servico-chip' + (servicosArr.includes(serv) ? ' servico-chip-selected' : '')
                    }
                    onClick={() => setServicosArr(prev => prev.includes(serv) ? prev.filter(s=>s!==serv) : [...prev, serv])}
                    aria-pressed={servicosArr.includes(serv)}
                  >
                    {t(serv)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>{t('Descrição')}</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value.slice(0,300))} rows={4} className="resize-none" />
              <div className="text-sm text-muted-foreground">{description.length}/300</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ marginTop: 8 }}>
                <input id="edit-foto-input" type="file" accept="image/*" onChange={onFotoChange} style={{ display: 'none' }} />
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => document.getElementById('edit-foto-input')?.click()}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('edit-foto-input')?.click(); }}
                  style={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', border: '2px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#fff' }}
                >
                  {previewSrc ? (
                    <img src={previewSrc} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
                  ) : (
                    <div style={{ color: '#9ca3af', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <UserIcon size={40} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botão "IDIOMA" — um pouco abaixo da foto */}
            <div className="mt-6 flex justify-center">
              <div className="relative" ref={langMenuRef}>
                <Button type="button" variant="outline" onClick={() => setLangMenuOpen(v => !v)}>
                  {t('Idioma')}
                </Button>

                {langMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-50">
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-gray-100"
                      onClick={() => { i18n.changeLanguage('pt-BR'); setLangMenuOpen(false); }}
                    >
                      PT-BR
                    </button>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-gray-100"
                      onClick={() => { i18n.changeLanguage('en'); setLangMenuOpen(false); }}
                    >
                      INGLES
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-primary" disabled={saving}>{saving ? t('Salvando...') : t('Salvar')}</Button>
              <Button type="button" variant="ghost" onClick={() => navigate('/feed')}>{t('Cancelar')}</Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default EditProfile;