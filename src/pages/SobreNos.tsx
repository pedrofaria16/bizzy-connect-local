import React from "react";
import { useNavigate } from "react-router-dom";

import "../css/sobrenos.css";
import "../css/footer.css"

const equipe = [
  {
    nome: "Alice de Paulo Pinheiro",
    img: "src/assets/img/alice.jpg",
    alt: "Alice",
  },
  {
    nome: "Guilherme dos Santos Gonsalves",
    img: "https://agrafica.com.br/wp-content/uploads/2016/01/resolucao_300dpi.jpg",
    alt: "Guilherme",
  },
  {
    nome: "Luiza Nissola Pereira",
    img: "https://dus6dayednven.cloudfront.net/app/uploads/2022/05/1-DSC00855-Editar_baja.jpg",
    alt: "Luiza",
  },
  {
    nome: "Miguel Lourenço Camargo",
    img: "https://rapgol.com.br/wp-content/uploads/2024/05/Oruam.jpg",
    alt: "Miguel",
  },
  {
    nome: "Pedro Faria de Oliveira",
    img: "https://cdn6.campograndenews.com.br/uploads/noticias/2021/01/31/6016b9324880a.jpg",
    alt: "Pedro",
  },
  {
    nome: "Vinicius Ferreira Monteiro",
    img: "https://media.licdn.com/dms/image/v2/C4D12AQHBwfCGEWIqvg/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1611075796243?e=2147483647&v=beta&t=GHCaODwEcJ7lSryvp85xiXjb2g8WVXNa0rbyg8hYn6w",
    alt: "Vinicius",
  },
];

const SobreNos: React.FC = () => {
  const navigate = useNavigate();
 
return (
  <div className="sobrenos-main">
     {/* <header className="header-homepage "> 
      
      <div className="logo-header" style={{cursor : "pointer"}} onClick={() => navigate("/Feed")}>
        
          <img className="logo-sobrenos" src="src/assets/img/logo-branca.svg" alt="Logo Bizzy" />
     
      </div>
    </header> */}

    <div className="sobrenos-missao">
      <div id="missao-cont" className="sobrenos-conteudo">
        <h1 id="title-01" className="sobrenos-titulo">Nossa missão</h1>
        <p>
          <span className="sobrenos-indent">
            Nossa missão é ampliar o acesso a oportunidades de trabalho de forma rápida,
            prática e colaborativa. Para isso, criamos uma plataforma que conecta quem precisa de serviços a
            quem oferece suas habilidades.
          </span>
          <br />
          <span className="sobrenos-indent">
            Nossa rede social busca movimentar a economia local, fortalecer a colaboração entre
            as pessoas e gerar oportunidades de atuação sem burocracia. Acreditamos no poder das conexões locais
            e na valorização de talentos diversos. Juntos, esses elementos permitem que qualquer pessoa
            desenvolva suas habilidades, seja reconhecida e construa sua trajetória profissional com autonomia e
            liberdade.
          </span>
          <br />
          <span className="sobrenos-indent">
            Mais do que uma plataforma, somos uma comunidade que acredita no trabalho como
            ferramenta de transformação e desenvolvimento. Com essa visão, buscamos inspirar e fortalecer quem
            quer transformar suas habilidades em oportunidades reais, construindo um ambiente onde o talento é
            valorizado e onde todos podem contribuir, crescer e prosperar.
          </span>
        </p>
      </div>
      <div className="sobrenos-mis-fotos">
        <div className="sobrenos-mis-laranja"></div>
        <img
          className="sobrenos-foto-grupo"
          src="https://www.sescsp.org.br/wp-content/uploads/2025/05/Vida_de_Inseto_Divulgacao_2025-02-06-18-00-2.png"
          alt="Foto do grupo reunido"
        />
      </div>
    </div>

    <div className="sobrenos-historia">
      <div className="sobrenos-hist-fotos">
        <div className="sobrenos-hist-laranja"></div>
        <img
          className="sobrenos-grupo"
          src="https://i.ytimg.com/vi/JssTOiaEL6k/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGE0gSChZMA8=&rs=AOn4CLDljt4mq2jGNciYcWxhju3zgKz8pw"
          alt="Foto do grupo reunido"
        />
      </div>
      <div id="historia-cont" className="sobrenos-conteudo">
        <h1 id="title-02" className="sobrenos-titulo">Nossa história</h1>
        <p>
          <span className="sobrenos-indent">
            A Bizzy nasceu em um projeto de escola, onde nós seis nos juntamos e demos vida a
            essa plataforma. Não foi fácil: trabalhamos duro, batemos cabeça e descobrimos que crescer é também
            saber voltar, repensar e seguir com mais força.
          </span>
          <br />
          <span className="sobrenos-indent">
            Aprendemos que um projeto não nasce pronto — ele é feito de processos, de erros, de
            reconstruções e, principalmente, de pessoas que acreditam nele. E nós acreditamos. Acreditamos no
            que a Bizzy representa, naquilo que ela pode se tornar e na diferença que pode fazer. E foi assim,
            entre tentativas e reinvenções, que ela se tornou o que é hoje.
          </span>
          <br />
          <span className="sobrenos-indent">
            A Bizzy é fruto da nossa união, da nossa persistência e da nossa vontade de criar
            algo relevante. Não fizemos sozinhos, fizemos juntos — compartilhando erros, acertos, aprendizados
            e, acima de tudo, um propósito.
          </span>
          <br />
          <span className="sobrenos-indent">
            A Bizzy é, e sempre será, um reflexo de quem somos e de quem queremos ser.
          </span>
        </p>
      </div>
    </div>

    <div className="sobrenos-equipe">
      <h1 id="sobrenos-title-03" className="sobrenos-titulo">Nossa equipe</h1>
      <div className="sobrenos-cada-um">
        {equipe.map((membro) => (
          <div className="sobrenos-unidade" key={membro.nome}>
            <img src={membro.img} alt={membro.alt} />
            <h3 className="sobrenos-nomezinho">{membro.nome}</h3>
          </div>
        ))}
      </div>
    </div>

     <div className="sobrenos-footer">
          <div className="sobrenos-footer-container">
            <div className="sobrenos-footer-col">
              <h1>Empresa</h1>
              <a href="/feed"><img src="src/assets/img/logo-branca.svg" alt="Logo" /></a>
            </div>
            <div className="sobrenos-footer-col">
              <h1>Contato</h1>
              <p className="bizzy-email">bizzyorg@gmail.com</p>
              <p className="sobrenos-telefone-footer">+55 67 98466-9533</p>
            </div>
            <div className="sobrenos-footer-col">
              <h1>Ajuda</h1>
              <a href="#" className="sobrenos-atend">Atendimento ao cliente</a>
              <a href="#" className="sobrenos-atend">Perguntas frequentes</a>
            </div>
            <div className="sobrenos-footer-col">
              <h1>Siga-nos</h1>
              <div className="sobrenos-social-icons">
                <a href="#"><img src="src/assets/img/21.png" alt="Facebook" /></a>
                <a href="#"><img src="src/assets/img/22.png" alt="X" /></a>
                <a href="#"><img src="src/assets/img/19.png" alt="Instagram" /></a>
              </div>
              <p className="sobrenos-copyright">Todos Direitos Reservados ©</p>
            </div>
          </div>
        </div>
  </div>
)};

export default SobreNos;