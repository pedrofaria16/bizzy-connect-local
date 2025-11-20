import { Search, Bell, MessageCircle, User } from "lucide-react";
import { useState, useEffect } from "react";
import { apiJson } from '@/lib/api';
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const raw = typeof window !== 'undefined' ? localStorage.getItem('bizzy_user') : null;
  let storedUser: any = null;
  try { storedUser = raw ? JSON.parse(raw) : null; } catch(e) { storedUser = null; }

  const [menuAberto, setMenuAberto] = useState(false);
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
        console.debug('Erro ao buscar notificações no header', e);
      }
    })();
    return () => { mounted = false; };
  }, []);
  const abrirMenu = () => setMenuAberto((prev) => !prev);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
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
              placeholder="Buscar serviços..." 
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
            className="hover:bg-secondary"
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
                <i className='bx bx-log-in'></i>
                Entrar
              </Button>
            </>
          )}

          {/* Menu toggle + menu container (relative) - disponível sempre */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-secondary"
              onClick={abrirMenu}
              aria-label="Abrir opções"
            >
              {/* Simple three-bar hamburger (black) */}
              <span className="flex flex-col justify-between h-4 w-4">
                <span className="block h-[2px] bg-black rounded" />
                <span className="block h-[2px] bg-black rounded" />
                <span className="block h-[2px] bg-black rounded" />
              </span>
            </Button>

            {/* Menu opções (lado direito) */}
            <div className={`menu-opcoes${menuAberto ? " ativo" : ""}`}>
              <ul>
                <a onClick={() => { setMenuAberto(false); navigate("/sobre-nos"); }}><li>Sobre nós</li></a>
                <a onClick={() => { setMenuAberto(false); navigate("/politica-de-privacidade"); }}><li>Política e Privacidade</li></a>
                <a onClick={() => { setMenuAberto(false); navigate("/termos-de-uso"); }}><li>Termos de Uso</li></a>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
