import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/politica-de-privacidade.css";
import "../css/footer.css"


const PoliticaDePrivacidade: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="titulo">
        <a className="back-link" onClick={() => navigate("/feed")}>Voltar</a>
        <h1>Política de Privacidade</h1>
        <div className="nada"></div>
      </div>

      <div className="conteudo-scroll">
        <div className="textoPolitica">
          <div className="paragrafo">
            <p>
              A sua privacidade é uma prioridade absoluta para a Bizzy. Esta política foi elaborada com o compromisso
              de garantir total transparência sobre como coletamos, armazenamos, protegemos e utilizamos as suas
              informações pessoais quando você interage com os nossos serviços, incluindo o site oficial da Bizzy e
              quaisquer outras plataformas digitais sob a nossa gestão.
            </p>
          </div>

          <div className="topico">
            <h2>1. Coleta de Informações Pessoais</h2>
          </div>

          <div className="paragrafo">
            <p>
              Esta Política de Privacidade descreve como coletamos, usamos e protegemos as informações pessoais dos
              usuários do nosso site. Ao utilizar nossos serviços, você concorda com a coleta e uso de informações de
              acordo com esta política.
            </p>
            <ul>
              <li>Por que precisamos dessas informações (finalidade da coleta);</li>
              <li>Como elas serão utilizadas (processamento e aplicação);</li>
              <li>Quais são os seus direitos em relação aos seus dados.</li>
            </ul>
            <p>
              Nunca coletamos mais informações do que o necessário, e você tem o direito de recusar o fornecimento de
              dados, ainda que isso possa impactar a disponibilidade de alguns serviços.
            </p>
          </div>

          <div className="topico">
            <h2>2. Armazenamento e Proteção de Dados</h2>
          </div>

          <div className="paragrafo">
            <p>
              A Bizzy armazena as informações pessoais apenas pelo tempo estritamente necessário para cumprir com a
              finalidade para a qual foram coletadas. Implementamos medidas de segurança avançadas, incluindo:
            </p>
            <ul>
              <li>Criptografia de dados;</li>
              <li>Firewalls e sistemas de detecção de intrusões;</li>
              <li>Acesso restrito apenas a pessoal autorizado.</li>
            </ul>
            <p>
              Essas práticas visam prevenir perdas, vazamentos, acessos não autorizados ou qualquer forma de má
              utilização das suas informações.
            </p>
          </div>

          <div className="topico">
            <h2>3. Compartilhamento de Dados com Terceiros</h2>
          </div>

          <div className="paragrafo">
            <p>
              A Bizzy não comercializa, aluga ou compartilha dados pessoais identificáveis com terceiros sem a sua
              autorização, exceto em situações específicas, como:
            </p>
            <ul>
              <li>Cumprimento de obrigações legais (ordens judiciais ou solicitações de autoridades competentes);</li>
              <li>Parcerias comerciais confiáveis, desde que haja um acordo de confidencialidade e proteção de dados;</li>
              <li>
                Serviços essenciais (como processamento de pagamentos), onde os provedores estão em conformidade com
                as leis de proteção de dados.
              </li>
            </ul>
          </div>

          <div className="topico">
            <h2>4. Links Externos e Sites de Terceiros</h2>
          </div>

          <div className="paragrafo">
            <p>
              O site da Bizzy pode conter links para páginas externas que não são administradas por nós. A Bizzy não
              tem controle sobre o conteúdo ou as políticas de privacidade desses sites e, portanto, não se
              responsabiliza por suas práticas. Recomendamos que você leia atentamente as políticas de privacidade de
              qualquer plataforma que visitar.
            </p>
          </div>

          <div className="topico">
            <h2>5. Cookies e Tecnologias de Rastreamento</h2>
          </div>

          <div className="paragrafo">
            <p>
              Para melhorar a sua experiência e oferecer serviços personalizados, a Bizzy utiliza tecnologias como
              cookies, pixels e armazenamento local. Essas ferramentas nos ajudam a:
            </p>
            <ul>
              <li>Analisar o tráfego do site;</li>
              <li>Personalizar anúncios (via Google AdSense e parceiros de publicidade);</li>
              <li>Garantir o funcionamento técnico adequado (como manter sessões de login).</li>
            </ul>
          </div>

          <div className="sub">
            <h3>5.1 Publicidade Personalizada</h3>
          </div>
          <p>
            A Bizzy utiliza o Google AdSense, que emprega cookies (como o DoubleClick) para exibir anúncios mais
            relevantes com base no seu comportamento de navegação. Esses cookies rastreiam interesses de forma anônima,
            limitando a repetição excessiva de propagandas.
          </p>
          <p>
            Além disso, trabalhamos com parceiros afiliados que podem utilizar cookies de rastreamento para identificar
            visitas originadas em suas plataformas, permitindo que a Bizzy credite corretamente essas referências e,
            quando aplicável, ofereça promoções exclusivas.
          </p>

          <div className="topico">
            <h2>6. Direitos do Usuário</h2>
          </div>

          <div className="paragrafo">
            <p>Você tem o direito de:</p>
            <p>✅Acessar as suas informações pessoais armazenadas pela Bizzy;</p>
            <p>✅Solicitar a correção de dados desatualizados ou incorretos;</p>
            <p>✅Revogar o consentimento para o uso dos seus dados;</p>
            <p>✅Solicitar a exclusão das suas informações (exceto quando a retenção for obrigatória por lei).</p>
            <p>
              Para exercer esses direitos, entre em contato conosco através dos canais oficiais de atendimento.
            </p>
          </div>

          <div className="topico">
            <h2>7. Responsabilidades do Usuário</h2>
          </div>

          <div className="paragrafo">
            <p>Ao utilizar os serviços da Bizzy, você concorda em:</p>
            <ul>
              <li>Não praticar atividades ilegais ou que violem a boa-fé e a ordem pública;</li>
              <li>
                Não disseminar conteúdo ofensivo, discriminatório, de ódio, apologia à violência, jogos de azar ou
                materiais ilegais;
              </li>
              <li>
                Não danificar sistemas da Bizzy ou de terceiros, incluindo a introdução de vírus, malware ou
                tentativas de acesso não autorizado.
              </li>
            </ul>
          </div>

          <div className="topico">
            <h2>8. Alterações na Política de Privacidade</h2>
            <p>
              A Bizzy reserva-se o direito de atualizar esta política periodicamente para refletir mudanças nas nossas práticas ou nas legislações aplicáveis. Recomendamos que você revise esta página regularmente para se manter informado.
            </p>
          </div>

          <div className="topico">
            <h2>9. Contato e Dúvidas</h2>
          </div>
          <div className="paragrafo">
            <p>
              Se tiver qualquer dúvida sobre esta política, o tratamento dos seus dados ou desejar exercer os seus direitos, entre em contato através do nosso canal oficial de suporte.
            </p>
            <p>E-mail: [inserir e-mail de contato]</p>
            <p>Site: [inserir link de contato]</p>
            <p>Data de vigência: 05 de junho de 2025.</p>
          </div>
        </div>

         <div className="sobrenos-footer">
          <div className="sobrenos-footer-container">
            <div className="sobrenos-footer-col">
              <h1>Empresa</h1>
              <a href="sobre-nos" className="sobrenos-atend">Sobre nós</a>
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
    </div>
  );
};

export default PoliticaDePrivacidade;