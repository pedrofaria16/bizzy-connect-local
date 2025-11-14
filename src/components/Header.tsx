import { Search, Bell, MessageCircle, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Header = () => {
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const abrirMenu = () => setMenuAberto((prev) => !prev);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <h1 
            className="text-2xl font-bold text-primary cursor-pointer"
            onClick={() => navigate("/")}
          >
            Bizzy
          </h1>
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
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-secondary"
            onClick={() => navigate("/profile")}
          >
            <User className="h-5 w-5 text-darker-gray" />
          </Button>

          {/* Menu toggle + menu container (relative) */}
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
