import { Search, Bell, MessageCircle, User, Wallet, Globe } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import { apiJson } from '@/lib/api';
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Header = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const raw = typeof window !== 'undefined' ? localStorage.getItem('bizzy_user') : null;
  let storedUser: any = null;
  try { storedUser = raw ? JSON.parse(raw) : null; } catch(e) { storedUser = null; }

  const [menuAberto, setMenuAberto] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState<string>("");
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const q = params.get('q') || '';
      setHeaderSearch(q);
    } catch (e) {
      // ignore
    }
  }, [location.search]);

  // buscar notificações para mostrar o indicador quando houver novas
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data: any[] = await apiJson('/api/notifications');
        if (!mounted) return;
        const unread = (data || []).filter(n => !n.read);
        setHasUnreadNotifications(unread.length > 0);
        setHasUnreadMessages(unread.some(n => n.type === 'message'));
      } catch (e) {
        // falha silenciosa
        console.debug(t('Erro ao buscar notificações no header'), e);
      }
    })();
    return () => { mounted = false; };
  }, [t]);

  const abrirMenu = () => setMenuAberto((prev) => !prev);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // fecha o menu ao clicar fora
  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      if (!menuAberto) return;
      if (!menuRef.current) return;
      const target = e.target as Node | null;
      if (target && menuRef.current.contains(target)) return;
      setMenuAberto(false);
      setLangOpen(false);
    }
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, [menuAberto]);

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate("/feed")} aria-label="Home" className="p-0 m-0">
            <img src="/logo-preta.svg" alt="Bizzy" className="h-8 w-auto" />
          </button>
          <div className="hidden md:flex relative w-64 lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              value={headerSearch}
              onChange={(e: any) => {
                setHeaderSearch(e.target.value);
              }}
              onKeyDown={(e: any) => {
                if (e.key === 'Enter') {
                  const v = String(headerSearch || '').trim();
                  navigate(`/feed${v ? `?q=${encodeURIComponent(v)}` : ''}`);
                }
              }}
              placeholder={t("Buscar serviços...")}
              className="pl-10 bg-secondary/50 border-border focus-visible:ring-primary"
            />
          </div>
        </div>
        
        <nav className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-secondary"
            onClick={() => navigate("/notifications")}
          >
            <Bell className="h-5 w-5 text-darker-gray" />
            {hasUnreadNotifications && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full" aria-hidden />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-secondary"
             onClick={() => navigate("/contacts")}
          >
            <MessageCircle className="h-5 w-5 text-darker-gray" />
            {hasUnreadMessages && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full" aria-hidden />
            )}
          </Button>
          {/* Perfil / Login */}
          {storedUser ? (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-secondary"
                onClick={() => navigate("/profile")}
              >
                <User className="h-5 w-5 text-darker-gray" />
              </Button>
            </>
          ) : (
            // Quando não há usuário logado, mostrar apenas o botão Entrar no lugar do perfil
            <>
              <Button onClick={() => navigate('/login')} id="continuar-login">
                {t("Entrar")}
              </Button>
            </>
          )}

          {/* Menu toggle + menu container (relative) - disponível sempre */}
          <div className="relative" ref={menuRef}>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-secondary"
              onClick={abrirMenu}
              aria-label={t("Abrir opções")}
            >
              {/* Simple three-bar hamburger (black) */}
              <span className="flex flex-col justify-between h-4 w-4">
                <span className="block h-[2px] bg-black rounded" />
                <span className="block h-[2px] bg-black rounded" />
                <span className="block h-[2px] bg-black rounded" />
              </span>
            </Button>

            {/* Menu opções (lado direito) */}
            <div className={`menu-opcoes${menuAberto ? " ativo" : ""}`} role="menu" aria-hidden={!menuAberto}>
              <ul>
                <li>
                  <button className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm" id="carteira" onClick={() => { setMenuAberto(false); navigate("/carteira"); }}>
                    <span className="w-4 h-4 flex items-center justify-center text-darker-gray"><Wallet className="h-4 w-4" /></span>
                    <span className="flex-1">{t("Carteira")}</span>
                  </button>
                </li>

                <li>
                  <button className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm" onClick={() => { setMenuAberto(false); navigate("/sobre-nos"); }}>
                    <span className="w-4 h-4" />
                    <span className="flex-1">{t("Sobre nós")}</span>
                  </button>
                </li>
                <li>
                  <button className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm" onClick={() => { setMenuAberto(false); navigate("/politica-de-privacidade"); }}>
                    <span className="w-4 h-4" />
                    <span className="flex-1">{t("Política e Privacidade")}</span>
                  </button>
                </li>
                <li>
                  <button className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm" onClick={() => { setMenuAberto(false); navigate("/termos-de-uso"); }}>
                    <span className="w-4 h-4" />
                    <span className="flex-1">{t("Termos de Uso")}</span>
                  </button>
                </li>
                <li>
                  <div className="relative">
                    <button
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm"
                      onClick={() => { setLangOpen(v => !v); }}
                      onMouseEnter={() => setLangOpen(true)}
                      onMouseLeave={() => setLangOpen(false)}
                    >
                      <span className="flex-1">{t("Idioma")}</span>
                      <span className="w-4 h-4 flex items-center justify-center text-darker-gray"><Globe className="h-4 w-4" /></span>
                    </button>

                    {langOpen && (
                      <div className="absolute left-0 top-full w-full bg-card border rounded shadow z-50" onMouseEnter={() => setLangOpen(true)} onMouseLeave={() => setLangOpen(false)}>
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                          onClick={() => { i18n.changeLanguage('pt-BR'); setLangOpen(false); setMenuAberto(false); }}
                        >
                          Português (PT)
                        </button>
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                          onClick={() => { i18n.changeLanguage('en'); setLangOpen(false); setMenuAberto(false); }}
                        >
                          English (EN)
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;