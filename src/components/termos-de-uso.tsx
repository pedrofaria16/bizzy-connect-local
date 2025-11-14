import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/politica-de-privacidade.css';

const TermosDeUso: React.FC = () => {

    const navigate = useNavigate();

  return (
    <div>
      <div className="titulo">
      <a className="back-link" onClick={() => navigate("/feed")}>Voltar</a>
        <h1>Termos de Uso</h1>
        <div className="nada"></div>
      </div>

      <div className="textoPolitica">
        <div className="topico">
          <h2>1. Aceitação dos Termos</h2>
        </div>

        <div className="paragrafo">
          <p>
            Ao acessar e utilizar o site da Bizzy, você concorda em cumprir integralmente estes <b>Termos de Serviço</b>, bem como todas as leis e regulamentações aplicáveis. Caso não concorde com qualquer disposição aqui apresentada, você <b>não está autorizado a utilizar ou acessar este site</b>. Todos os materiais disponibilizados na plataforma da Bizzy estão protegidos por <b>leis de direitos autorais, propriedade intelectual e marcas registradas</b>.
          </p>
        </div>

        <div className="topico">
          <h2>2. Licença de Uso Limitado</h2>
        </div>

        <div className="paragrafo">
          <p>
            A Bizzy concede a você uma <b>licença temporária, não exclusiva e intransferível</b> para acessar e baixar materiais (informações, softwares ou outros conteúdos) disponíveis no site, <b>exclusivamente para uso pessoal e não comercial</b>. Esta licença <b>não constitui uma transferência de titularidade</b>, e, sob nenhuma circunstância, você poderá:
          </p>
          <ul>
            <li><b>Modificar, copiar ou reproduzir</b> os materiais sem autorização expressa;</li>
            <li><b>Utilizar os conteúdos para fins comerciais</b>, incluindo exibição pública (seja com ou sem fins lucrativos);</li>
            <li><b>Realizar engenharia reversa, descompilar ou desmontar</b> qualquer software disponibilizado pela Bizzy;</li>
            <li><b>Remover avisos de direitos autorais, marcas registradas ou outras menções de propriedade intelectual</b>;</li>
            <li><b>Distribuir, espelhar ou hospedar</b> os materiais em outros servidores ou sistemas.</li>
          </ul>
          <p>
            Esta licença <b>encerra-se automaticamente</b> em caso de violação de qualquer uma dessas condições. Ao término da licença ou se for revogada pela Bizzy, você <b>deve excluir imediatamente</b> todos os materiais baixados, sejam eles digitais ou impressos.
          </p>
        </div>

        <div className="topico">
          <h2>3. Isenção de Responsabilidade</h2>
        </div>

        <div className="paragrafo">
          <p>Os materiais disponíveis no site da Bizzy são fornecidos <b>"no estado em que se encontram"</b>, sem garantias de qualquer natureza, sejam <b>expressas ou implícitas</b>. A Bizzy <b>não se responsabiliza por</b>:</p>
          <ul>
            <li><b>Garantias de comercialização;</b></li>
            <li><b>Adequação a um propósito específico;</b></li>
            <li><b>Não violação de direitos de propriedade intelectual;</b></li>
            <li><b>Precisão, confiabilidade ou atualidade dos materiais.</b></li>
          </ul>
          <p>Além disso, a Bizzy <b>não garante</b> que o uso dos materiais disponíveis no site ou em plataformas vinculadas produzirá resultados específicos.</p>
        </div>

        <div className="topico">
          <h2>4. Limitação de Responsabilidade</h2>
        </div>

        <div className="paragrafo">
          <p>Em <b>nenhuma hipótese</b> a Bizzy ou seus fornecedores serão responsabilizados por quaisquer danos decorrentes do uso ou da impossibilidade de uso dos materiais disponíveis no site, incluindo, mas não se limitando a:</p>
          <ul>
            <li><b>Perda de dados ou lucros;</b></li>
            <li><b>Interrupção de negócios;</b></li>
            <li><b>Danos indiretos, incidentais ou consequenciais.</b></li>
          </ul>
        </div>

        <div className="topico">
          <h2>5. Precisão dos Materiais</h2>
        </div>

        <div className="paragrafo">
          <p>
            Os conteúdos disponíveis no site da Bizzy <b>podem conter erros técnicos, tipográficos ou fotográficos</b>. A Bizzy <b>não garante</b> que os materiais sejam <b>precisos, completos ou atualizados</b> e reserva-se o direito de <b>modificar, corrigir ou remover</b> informações a qualquer momento, <b>sem aviso prévio</b>. A Bizzy <b>não assume o compromisso</b> de atualizar os materiais regularmente.
          </p>
        </div>

        <div className="topico">
          <h2>6. Links Externos</h2>
        </div>

        <div className="paragrafo">
          <p>
            A Bizzy <b>não analisou todos os sites vinculados ao seu domínio e não se responsabiliza</b> pelo conteúdo de páginas de terceiros. A inclusão de qualquer link <b>não implica endosso</b> pela Bizzy. O acesso e uso de sites externos são <b>de inteira responsabilidade do usuário.</b>
          </p>
        </div>

        <div className="topico">
          <h2>7. Modificações nos Termos de Serviço</h2>
        </div>

        <div className="paragrafo">
          <p>
            A Bizzy <b>pode revisar e atualizar</b> estes Termos de Serviço <b>a qualquer momento</b>, sem notificação prévia. Ao continuar utilizando o site após eventuais alterações, você <b>concorda automaticamente</b> com a versão mais recente dos termos.
          </p>
        </div>

        <div className="topico">
          <h2>8. Lei Aplicável e Jurisdição</h2>
        </div>

        <div className="paragrafo">
          <p>
            <b>Estes Termos de Serviço são regidos e interpretados</b> conforme as leis vigentes na jurisdição da Bizzy. Qualquer disputa relacionada a estes termos <b>deverá ser resolvida</b> nos tribunais competentes da localidade em que a Bizzy está estabelecida, com <b>jurisdição exclusiva</b>.
          </p>
          <p>Data de vigência: 29 de maio de 2025.</p>
          <p>
            Ao utilizar os serviços da Bizzy, você reconhece e aceita integralmente estes Termos de Serviço. Em caso de dúvidas, entre em contato conosco através dos nossos canais oficiais.
          </p>
          <p><b>E-mail:</b> bizzy@gmail.com</p>
          <p><b>Agradecemos por escolher a Bizzy!</b></p>
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
  );
};

export default TermosDeUso;
