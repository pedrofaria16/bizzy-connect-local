import { Search, Bell, MessageCircle, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Header = () => {
  const navigate = useNavigate();
  const raw = typeof window !== 'undefined' ? localStorage.getItem('bizzy_user') : null;
  let storedUser: any = null;
  try { storedUser = raw ? JSON.parse(raw) : null; } catch(e) { storedUser = null; }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate("/")} aria-label="Home" className="p-0 m-0">
            <img src="/logo-preta.svg" alt="Bizzy" className="h-8 w-auto" />
          </button>
          <div className="hidden md:flex relative w-64 lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
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
            <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full"></span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-secondary"
            onClick={() => navigate("/chat")}
          >
            <MessageCircle className="h-5 w-5 text-darker-gray" />
          </Button>
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
        </nav>
      </div>
    </header>
  );
};

export default Header;
