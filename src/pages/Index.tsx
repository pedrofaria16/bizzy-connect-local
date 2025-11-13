import Header from "@/components/Header";
import FilterBar from "@/components/FilterBar";
import PostCard from "@/components/PostCard";
import CreatePostButton from "@/components/CreatePostButton";

import limpezaImg from "@/assets/categories/limpeza.jpg";
import construcaoImg from "@/assets/categories/construcao.jpg";
import tecnologiaImg from "@/assets/categories/tecnologia.jpg";
import belezaImg from "@/assets/categories/beleza.jpg";
import jardnagemImg from "@/assets/categories/jardinagem.jpg";
import transporteImg from "@/assets/categories/transporte.jpg";

const mockPosts = [
  {
    type: "offer" as const,
    username: "Maria Silva",
    rating: 4.8,
    category: "Limpeza",
    categoryImage: limpezaImg,
    title: "Serviços de Limpeza Residencial",
    description: "Ofereço serviços completos de limpeza residencial com experiência de 5 anos. Trabalho com produtos de qualidade e garanto sua satisfação.",
    price: "R$ 120/dia",
    location: "Centro",
    distance: "1.2 km",
    time: "2h atrás",
  },
  {
    type: "request" as const,
    username: "João Santos",
    rating: 4.5,
    category: "Construção",
    categoryImage: construcaoImg,
    title: "Preciso de Pedreiro para Reforma",
    description: "Busco profissional experiente para reforma de banheiro. Serviço inclui troca de azulejos e instalações hidráulicas.",
    price: "R$ 200/dia",
    location: "Jardim América",
    distance: "2.5 km",
    time: "4h atrás",
  },
  {
    type: "offer" as const,
    username: "Ana Costa",
    rating: 5.0,
    category: "Tecnologia",
    categoryImage: tecnologiaImg,
    title: "Manutenção de Computadores",
    description: "Técnica em informática oferece serviços de manutenção, formatação e upgrade de computadores. Atendimento rápido e eficiente.",
    price: "R$ 80/serviço",
    location: "Vila Nova",
    distance: "800m",
    time: "1h atrás",
  },
  {
    type: "offer" as const,
    username: "Carlos Oliveira",
    rating: 4.7,
    category: "Jardinagem",
    categoryImage: jardnagemImg,
    title: "Jardineiro Profissional",
    description: "Serviços de jardinagem, poda de árvores, manutenção de gramados e paisagismo. Trabalho com paixão e dedicação.",
    price: "R$ 150/dia",
    location: "Bela Vista",
    distance: "3.1 km",
    time: "5h atrás",
  },
  {
    type: "request" as const,
    username: "Paula Mendes",
    rating: 4.9,
    category: "Beleza",
    categoryImage: belezaImg,
    title: "Manicure para Domicílio",
    description: "Procuro manicure que faça atendimento em domicílio. Preciso de serviço regular, 2x por semana.",
    price: "R$ 60/sessão",
    location: "Morumbi",
    distance: "4.2 km",
    time: "3h atrás",
  },
  {
    type: "offer" as const,
    username: "Roberto Lima",
    rating: 4.6,
    category: "Transporte",
    categoryImage: transporteImg,
    title: "Motorista Particular",
    description: "Motorista profissional com 10 anos de experiência. Ofereço serviços de transporte executivo e viagens intermunicipais.",
    price: "R$ 35/hora",
    location: "Saúde",
    distance: "2.8 km",
    time: "6h atrás",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <FilterBar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {mockPosts.map((post, index) => (
            <PostCard key={index} {...post} />
          ))}
        </div>
      </main>
      
      <CreatePostButton />
    </div>
  );
};

export default Index;
