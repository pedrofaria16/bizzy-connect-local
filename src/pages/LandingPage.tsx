import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import '../css/landing-page.css'

function App() {
  return (
    <div className="App">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <a className="scroll-arrow" href="#como-funciona" aria-label="Scroll down">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </a>
      <Testimonials />
      <Footer />
    </div>
  );
}



// Componente Header
function Header() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight * 0.9;
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > heroHeight);
    };

    // Check initial position
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`dynamic-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <img className="logo" src="src/assets/img/logo-laranja.svg" alt="Logo Bizzy" onClick={() => navigate("/feed")} />
          </div>
          <nav>
            <ul>
              <li><a href="#como-funciona">Como Funciona</a></li>
              <li><a href="#servicos">Serviços</a></li>
              <li><a href="#depoimentos">Depoimentos</a></li>
            </ul>
          </nav>
          <Link to="/cadastro" className="btn">Começar Agora</Link>
        </div>
      </div>
    </header>
  );
}


// Componente Hero
function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h2>Conectando quem precisa com quem faz</h2>
        <p>Encontre profissionais qualificados para seus projetos ou ofereça seus serviços na maior rede social de trabalhos do Brasil.</p>
      </div>
    </section>

  );
}

// Interface para as props do FeatureCard
interface FeatureCardProps {
  icone: React.ReactNode;
  title: string;
  description: string;
}

// Componente FeatureCard
function FeatureCard({ icone, title, description }: FeatureCardProps) {
  return (
    <div className="feature-card">
      <div className="feature-icon">
        {icone}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

// Componente Features
function Features() {
  return (
    <section className="features" id="servicos">
      <div className="container">
        <div className="section-title">
          <h2>Serviços em Destaque</h2>
          <p>Encontre os melhores profissionais para diversas categorias de serviços</p>
        </div>
        <div className="features-grid">
          <FeatureCard
            icone={
              <svg width="35" height="35" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 21H21V19H3V21ZM3 17H21V15H3V17ZM3 13H21V11H3V13ZM3 7H21V5H3V7ZM3 3V1H21V3H3Z" fill="white" />
              </svg>
            }
            title="Reformas e Reparos"
            description="Encontre pedreiros, pintores, eletricistas e mais para seus projetos de reforma."
          />
          <FeatureCard
            icone={
              <svg width="35" height="35" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 18C21.1 18 21.99 17.1 21.99 16L22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V16C2 17.1 2.9 18 4 18H0V20H24V18H20ZM4 6H20V16H4V6Z" fill="white" />
              </svg>
            }
            title="Tecnologia"
            description="Desenvolvedores, designers, suporte técnico e outros profissionais de TI."
          />
          <FeatureCard
            icone={
              <svg width="35" height="35" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20ZM19 8H5V6H19V8ZM9 14H7V12H9V14ZM13 14H11V12H13V14ZM17 14H15V12H17V14ZM9 18H7V16H9V18ZM13 18H11V16H13V18ZM17 18H15V16H17V18Z" fill="white" />
              </svg>
            }
            title="Eventos"
            description="Fotógrafos, buffet, decoradores e mais para tornar seu evento especial."
          />
        </div>
      </div>
    </section>
  );
}

// Interface para as props do Step
interface StepProps {
  number: string;
  title: string;
  description: string;
}

// Componente Step
function Step({ number, title, description }: StepProps) {
  return (
    <div className="step">
      <div className="step-number">{number}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

// Componente HowItWorks
function HowItWorks() {
  return (
    <section className="how-it-works" id="como-funciona">
      <div className="container">
        <div className="section-title">
          <h2>Como Funciona</h2>
          <p>É simples e rápido conectar-se com profissionais ou oferecer seus serviços</p>
        </div>
        <div className="steps">
          <Step number="1" title="Crie seu Perfil" description="Cadastre-se gratuitamente como cliente ou profissional." />
          <Step number="2" title="Encontre ou Ofereça" description="Busque por serviços necessários ou publique seus próprios serviços." />
          <Step number="3" title="Conecte-se" description="Negocie diretamente com profissionais ou clientes." />
          <Step number="4" title="Avalie" description="Deixe sua avaliação após a conclusão do serviço." />
        </div>
      </div>
    </section>
  );
}

// Interface para as props do TestimonialCard
interface TestimonialCardProps {
  text: string;
  author: string;
  location?: string;
  role?: string;
  initial: string;
}

// Componente TestimonialCard
function TestimonialCard({ text, author, location, role, initial }: TestimonialCardProps) {
  return (
    <div className="testimonial-card">
      <p className="testimonial-text">"{text}"</p>
      <div className="testimonial-author">
        <div className="author-avatar">{initial}</div>
        <div>
          <strong>{author}</strong>
          <p>{location || role}</p>
        </div>
      </div>
    </div>
  );
}

// Componente Testimonials
function Testimonials() {
  return (
    <section className="testimonials" id="depoimentos">
      <div className="container">
        <div className="section-title">
          <h2>O que nossos usuários dizem</h2>
          <p>Veja depoimentos de pessoas que já utilizaram nossa plataforma</p>
        </div>
        <div className="testimonials-grid">
          <TestimonialCard
            text="Encontrei um excelente marceneiro para reformar minha cozinha através do Bizzy. O serviço foi impecável e o preço justo!"
            author="Maria Silva"
            location="São Paulo, SP"
            initial="M"
          />
          <TestimonialCard
            text="Como freelancer, o Bizzy me ajudou a encontrar clientes consistentes. Agora tenho uma renda estável fazendo o que amo."
            author="Carlos Mendonça"
            role="Designer Gráfico"
            initial="C"
          />
          <TestimonialCard
            text="Precisava urgentemente de um encanador no fim de semana e o Bizzy me salvou! Em poucos minutos já tinha três orçamentos."
            author="João Santos"
            location="Rio de Janeiro, RJ"
            initial="J"
          />
        </div>
      </div>
    </section>
  );
}

// Componente Footer
function Footer() {
  return (
    <section className='footer' id='contato'>
      <div className="footer">
        <div className="footer-container">
          <div className="footer-col">
            <h1>Empresa</h1>
            <a href="/sobrenos" className="atend">Sobre nós</a>
            <a href="/feed"><img src="src/assets/img/logo-branca.svg" alt="Logo" /></a>
          </div>
          <div className="footer-col">
            <h1>Contato</h1>
            <p className="bizzy-email">bizzyorg@gmail.com</p>
            <p className="telefone-footer">+55 67 98466-9533</p>
          </div>
          <div className="footer-col">
            <h1>Ajuda</h1>
            <a href="#" className="atend">Atendimento ao cliente</a>
            <a href="#" className="atend">Perguntas frequentes</a>
          </div>
          <div className="footer-col">
            <h1>Siga-nos</h1>
            <div className="social-icons">
              <a href="#"><img src="src/assets/img/21.png" alt="Facebook" /></a>
              <a href="#"><img src="src/assets/img/22.png" alt="X" /></a>
              <a href="#"><img src="src/assets/img/19.png" alt="Instagram" /></a>
            </div>
            <p className="copyright">Todos Direitos Reservados ©</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default App;

// <div className="hero-buttons">
// <a href="#contratar" className="btn">Preciso de um serviço</a>
// <a href="#oferecer" className="btn btn-secondary">Quero oferecer serviços</a>
// </div>