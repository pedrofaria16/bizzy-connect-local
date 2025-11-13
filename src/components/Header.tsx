import { Search, Bell, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold text-primary">
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
          <Button variant="ghost" size="icon" className="relative hover:bg-secondary">
            <Bell className="h-5 w-5 text-darker-gray" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full"></span>
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-secondary">
            <MessageCircle className="h-5 w-5 text-darker-gray" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-secondary">
            <User className="h-5 w-5 text-darker-gray" />
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
